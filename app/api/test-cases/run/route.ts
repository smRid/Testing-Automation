import { randomUUID } from "crypto";
import { promises as fs } from "fs";
import { tmpdir } from "os";
import { join } from "path";

import { GoogleGenAI } from "@google/genai";
import { chromium, type Browser, type BrowserContext, type CDPSession, type Page } from "playwright-core";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

import { db } from "@/db";
import { repositories, TestCasesTable } from "@/db/schema";

export const runtime = "nodejs";
export const maxDuration = 300;

const DEFAULT_BROWSERLESS_SESSION_TIMEOUT_MS = 300_000;
const DEFAULT_PLAYWRIGHT_ACTION_TIMEOUT_MS = 10_000;
const DEFAULT_PLAYWRIGHT_NAVIGATION_TIMEOUT_MS = 20_000;
const ANSI_ESCAPE_PATTERN =
  // eslint-disable-next-line no-control-regex
  /[\u001B\u009B][[\]()#;?]*(?:(?:(?:[a-zA-Z\d]*(?:;[-a-zA-Z\d/#&.:=?%@~_]+)*)?\u0007)|(?:(?:\d{1,4}(?:[;:]\d{0,4})*)?[\dA-PR-TZcf-nq-uy=><~]))/g;

type RunMode = "cache" | "generate";

type RunRequest = {
  testCaseId?: number;
  baseUrl?: string;
  mode?: RunMode;
  customPrompt?: string;
};

type ArtifactMetadata = {
  screenshot?: { mimeType: string; size: number };
  video?: { mimeType: string; size: number };
  trace?: { mimeType: string; size: number };
};

type BrowserlessPageIdResponse = {
  pageId?: string;
};

type BrowserlessLiveUrlResponse = {
  liveURL?: string;
};

type BrowserlessRecordingResponse = {
  value?: string;
};

type ScriptRunner = (
  page: Page,
  assert: (condition: unknown, message?: string) => void,
  console: {
    log: (...args: unknown[]) => void;
    error: (...args: unknown[]) => void;
    warn: (...args: unknown[]) => void;
  },
  Buffer: typeof globalThis.Buffer
) => Promise<void>;

function getPositiveIntegerEnv(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isInteger(value) && value > 0 ? value : fallback;
}

function getBrowserlessSessionTimeoutMs() {
  return getPositiveIntegerEnv(
    "BROWSERLESS_TIMEOUT",
    DEFAULT_BROWSERLESS_SESSION_TIMEOUT_MS
  );
}

function getPlaywrightActionTimeoutMs() {
  return getPositiveIntegerEnv(
    "BROWSERLESS_ACTION_TIMEOUT",
    DEFAULT_PLAYWRIGHT_ACTION_TIMEOUT_MS
  );
}

function getPlaywrightNavigationTimeoutMs() {
  return getPositiveIntegerEnv(
    "BROWSERLESS_NAVIGATION_TIMEOUT",
    DEFAULT_PLAYWRIGHT_NAVIGATION_TIMEOUT_MS
  );
}

function cleanMessage(value: unknown) {
  const message = value instanceof Error ? value.message : String(value);
  return message.replace(ANSI_ESCAPE_PATTERN, "").trim();
}

async function sendBrowserlessCommand<T>(
  cdp: CDPSession,
  method: string,
  params?: Record<string, unknown>
) {
  const browserlessCdp = cdp as unknown as {
    send(command: string, commandParams?: Record<string, unknown>): Promise<T>;
  };

  return browserlessCdp.send(method, params);
}

function serializeLogValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}

function normalizeTargetUrl(baseUrl: string, targetRoute?: string | null) {
  const parsedBase = new URL(baseUrl);
  if (!["http:", "https:"].includes(parsedBase.protocol)) {
    throw new Error("Target URL must use http or https");
  }

  return new URL(targetRoute || "/", parsedBase).toString();
}

function buildBrowserlessUrl(enableVideo: boolean) {
  const token = process.env.BROWSERLESS_API_KEY;
  const configuredUrl =
    process.env.BROWSERLESS_URL || "wss://production-sfo.browserless.io";
  const endpoint = new URL(configuredUrl);

  if (!["ws:", "wss:"].includes(endpoint.protocol)) {
    throw new Error("BROWSERLESS_URL must use ws or wss");
  }

  if (token && !endpoint.searchParams.has("token")) {
    endpoint.searchParams.set("token", token);
  }

  if (!endpoint.searchParams.has("token")) {
    throw new Error("BROWSERLESS_API_KEY is not configured");
  }

  endpoint.searchParams.set("timeout", String(getBrowserlessSessionTimeoutMs()));
  endpoint.searchParams.set("headless", "false");

  if (enableVideo) {
    endpoint.searchParams.set("record", "true");
  } else {
    endpoint.searchParams.delete("record");
  }

  return endpoint.toString();
}

function getScriptValidationIssues(
  script: string,
  testCase: typeof TestCasesTable.$inferSelect,
  targetUrl: string
) {
  const issues: string[] = [];

  if (/\bexpect\s*\(/.test(script)) {
    issues.push("Use the provided assert() helper instead of expect().");
  }
  if (/\bprocess\.env\b/.test(script)) {
    issues.push(
      "Do not read process.env. Runtime credentials are not exposed to generated scripts."
    );
  }
  if (/\b(?:require\s*\(|import\s*(?:\(|[\s{*]))/.test(script)) {
    issues.push("Do not import or require modules.");
  }
  if (/:(?:has-text|text)\(\s*\/[^/]+\/[a-z]*\s*\)/i.test(script)) {
    issues.push(
      "Do not place JavaScript regular expressions inside CSS selectors; use getByRole(), getByText(), or locator(..., { hasText })."
    );
  }
  if (
    (testCase.type === "api" || testCase.targetRoute?.startsWith("/api/")) &&
    script.includes(`page.goto(${JSON.stringify(targetUrl)}`)
  ) {
    issues.push(
      "Do not navigate to an API endpoint with page.goto(); use page.request with the endpoint's actual HTTP method."
    );
  }

  return issues;
}

function compileScript(
  script: string,
  testCase: typeof TestCasesTable.$inferSelect,
  targetUrl: string
) {
  const issues = getScriptValidationIssues(script, testCase, targetUrl);
  if (issues.length > 0) {
    throw new Error(`Generated script is not runnable: ${issues.join(" ")}`);
  }

  const AsyncFunction = Object.getPrototypeOf(async function () {}).constructor as new (
    ...args: string[]
  ) => ScriptRunner;

  try {
    return new AsyncFunction("page", "assert", "console", "Buffer", script);
  } catch (error) {
    throw new Error(`Generated script has invalid JavaScript: ${cleanMessage(error)}`);
  }
}

async function connectToBrowserless(logs: string[]) {
  const videoRequested = process.env.BROWSERLESS_ENABLE_VIDEO !== "false";

  try {
    const browser = await chromium.connectOverCDP(
      buildBrowserlessUrl(videoRequested),
      { timeout: 30_000 }
    );
    return { browser, videoEnabled: videoRequested };
  } catch (error) {
    if (!videoRequested) {
      throw error;
    }

    logs.push(
      `[WARN] Browserless video connection was unavailable; retrying without video recording. ${error instanceof Error ? error.message : String(error)}`
    );

    const browser = await chromium.connectOverCDP(
      buildBrowserlessUrl(false),
      { timeout: 30_000 }
    );
    return { browser, videoEnabled: false };
  }
}

async function readGithubFile({
  owner,
  repo,
  path,
  branch,
  githubToken,
}: {
  owner: string;
  repo: string;
  path: string;
  branch: string;
  githubToken: string;
}) {
  const encodedPath = path.split("/").map(encodeURIComponent).join("/");
  const response = await fetch(
    `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}/contents/${encodedPath}?ref=${encodeURIComponent(branch)}`,
    {
      headers: {
        Authorization: `Bearer ${githubToken}`,
        Accept: "application/vnd.github+json",
      },
    }
  );

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as { content?: string };
  if (!data.content) {
    return null;
  }

  return {
    path,
    content: Buffer.from(data.content, "base64").toString("utf-8").slice(0, 5000),
  };
}

async function generateScript({
  testCase,
  baseUrl,
  customPrompt,
  globalInstruction,
}: {
  testCase: typeof TestCasesTable.$inferSelect;
  baseUrl: string;
  customPrompt: string;
  globalInstruction?: string | null;
}) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured");
  }

  const cookieStore = await cookies();
  const githubToken = cookieStore.get("gh_token")?.value;
  if (!githubToken) {
    throw new Error("GitHub authentication token is missing or expired");
  }

  const fileContents = await Promise.all(
    (testCase.targetFiles || []).map((path) =>
      readGithubFile({
        owner: testCase.repoOwner,
        repo: testCase.repoName,
        branch: testCase.branch || "main",
        path,
        githubToken,
      })
    )
  );

  const repoContext = fileContents
    .filter((file): file is NonNullable<typeof file> => Boolean(file))
    .map(
      (file) =>
        `File Path: ${file.path}\nFile Content:\n${file.content}`
    )
    .join("\n\n------------------------\n\n");

  const targetUrl = normalizeTargetUrl(baseUrl, testCase.targetRoute);
  const expectedResult = testCase.expectedResult || "";
  let validationFeedback = "";

  for (let attempt = 1; attempt <= 2; attempt += 1) {
    const prompt = `
You are an expert QA automation engineer.
Write a Playwright JavaScript script body for the test case below.

Target URL: ${targetUrl}
Title: ${testCase.title}
Description: ${testCase.description}
Type: ${testCase.type}
Expected Result: ${expectedResult}

${globalInstruction ? `[GLOBAL PROJECT INSTRUCTIONS]\n${globalInstruction}\n` : ""}
${customPrompt ? `[ADDITIONAL RUNTIME INSTRUCTIONS]\n${customPrompt}\n` : ""}
${validationFeedback ? `[PREVIOUS SCRIPT VALIDATION FAILURE]\n${validationFeedback}\nCorrect every listed issue.\n` : ""}

Source file context:
${repoContext || "No source file context is available."}

Runtime contract:
- The script runs inside an async function with only page, assert, console, and Buffer provided.
- Do not use expect(), process.env, require(), import, browser launch, or browser connection APIs.
- Use assert(condition, message) for every assertion. Do not await assert().
- Do not invent credentials. If an authenticated success path needs credentials that are not present
  in the source or instructions, detect the unavailable/disabled login state and throw a concise setup
  error explaining what the target application must configure.
- Use valid Playwright locators. Never put a JavaScript regex inside a CSS selector such as
  button:has-text(/text/i). Prefer getByRole(), getByLabel(), getByPlaceholder(), or getByText().
- Locators and expected labels must come from the supplied source context; do not invent UI text.
- Before interacting, verify the target control is visible and enabled, and fail with a clear message
  if the page is an authentication screen, configuration screen, or 404 page.
- Keep each explicit action/wait timeout at or below 10000ms. Do not stack many fallback waits.
- Log useful execution steps with console.log().

For UI, auth, form, integration, and edge-case tests:
- Navigate with await page.goto(${JSON.stringify(targetUrl)}, { waitUntil: "domcontentloaded", timeout: 20000 });
- Wait briefly only when necessary; prefer Playwright's locator auto-waiting.

For API tests:
- Do not use page.goto() on the API URL.
- Use page.request with the HTTP method, body, and content type shown by the route source.
- Assert the intended success or validation response. A generic HTTP 500 must never count as a pass.

Return raw executable JavaScript only. Do not use Markdown fences or add an explanation.
`;

    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL || "gemini-3.1-flash-lite",
      contents: prompt,
    });

    const script = (response.text || "")
      .replace(/^```(?:javascript|js)?\s*/i, "")
      .replace(/\s*```$/i, "")
      .trim();

    if (!script) {
      validationFeedback = "Gemini returned an empty script.";
      continue;
    }

    try {
      compileScript(script, testCase, targetUrl);
      return script;
    } catch (error) {
      validationFeedback = cleanMessage(error);
    }
  }

  throw new Error(
    validationFeedback || "Gemini failed to generate a runnable automation script"
  );
}

function getArtifactUrls(testCaseId: number, metadata: ArtifactMetadata) {
  return {
    screenshot: metadata.screenshot
      ? `/api/test-cases/${testCaseId}/artifacts/screenshot`
      : undefined,
    video: metadata.video
      ? `/api/test-cases/${testCaseId}/artifacts/video`
      : undefined,
    trace: metadata.trace
      ? `/api/test-cases/${testCaseId}/artifacts/trace`
      : undefined,
  };
}

async function stopTrace(context: BrowserContext | null, tracePath: string, logs: string[]) {
  if (!context) {
    return null;
  }

  try {
    await context.tracing.stop({ path: tracePath });
    return await fs.readFile(tracePath);
  } catch (error) {
    logs.push(
      `[WARN] Playwright trace could not be saved: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  } finally {
    await fs.unlink(tracePath).catch(() => undefined);
  }
}

async function stopVideoRecording(cdp: CDPSession | null, logs: string[]) {
  if (!cdp) {
    return null;
  }

  try {
    const response = await sendBrowserlessCommand<BrowserlessRecordingResponse>(
      cdp,
      "Browserless.stopRecording",
      {
      encoding: "base64",
      }
    );

    if (!response.value) {
      logs.push(
        "[WARN] Browserless stopped recording but returned no video data. Screen recording may not be enabled for this account."
      );
      return null;
    }

    return Buffer.from(response.value, "base64");
  } catch (error) {
    logs.push(
      `[WARN] Browserless video could not be saved: ${error instanceof Error ? error.message : String(error)}`
    );
    return null;
  }
}

export async function POST(request: NextRequest) {
  let body: RunRequest;

  try {
    body = (await request.json()) as RunRequest;
  } catch {
    return NextResponse.json({ error: "Invalid JSON request body" }, { status: 400 });
  }

  const testCaseId = Number(body.testCaseId);
  const baseUrl = body.baseUrl?.trim();
  const mode: RunMode = body.mode === "cache" ? "cache" : "generate";
  const customPrompt = body.customPrompt?.trim() || "";

  if (!Number.isInteger(testCaseId) || !baseUrl) {
    return NextResponse.json(
      { error: "A valid testCaseId and baseUrl are required" },
      { status: 400 }
    );
  }

  try {
    normalizeTargetUrl(baseUrl);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid target URL" },
      { status: 400 }
    );
  }

  const [testCase] = await db
    .select()
    .from(TestCasesTable)
    .where(eq(TestCasesTable.id, testCaseId));

  if (!testCase) {
    return NextResponse.json({ error: "Test case not found" }, { status: 404 });
  }

  let repository: typeof repositories.$inferSelect | undefined;
  const numericRepoId = Number(testCase.repoId);

  if (Number.isInteger(numericRepoId)) {
    [repository] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.repoId, numericRepoId));
  }

  if (!repository) {
    [repository] = await db
      .select()
      .from(repositories)
      .where(eq(repositories.fullName, `${testCase.repoOwner}/${testCase.repoName}`));
  }

  let scriptText = testCase.browserlessScript;
  const shouldGenerate = mode === "generate" || !scriptText;

  try {
    if (shouldGenerate) {
      scriptText = await generateScript({
        testCase,
        baseUrl,
        customPrompt,
        globalInstruction: repository?.globalInstruction,
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await db
      .update(TestCasesTable)
      .set({
        status: "failed",
        logs: [`[SYSTEM ERROR] Script generation failed: ${message}`],
        completedAt: new Date(),
      })
      .where(eq(TestCasesTable.id, testCase.id));

    return NextResponse.json({ error: message, status: "failed" }, { status: 500 });
  }

  if (!scriptText) {
    return NextResponse.json(
      { error: "No Browserless script is available", status: "failed" },
      { status: 500 }
    );
  }

  const targetUrl = normalizeTargetUrl(baseUrl, testCase.targetRoute);
  let runScript: ScriptRunner;

  try {
    runScript = compileScript(scriptText, testCase, targetUrl);
  } catch (error) {
    const message = cleanMessage(error);
    const invalidScriptLogs = [`[SYSTEM ERROR] Script validation failed: ${message}`];

    await db
      .update(TestCasesTable)
      .set({
        status: "failed",
        browserlessScript: scriptText,
        logs: invalidScriptLogs,
        completedAt: new Date(),
      })
      .where(eq(TestCasesTable.id, testCase.id));

    return NextResponse.json(
      {
        error: `${message} Regenerate this test script before running it again.`,
        status: "failed",
        logs: invalidScriptLogs,
        browserlessScript: scriptText,
      },
      { status: 422 }
    );
  }

  const sessionTimeoutMs = getBrowserlessSessionTimeoutMs();
  const actionTimeoutMs = getPlaywrightActionTimeoutMs();
  const navigationTimeoutMs = getPlaywrightNavigationTimeoutMs();
  const logs: string[] = [
    shouldGenerate
      ? "[SYSTEM] Generated a new Playwright script and cached it in the database."
      : "[SYSTEM] Loaded the cached Playwright script from the database.",
    `[SYSTEM] Browserless session budget: ${sessionTimeoutMs}ms; action timeout: ${actionTimeoutMs}ms; navigation timeout: ${navigationTimeoutMs}ms.`,
  ];
  const startedAt = new Date();
  const fallbackSessionId = randomUUID();
  const tracePath = join(tmpdir(), `browserless-trace-${fallbackSessionId}.zip`);

  await db
    .update(TestCasesTable)
    .set({
      status: "running",
      browserlessScript: scriptText,
      logs,
      sessionId: fallbackSessionId,
      sessionUrl: null,
      screenshotData: null,
      videoData: null,
      traceData: null,
      artifactMetadata: {},
      startedAt,
      completedAt: null,
      durationMs: null,
    })
    .where(eq(TestCasesTable.id, testCase.id));

  let browser: Browser | null = null;
  let context: BrowserContext | null = null;
  let page: Page | null = null;
  let cdp: CDPSession | null = null;
  let traceStarted = false;
  let recordingStarted = false;
  let sessionId: string = fallbackSessionId;
  let sessionUrl: string | null = null;
  let screenshotBuffer: Buffer | null = null;
  let videoBuffer: Buffer | null = null;
  let traceBuffer: Buffer | null = null;
  let executionError: Error | null = null;
  let browserDisconnected = false;

  const customConsole = {
    log: (...args: unknown[]) =>
      logs.push(args.map(serializeLogValue).join(" ")),
    error: (...args: unknown[]) =>
      logs.push(`[ERROR] ${args.map(serializeLogValue).join(" ")}`),
    warn: (...args: unknown[]) =>
      logs.push(`[WARN] ${args.map(serializeLogValue).join(" ")}`),
  };

  try {
    logs.push("[SYSTEM] Creating Browserless cloud session...");
    const connection = await connectToBrowserless(logs);
    browser = connection.browser;
    browser.on("disconnected", () => {
      browserDisconnected = true;
    });

    context = browser.contexts()[0];
    if (!context) {
      throw new Error("Browserless did not provide a browser context");
    }

    page = context.pages()[0] || (await context.newPage());
    page.setDefaultTimeout(actionTimeoutMs);
    page.setDefaultNavigationTimeout(navigationTimeoutMs);
    await page.setViewportSize({ width: 1440, height: 900 }).catch(() => undefined);
    cdp = await context.newCDPSession(page);

    try {
      const pageIdResponse =
        await sendBrowserlessCommand<BrowserlessPageIdResponse>(
          cdp,
          "Browserless.pageId"
        );
      sessionId = pageIdResponse.pageId || fallbackSessionId;
    } catch {
      logs.push(`[SYSTEM] Browserless session created with execution ID: ${sessionId}`);
    }

    try {
      const liveResponse =
        await sendBrowserlessCommand<BrowserlessLiveUrlResponse>(
          cdp,
          "Browserless.liveURL",
          {
            timeout: 180_000,
            interactable: false,
            resizable: false,
          }
        );
      sessionUrl = liveResponse.liveURL || null;
    } catch (error) {
      logs.push(
        `[WARN] Live Browserless viewer is unavailable: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    page.on("console", (message) => {
      logs.push(`[BROWSER] [${message.type().toUpperCase()}] ${message.text()}`);
    });
    page.on("pageerror", (error) => {
      logs.push(`[BROWSER] [PAGE ERROR] ${error.message}`);
    });

    try {
      await context.tracing.start({
        screenshots: true,
        snapshots: true,
        sources: true,
      });
      traceStarted = true;
    } catch (error) {
      logs.push(
        `[WARN] Playwright tracing is unavailable: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    if (connection.videoEnabled) {
      try {
        await sendBrowserlessCommand(cdp, "Browserless.startRecording");
        recordingStarted = true;
      } catch (error) {
        logs.push(
          `[WARN] Browserless video recording is unavailable: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    logs.push("[SYSTEM] Connected to Browserless. Executing Playwright script...");

    const assert = (condition: unknown, message?: string) => {
      if (!condition) {
        throw new Error(message || "Assertion failed");
      }
    };

    await runScript(page, assert, customConsole, Buffer);
    logs.push("[SYSTEM] Script execution completed successfully.");
  } catch (error) {
    const rawMessage = cleanMessage(error);
    const elapsedMs = Date.now() - startedAt.getTime();
    const closedUnexpectedly =
      browserDisconnected ||
      /target page, context or browser has been closed|browser.*(?:closed|disconnected)/i.test(
        rawMessage
      );

    executionError = closedUnexpectedly
      ? new Error(
          `Browserless closed the remote session after ${(elapsedMs / 1000).toFixed(1)}s. ` +
            `The requested session budget is ${sessionTimeoutMs}ms. Browserless Free sessions are limited to one minute; ` +
            `use a plan with a longer session limit or keep the test below that limit. ` +
            `Underlying error: ${rawMessage}`
        )
      : new Error(rawMessage);
    logs.push(`[SYSTEM ERROR] Script execution failed: ${executionError.message}`);
  } finally {
    if (page) {
      try {
        screenshotBuffer = await page.screenshot({
          type: "png",
          fullPage: true,
        });
        logs.push("[SYSTEM] Saved final-page screenshot.");
      } catch (error) {
        logs.push(
          `[WARN] Screenshot could not be saved: ${error instanceof Error ? error.message : String(error)}`
        );
      }
    }

    if (recordingStarted) {
      videoBuffer = await stopVideoRecording(cdp, logs);
      if (videoBuffer) {
        logs.push("[SYSTEM] Saved Browserless WebM recording.");
      }
    }

    if (traceStarted) {
      traceBuffer = await stopTrace(context, tracePath, logs);
      if (traceBuffer) {
        logs.push("[SYSTEM] Saved Playwright trace.");
      }
    }

    await browser?.close().catch(() => undefined);
  }

  const completedAt = new Date();
  const durationMs = completedAt.getTime() - startedAt.getTime();
  const status = executionError ? "failed" : "passed";
  const artifactMetadata: ArtifactMetadata = {};

  if (screenshotBuffer) {
    artifactMetadata.screenshot = {
      mimeType: "image/png",
      size: screenshotBuffer.length,
    };
  }
  if (videoBuffer) {
    artifactMetadata.video = {
      mimeType: "video/webm",
      size: videoBuffer.length,
    };
  }
  if (traceBuffer) {
    artifactMetadata.trace = {
      mimeType: "application/zip",
      size: traceBuffer.length,
    };
  }

  await db
    .update(TestCasesTable)
    .set({
      status,
      browserlessScript: scriptText,
      logs,
      sessionId,
      sessionUrl,
      screenshotData: screenshotBuffer?.toString("base64") || null,
      videoData: videoBuffer?.toString("base64") || null,
      traceData: traceBuffer?.toString("base64") || null,
      artifactMetadata,
      completedAt,
      durationMs,
    })
    .where(eq(TestCasesTable.id, testCase.id));

  return NextResponse.json({
    success: !executionError,
    status,
    error: executionError?.message,
    sessionId,
    sessionUrl,
    logs,
    browserlessScript: scriptText,
    artifacts: getArtifactUrls(testCase.id, artifactMetadata),
    artifactMetadata,
    durationMs,
  });
}
