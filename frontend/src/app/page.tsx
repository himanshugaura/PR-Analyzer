"use client";

import { Search, Loader2, GitPullRequest, ArrowRight, ShieldCheck, ExternalLink } from "lucide-react";
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
    searchQuery || undefined,
  );

  // Loading state while Clerk initializes
  if (!isLoaded) {
    return (
      <Container className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-zinc-500" />
      </Container>
    );
  }

  // Signed out state (if visited before middleware redirect or on public landing)
  if (!isSignedIn) {
    return (
      <Container className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <div className="max-w-xl space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900 text-zinc-100 shadow-xl">
            <GitPullRequest className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl font-bold tracking-tight text-zinc-100">
              PR Analyzer
            </h1>
            <p className="text-sm text-zinc-400 max-w-md mx-auto">
              Automated AI pull request code reviews, bug detection, and security analysis powered by Google Gemini.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <SignInButton mode="modal">
              <Button size="lg" className="gap-2 w-full sm:w-auto font-medium">
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

          <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-400">
            <ShieldCheck className="h-3.5 w-3.5 text-zinc-200" />
            <span>Automated inline comments & webhook evaluation</span>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-50">
            Overview
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Monitored GitHub App installations, repositories, and automated reviews.
          </p>
        </div>

        {/* Repository Search Filter */}
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-zinc-500" />
          <Input
            placeholder="Search repositories..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8 text-xs h-9 bg-zinc-900/50 border-zinc-800"
          />
        </div>
      </div>

      {/* Stats Overview */}
      <StatsOverview installations={installations} />

      {/* Installations and Repositories List */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-semibold tracking-tight text-zinc-100">
            Connected Repositories
          </h2>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Loader2 className="h-6 w-6 animate-spin text-zinc-500 mb-2" />
            <p className="text-xs text-zinc-400 font-mono">Loading installations...</p>
          </div>
        ) : error ? (
          <div className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-6 text-center text-xs text-zinc-400">
            Failed to load installations. Please check that your backend server is running on port 8080.
          </div>
        ) : (
          <InstallationList installations={installations} />
        )}
      </div>
    </Container>
  );
}
