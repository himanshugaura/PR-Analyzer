"use client";

import { Search, Loader2 } from "lucide-react";
import { Container } from "../components/layout/container";
import { StatsOverview } from "../components/dashboard/stats-overview";
import { InstallationList } from "../components/dashboard/installation-list";
import { Input } from "../components/ui/input";
import { useInstallations } from "../hooks/use-installations";
import { useUiStore } from "../store/use-ui-store";

export default function DashboardPage() {
  const searchQuery = useUiStore((s) => s.searchQuery);
  const setSearchQuery = useUiStore((s) => s.setSearchQuery);

  const { data: installations = [], isLoading, error } = useInstallations(
    searchQuery || undefined,
  );

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
            Failed to load installations. Please check that your backend server is running on port 5000.
          </div>
        ) : (
          <InstallationList installations={installations} />
        )}
      </div>
    </Container>
  );
}
