"use client";

import { Search, Loader2, GitPullRequest, ArrowRight, ExternalLink } from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Container } from "../components/layout/container";
import { StatsOverview } from "../components/dashboard/stats-overview";
import { InstallationList } from "../components/dashboard/installation-list";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useInstallations } from "../hooks/use-installations";
import { useUiStore } from "../store/use-ui-store";

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/pr-analyzer-ai/installations/new";

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);

  const { data: installations = [], isLoading, error } = useInstallations(
    searchQuery || undefined
  );

  if (!isLoaded) {
    return (
      <Container className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-amber-500" />
      </Container>
    );
  }

  if (!isSignedIn) {
    return (
      <Container className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <div className="max-w-md space-y-8">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-amber-500/20 bg-amber-500/10 text-amber-400">
            <GitPullRequest className="h-8 w-8" />
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-100 font-mono">
              PR ANALYZER
            </h1>
            <p className="text-sm text-zinc-500 max-w-sm mx-auto leading-relaxed">
              Automated AI code reviews, bug detection, and security analysis for your pull requests.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <SignInButton mode="modal">
              <Button size="lg" className="gap-2 w-full sm:w-auto">
                <span>Sign In to Continue</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </SignInButton>

            <a
              href={GITHUB_APP_INSTALL_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto"
            >
              <Button variant="outline" size="lg" className="gap-2 w-full sm:w-auto">
                <span>Install GitHub App</span>
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-100 font-mono uppercase">
            Overview
          </h1>
          <p className="text-xs text-zinc-600 mt-1">
            Connected repositories and automated review activity
          </p>
        </div>

        <div className="relative w-full sm:w-60">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-600" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 h-9"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview installations={installations} />

      {/* Repositories */}
      <div>
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-sm font-semibold tracking-widest text-zinc-400 uppercase font-mono">
            Connected Repositories
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-amber-500 mb-3" />
            <p className="text-xs text-zinc-600 font-mono">Loading...</p>
          </div>
        ) : error ? (
          <div className="rounded-xl border border-white/5 bg-white/[0.02] p-8 text-center text-xs text-zinc-500">
            Failed to load installations.
          </div>
        ) : (
          <InstallationList installations={installations} />
        )}
      </div>
    </Container>
  );
}
