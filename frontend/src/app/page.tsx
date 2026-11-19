"use client";

import Link from "next/link";
import {
  Search,
  Loader2,
  GitPullRequest,
  ArrowRight,
  ExternalLink,
  Plus,
  Layers,
} from "lucide-react";
import { useAuth, SignInButton } from "@clerk/nextjs";
import { Container } from "../components/layout/container";
import { InstallationList } from "../components/dashboard/installation-list";
import { Input } from "../components/ui/input";
import { Button } from "../components/ui/button";
import { useInstallations } from "../hooks/use-installations";
import { useUiStore } from "../store/use-ui-store";

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/revue-de-pr/installations/new";

export default function DashboardPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);

  const { data: installations = [], isLoading, error } = useInstallations(
    searchQuery || undefined
  );

  const allRepos = installations.flatMap((i) => i.repositories || []);

  if (!isLoaded) {
    return (
      <Container className="flex min-h-[calc(100vh-10rem)] items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-[#8B7CF6]" />
      </Container>
    );
  }

  if (!isSignedIn) {
    return (
      <Container className="flex min-h-[calc(100vh-10rem)] flex-col items-center justify-center text-center">
        <div className="max-w-md space-y-6">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-[12px] border border-[#8B7CF6]/30 bg-[#8B7CF6]/10 text-[#8B7CF6]">
            <GitPullRequest className="h-7 w-7" />
          </div>

          <div className="space-y-2">
            <h1 className="text-3xl font-bold tracking-tight text-[#EDEDF2]">
              PR Analyzer
            </h1>
            <p className="text-sm text-[#858593] max-w-sm mx-auto leading-relaxed">
              Automated AI code reviews, bug detection, and security analysis for engineering teams.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 pt-2">
            <SignInButton mode="modal">
              <Button size="default" className="gap-2 w-full sm:w-auto">
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
              <Button variant="outline" size="default" className="gap-2 w-full sm:w-auto">
                <span>Install GitHub App</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </Button>
            </a>
          </div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-6 space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#303039]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EDEDF2]">
              Repositories
            </h1>
            <span className="font-mono text-xs text-[#858593] bg-[#1E1E26] border border-[#303039] rounded-[4px] px-2 py-0.5">
              {allRepos.length} connected
            </span>
          </div>
          <p className="text-xs text-[#858593] mt-1">
            Connected repositories and automated pull request review activity.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-[#858593]" />
            <Input
              placeholder="Search repositories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 text-xs bg-[#1E1E26] border-[#303039]"
            />
          </div>

          <a
            href={GITHUB_APP_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button size="sm" className="gap-1.5 h-8 text-xs">
              <Plus className="h-3.5 w-3.5" />
              <span>Connect Repo</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Connected Repositories List */}
      <div>
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-5 w-5 animate-spin text-[#8B7CF6] mb-3" />
            <p className="text-xs text-[#858593] font-mono">Loading repositories...</p>
          </div>
        ) : error ? (
          <div className="rounded-[8px] border border-[#F87171]/20 bg-[#F87171]/5 p-6 text-center text-xs text-[#F87171]">
            Failed to load connected repositories. Check your API connection.
          </div>
        ) : (
          <InstallationList installations={installations} />
        )}
      </div>
    </Container>
  );
}
