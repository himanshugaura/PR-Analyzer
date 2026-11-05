import Link from "next/link";
import { ArrowLeft, GitBranch, Globe, Lock } from "lucide-react";
import { Badge } from "../ui/badge";
import { formatDate } from "../../lib/utils";
import type { Repository } from "../../types";

export function RepoHeader({ repository }: { repository: Repository }) {
  return (
    <div className="space-y-4 mb-8">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-500 hover:text-zinc-950 dark:hover:text-zinc-100 transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Dashboard</span>
      </Link>

      <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs text-zinc-400 font-mono">
              {repository.ownerLogin} /
            </span>
            <Badge variant="outline" className="text-[10px] font-mono">
              {repository.private ? (
                <span className="flex items-center gap-1">
                  <Lock className="h-2.5 w-2.5" /> Private
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Globe className="h-2.5 w-2.5" /> Public
                </span>
              )}
            </Badge>
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50">
            {repository.name}
          </h1>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-zinc-500 dark:text-zinc-400">
            {repository.defaultBranch && (
              <span className="flex items-center gap-1 font-mono">
                <GitBranch className="h-3 w-3" />
                {repository.defaultBranch}
              </span>
            )}
            <span>Created {formatDate(repository.createdAt)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
