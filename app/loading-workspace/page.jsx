"use client";

import { useAuth } from "@clerk/nextjs";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

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
          className="relative grid h-[86px] w-[86px] place-items-center"
          role="status"
          aria-label="Loading workspace"
        >
          <div className="absolute inset-0 animate-spin rounded-full border-[3px] border-blue-100 border-t-blue-600 border-r-cyan-400 shadow-[0_0_24px_rgba(37,99,235,0.12)] [animation-duration:1.1s]" />
          <div className="absolute inset-[7px] animate-[spin_1.6s_linear_infinite_reverse] rounded-full border border-dashed border-blue-200" />
          <div className="absolute inset-[15px] animate-pulse rounded-[18px] border border-blue-100 bg-white shadow-[0_8px_22px_rgba(37,99,235,0.14)]">
            <Image
              src="/logo.png"
              alt=""
              width={519}
              height={481}
              priority
              className="h-full w-full object-contain p-2.5"
            />
          </div>
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
