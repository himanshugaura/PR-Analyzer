"use client";

import { FileCode, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useUpdateFindingStatus } from "../../hooks/use-reviews";
import type { Finding } from "../../types";

export function FindingCard({ finding }: { finding: Finding }) {
  const updateStatusMutation = useUpdateFindingStatus();
  const [copied, setCopied] = useState(false);

  const handleCopySuggestion = () => {
    if (finding.suggestion) {
      navigator.clipboard.writeText(finding.suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isResolved = finding.status === "RESOLVED";
  const isDismissed = finding.status === "DISMISSED";

  return (
    <div className={`rounded-xl border transition-all p-4 sm:p-5 ${
      isResolved
        ? "border-zinc-200 bg-zinc-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/40 opacity-75"
        : isDismissed
        ? "border-zinc-200 bg-zinc-50/20 dark:border-zinc-800/40 dark:bg-zinc-950/20 opacity-60"
        : "border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-950 shadow-xs"
    }`}>
      {/* Header Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2.5">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={
              finding.severity === "CRITICAL"
                ? "critical"
                : finding.severity === "HIGH"
                ? "high"
                : finding.severity === "MEDIUM"
                ? "medium"
                : finding.severity === "LOW"
                ? "low"
                : "info"
            }
            className="font-mono text-[10px]"
          >
            {finding.severity}
          </Badge>

          <Badge variant="outline" className="font-mono text-[10px]">
            {finding.category}
          </Badge>

          {finding.confidence && (
            <span className="text-[10px] text-zinc-400 font-mono">
              {Math.round(finding.confidence * 100)}% confidence
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {finding.commentStatus === "POSTED" && (
            <Badge variant="outline" className="text-[10px] font-mono text-zinc-400">
              Posted to GitHub
            </Badge>
          )}

          <Badge
            variant={isResolved ? "outline" : isDismissed ? "outline" : "default"}
            className="text-[10px] font-mono"
          >
            {finding.status}
          </Badge>
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-sm font-semibold tracking-tight text-zinc-950 dark:text-zinc-50 mb-1.5">
        {finding.title}
      </h3>
      <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed whitespace-pre-wrap">
        {finding.message}
      </p>

      {/* File & Line Location */}
      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-900 text-xs font-mono text-zinc-500 dark:text-zinc-400">
        <FileCode className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
        <span className="truncate">{finding.filePath}</span>
        {finding.line && (
          <span className="rounded bg-zinc-100 px-1 py-0.2 text-[10px] text-zinc-600 dark:bg-zinc-800 dark:text-zinc-300">
            Line {finding.line}
          </span>
        )}
      </div>

      {/* Code Suggestion Box */}
      {finding.suggestion && (
        <div className="mt-3 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100/70 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-500 font-mono">
            <span>Suggested Code Fix</span>
            <button
              type="button"
              onClick={handleCopySuggestion}
              className="flex items-center gap-1 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="h-3 w-3 text-zinc-700 dark:text-zinc-200" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="p-3 text-xs font-mono text-zinc-800 dark:text-zinc-200 overflow-x-auto whitespace-pre-wrap">
            <code>{finding.suggestion}</code>
          </pre>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-900">
        {finding.status !== "RESOLVED" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() =>
              updateStatusMutation.mutate({
                findingId: finding.id,
                status: "RESOLVED",
              })
            }
            isLoading={updateStatusMutation.isPending}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Mark Resolved</span>
          </Button>
        )}

        {finding.status !== "DISMISSED" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1 text-zinc-400 hover:text-zinc-600"
            onClick={() =>
              updateStatusMutation.mutate({
                findingId: finding.id,
                status: "DISMISSED",
              })
            }
            isLoading={updateStatusMutation.isPending}
          >
            <XCircle className="h-3.5 w-3.5" />
            <span>Dismiss</span>
          </Button>
        )}

        {(isResolved || isDismissed) && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs text-zinc-400"
            onClick={() =>
              updateStatusMutation.mutate({
                findingId: finding.id,
                status: "OPEN",
              })
            }
            isLoading={updateStatusMutation.isPending}
          >
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}
