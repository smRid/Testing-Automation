"use client";

import { useEffect, useRef, useState } from "react";
import axios from "axios";
import {
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Code,
  Database,
  Download,
  ExternalLink,
  FileArchive,
  Globe,
  ImageIcon,
  Loader2,
  Play,
  PlayCircle,
  SlidersHorizontal,
  Sparkles,
  Square,
  Terminal,
  XCircle,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { UserRepo } from "./WorkspaceBody";
import type { TestCase } from "./UserRepoList";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  testCases: TestCase[];
  repository: UserRepo;
};

type RunStatus =
  | "idle"
  | "generating"
  | "running"
  | "passed"
  | "failed"
  | "cancelled";

type ArtifactUrls = {
  screenshot?: string;
  trace?: string;
};

type ArtifactMetadata = {
  screenshot?: { mimeType: string; size: number };
  trace?: { mimeType: string; size: number };
};

type RunResult = {
  testCaseId: number;
  status: RunStatus;
  logs: string[];
  error?: string;
  sessionId?: string;
  sessionUrl?: string;
  browserlessScript?: string;
  artifacts?: ArtifactUrls;
  artifactMetadata?: ArtifactMetadata;
  durationMs?: number;
};

type RunResponse = {
  status: "passed" | "failed";
  logs?: string[];
  error?: string;
  sessionId?: string;
  sessionUrl?: string;
  browserlessScript?: string;
  artifacts?: ArtifactUrls;
  artifactMetadata?: ArtifactMetadata;
  durationMs?: number;
};

function getInitialResult(testCase: TestCase): RunResult {
  const persistedStatus =
    testCase.status === "passed" || testCase.status === "failed"
      ? testCase.status
      : "idle";

  return {
    testCaseId: testCase.id,
    status: persistedStatus,
    logs:
      testCase.logs && testCase.logs.length > 0
        ? testCase.logs
        : ["Waiting to run..."],
    browserlessScript: testCase.browserlessScript || undefined,
    sessionId: testCase.sessionId || undefined,
    sessionUrl: testCase.sessionUrl || undefined,
    artifacts: {
      screenshot: testCase.artifactMetadata?.screenshot
        ? `/api/test-cases/${testCase.id}/artifacts/screenshot`
        : undefined,
      trace: testCase.artifactMetadata?.trace
        ? `/api/test-cases/${testCase.id}/artifacts/trace`
        : undefined,
    },
    artifactMetadata: testCase.artifactMetadata || undefined,
    durationMs: testCase.durationMs || undefined,
  };
}

export default function TestExecutionModal({
  isOpen,
  onClose,
  testCases,
  repository,
}: Props) {
  const [baseUrl, setBaseUrl] = useState("http://localhost:3000");
  const [currentIdx, setCurrentIdx] = useState(-1);
  const [isExecuting, setIsExecuting] = useState(false);
  const [results, setResults] = useState<Record<number, RunResult>>({});
  const [selectedDetailId, setSelectedDetailId] = useState<number | null>(null);
  const [executionMode, setExecutionMode] = useState<"cache" | "generate">("cache");
  const [customPrompt, setCustomPrompt] = useState("");
  const [showOptions, setShowOptions] = useState(false);
  const stopRequestedRef = useRef(false);
  const activeRequestRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!isOpen || testCases.length === 0) {
      return;
    }

    setResults(
      Object.fromEntries(testCases.map((testCase) => [testCase.id, getInitialResult(testCase)]))
    );
    setSelectedDetailId(testCases[0].id);
    setCurrentIdx(-1);
    setIsExecuting(false);
    setCustomPrompt("");
    setBaseUrl(repository.targetDomain || "http://localhost:3000");
    setExecutionMode(
      testCases.some((testCase) => !testCase.browserlessScript) ? "generate" : "cache"
    );
  }, [isOpen, repository.targetDomain, testCases]);

  const startExecution = async () => {
    if (testCases.length === 0 || !baseUrl.trim()) {
      return;
    }

    const resetResults = Object.fromEntries(
      testCases.map((testCase) => [
        testCase.id,
        {
          testCaseId: testCase.id,
          status: "idle" as const,
          logs: ["Queued..."],
          browserlessScript: testCase.browserlessScript || undefined,
        },
      ])
    );

    stopRequestedRef.current = false;
    setResults(resetResults);
    setIsExecuting(true);
    setSelectedDetailId(testCases[0].id);

    try {
      for (let index = 0; index < testCases.length; index += 1) {
        if (stopRequestedRef.current) {
          break;
        }

        const testCase = testCases[index];
        const isGenerating = executionMode === "generate" || !testCase.browserlessScript;
        const controller = new AbortController();
        activeRequestRef.current = controller;

        setCurrentIdx(index);
        setSelectedDetailId(testCase.id);
        setResults((previous) => ({
          ...previous,
          [testCase.id]: {
            ...previous[testCase.id],
            status: isGenerating ? "generating" : "running",
            logs: [
              isGenerating
                ? "[SYSTEM] Generating a Playwright script before starting Browserless..."
                : "[SYSTEM] Cached script found. Creating Browserless session...",
            ],
          },
        }));

        try {
          const response = await axios.post<RunResponse>(
            "/api/test-cases/run",
            {
              testCaseId: testCase.id,
              baseUrl: baseUrl.trim(),
              mode: executionMode,
              customPrompt: customPrompt.trim(),
            },
            { signal: controller.signal }
          );
          const data = response.data;

          setResults((previous) => ({
            ...previous,
            [testCase.id]: {
              testCaseId: testCase.id,
              status: data.status,
              logs: data.logs || [],
              browserlessScript: data.browserlessScript,
              sessionId: data.sessionId,
              sessionUrl: data.sessionUrl,
              error: data.error,
              artifacts: data.artifacts,
              artifactMetadata: data.artifactMetadata,
              durationMs: data.durationMs,
            },
          }));
        } catch (error) {
          if (axios.isCancel(error) || controller.signal.aborted) {
            setResults((previous) => ({
              ...previous,
              [testCase.id]: {
                ...previous[testCase.id],
                status: "cancelled",
                logs: [...(previous[testCase.id]?.logs || []), "[SYSTEM] Run stopped by user."],
              },
            }));
            break;
          }

          const message = axios.isAxiosError<{ error?: string }>(error)
            ? error.response?.data?.error || error.message
            : error instanceof Error
              ? error.message
              : "Execution failed";

          setResults((previous) => ({
            ...previous,
            [testCase.id]: {
              ...previous[testCase.id],
              status: "failed",
              error: message,
              logs: [
                ...(previous[testCase.id]?.logs || []),
                `[SYSTEM ERROR] ${message}`,
              ],
            },
          }));
        }
      }
    } finally {
      activeRequestRef.current = null;
      setCurrentIdx(-1);
      setIsExecuting(false);
    }
  };

  const stopExecution = () => {
    stopRequestedRef.current = true;
    activeRequestRef.current?.abort();
  };

  const selectedResult = selectedDetailId ? results[selectedDetailId] : undefined;
  const selectedTestCase = testCases.find(
    (testCase) => testCase.id === selectedDetailId
  );

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isExecuting) {
          onClose();
        }
      }}
    >
      <DialogContent className="flex h-[96dvh] w-[calc(100vw-0.75rem)] max-w-6xl flex-col gap-3 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-3 text-slate-900 shadow-2xl [&>button]:text-slate-500 [&>button:hover]:bg-slate-100 [&>button]:data-[state=open]:bg-slate-100 [&>button]:data-[state=open]:text-slate-500 sm:h-[94dvh] sm:w-[calc(100vw-2rem)] sm:gap-4 sm:p-5 lg:h-[90vh] lg:overflow-hidden lg:p-6">
        <DialogHeader className="shrink-0 border-b border-slate-200 pb-3 sm:pb-4">
          <DialogTitle className="flex items-center gap-2 pr-7 text-lg font-bold text-slate-900 sm:text-2xl">
            <PlayCircle className="h-5 w-5 text-blue-600 sm:h-6 sm:w-6" />
            Browserless Cloud Test Runner
          </DialogTitle>
          <DialogDescription className="text-xs leading-5 text-slate-500 sm:text-sm">
            Generate or reuse Playwright scripts, run them in Browserless, and retain
            execution artifacts.
          </DialogDescription>
        </DialogHeader>

        <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3 sm:p-4">
          <div className="flex flex-col items-end gap-4 sm:flex-row">
            <div className="flex-1 space-y-1.5">
              <label className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <Globe className="h-3.5 w-3.5 text-blue-600" />
                Target Website URL
              </label>
              <Input
                placeholder="https://your-application.example"
                value={baseUrl}
                onChange={(event) => setBaseUrl(event.target.value)}
                disabled={isExecuting}
                className="h-10 rounded-xl border-slate-200 bg-white font-mono text-xs text-slate-900 caret-blue-600 placeholder:text-slate-400 focus-visible:border-blue-400 focus-visible:ring-blue-100 sm:text-sm"
              />
            </div>

            <div className="grid w-full grid-cols-1 gap-2 sm:flex sm:w-auto sm:gap-2.5">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowOptions((visible) => !visible)}
                className="h-10 w-full gap-1.5 rounded-xl border-slate-200 bg-white px-4 text-xs font-medium text-slate-700 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700 sm:w-auto"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Execution Options
                {showOptions ? (
                  <ChevronUp className="h-3 w-3" />
                ) : (
                  <ChevronDown className="h-3 w-3" />
                )}
              </Button>

              {isExecuting ? (
                <Button
                  type="button"
                  variant="destructive"
                  onClick={stopExecution}
                  className="h-10 w-full gap-2 rounded-xl bg-rose-600 px-6 font-medium text-white hover:bg-rose-700 sm:w-auto"
                >
                  <Square className="h-4 w-4 fill-current" />
                  Stop Runner
                </Button>
              ) : (
                <Button
                  type="button"
                  onClick={startExecution}
                  disabled={!baseUrl.trim() || testCases.length === 0}
                  className="h-10 w-full gap-2 rounded-xl bg-blue-600 px-6 font-medium text-white shadow-md hover:bg-blue-700 sm:w-auto"
                >
                  <Play className="h-4 w-4 fill-current" />
                  Start Execution
                </Button>
              )}
            </div>
          </div>

          {showOptions && (
            <div className="grid grid-cols-1 gap-5 border-t border-slate-200 pt-3 md:grid-cols-3">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Run Mode
                </span>
                <div className="grid grid-cols-2 rounded-lg border border-slate-200 bg-slate-100 p-1">
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => setExecutionMode("cache")}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold ${
                      executionMode === "cache"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    } disabled:opacity-50`}
                  >
                    <Database className="h-3.5 w-3.5" />
                    Run Cached
                  </button>
                  <button
                    type="button"
                    disabled={isExecuting}
                    onClick={() => setExecutionMode("generate")}
                    className={`flex items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold ${
                      executionMode === "generate"
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-700"
                    } disabled:opacity-50`}
                  >
                    <Sparkles className="h-3.5 w-3.5 text-yellow-600" />
                    AI Regenerate
                  </button>
                </div>
              </div>

              <div className="space-y-1.5 md:col-span-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Custom Generation Instructions
                </span>
                <textarea
                  placeholder="Optional instructions used only when generating a new script."
                  value={customPrompt}
                  onChange={(event) => setCustomPrompt(event.target.value)}
                  disabled={isExecuting || executionMode === "cache"}
                  rows={2}
                  className="w-full resize-none rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-900 caret-blue-600 shadow-sm outline-none placeholder:text-slate-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 disabled:bg-slate-100 disabled:text-slate-500 disabled:opacity-50"
                />
              </div>
            </div>
          )}
        </div>

        <div className="grid flex-none grid-cols-1 gap-4 lg:min-h-0 lg:flex-1 lg:grid-cols-3 lg:gap-5">
          <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-xl border border-slate-200 bg-slate-50/60 p-3 shadow-sm lg:max-h-none">
            <h3 className="mb-1 px-2 text-xs font-bold uppercase tracking-wider text-slate-500">
              Execution Queue
            </h3>
            {testCases.map((testCase, index) => {
              const result = results[testCase.id];
              const isActive = selectedDetailId === testCase.id;
              const isRunning = isExecuting && currentIdx === index;

              return (
                <button
                  type="button"
                  key={testCase.id}
                  onClick={() => setSelectedDetailId(testCase.id)}
                  className={`rounded-lg border p-3 text-left transition-all ${
                    isActive
                      ? "border-blue-500 bg-white shadow-sm ring-1 ring-blue-100"
                      : "border-slate-200 bg-white shadow-sm hover:border-slate-300"
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <h4 className="line-clamp-1 text-sm font-semibold text-slate-800">
                      {testCase.title}
                    </h4>
                    <ChevronRight
                      className={`h-4 w-4 text-slate-400 ${isActive ? "rotate-90 text-blue-600" : ""}`}
                    />
                  </div>
                  <p className="mb-2.5 line-clamp-1 text-xs text-slate-500">
                    {testCase.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-[10px] capitalize ${getTestTypeBadgeClassName(testCase.type)}`}
                    >
                      {testCase.type}
                    </Badge>
                    <StatusBadge
                      status={result?.status || "idle"}
                      isRunning={isRunning}
                    />
                  </div>
                </button>
              );
            })}
          </div>

          <div className="flex min-h-[420px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm lg:col-span-2 lg:min-h-0">
            {selectedTestCase ? (
              <>
                <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 bg-slate-50/70 p-4">
                  <div>
                    <h3 className="font-bold text-slate-800">{selectedTestCase.title}</h3>
                    <p className="mt-1 text-xs text-slate-500">
                      Expected: {selectedTestCase.expectedResult || "No expected result supplied"}
                    </p>
                    {selectedResult?.durationMs !== undefined && (
                      <p className="mt-1 text-[11px] text-slate-400">
                        Completed in {(selectedResult.durationMs / 1000).toFixed(1)}s
                      </p>
                    )}
                  </div>
                  {selectedResult?.sessionUrl && (
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="shrink-0 gap-1 border-blue-200 bg-white text-xs text-blue-700 hover:bg-blue-50 hover:text-blue-800"
                    >
                      <a
                        href={selectedResult.sessionUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Session View
                      </a>
                    </Button>
                  )}
                </div>

                <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4">
                  <ArtifactLinks
                    artifacts={selectedResult?.artifacts}
                    metadata={selectedResult?.artifactMetadata}
                  />

                  {selectedResult?.browserlessScript && (
                    <div className="overflow-hidden rounded-lg border">
                      <div className="flex items-center justify-between border-b border-slate-200 bg-slate-100 px-3.5 py-2">
                        <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                          <Code className="h-3.5 w-3.5 text-blue-600" />
                          Browserless Playwright Script
                        </span>
                      </div>
                      <pre className="max-h-40 overflow-x-auto bg-gray-950 p-3 font-mono text-[11px] leading-relaxed text-emerald-400">
                        {selectedResult.browserlessScript}
                      </pre>
                    </div>
                  )}

                  <div className="flex min-h-48 flex-1 flex-col overflow-hidden rounded-lg border">
                    <div className="flex shrink-0 items-center justify-between border-b border-gray-800 bg-gray-950 px-3.5 py-2.5 font-mono text-gray-200">
                      <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                        <Terminal className="h-3.5 w-3.5" />
                        Console Terminal Output
                      </span>
                      <Badge
                        className={`border text-[10px] uppercase ${getTerminalStatusClassName(
                          selectedResult?.status || "idle"
                        )}`}
                      >
                        {selectedResult?.status || "idle"}
                      </Badge>
                    </div>
                    <div className="flex flex-1 select-text flex-col gap-1.5 overflow-y-auto bg-gray-950 p-3 font-mono text-[11px] text-gray-300">
                      {(selectedResult?.logs || ["Waiting to run..."]).map((log, index) => (
                        <div
                          key={`${index}-${log}`}
                          className={`whitespace-pre-wrap leading-relaxed ${
                            log.startsWith("[SYSTEM ERROR]")
                              ? "font-semibold text-rose-400"
                              : log.startsWith("[SYSTEM]")
                                ? "text-blue-400"
                                : log.startsWith("[BROWSER]")
                                  ? "text-purple-400"
                                  : log.startsWith("[WARN]")
                                    ? "text-amber-300"
                                    : ""
                          }`}
                        >
                          {log}
                        </div>
                      ))}
                      {selectedResult?.error && (
                        <div className="mt-2 border-t border-gray-800 pt-2 font-bold text-red-400">
                          Error: {selectedResult.error}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center p-8 text-center">
                <Terminal className="mb-3 h-12 w-12 text-slate-300" />
                <h3 className="text-lg font-bold text-slate-700">No Test Case Selected</h3>
              </div>
            )}
          </div>
        </div>

        <div className="flex shrink-0 justify-end border-t border-slate-200 pt-3 sm:pt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isExecuting}
            className="h-10 w-full rounded-xl border-slate-300 bg-white px-5 font-medium text-slate-700 hover:bg-slate-100 hover:text-slate-900 sm:w-auto"
          >
            Close & Refresh Status
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function ArtifactLinks({
  artifacts,
  metadata,
}: {
  artifacts?: ArtifactUrls;
  metadata?: ArtifactMetadata;
}) {
  const items = [
    {
      key: "screenshot" as const,
      label: "Screenshot",
      icon: ImageIcon,
      href: artifacts?.screenshot,
    },
    {
      key: "trace" as const,
      label: "Trace",
      icon: FileArchive,
      href: artifacts?.trace,
    },
  ].filter((item) => item.href);

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => {
        const Icon = item.icon;
        const size = metadata?.[item.key]?.size;

        return (
          <Button
            key={item.key}
            asChild
            variant="outline"
            size="sm"
            className="gap-1.5 border-slate-300 bg-white text-xs text-slate-700 hover:bg-slate-100 hover:text-slate-900"
          >
            <a href={item.href} target="_blank" rel="noreferrer">
              <Icon className="h-3.5 w-3.5" />
              {item.label}
              {size ? ` (${formatBytes(size)})` : ""}
              <Download className="h-3 w-3 text-slate-400" />
            </a>
          </Button>
        );
      })}
    </div>
  );
}

function formatBytes(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }
  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function getTestTypeBadgeClassName(type: string) {
  const normalizedType = type.toLowerCase().trim();

  if (normalizedType === "ui") {
    return "border-blue-200 bg-blue-50 text-blue-700";
  }
  if (normalizedType === "auth") {
    return "border-violet-200 bg-violet-50 text-violet-700";
  }
  if (normalizedType === "api") {
    return "border-cyan-200 bg-cyan-50 text-cyan-700";
  }
  if (normalizedType === "form") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }
  if (normalizedType === "integration") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }
  if (normalizedType === "edge-case") {
    return "border-rose-200 bg-rose-50 text-rose-700";
  }

  return "border-slate-200 bg-slate-50 text-slate-700";
}

function getTerminalStatusClassName(status: RunStatus) {
  if (status === "generating") {
    return "border-blue-800 bg-blue-950 text-blue-300 hover:bg-blue-950";
  }
  if (status === "running") {
    return "border-amber-800 bg-amber-950 text-amber-300 hover:bg-amber-950";
  }
  if (status === "passed") {
    return "border-emerald-800 bg-emerald-950 text-emerald-300 hover:bg-emerald-950";
  }
  if (status === "failed") {
    return "border-rose-800 bg-rose-950 text-rose-300 hover:bg-rose-950";
  }
  if (status === "cancelled") {
    return "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-800";
  }

  return "border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-800";
}

function StatusBadge({
  status,
  isRunning,
}: {
  status: RunStatus;
  isRunning: boolean;
}) {
  if (isRunning || status === "running") {
    return (
      <Badge className="flex items-center gap-1 border border-amber-200 bg-amber-50 text-amber-700 hover:bg-amber-50">
        <Loader2 className="h-3 w-3 animate-spin" />
        Running
      </Badge>
    );
  }

  if (status === "generating") {
    return (
      <Badge className="flex items-center gap-1 border border-blue-200 bg-blue-50 text-blue-700 hover:bg-blue-50">
        <Loader2 className="h-3 w-3 animate-spin" />
        Generating
      </Badge>
    );
  }

  if (status === "passed") {
    return (
      <Badge className="flex items-center gap-1 border border-emerald-200 bg-emerald-50 text-emerald-700 hover:bg-emerald-50">
        <CheckCircle2 className="h-3 w-3" />
        Passed
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <Badge className="flex items-center gap-1 border border-rose-200 bg-rose-50 text-rose-700 hover:bg-rose-50">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  }

  if (status === "cancelled") {
    return (
      <Badge className="border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100">
        Stopped
      </Badge>
    );
  }

  return (
    <Badge className="border border-slate-200 bg-slate-100 text-slate-700 hover:bg-slate-100">
      Queued
    </Badge>
  );
}
