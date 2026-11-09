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
