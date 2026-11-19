"use client";

import { FileCode, CheckCircle2, Copy, Check, ChevronDown, ChevronUp, Sparkles, ExternalLink, Loader2 } from "lucide-react";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { useUpdateFindingStatus, useAutoFixFinding } from "../../hooks/use-reviews";
import type { Finding } from "../../types";

const SEVERITY_BORDER_COLOR: Record<string, string> = {
  CRITICAL: "#F87171",
  HIGH: "#FB923C",
  MEDIUM: "#FBBF24",
  LOW: "#60A5FA",
  INFO: "#858593",
};

const SEVERITY_BADGE_CLASS: Record<string, string> = {
  CRITICAL: "bg-[#F87171]/15 text-[#F87171] border border-[#F87171]/25",
  HIGH: "bg-orange-400/15 text-orange-400 border border-orange-400/25",
  MEDIUM: "bg-[#FBBF24]/15 text-[#FBBF24] border border-[#FBBF24]/25",
  LOW: "bg-blue-400/15 text-blue-400 border border-blue-400/25",
  INFO: "bg-[#858593]/15 text-[#858593] border border-[#858593]/25",
};

export function FindingCard({ finding }: { finding: Finding }) {
  const updateStatusMutation = useUpdateFindingStatus();
  const autoFixMutation = useAutoFixFinding();
  const [copied, setCopied] = useState(false);
  const [suggestionExpanded, setSuggestionExpanded] = useState(false);

  const handleCopySuggestion = () => {
    if (finding.suggestion) {
      navigator.clipboard.writeText(finding.suggestion);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const isResolved = finding.status === "RESOLVED";
  const severityBorderColor = SEVERITY_BORDER_COLOR[finding.severity] ?? "#858593";
  const severityBadgeClass = SEVERITY_BADGE_CLASS[finding.severity] ?? SEVERITY_BADGE_CLASS.INFO;

  return (
    <div
      className={`relative rounded-[8px] border border-[#303039] bg-[#1E1E26] p-4 hover:border-[#303039]/80 transition-all overflow-hidden ${
        isResolved ? "opacity-50" : ""
      }`}
      style={{ borderLeft: `2px solid ${severityBorderColor}` }}
    >
      {/* Header row */}
      <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
        <div className="flex flex-wrap items-center gap-1.5">
          {/* Category chip */}
          <span className="text-[11px] font-mono px-1.5 py-0.5 rounded-[4px] bg-[#292932] text-[#858593] border border-[#303039]">
            {finding.category}
          </span>
          {finding.confidence && (
            <span className="text-[10px] text-[#858593] font-mono">
              {Math.round(finding.confidence * 100)}% confidence
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {finding.commentStatus === "POSTED" && (
            <span className="text-[10px] text-[#858593] border border-[#303039] rounded-[4px] px-1.5 py-0.5 font-mono">
              → GitHub
            </span>
          )}
          {/* Severity badge */}
          <span className={`text-[10px] font-mono font-semibold uppercase tracking-wider px-2 py-0.5 rounded-[4px] ${severityBadgeClass}`}>
            {finding.severity}
          </span>
          {/* Status badge */}
          <span className="text-[10px] text-[#858593] border border-[#303039] rounded-[4px] px-1.5 py-0.5 font-mono">
            {finding.status}
          </span>
        </div>
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-[#EDEDF2] mb-1.5 leading-snug">{finding.title}</h3>

      {/* Message */}
      <p className="text-[13px] text-[#858593] leading-relaxed whitespace-pre-wrap">{finding.message}</p>

      {/* File location */}
      <div className="flex items-center gap-1.5 mt-3 pt-2.5 border-t border-[#303039]/60">
        <FileCode className="h-3.5 w-3.5 text-[#858593] shrink-0" />
        <span className="font-mono text-[11px] text-[#858593] truncate">{finding.filePath}</span>
        {finding.line && (
          <span className="bg-[#292932] rounded-[4px] px-1.5 py-0.5 text-[11px] text-[#858593] font-mono shrink-0 border border-[#303039]/60">
            L{finding.line}
          </span>
        )}
        {finding.startLine && finding.startLine !== finding.line && (
          <span className="bg-[#292932] rounded-[4px] px-1.5 py-0.5 text-[11px] text-[#858593] font-mono shrink-0 border border-[#303039]/60">
            -{finding.startLine}
          </span>
        )}
      </div>

      {/* Expandable suggestion */}
      {finding.suggestion && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setSuggestionExpanded((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] text-[#858593] hover:text-[#EDEDF2] transition-colors font-mono cursor-pointer"
          >
            {suggestionExpanded ? (
              <ChevronUp className="h-3 w-3" />
            ) : (
              <ChevronDown className="h-3 w-3" />
            )}
            Suggested fix
          </button>

          {suggestionExpanded && (
            <div className="mt-2 rounded-[6px] bg-[#101014] border border-[#303039] overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#303039] text-[10px] text-[#858593] font-mono">
                <span>SUGGESTION</span>
                <button
                  type="button"
                  onClick={handleCopySuggestion}
                  className="flex items-center gap-1 hover:text-[#EDEDF2] cursor-pointer transition-colors"
                >
                  {copied ? (
                    <><Check className="h-3 w-3 text-[#34D399]" /><span className="text-[#34D399]">Copied</span></>
                  ) : (
                    <><Copy className="h-3 w-3" /><span>Copy</span></>
                  )}
                </button>
              </div>
              <pre className="p-3 font-mono text-[12px] text-[#EDEDF2] overflow-x-auto whitespace-pre-wrap leading-relaxed">
                <code>{finding.suggestion}</code>
              </pre>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 mt-4 pt-3 border-t border-[#303039]/60">
        <div className="text-[11px] font-mono">
          {autoFixMutation.data?.commitSha ? (
            <a
              href={autoFixMutation.data.commitUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[#34D399] hover:underline flex items-center gap-1"
            >
              <Check className="h-3 w-3" />
              <span>Fix committed ({autoFixMutation.data.commitSha.slice(0, 7)})</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          ) : isResolved ? (
            <span className="text-[#34D399] flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3" /> Issue resolved
            </span>
          ) : null}
        </div>

        <div className="flex items-center gap-1.5 ml-auto">
          {finding.status !== "RESOLVED" ? (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1.5 text-[#A78BFA] hover:text-[#C4B5FD] hover:bg-[#8B7CF6]/15 font-medium border border-[#8B7CF6]/25 bg-[#8B7CF6]/10"
              onClick={() => autoFixMutation.mutate(finding.id)}
              disabled={autoFixMutation.isPending}
            >
              {autoFixMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-[#8B7CF6]" />
                  <span>AI Fixing & Committing...</span>
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5 text-[#8B7CF6]" />
                  <span>Resolve with AI</span>
                </>
              )}
            </Button>
          ) : (
            <Button
              size="sm"
              variant="ghost"
              className="h-7 text-xs gap-1 text-[#858593] hover:text-[#EDEDF2]"
              onClick={() => updateStatusMutation.mutate({ findingId: finding.id, status: "OPEN" })}
              disabled={updateStatusMutation.isPending}
            >
              <span>Reopen</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
