"use client";

import { useUiStore } from "../../store/use-ui-store";
import type { Severity, FindingStatus } from "../../types";

const SEVERITIES: Array<Severity | "ALL"> = [
  "ALL",
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
  "INFO",
];

const STATUSES: Array<FindingStatus | "ALL"> = ["ALL", "OPEN", "RESOLVED", "DISMISSED"];

export function FindingsFilterBar({
  totalCount,
}: {
  totalCount?: number;
}) {
  const selectedSeverity = useUiStore((s) => s.severityFilter);
  const setSeverity = useUiStore((s) => s.setSeverityFilter);
  const selectedStatus = useUiStore((s) => s.statusFilter);
  const setStatus = useUiStore((s) => s.setStatusFilter);

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-3 mb-4 border-b border-zinc-200 dark:border-zinc-800">
      {/* Severity filter pills */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-xs text-zinc-400 mr-1 font-medium">
          Severity {totalCount !== undefined ? `(${totalCount}):` : ":"}
        </span>
        {SEVERITIES.map((sev) => {
          const isSelected =
            sev === "ALL" ? !selectedSeverity : selectedSeverity === sev;

          return (
            <button
              key={sev}
              type="button"
              onClick={() => setSeverity(sev === "ALL" ? undefined : sev)}
              className={`px-2.5 py-1 text-[11px] font-mono rounded-md border transition-all cursor-pointer ${
                isSelected
                  ? "bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 font-semibold"
                  : "bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
              }`}
            >
              {sev}
            </button>
          );
        })}
      </div>

      {/* Status filter pills */}
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-zinc-400 mr-1 font-medium">Status:</span>
        {STATUSES.map((st) => {
          const isSelected =
            st === "ALL" ? !selectedStatus : selectedStatus === st;

          return (
            <button
              key={st}
              type="button"
              onClick={() => setStatus(st === "ALL" ? undefined : st)}
              className={`px-2 py-0.5 text-[11px] font-mono rounded-md border transition-all cursor-pointer ${
                isSelected
                  ? "bg-zinc-950 text-white border-zinc-950 dark:bg-zinc-100 dark:text-zinc-950 dark:border-zinc-100 font-semibold"
                  : "bg-transparent text-zinc-500 border-zinc-200 hover:border-zinc-400 dark:border-zinc-800 dark:text-zinc-400 dark:hover:border-zinc-700"
              }`}
            >
              {st}
            </button>
          );
        })}
      </div>
    </div>
  );
}
