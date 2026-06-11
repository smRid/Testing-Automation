import { neon } from "@neondatabase/serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not configured");
}
if (!process.env.BROWSERLESS_API_KEY) {
  throw new Error("BROWSERLESS_API_KEY is not configured");
}

const appUrl = process.env.BROWSERLESS_SMOKE_APP_URL || "http://localhost:3001";
const sql = neon(process.env.DATABASE_URL);
let testCaseId;

try {
  const [testCase] = await sql.query(
    `
      INSERT INTO "test_cases" (
        "user_id",
        "repo_id",
        "repo_name",
        "repo_owner",
        "branch",
        "title",
        "description",
        "type",
        "priority",
        "target_route",
        "target_files",
        "expected_result",
        "browserless_script",
        "status"
      )
      VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        $7,
        $8,
        $9,
        $10,
        $11::jsonb,
        $12,
        $13,
        $14
      )
      RETURNING "id"
    `,
    [
      "codex-browserless-smoke",
      null,
      "browserless-smoke",
      "local-verification",
      "main",
      "Browserless route smoke test",
      "Navigate to Example Domain and verify its title.",
      "ui",
      "low",
      "/",
      "[]",
      "The page title contains Example Domain.",
      `
console.log("Opening Example Domain");
await page.goto("https://example.com", { waitUntil: "load", timeout: 15000 });
const title = await page.title();
console.log("Page title:", title);
assert(title.toLowerCase().includes("example domain"), "Example Domain title was not found");
      `.trim(),
      "generated",
    ]
  );

  testCaseId = testCase.id;
  const response = await fetch(`${appUrl}/api/test-cases/run`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      testCaseId,
      baseUrl: "https://example.com",
      mode: "cache",
    }),
    signal: AbortSignal.timeout(240_000),
  });
  const result = await response.json();

  if (!response.ok || result.status !== "passed") {
    throw new Error(
      `Run route failed (${response.status}): ${result.error || JSON.stringify(result)}`
    );
  }

  for (const type of ["screenshot", "trace"]) {
    const artifactUrl = result.artifacts?.[type];
    if (!artifactUrl) {
      throw new Error(`${type} artifact URL was not returned`);
    }

    const artifactResponse = await fetch(new URL(artifactUrl, appUrl));
    if (!artifactResponse.ok) {
      throw new Error(`${type} artifact returned ${artifactResponse.status}`);
    }

    const artifact = await artifactResponse.arrayBuffer();
    if (artifact.byteLength === 0) {
      throw new Error(`${type} artifact was empty`);
    }
  }

  const [persisted] = await sql.query(
    `
      SELECT "status", "logs", "artifact_metadata", "duration_ms"
      FROM "test_cases"
      WHERE "id" = $1
    `,
    [testCaseId]
  );

  if (persisted?.status !== "passed") {
    throw new Error("The database result was not updated to passed");
  }

  console.log(
    JSON.stringify({
      status: result.status,
      sessionId: result.sessionId,
      durationMs: result.durationMs,
      artifacts: Object.keys(result.artifacts || {}).filter(
        (key) => result.artifacts[key]
      ),
      persistedLogLines: Array.isArray(persisted.logs)
        ? persisted.logs.length
        : 0,
      warnings: Array.isArray(persisted.logs)
        ? persisted.logs.filter((line) => line.startsWith("[WARN]"))
        : [],
    })
  );
} finally {
  if (testCaseId) {
    await sql.query(
      `
        DELETE FROM "test_cases"
        WHERE "id" = $1
          AND "user_id" = $2
      `,
      [testCaseId, "codex-browserless-smoke"]
    );
  }
}
