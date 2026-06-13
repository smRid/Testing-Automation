"use client";

import { useEffect, useRef, useState } from "react";
import { Play } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

export default function DemoVideoDialog() {
  const [open, setOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (open) {
      void video.play().catch(() => {
        // The player controls remain available when autoplay is browser-blocked.
      });
      return;
    }

    video.pause();
    video.currentTime = 0;
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="group flex h-[54px] items-center gap-3 rounded-lg border border-[#dfe4ec] bg-white px-6 text-sm font-medium text-[#4b5563] shadow-sm transition-all hover:-translate-y-0.5 hover:border-[#cbd5e1] hover:bg-[#f8faff] hover:text-[#2f65e8] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2f65e8] focus-visible:ring-offset-2"
        >
          <span className="grid h-7 w-7 place-items-center rounded-full bg-[#edf3ff] text-[#2f65e8] transition-colors group-hover:bg-[#2f65e8] group-hover:text-white">
            <Play className="ml-0.5 h-3.5 w-3.5 fill-current" />
          </span>
          Watch demo
        </button>
      </DialogTrigger>

      <DialogContent className="w-[calc(100vw-1.5rem)] max-w-5xl gap-0 overflow-hidden rounded-2xl border border-white/10 bg-[#080b12] p-0 text-white shadow-[0_30px_90px_rgba(15,23,42,0.45)] [&>button]:right-4 [&>button]:top-4 [&>button]:z-20 [&>button]:grid [&>button]:h-9 [&>button]:w-9 [&>button]:place-items-center [&>button]:rounded-full [&>button]:bg-black/55 [&>button]:text-white [&>button]:opacity-100 [&>button]:backdrop-blur-sm [&>button:hover]:bg-black/75 sm:w-[calc(100vw-3rem)]">
        <DialogHeader className="border-b border-white/10 bg-[#0d111b] px-5 py-4 pr-16 text-left sm:px-6">
          <DialogTitle className="text-base font-semibold tracking-[-0.01em] text-white sm:text-lg">
            See TestFlow in action
          </DialogTitle>
          <DialogDescription className="mt-1 text-xs leading-5 text-slate-400 sm:text-sm">
            From repository analysis to cloud test execution and results.
          </DialogDescription>
        </DialogHeader>

        <div className="relative aspect-video w-full bg-black">
          <video
            ref={videoRef}
            className="h-full w-full object-contain"
            controls
            controlsList="nodownload"
            disablePictureInPicture
            playsInline
            preload="metadata"
            poster="/preview2.png"
            onContextMenu={(event) => event.preventDefault()}
          >
            <source src="/demo.mp4" type="video/mp4" />
            Your browser does not support HTML5 video.
          </video>
        </div>
      </DialogContent>
    </Dialog>
  );
}
