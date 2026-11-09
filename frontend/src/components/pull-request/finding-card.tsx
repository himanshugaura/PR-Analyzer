"use client";

import { FileCode, CheckCircle2, XCircle, Copy, Check } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useUpdateFindingStatus } from "../../hooks/use-reviews";
import type { Finding } from "../../types";

const SEVERITY_BORDER: Record<string, string> = {
  CRITICAL: "border-l-red-500/60",
  HIGH: "border-l-orange-500/60",
  MEDIUM: "border-l-amber-500/60",
  LOW: "border-l-zinc-700",
  INFO: "border-l-zinc-800",
};

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
  const borderColor = SEVERITY_BORDER[finding.severity] || "border-l-zinc-800";

  return (
    <div
      className={`rounded-xl border border-white/8 bg-white/[0.03] backdrop-blur-sm p-4 border-l-2 ${borderColor} transition-all ${
        isResolved || isDismissed ? "opacity-50" : ""
      }`}
    >
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <Badge
            variant={
              finding.severity === "CRITICAL" ? "critical"
              : finding.severity === "HIGH" ? "high"
              : finding.severity === "MEDIUM" ? "medium"
              : finding.severity === "LOW" ? "low"
              : "info"
            }
          >
            {finding.severity}
          </Badge>
          <Badge variant="outline">{finding.category}</Badge>
          {finding.confidence && (
            <span className="text-[10px] text-zinc-600 font-mono">
              {Math.round(finding.confidence * 100)}% confidence
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {finding.commentStatus === "POSTED" && (
            <Badge variant="outline" className="text-[10px] text-zinc-600">↑ GitHub</Badge>
          )}
          <Badge variant={isResolved || isDismissed ? "outline" : "secondary"} className="text-[10px]">
            {finding.status}
          </Badge>
        </div>
      </div>

      {/* Title & Description */}
      <h3 className="text-sm font-semibold text-zinc-100 mb-1.5">{finding.title}</h3>
      <p className="text-xs text-zinc-500 leading-relaxed whitespace-pre-wrap">{finding.message}</p>

      {/* File Location */}
      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-white/5 text-xs font-mono text-zinc-600">
        <FileCode className="h-3.5 w-3.5 shrink-0" />
        <span className="truncate">{finding.filePath}</span>
        {finding.line && (
          <span className="rounded bg-white/5 px-1.5 py-0.5 text-[10px] text-zinc-500 border border-white/5 shrink-0">
            L{finding.line}
          </span>
        )}
      </div>

      {/* Suggestion */}
      {finding.suggestion && (
        <div className="mt-3 rounded-lg border border-white/8 bg-black/40 overflow-hidden">
          <div className="flex items-center justify-between px-3 py-1.5 border-b border-white/5 text-[10px] text-zinc-600 font-mono">
            <span>SUGGESTED FIX</span>
            <button
              type="button"
              onClick={handleCopySuggestion}
              className="flex items-center gap-1 hover:text-zinc-200 cursor-pointer transition-colors"
            >
              {copied ? (
                <><Check className="h-3 w-3 text-amber-400" /><span className="text-amber-400">Copied</span></>
              ) : (
                <><Copy className="h-3 w-3" /><span>Copy</span></>
              )}
            </button>
          </div>
          <pre className="p-3 text-xs font-mono text-zinc-300 overflow-x-auto whitespace-pre-wrap">
            <code>{finding.suggestion}</code>
          </pre>
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-white/5">
        {finding.status !== "RESOLVED" && (
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-xs gap-1"
            onClick={() => updateStatusMutation.mutate({ findingId: finding.id, status: "RESOLVED" })}
            isLoading={updateStatusMutation.isPending}
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            <span>Resolve</span>
          </Button>
        )}
        {finding.status !== "DISMISSED" && (
          <Button
            size="sm"
            variant="ghost"
            className="h-7 text-xs gap-1 text-zinc-600 hover:text-zinc-400"
            onClick={() => updateStatusMutation.mutate({ findingId: finding.id, status: "DISMISSED" })}
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
            className="h-7 text-xs text-zinc-600"
            onClick={() => updateStatusMutation.mutate({ findingId: finding.id, status: "OPEN" })}
            isLoading={updateStatusMutation.isPending}
          >
            Reopen
          </Button>
        )}
      </div>
    </div>
  );
}
