const productionUrl = "https://testflow-studio.vercel.app";

function normalizeUrl(url: string) {
  const value = url.trim().replace(/\/+$/, "");
  return value.startsWith("http://") || value.startsWith("https://")
    ? value
    : `https://${value}`;
}

export const siteConfig = {
  name: "TestFlow Studio",
  shortName: "TestFlow",
  description:
    "Generate repository-aware test cases with AI, run Playwright tests in cloud browsers, and review logs, screenshots, traces, and results in one workspace.",
  url: normalizeUrl(
    process.env.NEXT_PUBLIC_APP_URL ||
      process.env.VERCEL_PROJECT_PRODUCTION_URL ||
      productionUrl,
  ),
};

