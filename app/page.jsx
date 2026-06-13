import {
  ArrowRight,
  CheckCircle2,
  ChevronUp,
  CircleDot,
  Code2,
  FileArchive,
  FolderGit2,
  Github,
  KeyRound,
  LogOut,
  Play,
  PlayCircle,
  Plus,
  RefreshCw,
  SlidersHorizontal,
  Sparkles,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Show,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";
import DemoVideoDialog from "@/components/custom/DemoVideoDialog";
import { siteConfig } from "@/lib/site";

const authRedirect = "/loading-workspace";

export const metadata = {
  title: "AI-Powered Test Automation for GitHub Projects",
  description: siteConfig.description,
  alternates: {
    canonical: "/",
  },
};

const softwareApplicationSchema = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: siteConfig.name,
  alternateName: siteConfig.shortName,
  url: siteConfig.url,
  description: siteConfig.description,
  applicationCategory: "DeveloperApplication",
  applicationSubCategory: "Software Testing Tool",
  operatingSystem: "Web",
  image: `${siteConfig.url}/preview2.png`,
  screenshot: [
    `${siteConfig.url}/preview1.png`,
    `${siteConfig.url}/preview2.png`,
  ],
  featureList: [
    "AI-generated test cases from GitHub repositories",
    "Playwright script generation",
    "Cloud browser test execution",
    "Screenshots, traces, logs, and execution history",
    "Repository-aware test planning",
  ],
  author: {
    "@type": "Person",
    name: "Sarker Mohammad Riduan",
  },
};

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8faff] text-[#111827]">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationSchema).replace(/</g, "\\u003c"),
        }}
      />
      <header className="border-b border-[#e5e9f2] bg-[#f8faff]/95">
        <div className="mx-auto flex h-[68px] max-w-[1480px] items-center justify-between px-5 sm:px-8 lg:px-12">
          <Brand />

          <div className="flex items-center gap-3">
            <Show when="signed-out">
              <SignInButton
                mode="modal"
                forceRedirectUrl={authRedirect}
                signUpForceRedirectUrl={authRedirect}
              >
                <button
                  type="button"
                  className="h-11 rounded-lg border border-[#e2e7f0] bg-white px-5 text-sm font-medium text-[#4b5563] transition-colors hover:bg-[#f3f6fb]"
                >
                  Sign in
                </button>
              </SignInButton>
              <SignUpButton
                mode="modal"
                forceRedirectUrl={authRedirect}
                signInForceRedirectUrl={authRedirect}
              >
                <button
                  type="button"
                  className="flex h-11 items-center gap-2 rounded-lg bg-[#2f65e8] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2558d6]"
                >
                  Get started <ArrowRight className="h-4 w-4" />
                </button>
              </SignUpButton>
            </Show>

            <Show when="signed-in">
              <Link
                href="/workspace"
                className="flex h-11 items-center gap-2 rounded-lg bg-[#2f65e8] px-5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-[#2558d6]"
              >
                Open workspace <ArrowRight className="h-4 w-4" />
              </Link>
            </Show>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden border-b border-[#e5e9f2]">
        <div className="absolute right-[-12%] top-[-25%] h-[620px] w-[620px] rounded-full bg-[#eaf0ff] blur-3xl" />

        <div className="relative mx-auto grid max-w-[1240px] items-center gap-14 px-5 py-16 sm:px-8 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-[74px]">
          <div>
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-[#dfe4ec] bg-white px-4 py-2 text-xs text-[#4b5563] shadow-sm">
              <span className="h-2 w-2 rounded-full bg-[#24a35a]" />
              AI test cases, cloud runs & clear reports
            </div>

            <h1 className="max-w-[600px] text-[48px] font-bold leading-[0.98] tracking-[-0.055em] text-[#111318] sm:text-[64px]">
              Testing
              <br />
              Automation
              <br />
              <span className="text-[#2f65e8]">Simplified.</span>
            </h1>

            <p className="mt-7 max-w-[530px] text-base leading-7 text-[#7b8497] sm:text-[17px]">
              Generate test cases from your repository, run them in Browserless,
              and review every result without the extra setup.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Show when="signed-out">
                <SignInButton
                  mode="modal"
                  forceRedirectUrl={authRedirect}
                  signUpForceRedirectUrl={authRedirect}
                >
                  <button
                    type="button"
                    className="flex h-[54px] items-center gap-3 rounded-lg bg-[#2f65e8] px-7 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(47,101,232,0.24)] transition-colors hover:bg-[#2558d6]"
                  >
                    Sign in to continue <ArrowRight className="h-4 w-4" />
                  </button>
                </SignInButton>
              </Show>

              <Show when="signed-in">
                <Link
                  href="/workspace"
                  className="flex h-[54px] items-center gap-3 rounded-lg bg-[#2f65e8] px-7 text-sm font-semibold text-white shadow-[0_10px_24px_rgba(47,101,232,0.24)] transition-colors hover:bg-[#2558d6]"
                >
                  Continue to workspace <ArrowRight className="h-4 w-4" />
                </Link>
              </Show>

              <DemoVideoDialog />
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <FeatureStrip />

      <footer className="mx-auto flex max-w-[1240px] items-center justify-between border-t border-[#e5e9f2] px-5 py-8 text-xs text-[#8a93a5] sm:px-8 lg:px-10">
        <p>© 2026 Sarker Mohammad Riduan. All rights reserved.</p>
        <p>AI-powered test automation</p>
      </footer>
    </main>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-3">
      <Image
        src="/logo.png"
        alt="TestFlow"
        width={519}
        height={481}
        priority
        className="h-10 w-10 object-contain"
      />
      <span className="text-lg font-bold tracking-[-0.03em] text-[#131722]">
        TestFlow
      </span>
    </div>
  );
}

function ProductPreview() {
  const testCases = [
    {
      title: "Customer login flow",
      subtitle: "Confirms valid users can securely access their account.",
      type: "API",
      priority: "HIGH",
      icon: Code2,
      color: "text-blue-600",
    },
    {
      title: "Invalid form validation",
      subtitle: "Checks required fields and invalid input messages.",
      type: "E2E",
      priority: "HIGH",
      icon: XCircle,
      color: "text-indigo-600",
    },
    {
      title: "Create a new project",
      subtitle: "Verifies that a project is created with the selected settings.",
      type: "UI",
      priority: "MEDIUM",
      icon: Plus,
      color: "text-blue-600",
    },
    {
      title: "Account sign out",
      subtitle: "Ends the active session and returns to the sign-in page.",
      type: "UI",
      priority: "HIGH",
      icon: LogOut,
      color: "text-violet-600",
    },
    {
      title: "Role-based access",
      subtitle: "Restricts protected pages based on the user role.",
      type: "AUTH",
      priority: "HIGH",
      icon: KeyRound,
      color: "text-purple-600",
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[550px]">
      <div className="rounded-2xl border border-[#dfe5ee] bg-[#f7f9fc] p-2.5 shadow-[0_22px_50px_rgba(35,48,82,0.13)] sm:p-3">
        <div className="mb-2.5 flex items-center justify-between gap-3 rounded-lg border border-[#e3e7ee] bg-white px-3 py-2 shadow-[0_2px_8px_rgba(15,23,42,0.04)]">
          <div className="flex min-w-0 items-center gap-2.5">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-[#f1f5f9]">
              <Github className="h-3.5 w-3.5 text-[#334155]" />
            </span>
            <div className="min-w-0">
              <p className="truncate text-[9px] font-semibold text-[#182033] sm:text-[10px]">
                Connected repository
              </p>
              <p className="mt-0.5 truncate text-[7px] text-[#8a94a7] sm:text-[8px]">
                Generate and run tests from your codebase.
              </p>
            </div>
          </div>
          <span className="shrink-0 rounded-md bg-[#2563eb] px-2.5 py-1.5 text-[7px] font-semibold text-white sm:text-[8px]">
            Add repository
          </span>
        </div>

        <div className="rounded-xl border border-[#e3e7ee] bg-white p-3">
          <div className="mb-2.5 flex items-end justify-between">
            <div>
              <p className="text-[11px] font-bold tracking-[-0.02em] text-[#172033] sm:text-xs">
                Repositories
              </p>
              <p className="mt-0.5 text-[7px] text-[#8a94a7] sm:text-[8px]">
                Test coverage and recent execution results.
              </p>
            </div>
            <span className="rounded-full bg-[#f1f5f9] px-2 py-1 text-[7px] font-semibold text-[#64748b]">
              1 connected
            </span>
          </div>

          <div className="overflow-hidden rounded-lg border border-[#b8cefa] bg-white">
            <div className="flex items-center justify-between px-3 py-2">
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="grid h-6 w-6 shrink-0 place-items-center rounded-md bg-[#f1f5f9]">
                  <Github className="h-3 w-3 text-[#334155]" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-[9px] font-semibold text-[#172033] sm:text-[10px]">
                    acme/customer-portal
                  </p>
                  <p className="mt-0.5 text-[7px] text-[#8290a5]">
                    main <span className="mx-1 text-[#60a5fa]">/</span> TypeScript
                  </p>
                </div>
              </div>
              <ChevronUp className="h-3.5 w-3.5 text-[#718096]" />
            </div>

            <div className="border-t border-[#edf0f5] px-3 pb-2.5 pt-2">
              <div className="flex items-center justify-between gap-3 rounded-md bg-[#f8fafc] px-2.5 py-1.5">
                <div className="flex min-w-0 items-center gap-2">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded bg-[#dcfce7]">
                    <CircleDot className="h-3 w-3 text-[#16a34a]" />
                  </span>
                  <div className="min-w-0">
                    <p className="text-[6px] font-bold uppercase tracking-wider text-[#94a3b8]">
                      Target domain
                    </p>
                    <p className="truncate text-[8px] font-semibold text-[#16a34a] sm:text-[9px]">
                      https://demo.testflow.app
                    </p>
                  </div>
                </div>
                <span className="inline-flex shrink-0 items-center gap-1 rounded-md border border-[#d9e0e9] bg-white px-2 py-1 text-[7px] font-medium text-[#475569]">
                  <SlidersHorizontal className="h-2.5 w-2.5" />
                  Project Config
                </span>
              </div>

              <div className="mt-2 grid grid-cols-4 gap-1.5">
                <PreviewStat value="12" label="Total Tests" icon={Code2} color="text-blue-600 bg-blue-50" />
                <PreviewStat value="10" label="Passed" icon={CheckCircle2} color="text-emerald-600 bg-emerald-50" />
                <PreviewStat value="2" label="Failed" icon={XCircle} color="text-rose-500 bg-rose-50" />
                <PreviewStat value="83%" label="Pass Rate" icon={Sparkles} color="text-purple-600 bg-purple-50" />
              </div>

              <div className="mt-2 overflow-hidden rounded-md border border-[#e1e6ed]">
                <div className="flex items-center justify-between border-b border-[#e7ebf1] bg-[#fbfcfe] px-2.5 py-1.5">
                  <div>
                    <p className="text-[8px] font-semibold text-[#172033] sm:text-[9px]">
                      Generated Test Cases
                    </p>
                    <p className="mt-0.5 text-[6px] text-[#94a3b8]">12 test cases available</p>
                  </div>
                  <span className="inline-flex items-center gap-1 rounded border border-[#dce3ed] bg-white px-2 py-1 text-[6px] font-medium text-[#64748b]">
                    <RefreshCw className="h-2 w-2" /> Refresh
                  </span>
                </div>

                <div className="divide-y divide-[#edf0f4]">
                  {testCases.map(({ title, subtitle, type, priority, icon: Icon, color }) => (
                    <div key={title} className="flex items-center gap-2 px-2.5 py-1">
                      <Icon className={`h-3 w-3 shrink-0 ${color}`} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-[7px] font-semibold text-[#273248] sm:text-[8px]">
                          {title}
                        </p>
                        <p className="mt-0.5 hidden truncate text-[6px] text-[#98a2b3] sm:block">
                          {subtitle}
                        </p>
                      </div>
                      <span className="rounded-full border border-[#bfdbfe] bg-[#eff6ff] px-1.5 py-0.5 text-[5px] font-bold text-[#2563eb]">
                        {type}
                      </span>
                      <span className={`rounded-full px-1.5 py-0.5 text-[5px] font-bold ${
                        priority === "HIGH"
                          ? "border border-[#fecaca] bg-[#fff1f2] text-[#ef4444]"
                          : "border border-[#fde68a] bg-[#fffbeb] text-[#d97706]"
                      }`}>
                        {priority}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end border-t border-[#e7ebf1] bg-[#fbfcfe] px-2.5 py-1.5">
                  <span className="inline-flex items-center gap-1 rounded bg-[#2563eb] px-2.5 py-1 text-[6px] font-semibold text-white">
                    <Play className="h-2.5 w-2.5 fill-current" />
                    Run Selected
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="pointer-events-none absolute -bottom-5 -left-5 -z-10 h-24 w-24 rounded-full bg-[#dce8ff] blur-2xl" />
      <div className="pointer-events-none absolute -right-4 -top-6 -z-10 h-28 w-28 rounded-full bg-[#e7edff] blur-2xl" />
    </div>
  );
}

function PreviewStat({ value, label, icon: Icon, color }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-1 rounded-md border border-[#e4e8ef] bg-white p-1.5">
      <div className="min-w-0">
        <p className="truncate text-[6px] font-medium text-[#7d8899] sm:text-[7px]">{label}</p>
        <p className="mt-0.5 text-[11px] font-bold text-[#172033] sm:text-xs">{value}</p>
      </div>
      <span className={`grid h-5 w-5 shrink-0 place-items-center rounded ${color}`}>
        <Icon className="h-2.5 w-2.5" />
      </span>
    </div>
  );
}

function FeatureStrip() {
  const features = [
    {
      title: "AI test cases",
      description: "Generated from your code",
      icon: Sparkles,
    },
    {
      title: "Browserless runs",
      description: "Cloud browser execution",
      icon: PlayCircle,
    },
    {
      title: "Run artifacts",
      description: "Screenshots, traces & logs",
      icon: FileArchive,
    },
    {
      title: "GitHub repos",
      description: "Connect and test projects",
      icon: FolderGit2,
    },
  ];

  return (
    <section className="border-b border-[#e5e9f2] bg-white">
      <div className="mx-auto grid max-w-[1240px] grid-cols-1 px-5 py-7 sm:grid-cols-2 sm:px-8 lg:grid-cols-4 lg:px-10">
        {features.map(({ title, description, icon: Icon }, index) => (
          <div
            key={title}
            className={`flex items-center gap-3 px-0 py-3 sm:px-5 lg:py-0 ${
              index > 0 ? "lg:border-l lg:border-[#e5e9f2]" : ""
            }`}
          >
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-[10px] bg-[#edf3ff] text-[#2f65e8]">
              <Icon className="h-4.5 w-4.5" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#242a35]">{title}</p>
              <p className="mt-1 text-[11px] text-[#8b94a6]">{description}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
