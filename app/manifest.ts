import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TestFlow Studio - AI Test Automation",
    short_name: "TestFlow",
    description:
      "Generate AI test cases, run Playwright tests in cloud browsers, and review every result in one workspace.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8faff",
    theme_color: "#2f65e8",
    icons: [
      {
        src: "/logo.png",
        sizes: "438x391",
        type: "image/png",
      },
    ],
  };
}
