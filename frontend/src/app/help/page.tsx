"use client";

import {
  HelpCircle,
  BookOpen,
  GitBranch,
  Key,
  ShieldCheck,
  Terminal,
  ExternalLink,
  MessageSquare,
} from "lucide-react";
import { Container } from "../../components/layout/container";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/revue-de-pr/installations/new";

export default function HelpPage() {
  return (
    <Container className="py-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#303039]">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-bold tracking-tight text-[#EDEDF2]">
            Help &amp; Documentation
          </h1>
          <Badge variant="outline" className="text-[11px] font-mono">
            v1.0.0
          </Badge>
        </div>
        <p className="text-xs text-[#858593] mt-1">
          Everything you need to know about setting up PR Analyzer, configuring AI models, and understanding review scores.
        </p>
      </div>

      {/* Quick Setup Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#8B7CF6]/10 text-[#8B7CF6]">
            <GitBranch className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#EDEDF2]">
            1. Connect Repository
          </h3>
          <p className="text-xs text-[#858593] leading-relaxed">
            Install the PR Analyzer GitHub App on your personal account or organization to grant repository read &amp; comment permissions.
          </p>
          <a
            href={GITHUB_APP_INSTALL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block pt-1"
          >
            <Button variant="outline" size="sm" className="text-xs h-7 gap-1 border-[#303039]">
              <span>Install App</span>
              <ExternalLink className="h-3 w-3" />
            </Button>
          </a>
        </div>

        <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#34D399]/10 text-[#34D399]">
            <Terminal className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#EDEDF2]">
            2. Webhook Triggers
          </h3>
          <p className="text-xs text-[#858593] leading-relaxed">
            Whenever a pull request is opened, synchronized, or marked ready for review, our background workers immediately fetch the diff.
          </p>
        </div>

        <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#FBBF24]/10 text-[#FBBF24]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <h3 className="text-sm font-semibold text-[#EDEDF2]">
            3. AI Review &amp; Score
          </h3>
          <p className="text-xs text-[#858593] leading-relaxed">
            Gemini parses changed hunks, calculates the code quality index (0–100), and flags critical bugs directly on GitHub diff lines.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-4">
        <h3 className="text-sm font-semibold text-[#EDEDF2] flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#8B7CF6]" />
          <span>Frequently Asked Questions</span>
        </h3>

        <div className="space-y-3 pt-2 text-xs">
          <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039]/50 space-y-1">
            <div className="font-semibold text-[#EDEDF2]">
              How is the Quality Score computed?
            </div>
            <p className="text-[#858593] leading-relaxed">
              Scores start at 100 points. Penalties are deducted based on finding severities: Critical (-20 pts), High (-10 pts), Medium (-5 pts), and Low (-2 pts).
            </p>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039]/50 space-y-1">
            <div className="font-semibold text-[#EDEDF2]">
              Are my repository files kept private?
            </div>
            <p className="text-[#858593] leading-relaxed">
              Yes. Diff streams are processed in memory and encrypted in transit. Source code is never persisted to disk or used for model training.
            </p>
          </div>

          <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039]/50 space-y-1">
            <div className="font-semibold text-[#EDEDF2]">
              How are reviews triggered on existing PRs?
            </div>
            <p className="text-[#858593] leading-relaxed">
              Reviews trigger automatically whenever new commits are pushed or synchronized to the pull request branch.
            </p>
          </div>
        </div>
      </div>
    </Container>
  );
}
