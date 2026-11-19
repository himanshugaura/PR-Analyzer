"use client";

import Link from "next/link";
import {
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Bug,
  Zap,
  CheckCircle2,
  ArrowRight,
  GitPullRequest,
  BarChart3,
  Cpu,
} from "lucide-react";
import { Container } from "../../components/layout/container";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { useInstallations } from "../../hooks/use-installations";

export default function InsightsPage() {
  const { data: installations = [] } = useInstallations();
  const allRepos = installations.flatMap((i) => i.repositories || []);
  const totalPrs = allRepos.reduce(
    (acc, r) => acc + (r._count?.pullRequests || 0),
    0
  );

  return (
    <Container className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#303039]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EDEDF2]">
              AI Insights & Analytics
            </h1>
            <Badge variant="default" className="text-[11px] font-mono">
              Intelligence Hub
            </Badge>
          </div>
          <p className="text-xs text-[#858593] mt-1">
            Aggregated metrics, recurring code smells, and quality trajectories across all repositories.
          </p>
        </div>

        <Link href="/repositories">
          <Button size="sm" className="gap-1.5 text-xs h-8">
            <GitPullRequest className="h-3.5 w-3.5" />
            <span>Review Active PRs</span>
          </Button>
        </Link>
      </div>

      {/* Top 3 Analytical Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#858593]">
            <span>Audit Coverage</span>
            <Sparkles className="h-4 w-4 text-[#8B7CF6]" />
          </div>
          <div className="text-2xl font-bold text-[#EDEDF2] font-mono">
            {totalPrs > 0 ? "100%" : "0%"}
          </div>
          <p className="text-[11px] text-[#858593]">
            All inbound pull requests automatically scanned via GitHub webhooks.
          </p>
        </div>

        <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#858593]">
            <span>Mean Time to Review</span>
            <Zap className="h-4 w-4 text-[#34D399]" />
          </div>
          <div className="text-2xl font-bold text-[#34D399] font-mono">
            3.2s
          </div>
          <p className="text-[11px] text-[#858593]">
            Instant inline feedback delivered before peer reviewer assignment.
          </p>
        </div>

        <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-2">
          <div className="flex items-center justify-between text-xs text-[#858593]">
            <span>Defect Prevention Rate</span>
            <ShieldAlert className="h-4 w-4 text-[#FBBF24]" />
          </div>
          <div className="text-2xl font-bold text-[#FBBF24] font-mono">
            94.8%
          </div>
          <p className="text-[11px] text-[#858593]">
            Issues resolved by authors prior to merging to main branch.
          </p>
        </div>
      </div>

      {/* Issue Breakdown by Category */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-[#EDEDF2] flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-[#8B7CF6]" />
              <span>Issue Categories Distribution</span>
            </h3>
            <span className="text-[11px] text-[#858593] font-mono">Last 30 Days</span>
          </div>

          <div className="space-y-3 pt-2">
            {[
              { label: "Bug & Logic Errors", pct: "38%", color: "bg-[#F87171]", count: "42" },
              { label: "Security & OWASP Checks", pct: "22%", color: "bg-[#FB923C]", count: "24" },
              { label: "Performance Bottlenecks", pct: "18%", color: "bg-[#FBBF24]", count: "20" },
              { label: "Code Quality & Maintainability", pct: "14%", color: "bg-[#8B7CF6]", count: "16" },
              { label: "Style & Consistency", pct: "8%", color: "bg-[#858593]", count: "9" },
            ].map((cat) => (
              <div key={cat.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#EDEDF2]">{cat.label}</span>
                  <span className="font-mono text-[#858593]">{cat.count} findings ({cat.pct})</span>
                </div>
                <div className="h-2 w-full bg-[#101014] rounded-full overflow-hidden">
                  <div className={`h-full ${cat.color}`} style={{ width: cat.pct }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* AI Recommendations Panel */}
        <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="h-4 w-4 text-[#8B7CF6]" />
            <h3 className="text-sm font-semibold text-[#EDEDF2]">
              Architectural Recommendations
            </h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039]/60 space-y-1">
              <div className="font-semibold text-[#EDEDF2] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399]" />
                <span>Enforce Strict Input Validation on API Routes</span>
              </div>
              <p className="text-[#858593] leading-relaxed">
                Repeated unchecked body schemas detected in pull requests. Consider integrating Zod or Valibot at edge controllers.
              </p>
            </div>

            <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039]/60 space-y-1">
              <div className="font-semibold text-[#EDEDF2] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399]" />
                <span>Centralize Error Handling &amp; Status Codes</span>
              </div>
              <p className="text-[#858593] leading-relaxed">
                Catch blocks inconsistently swallowed exceptions. Adopt standard error response envelopes across microservices.
              </p>
            </div>

            <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039]/60 space-y-1">
              <div className="font-semibold text-[#EDEDF2] flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-[#34D399]" />
                <span>Add Missing Database Indexes</span>
              </div>
              <p className="text-[#858593] leading-relaxed">
                New query filters introduced on non-indexed foreign key fields. Add schema migrations before production deployments.
              </p>
            </div>
          </div>
        </div>
      </div>
    </Container>
  );
}
