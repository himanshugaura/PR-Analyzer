"use client";

import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/nextjs";
import {
  User,
  GitBranch,
  Sliders,
  Bell,
  Palette,
  Shield,
  ExternalLink,
  Check,
  Building2,
  Lock,
  Sparkles,
  Zap,
} from "lucide-react";
import { Container } from "../../components/layout/container";
import { Button } from "../../components/ui/button";
import { Badge } from "../../components/ui/badge";
import { Switch } from "../../components/ui/switch";
import { useInstallations } from "../../hooks/use-installations";
import { useUiStore } from "../../store/use-ui-store";

const SETTINGS_SECTIONS = [
  { id: "profile", label: "Profile", icon: User },
  { id: "github", label: "GitHub Integration", icon: GitBranch },
  { id: "ai", label: "AI Configuration", icon: Sparkles },
  { id: "notifications", label: "Notifications", icon: Bell },
  { id: "appearance", label: "Appearance", icon: Palette },
  { id: "security", label: "Security", icon: Shield },
] as const;

type SettingsSection = (typeof SETTINGS_SECTIONS)[number]["id"];

const GITHUB_APP_INSTALL_URL =
  process.env.NEXT_PUBLIC_GITHUB_APP_INSTALL_URL ||
  "https://github.com/apps/revue-de-pr/installations/new";

export default function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSection>("profile");
  const { user } = useUser();
  const { data: installations = [] } = useInstallations();

  const isSidebarCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);

  return (
    <Container className="py-6 space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#303039]">
        <h1 className="text-2xl font-bold tracking-tight text-[#EDEDF2]">
          Settings
        </h1>
        <p className="text-xs text-[#858593] mt-1">
          Manage your account preferences, GitHub installations, and AI review models.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Left Subnav */}
        <div className="space-y-1 bg-[#1E1E26] border border-[#303039] rounded-[8px] p-2">
          {SETTINGS_SECTIONS.map((sec) => {
            const Icon = sec.icon;
            const isActive = activeSection === sec.id;
            return (
              <button
                key={sec.id}
                onClick={() => setActiveSection(sec.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-[6px] text-xs font-medium transition-colors cursor-pointer text-left ${
                  isActive
                    ? "bg-[#8B7CF6]/15 text-[#8B7CF6] font-semibold"
                    : "text-[#858593] hover:text-[#EDEDF2] hover:bg-[#292932]"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span>{sec.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Content Area */}
        <div className="md:col-span-3 space-y-6">
          {/* PROFILE SECTION */}
          {activeSection === "profile" && (
            <div className="space-y-4">
              <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#EDEDF2]">
                  User Profile
                </h3>
                <div className="flex items-center gap-4">
                  {user?.imageUrl && (
                    <img
                      src={user.imageUrl}
                      alt={user.fullName || "User"}
                      className="h-12 w-12 rounded-full border border-[#303039]"
                    />
                  )}
                  <div className="space-y-0.5">
                    <div className="text-sm font-semibold text-[#EDEDF2]">
                      {user?.fullName || user?.username || "Authenticated Developer"}
                    </div>
                    <div className="text-xs text-[#858593] font-mono">
                      {user?.primaryEmailAddress?.emailAddress || "user@github.com"}
                    </div>
                  </div>
                </div>

                <div className="pt-3 border-t border-[#303039] flex items-center justify-between">
                  <span className="text-xs text-[#858593]">
                    Authentication managed securely via Clerk.
                  </span>
                  <SignOutButton>
                    <Button variant="outline" size="sm" className="text-xs h-8 border-[#303039]">
                      Sign Out
                    </Button>
                  </SignOutButton>
                </div>
              </div>
            </div>
          )}

          {/* GITHUB INTEGRATION */}
          {activeSection === "github" && (
            <div className="space-y-4">
              <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-[#EDEDF2]">
                      Connected GitHub App
                    </h3>
                    <p className="text-xs text-[#858593] mt-0.5">
                      PR Analyzer connects via your GitHub App installation.
                    </p>
                  </div>
                  <a
                    href={GITHUB_APP_INSTALL_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <Button size="sm" className="gap-1.5 text-xs h-8">
                      <span>Add Installation</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>

                <div className="space-y-2 pt-2">
                  {installations.map((inst) => (
                    <div
                      key={inst.id}
                      className="flex items-center justify-between p-3 rounded-[6px] bg-[#101014] border border-[#303039]"
                    >
                      <div className="flex items-center gap-2.5">
                        <Building2 className="h-4 w-4 text-[#8B7CF6]" />
                        <div>
                          <div className="text-xs font-semibold text-[#EDEDF2]">
                            Installation #{inst.installationId}
                          </div>
                          <div className="text-[11px] text-[#858593]">
                            {inst.repositories?.length || 0} repositories synced
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px]">
                        {inst.accountType}
                      </Badge>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* AI CONFIGURATION */}
          {activeSection === "ai" && (
            <div className="space-y-4">
              <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#EDEDF2]">
                  AI Review Engine
                </h3>
                <p className="text-xs text-[#858593]">
                  Configure model parameters, review aggressiveness, and prompt rules.
                </p>

                <div className="space-y-3 pt-2">
                  <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#EDEDF2]">
                        Review Model
                      </div>
                      <div className="text-[11px] text-[#858593]">
                        Google Gemini (High Speed / Code Auditing)
                      </div>
                    </div>
                    <Badge variant="default" className="text-[11px] font-mono">
                      gemini-flash
                    </Badge>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#EDEDF2]">
                        Automated GitHub Commenting
                      </div>
                      <div className="text-[11px] text-[#858593]">
                        Post review findings directly as PR comments
                      </div>
                    </div>
                    <Badge variant="success">Enabled</Badge>
                  </div>

                  <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039] flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#EDEDF2]">
                        Security Analysis Depth
                      </div>
                      <div className="text-[11px] text-[#858593]">
                        Audit OWASP Top 10 vulnerabilities & secret leaks
                      </div>
                    </div>
                    <Badge variant="default">Deep Scan</Badge>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* NOTIFICATIONS */}
          {activeSection === "notifications" && (
            <div className="space-y-4">
              <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#EDEDF2]">
                  Notifications & Webhooks
                </h3>
                <p className="text-xs text-[#858593]">
                  Notifications are pushed via GitHub webhooks on every PR synchronize and open event.
                </p>

                <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#EDEDF2]">
                      Webhook Delivery Status
                    </div>
                    <div className="text-[11px] text-[#858593]">
                      Listening on /api/v1/webhooks/github
                    </div>
                  </div>
                  <Badge variant="success">Healthy (200 OK)</Badge>
                </div>
              </div>
            </div>
          )}

          {/* APPEARANCE */}
          {activeSection === "appearance" && (
            <div className="space-y-4">
              <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#EDEDF2]">
                  Interface Theme
                </h3>
                <p className="text-xs text-[#858593]">
                  Linear-inspired dark interface theme with neutral charcoal surfaces.
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3 rounded-[6px] bg-[#101014] border-2 border-[#8B7CF6] flex items-center justify-between">
                    <span className="text-xs font-medium text-[#EDEDF2]">
                      Linear Dark (Active)
                    </span>
                    <Check className="h-4 w-4 text-[#8B7CF6]" />
                  </div>
                  <div className="p-3 rounded-[6px] bg-[#292932] border border-[#303039] opacity-40 flex items-center justify-between cursor-not-allowed">
                    <span className="text-xs font-medium text-[#858593]">
                      Light Mode
                    </span>
                    <Lock className="h-3.5 w-3.5 text-[#858593]" />
                  </div>
                </div>

                <div className="pt-3 border-t border-[#303039] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-medium text-[#EDEDF2]">
                      Sidebar Default State
                    </div>
                    <div className="text-[11px] text-[#858593]">
                      Keep sidebar collapsed by default
                    </div>
                  </div>
                  <Switch
                    checked={isSidebarCollapsed}
                    onCheckedChange={toggleSidebar}
                  />
                </div>
              </div>
            </div>
          )}

          {/* SECURITY */}
          {activeSection === "security" && (
            <div className="space-y-4">
              <div className="rounded-[8px] border border-[#303039] bg-[#1E1E26] p-5 space-y-4">
                <h3 className="text-sm font-semibold text-[#EDEDF2]">
                  Security & Access Control
                </h3>
                <p className="text-xs text-[#858593]">
                  Session tokens and GitHub App authorization keys are encrypted at rest.
                </p>

                <div className="p-3.5 rounded-[6px] bg-[#101014] border border-[#303039] space-y-2">
                  <div className="text-xs font-semibold text-[#EDEDF2]">
                    Data Privacy Policy
                  </div>
                  <p className="text-xs text-[#858593] leading-relaxed">
                    Source code diffs are transmitted directly to the Gemini API over TLS 1.3 and are strictly never stored or used to train public foundation models.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </Container>
  );
}
