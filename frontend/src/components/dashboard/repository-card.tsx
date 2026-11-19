"use client";

import Link from "next/link";
import { GitPullRequest, Lock, Globe, ArrowRight } from "lucide-react";
import type { Repository } from "../../types";

export function RepositoryCard({ repository }: { repository: Repository }) {
  return (
    <div className="group rounded-[8px] border border-[#303039] bg-[#1E1E26] p-4 transition-colors hover:border-[#8B7CF6]/30 hover:bg-[#292932]/40">
      <div className="flex items-start justify-between gap-2 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1 text-[11px] text-[#858593] font-mono">
            {repository.private ? (
              <Lock className="h-3 w-3 text-[#858593] shrink-0" />
            ) : (
              <Globe className="h-3 w-3 text-[#858593] shrink-0" />
            )}
            <span className="truncate">{repository.ownerLogin}</span>
          </div>
          <Link
            href={`/repositories/${repository.id}`}
            className="text-sm font-semibold text-[#EDEDF2] hover:text-[#8B7CF6] transition-colors truncate block"
          >
            {repository.name}
          </Link>
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-[10px] text-[#8B7CF6] font-mono uppercase tracking-wider bg-[#8B7CF6]/10 border border-[#8B7CF6]/20 px-2 py-0.5 rounded-[4px]">
            AI Enabled
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-[#303039]/60 text-xs text-[#858593]">
        <div className="flex items-center gap-1.5">
          <GitPullRequest className="h-3.5 w-3.5 text-[#858593]" />
          <span className="font-mono text-[#EDEDF2]">
            {repository._count?.pullRequests ?? 0} PRs
          </span>
        </div>

        <Link
          href={`/repositories/${repository.id}`}
          className="flex items-center gap-1 text-[11px] font-medium text-[#858593] group-hover:text-[#8B7CF6] transition-colors"
        >
          <span>View</span>
          <ArrowRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </div>
  );
}
