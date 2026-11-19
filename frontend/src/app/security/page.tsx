"use client";

import Link from "next/link";
import {
  ShieldCheck,
  ShieldAlert,
  Lock,
  Key,
  Database,
  FileCode,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import { Container } from "../../components/layout/container";
import { Badge } from "../../components/ui/badge";
import { Button } from "../../components/ui/button";
import { useInstallations } from "../../hooks/use-installations";

const SECURITY_VECTORS = [
  {
    title: "SQL & NoSQL Injection",
    description: "Detects unescaped database queries, raw string concatenation in ORMs, and improper input sanitization.",
    status: "Active Scanning",
    icon: Database,
    badge: "success",
  },
  {
    title: "Secret & Credential Leakage",
    description: "Flags committed API keys, private RSA keys, JWT secrets, and bearer tokens in diff hunks.",
    status: "Zero Toleration",
    icon: Key,
    badge: "critical",
  },
  {
    title: "Cross-Site Scripting (XSS)",
    description: "Identifies dangerouslySetInnerHTML, unescaped user inputs, and raw HTML reflections in React components.",
    status: "Active Scanning",
    icon: FileCode,
    badge: "success",
  },
  {
    title: "Broken Authentication & RBAC",
    description: "Audits endpoint decorators, missing session checks, and insecure direct object references (IDOR).",
    status: "Active Scanning",
    icon: Lock,
    badge: "success",
  },
];

export default function SecurityPage() {
  const { data: installations = [] } = useInstallations();
  const allRepos = installations.flatMap((i) => i.repositories || []);

  return (
    <Container className="py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#303039]">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#EDEDF2]">
              Security &amp; Vulnerability Audit
            </h1>
            <Badge variant="success" className="text-[11px] font-mono">
              Posture: Compliant
            </Badge>
          </div>
          <p className="text-xs text-[#858593] mt-1">
            Automated SAST and semantic vulnerability detection for every incoming code diff.
          </p>
        </div>

        <Link href="/repositories">
          <Button size="sm" className="gap-1.5 text-xs h-8">
            <span>Manage Protected Repos</span>
            <ArrowRight className="h-3 w-3" />
          </Button>
        </Link>
      </div>

      {/* Security Status Banner */}
      <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-[8px] bg-[#34D399]/10 text-[#34D399]">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <h3 className="text-base font-semibold text-[#EDEDF2]">
              Automated Code Guardrails Active
            </h3>
            <p className="text-xs text-[#858593] mt-0.5">
              Continuous inspection enabled across {allRepos.length} connected repositories.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs text-[#858593]">Audit Standard</div>
            <div className="text-xs font-semibold text-[#EDEDF2] font-mono">
              OWASP Top 10 + CWE
            </div>
          </div>
        </div>
      </div>

      {/* Security Scanning Vectors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SECURITY_VECTORS.map((vector) => {
          const Icon = vector.icon;
          return (
            <div
              key={vector.title}
              className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-3 hover:border-[#303039]/80 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-[#292932] text-[#8B7CF6]">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h4 className="text-sm font-semibold text-[#EDEDF2]">
                    {vector.title}
                  </h4>
                </div>
                <Badge variant={vector.badge as "success" | "critical"}>
                  {vector.status}
                </Badge>
              </div>

              <p className="text-xs text-[#858593] leading-relaxed">
                {vector.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* Guidelines Card */}
      <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-3">
        <h4 className="text-xs font-semibold text-[#858593] uppercase tracking-wider font-mono">
          Security Review Best Practices
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-[#858593]">
          <div className="p-3 rounded-[6px] bg-[#101014] border border-[#303039]/40 space-y-1">
            <div className="text-[#EDEDF2] font-medium">1. Secret Management</div>
            <p>Always use `.env` files and KMS vaults. Never commit credentials to pull requests.</p>
          </div>
          <div className="p-3 rounded-[6px] bg-[#101014] border border-[#303039]/40 space-y-1">
            <div className="text-[#EDEDF2] font-medium">2. Schema Validation</div>
            <p>Validate all untrusted client payloads using runtime schemas before database queries.</p>
          </div>
          <div className="p-3 rounded-[6px] bg-[#101014] border border-[#303039]/40 space-y-1">
            <div className="text-[#EDEDF2] font-medium">3. Dependency Audits</div>
            <p>Run `pnpm audit` or Dependabot frequently to patch vulnerable nested dependencies.</p>
          </div>
        </div>
      </div>
    </Container>
  );
}
