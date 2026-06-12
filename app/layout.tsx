import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import Provider from './provider';

export const metadata: Metadata = {
  title: "TestFlow - AI Test Automation",
  description: "Generate, run, and review automated tests from one workspace.",
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/loading-workspace"
      signUpFallbackRedirectUrl="/loading-workspace"
    >
      <html lang="en">
        <body style={{ margin: 0, padding: 0 }}>
          <Provider>{children}</Provider>
        </body>
      </html>
    </ClerkProvider>
  );
}
