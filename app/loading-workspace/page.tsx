"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

const dots = [
  { x: 30, y: 4, color: "#31b9ad", delay: "0ms" },
  { x: 43, y: 10, color: "#2e83db", delay: "90ms" },
  { x: 48, y: 24, color: "#31b9ad", delay: "180ms" },
  { x: 42, y: 38, color: "#2e83db", delay: "270ms" },
  { x: 29, y: 44, color: "#31b9ad", delay: "360ms" },
  { x: 16, y: 38, color: "#2e83db", delay: "450ms" },
  { x: 10, y: 24, color: "#31b9ad", delay: "540ms" },
  { x: 16, y: 10, color: "#2e83db", delay: "630ms" },
];

export default function LoadingWorkspacePage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) {
      return;
    }

    if (!isSignedIn) {
      router.replace("/");
      return;
    }

    const workspaceParams = new URLSearchParams();
    const currentParams = new URLSearchParams(window.location.search);
    if (currentParams.get("github_connected") === "true") {
      workspaceParams.set("github_connected", "true");
    }
    const workspaceUrl = workspaceParams.size
      ? `/workspace?${workspaceParams.toString()}`
      : "/workspace";

    const redirectTimer = window.setTimeout(() => {
      router.replace(workspaceUrl);
    }, 1600);

    return () => window.clearTimeout(redirectTimer);
  }, [isLoaded, isSignedIn, router]);

  return (
    <main className="grid min-h-screen place-items-center bg-[#f8faff] px-6 text-center text-[#111827]">
      <div className="flex -translate-y-8 flex-col items-center">
        <div
          className="relative h-[58px] w-[58px] animate-[spin_1.35s_linear_infinite]"
          role="status"
          aria-label="Loading workspace"
        >
          {dots.map((dot, index) => (
            <span
              key={index}
              className="absolute h-[11px] w-[11px] rounded-full animate-[workspace-dot_1.1s_ease-in-out_infinite]"
              style={{
                left: dot.x,
                top: dot.y,
                backgroundColor: dot.color,
                animationDelay: dot.delay,
              }}
            />
          ))}
        </div>

        <h1 className="mt-6 text-xl font-semibold tracking-[-0.02em]">
          Loading workspace
        </h1>
        <p className="mt-2 text-base text-[#667085]">
          Setting up your environment...
        </p>
      </div>
    </main>
  );
}
