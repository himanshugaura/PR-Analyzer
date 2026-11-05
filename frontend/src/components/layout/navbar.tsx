"use client";

import Link from "next/link";
import { GitPullRequest, Plus, ShieldCheck } from "lucide-react";
import { Button } from "../ui/button";
import { useUiStore } from "../../store/use-ui-store";

export function Navbar() {
  const setLinkModalOpen = useUiStore((s) => s.setLinkModalOpen);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/80 backdrop-blur-md dark:border-zinc-800 dark:bg-zinc-950/80">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight text-zinc-900 dark:text-zinc-50"
          >
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950">
              <GitPullRequest className="h-4 w-4" />
            </div>
            <span className="text-sm font-bold tracking-wider uppercase">
              PR Analyzer
            </span>
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-xs font-medium text-zinc-500 dark:text-zinc-400">
            <Link
              href="/"
              className="transition-colors hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Dashboard
            </Link>
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-zinc-200 bg-zinc-50 px-2.5 py-1 text-xs text-zinc-600 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-900 dark:text-zinc-100" />
            <span className="font-mono text-[11px]">Gemini 2.5 Active</span>
          </div>

          <Button
            size="sm"
            onClick={() => setLinkModalOpen(true)}
            className="gap-1.5 text-xs h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Connect Installation</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
