"use client";

import { FileText, Plus, Minus } from "lucide-react";
import { Badge } from "../ui/badge";
import type { GitHubPullRequestFile } from "../../types";

export function DiffViewer({
  files = [],
  rawDiff,
}: {
  files: GitHubPullRequestFile[];
  rawDiff?: string;
}) {
  if (files.length === 0 && !rawDiff) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center text-xs text-zinc-400">
        No code changes found in this pull request diff.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Changed files summary */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pb-2 border-b border-zinc-200 dark:border-zinc-800">
        <span className="font-medium text-zinc-900 dark:text-zinc-100">
          {files.length} changed files
        </span>
        <div className="flex items-center gap-3 font-mono">
          <span className="flex items-center gap-0.5 text-zinc-600 dark:text-zinc-400">
            <Plus className="h-3 w-3" />
            {files.reduce((a, f) => a + f.additions, 0)} additions
          </span>
          <span className="flex items-center gap-0.5 text-zinc-400 dark:text-zinc-600">
            <Minus className="h-3 w-3" />
            {files.reduce((a, f) => a + f.deletions, 0)} deletions
          </span>
        </div>
      </div>

      {/* File Diff Hunks */}
      {files.map((file) => (
        <div
          key={file.filename}
          className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs"
        >
          {/* File Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
            <div className="flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-zinc-400" />
              <span className="font-semibold text-zinc-900 dark:text-zinc-100">
                {file.filename}
              </span>
              <Badge variant="outline" className="text-[10px]">
                {file.status}
              </Badge>
            </div>

            <div className="flex items-center gap-2 text-[11px]">
              <span className="text-zinc-600 dark:text-zinc-300">
                +{file.additions}
              </span>
              <span className="text-zinc-400 dark:text-zinc-500">
                -{file.deletions}
              </span>
            </div>
          </div>

          {/* Patch Lines */}
          {file.patch ? (
            <div className="p-3 font-mono text-[11px] leading-relaxed overflow-x-auto bg-zinc-950 text-zinc-200 dark:bg-black">
              {file.patch.split("\n").map((line, idx) => {
                const isAdd = line.startsWith("+");
                const isDel = line.startsWith("-");
                const isHeader = line.startsWith("@@");

                return (
                  <div
                    key={idx}
                    className={`whitespace-pre ${
                      isAdd
                        ? "bg-zinc-900 text-zinc-100 font-medium"
                        : isDel
                        ? "bg-zinc-950 text-zinc-500"
                        : isHeader
                        ? "text-zinc-500 font-semibold py-1"
                        : "text-zinc-300"
                    }`}
                  >
                    {line}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="p-4 text-xs text-zinc-400 italic">
              Binary file or empty changes.
            </p>
          )}
        </div>
      ))}
    </div>
  );
}
