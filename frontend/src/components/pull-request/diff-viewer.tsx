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
      <div className="rounded-[8px] border border-dashed border-[#303039] p-12 text-center text-xs text-[#858593] bg-[#1E1E26]/40">
        No code changes found in this pull request diff.
      </div>
    );
  }

  const totalAdditions = files.reduce((a, f) => a + (f.additions || 0), 0);
  const totalDeletions = files.reduce((a, f) => a + (f.deletions || 0), 0);

  return (
    <div className="space-y-4">
      {/* Changed files summary & view mode toggle */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#858593] pb-3 border-b border-[#303039]">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-[#EDEDF2] font-mono text-xs">
            {files.length > 0 ? `${files.length} changed files` : "Raw Diff"}
          </span>
          {files.length > 0 && (
            <div className="flex items-center gap-2 font-mono text-[11px]">
              <span className="flex items-center gap-0.5 text-[#34D399] font-medium bg-[#34D399]/10 px-1.5 py-0.5 rounded-[4px]">
                <Plus className="h-3 w-3" />
                {totalAdditions}
              </span>
              <span className="flex items-center gap-0.5 text-[#F87171] font-medium bg-[#F87171]/10 px-1.5 py-0.5 rounded-[4px]">
                <Minus className="h-3 w-3" />
                {totalDeletions}
              </span>
            </div>
          )}
        </div>

        {rawDiff && files.length > 0 && (
          <div className="flex items-center gap-1 rounded-[6px] bg-[#1E1E26] p-0.5 border border-[#303039]">
            <button
              type="button"
              onClick={() => setViewMode("files")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === "files"
                  ? "bg-[#292932] text-[#EDEDF2]"
                  : "text-[#858593] hover:text-[#EDEDF2]"
              }`}
            >
              <Eye className="h-3 w-3" />
              <span>Files ({files.length})</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("raw")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-[4px] text-[11px] font-medium transition-colors cursor-pointer ${
                viewMode === "raw"
                  ? "bg-[#292932] text-[#EDEDF2]"
                  : "text-[#858593] hover:text-[#EDEDF2]"
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
        <div className="rounded-[8px] border border-[#303039] bg-[#0C0C10] overflow-hidden font-mono text-xs">
          <div className="px-4 py-2 bg-[#17171D] border-b border-[#303039] text-[11px] text-[#858593] font-mono flex items-center justify-between">
            <span>Unified Git Diff</span>
            <span className="text-[10px] text-[#858593]">Raw Stream</span>
          </div>
          <pre className="p-4 overflow-x-auto text-[12px] leading-relaxed text-[#EDEDF2] font-mono select-text">
            {rawDiff}
          </pre>
        </div>
      )}

      {/* Structured File Diff Hunks */}
      {viewMode === "files" &&
        files.map((file) => (
          <div
            key={file.filename}
            className="rounded-[8px] border border-[#303039] bg-[#0C0C10] overflow-hidden"
          >
            {/* File Header */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 bg-[#17171D] border-b border-[#303039] text-xs font-mono">
              <div className="flex items-center gap-2 min-w-0">
                <FileText className="h-3.5 w-3.5 text-[#858593] shrink-0" />
                <span className="font-semibold text-[#EDEDF2] truncate text-[12px]">
                  {file.filename}
                </span>
                <Badge variant="outline" className="text-[10px] uppercase">
                  {file.status}
                </Badge>
              </div>

              <div className="flex items-center gap-3 text-[11px]">
                <span className="text-[#34D399] font-medium font-mono">
                  +{file.additions}
                </span>
                <span className="text-[#F87171] font-medium font-mono">
                  -{file.deletions}
                </span>
                {file.blob_url && (
                  <a
                    href={file.blob_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#858593] hover:text-[#8B7CF6] transition-colors ml-1"
                    title="View file on GitHub"
                  >
                    <ExternalLink className="h-3 w-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Patch Lines */}
            {file.patch ? (
              <div className="p-1 font-mono text-[12px] leading-relaxed overflow-x-auto bg-[#0C0C10] text-[#EDEDF2] select-text">
                {file.patch.split("\n").map((line, idx) => {
                  const isAdd = line.startsWith("+");
                  const isDel = line.startsWith("-");
                  const isHeader = line.startsWith("@@");

                  return (
                    <div
                      key={idx}
                      className={`px-3 py-0.5 whitespace-pre font-mono flex items-start ${
                        isAdd
                          ? "bg-[#34D399]/8 text-[#34D399] border-l-2 border-[#34D399]"
                          : isDel
                          ? "bg-[#F87171]/8 text-[#F87171] border-l-2 border-[#F87171]"
                          : isHeader
                          ? "bg-[#8B7CF6]/8 text-[#8B7CF6] font-medium py-1 my-0.5 border-l-2 border-[#8B7CF6]/30 text-[11px]"
                          : "text-[#858593] hover:bg-[#1E1E26]/40"
                      }`}
                    >
                      <span className="inline-block w-8 shrink-0 text-right pr-3 select-none text-[10px] text-[#303039] font-mono">
                        {idx + 1}
                      </span>
                      <span className="flex-1">{line}</span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-4 text-xs text-[#858593] italic flex items-center justify-between">
                <span>Binary file or diff preview unavailable for this format.</span>
                {file.blob_url && (
                  <a
                    href={file.blob_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-[#8B7CF6] hover:underline not-italic"
                  >
                    View on GitHub <ExternalLink className="h-3 w-3 ml-0.5" />
                  </a>
                )}
              </div>
            )}
          </div>
        ))}
    </div>
  );
}
