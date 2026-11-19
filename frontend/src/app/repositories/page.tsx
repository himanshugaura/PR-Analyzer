"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ExternalLink,
  GitBranch,
  Lock,
  Globe,
  ChevronRight,
  Loader2,
  FolderGit2,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Badge } from "../../components/ui/badge";
import { useInstallations } from "../../hooks/use-installations";
import { formatRelativeTime } from "../../lib/utils";
import type { Repository } from "../../types";

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/revue-de-pr/installations/new";

function SkeletonRow() {
  return (
    <tr className="border-b border-[#303039]/50">
      {[...Array(7)].map((_, i) => (
        <td key={i} className="py-3.5 px-4">
          <div className="h-4 bg-[#292932] rounded animate-pulse" style={{ width: `${60 + i * 10}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function RepositoriesPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const { data: installations = [], isLoading } = useInstallations();

  const allRepos: Repository[] = useMemo(
    () => installations.flatMap((inst) => inst.repositories || []),
    [installations]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return allRepos
      .filter(
        (r) =>
          !q ||
          r.name.toLowerCase().includes(q) ||
          r.fullName.toLowerCase().includes(q)
      )
      .sort(
        (a, b) =>
          new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      );
  }, [allRepos, search]);

  return (
    <div className="min-h-screen bg-[#101014] p-6 md:p-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
        <div>
          <h1 className="text-[26px] font-semibold text-[#EDEDF2] tracking-tight">
            Repositories
          </h1>
          <p className="text-sm text-[#858593] mt-1">
            Manage and monitor your connected GitHub repositories
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open(GITHUB_APP_INSTALL_URL, "_blank")}
          className="shrink-0"
        >
          <ExternalLink className="h-4 w-4 mr-2" />
          Connect Repository
        </Button>
      </div>

      {/* Search & Sort Bar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#858593]" />
          <Input
            placeholder="Search repositories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="h-9 px-3 text-sm bg-[#1E1E26] border border-[#303039] rounded-[6px] text-[#EDEDF2] focus:outline-none focus:border-[#8B7CF6] cursor-pointer"
          defaultValue="updatedAt"
        >
          <option value="updatedAt">Last Updated</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-[#1E1E26] border border-[#303039] rounded-[8px] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="border-b border-[#303039]">
                {[
                  "Repository",
                  "Account",
                  "Default Branch",
                  "PRs",
                  "Status",
                  "Last Updated",
                  "Actions",
                ].map((col) => (
                  <th
                    key={col}
                    className="py-3 px-4 text-left text-[11px] font-medium text-[#858593] uppercase tracking-wider"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <>
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                  <SkeletonRow />
                </>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <FolderGit2 className="h-8 w-8 text-[#303039]" />
                      <p className="text-sm font-medium text-[#858593]">
                        {search ? "No repositories match your search" : "No repositories connected"}
                      </p>
                      {!search && (
                        <p className="text-[13px] text-[#858593]/60 max-w-xs">
                          Connect a GitHub repository to start analyzing pull requests.
                        </p>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filtered.map((repo) => (
                  <tr
                    key={repo.id}
                    className="border-b border-[#303039]/50 hover:bg-[#292932] transition-colors cursor-pointer"
                    onClick={() => router.push(`/repositories/${repo.id}`)}
                  >
                    {/* Repository name */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-[#EDEDF2]">
                          {repo.name}
                        </span>
                        {repo.private ? (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#292932] border border-[#303039] text-[10px] text-[#858593]">
                            <Lock className="h-2.5 w-2.5" />
                            Private
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-[4px] bg-[#292932] border border-[#303039] text-[10px] text-[#858593]">
                            <Globe className="h-2.5 w-2.5" />
                            Public
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-[#858593] font-mono mt-0.5">{repo.fullName}</p>
                    </td>

                    {/* Account */}
                    <td className="py-3.5 px-4 text-sm text-[#858593]">
                      {repo.ownerLogin}
                    </td>

                    {/* Default Branch */}
                    <td className="py-3.5 px-4">
                      {repo.defaultBranch ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-[#292932] border border-[#303039] rounded-[6px] text-[12px] text-[#858593] font-mono">
                          <GitBranch className="h-3 w-3" />
                          {repo.defaultBranch}
                        </span>
                      ) : (
                        <span className="text-[#303039] text-[12px]">—</span>
                      )}
                    </td>

                    {/* PRs */}
                    <td className="py-3.5 px-4 text-sm text-[#858593] font-mono">
                      {repo._count?.pullRequests ?? "—"}
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      {repo.enabled ? (
                        <Badge variant="success">Enabled</Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </td>

                    {/* Last Updated */}
                    <td className="py-3.5 px-4 text-[12px] text-[#858593] font-mono">
                      {formatRelativeTime(repo.updatedAt)}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4" onClick={(e) => e.stopPropagation()}>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => router.push(`/repositories/${repo.id}`)}
                        className="gap-1"
                      >
                        View PRs
                        <ChevronRight className="h-3.5 w-3.5" />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Count footer */}
      {!isLoading && filtered.length > 0 && (
        <p className="mt-3 text-[12px] text-[#858593]">
          {filtered.length} {filtered.length === 1 ? "repository" : "repositories"}
          {search && ` matching "${search}"`}
        </p>
      )}
    </div>
  );
}
