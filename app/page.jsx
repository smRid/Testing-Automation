import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileArchive,
  FolderGit2,
  LayoutGrid,
  Play,
  PlayCircle,
  Settings,
  Sparkles,
  TestTube2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  Show,
  SignInButton,
  SignUpButton,
} from "@clerk/nextjs";

const authRedirect = "/loading-workspace";

export default function Home() {
  return (
    <main className="min-h-screen bg-[#f8faff] text-[#111827]">
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

              <button
                type="button"
                aria-label="Watch demo"
                className="flex h-[54px] cursor-default items-center gap-3 rounded-lg border border-[#dfe4ec] bg-white px-6 text-sm font-medium text-[#4b5563]"
              >
                <Play className="h-4 w-4" />
                Watch demo
              </button>
            </div>
          </div>

          <ProductPreview />
        </div>
      </section>

      <FeatureStrip />

      <footer className="mx-auto flex max-w-[1240px] items-center justify-between border-t border-[#e5e9f2] px-5 py-8 text-xs text-[#8a93a5] sm:px-8 lg:px-10">
        <p>© 2026 TestFlow. All rights reserved.</p>
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
  const menuItems = [
    { label: "Dashboard", icon: LayoutGrid, active: true },
    { label: "Repositories", icon: FolderGit2 },
    { label: "Test cases", icon: TestTube2 },
    { label: "Settings", icon: Settings },
  ];

  const testRuns = [
    {
      title: "Authentication flow",
      subtitle: "Passed in 18.4s",
      icon: CheckCircle2,
      color: "text-emerald-600",
      badge: "UI",
    },
    {
      title: "Repository settings",
      subtitle: "Running in Browserless",
      icon: Clock3,
      color: "text-amber-500",
      badge: "E2E",
    },
    {
      title: "Checkout validation",
      subtitle: "Failed assertion",
      icon: XCircle,
      color: "text-rose-500",
      badge: "API",
    },
  ];

  return (
    <div className="relative mx-auto w-full max-w-[620px]">
      <div className="overflow-hidden rounded-[22px] border border-[#dfe4ed] bg-white shadow-[0_28px_65px_rgba(35,48,82,0.18)]">
        <div className="flex h-14 items-center justify-between border-b border-[#e5e9f2] bg-[#fbfcfe] px-5">
          <div className="flex gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ff6259]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#ffc143]" />
            <span className="h-2.5 w-2.5 rounded-full bg-[#32c55a]" />
          </div>
          <div className="h-7 w-[190px] rounded-md bg-[#e9ecf2]" />
          <div className="h-7 w-16 rounded-md bg-[#2f65e8]" />
        </div>

        <div className="grid min-h-[340px] grid-cols-[150px_1fr] sm:grid-cols-[185px_1fr]">
          <aside className="border-r border-[#e5e9f2] bg-[#fafbfe] p-4">
            <div className="mb-5 grid h-9 w-9 place-items-center rounded-lg bg-[#2f65e8] text-white">
              <TestTube2 className="h-4.5 w-4.5" />
            </div>

            <div className="space-y-2">
              {menuItems.map(({ label, icon: Icon, active }) => (
                <div
                  key={label}
                  className={`flex items-center gap-2 rounded-lg px-2.5 py-2 text-[11px] sm:text-xs ${
                    active
                      ? "bg-[#edf3ff] font-medium text-[#2f65e8]"
                      : "text-[#7c8597]"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{label}</span>
                </div>
              ))}
            </div>
          </aside>

          <div className="p-5">
            <div className="grid grid-cols-3 gap-3">
              <PreviewStat value="24" label="Tests" color="bg-emerald-500" />
              <PreviewStat value="18" label="Passed" color="bg-[#2f65e8]" />
              <PreviewStat value="6" label="Failed" color="bg-rose-500" />
            </div>

            <div className="mt-7 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-[#202532]">
                  Recent test runs
                </p>
                <p className="mt-1 text-[11px] text-[#8b94a6]">
                  Browserless cloud execution
                </p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#edf3ff] px-2.5 py-1 text-[10px] font-medium text-[#2f65e8]">
                <Sparkles className="h-3 w-3" />
                AI generated
              </span>
            </div>

            <div className="mt-3 divide-y divide-[#e8ebf1]">
              {testRuns.map(({ title, subtitle, icon: Icon, color, badge }) => (
                <div
                  key={title}
                  className="flex items-center gap-3 py-3.5"
                >
                  <Icon className={`h-5 w-5 shrink-0 ${color}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-[#282e3a]">
                      {title}
                    </p>
                    <p className="mt-1 truncate text-[10px] text-[#8b94a6]">
                      {subtitle}
                    </p>
                  </div>
                  <span className="rounded-full bg-[#f1f4f8] px-2 py-1 text-[9px] font-semibold text-[#687286]">
                    {badge}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function PreviewStat({ value, label, color }) {
  return (
    <div className="rounded-xl border border-[#e2e6ee] bg-[#fafbfe] p-3">
      <p className="text-xl font-bold text-[#171b24] sm:text-2xl">{value}</p>
      <p className="mt-1 text-[10px] text-[#8b94a6]">{label}</p>
      <div className="mt-3 h-0.5 rounded-full bg-[#e7eaf0]">
        <div className={`h-0.5 w-3/4 rounded-full ${color}`} />
      </div>
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
