import { ClerkProvider } from '@clerk/nextjs';
import "./globals.css";
import type { Metadata } from "next";
import Provider from './provider';
import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: "TestFlow Studio | AI-Powered Test Automation",
    template: `%s | ${siteConfig.shortName}`,
  },
  description: siteConfig.description,
  applicationName: siteConfig.name,
  authors: [{ name: "Sarker Mohammad Riduan" }],
  creator: "Sarker Mohammad Riduan",
  publisher: siteConfig.name,
  category: "technology",
  keywords: [
    "AI test automation",
    "automated software testing",
    "Playwright test automation",
    "AI test case generator",
    "GitHub test automation",
    "cloud browser testing",
    "Browserless testing",
    "end-to-end testing",
    "software quality assurance",
    "QA automation platform",
  ],
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: siteConfig.name,
    title: "TestFlow Studio | AI-Powered Test Automation",
    description: siteConfig.description,
    images: [
      {
        url: "/preview2.png",
        width: 1249,
        height: 756,
        alt: "TestFlow Studio AI test automation workspace",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TestFlow Studio | AI-Powered Test Automation",
    description: siteConfig.description,
    images: ["/preview2.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  icons: {
    icon: "/logo.png",
    shortcut: "/logo.png",
    apple: "/logo.png",
  },
  manifest: "/manifest.webmanifest",
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
