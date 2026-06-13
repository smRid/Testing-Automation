import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Loading Workspace",
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoadingWorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}

