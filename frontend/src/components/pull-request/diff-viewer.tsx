"use client";

import { useState } from "react";
import { FileText, Plus, Minus, ExternalLink, Code2, Eye } from "lucide-react";
import { Badge } from "../ui/badge";
import type { GitHubPullRequestFile } from "../../types";

export function DiffViewer({
  files = [],
  rawDiff,
}: {
  files: GitHubPullRequestFile[];
  rawDiff?: string;
}) {
  const [viewMode, setViewMode] = useState<"files" | "raw">("files");

  if (files.length === 0 && !rawDiff) {
    return (
      <div className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-12 text-center text-xs text-zinc-400">
        No code changes found in this pull request diff.
      </div>
    );
  }

  const totalAdditions = files.reduce((a, f) => a + (f.additions || 0), 0);
  const totalDeletions = files.reduce((a, f) => a + (f.deletions || 0), 0);

  return (
    <div className="space-y-6">
      {/* Changed files summary & view mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-zinc-400 pb-3 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-zinc-900 dark:text-zinc-100">
            {files.length > 0 ? `${files.length} changed files` : "Raw Diff"}
          </span>
          {files.length > 0 && (
            <div className="flex items-center gap-2.5 font-mono text-[11px]">
              <span className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
                <Plus className="h-3 w-3" />
                {totalAdditions}
              </span>
              <span className="flex items-center gap-0.5 text-rose-600 dark:text-rose-400 font-medium">
                <Minus className="h-3 w-3" />
                {totalDeletions}
              </span>
            </div>
          )}
        </div>

        {rawDiff && files.length > 0 && (
          <div className="flex items-center gap-1 rounded-md bg-zinc-100 dark:bg-zinc-900 p-0.5 border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => setViewMode("files")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === "files"
                  ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Files ({files.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === "raw"
                  ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Code2 className="h-3 w-3" />
              <span>Unified Diff</span>
            </button>
          </div>
        )}
      </div>

      {/* Raw Unified Diff View */}
      {(viewMode === "raw" || files.length === 0) && rawDiff && (
        <div className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-950 overflow-hidden font-mono text-xs">
          <div className="px-4 py-2 bg-zinc-900/60 border-b border-zinc-800 text-[11px] text-zinc-400">
            Unified Git Diff
          </div>
          <pre className="p-4 overflow-x-auto text-[11px] leading-relaxed text-zinc-300">
            {rawDiff}
          </pre>
        </div>
      )}

      {/* Structured File Diff Hunks */}
      {viewMode === "files" &&
        files.map((file) => (
          <div
            key={file.filename}
            className="rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 overflow-hidden shadow-2xs"
          >
            {/* File Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900/70 border-b border-zinc-200 dark:border-zinc-800 text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
                <span className="font-semibold text-zinc-900 dark:text-zinc-100 truncate">
                  {file.filename}
                </span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {file.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-emerald-500 font-medium">
                  +{file.additions}
                </span>
                <span className="text-rose-500 font-medium">
                  -{file.deletions}
                </span>
                {file.blob_url && (
                  <a
                    href={file.blob_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-zinc-400 hover:text-zinc-200 transition-colors ml-1"
                    title="View file on GitHub"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Patch Lines */}
            {file.patch ? (
              <div className="p-2 font-mono text-[11px] leading-relaxed overflow-x-auto bg-zinc-950 text-zinc-200 select-text">
                {file.patch.split("\n").map((line, idx) => {
                  const isAdd = line.startsWith("+");
                  const isDel = line.startsWith("-");
                  const isHeader = line.startsWith("@@");

                  return (
                    <div
                      key={idx}
                      className={`px-3 py-0.5 whitespace-pre font-mono ${
                        isAdd
                          ? "bg-emerald-950/35 text-emerald-300 font-normal border-l-2 border-emerald-500"
                          : isDel
                          ? "bg-rose-950/35 text-rose-300 font-normal border-l-2 border-rose-500"
                          : isHeader
                          ? "bg-sky-950/25 text-sky-400 font-semibold py-1 my-0.5 border-l-2 border-sky-500/50"
                          : "text-zinc-300 hover:bg-zinc-900/40"
                      }`}
                    >
                      {line}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-xs text-zinc-400 italic flex items-center justify-between">
                <span>Binary file or diff preview unavailable for this file format.</span>
                {file.blob_url && (
                  <a
                    href={file.blob_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-zinc-300 hover:underline not-italic"
                  >
                    View full file on GitHub <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
