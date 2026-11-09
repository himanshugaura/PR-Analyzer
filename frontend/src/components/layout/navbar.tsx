"use client";

import Link from "next/link";
import { GitPullRequest, ExternalLink, LogIn } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "../ui/button";

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/pr-analyzer-ai/installations/new";

export function Navbar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/8 bg-black/60 backdrop-blur-xl">
      <div className="mx-auto flex h-13 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 text-zinc-100 hover:text-white transition-colors"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-amber-500 text-black shadow-sm">
              <GitPullRequest className="h-3.5 w-3.5" />
            </div>
            <span className="text-sm font-bold tracking-widest uppercase font-mono">
              PR Analyzer
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-5 text-xs font-medium text-zinc-500">
            <Link
              href="/"
              className="transition-colors hover:text-zinc-200"
            >
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">
          {/* GitHub App Install Button */}
          <a
            href={GITHUB_APP_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex"
          >
            <Button size="sm" className="gap-1.5 text-xs h-8">
              <span>Install GitHub App</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>

          {/* Clerk Auth */}
          <div className="flex items-center pl-2 border-l border-white/8">
            <Show when="signed-out">
              <SignInButton mode="modal">
                <Button variant="ghost" size="sm" className="gap-1.5 text-xs h-8">
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Sign In</span>
                </Button>
              </SignInButton>
            </Show>

            <Show when="signed-in">
              <UserButton
                appearance={{
                  elements: {
                    userButtonAvatarBox: "h-7 w-7 border border-white/15",
                    userButtonPopoverCard: "border border-white/10 bg-zinc-950 text-zinc-100",
                    userButtonPopoverActionButton: "hover:bg-white/5 text-zinc-200",
                    userButtonPopoverActionButtonText: "text-xs",
                    userButtonPopoverFooter: "hidden",
                  },
                }}
              />
            </Show>
          </div>
        </div>
      </div>
    </header>
  );
}
