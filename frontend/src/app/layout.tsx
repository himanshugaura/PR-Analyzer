import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import { Providers } from "./providers";
import { Navbar } from "../components/layout/navbar";
import { LinkInstallationModal } from "../components/dashboard/link-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "PR Analyzer | Minimalist AI Pull Request Reviewer",
  description:
    "Automated GitHub Pull Request reviews, inline bug detection, and security auditing powered by Google Gemini.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        variables: {
          colorPrimary: "#fafafa",
          colorPrimaryForeground: "#09090b",
          colorBackground: "#09090b",
          colorForeground: "#f4f4f5",
          colorMutedForeground: "#a1a1aa",
          colorBorder: "#27272a",
          colorInput: "#18181b",
          colorInputForeground: "#f4f4f5",
        },
        elements: {
          card: "border border-zinc-800 bg-zinc-950 text-zinc-100 shadow-2xl",
          headerTitle: "text-zinc-100 font-bold",
          headerSubtitle: "text-zinc-400 text-xs",
          socialButtonsBlockButton:
            "border border-zinc-800 bg-zinc-900 text-zinc-100 hover:bg-zinc-800",
          socialButtonsBlockButtonText: "text-zinc-100 font-medium text-xs",
          socialButtonsProviderIcon: "brightness-200",
          dividerLine: "bg-zinc-800",
          dividerText: "text-zinc-400 text-xs",
          formFieldLabel: "text-zinc-300 text-xs",
          formFieldInput:
            "border border-zinc-800 bg-zinc-900 text-zinc-100 focus:border-zinc-500 text-xs",
          formButtonPrimary:
            "bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold",
          footerActionText: "text-zinc-400 text-xs",
          footerActionLink: "text-zinc-200 hover:text-zinc-100 text-xs font-medium",
          identityPreviewText: "text-zinc-100 text-xs",
          identityPreviewEditButton: "text-zinc-400 hover:text-zinc-100",
        },
      }}
    >
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full dark antialiased`}
      >
        <body className="min-h-full flex flex-col bg-zinc-950 text-zinc-100 font-sans selection:bg-zinc-800 selection:text-zinc-100">
          <Providers>
            <Navbar />
            <div className="flex-1">{children}</div>
            <LinkInstallationModal />
          </Providers>
        </body>
      </html>
    </ClerkProvider>
  );
}
