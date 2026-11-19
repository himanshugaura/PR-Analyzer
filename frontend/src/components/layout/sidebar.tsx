"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import {
  LayoutDashboard,
  GitBranch,
  GitPullRequest,
  History,
  Sparkles,
  ShieldCheck,
  Settings,
  HelpCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useUiStore } from "../../store/use-ui-store";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/", icon: LayoutDashboard },
  { label: "Repositories", href: "/repositories", icon: GitBranch },
  { label: "Pull Requests", href: "/pull-requests", icon: GitPullRequest },
  { label: "Analysis History", href: "/history", icon: History },
  { label: "AI Insights", href: "/insights", icon: Sparkles },
  { label: "Security", href: "/security", icon: ShieldCheck },
];

const BOTTOM_NAV_ITEMS = [
  { label: "Settings", href: "/settings", icon: Settings },
  { label: "Help", href: "/help", icon: HelpCircle },
];

export function Sidebar() {
  const isSidebarCollapsed = useUiStore((s) => s.isSidebarCollapsed);
  const toggleSidebar = useUiStore((s) => s.toggleSidebar);
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/") return pathname === "/";
    return pathname.startsWith(href);
  };

  const NavItem = ({
    label,
    href,
    icon: Icon,
  }: {
    label: string;
    href: string;
    icon: React.ElementType;
  }) => {
    const active = isActive(href);
    return (
      <Link
        href={href}
        title={isSidebarCollapsed ? label : undefined}
        className={[
          "flex items-center gap-3 px-3 py-2 rounded-[6px] text-sm transition-colors duration-150 relative select-none",
          active
            ? "bg-[#8B7CF6]/15 text-[#8B7CF6] border-l-2 border-[#8B7CF6] pl-[10px]"
            : "text-[#858593] hover:text-[#EDEDF2] hover:bg-[#292932] border-l-2 border-transparent pl-[10px]",
        ].join(" ")}
      >
        <Icon size={16} className="shrink-0" />
        {!isSidebarCollapsed && (
          <span className="truncate">{label}</span>
        )}
      </Link>
    );
  };

  return (
    <aside
      className={[
        "relative flex flex-col h-screen sticky top-0 bg-[#17171D] border-r border-[#303039] transition-all duration-200 shrink-0",
        isSidebarCollapsed ? "w-16" : "w-60",
      ].join(" ")}
    >
      {/* Logo area */}
      <div
        className={[
          "flex items-center gap-3 p-4 border-b border-[#303039]",
          isSidebarCollapsed ? "justify-center" : "",
        ].join(" ")}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-[6px] bg-[#8B7CF6]/20 shrink-0">
          <GitPullRequest size={16} className="text-[#8B7CF6]" />
        </div>
        {!isSidebarCollapsed && (
          <span className="font-semibold text-[#EDEDF2] text-[15px] truncate">
            PR Analyzer
          </span>
        )}
      </div>

      {/* Main nav */}
      <nav className="flex-1 overflow-y-auto py-3 px-2 space-y-0.5">
        {NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}

        {/* Divider */}
        <div className="my-2 mx-1 border-t border-[#303039]" />

        {BOTTOM_NAV_ITEMS.map((item) => (
          <NavItem key={item.href} {...item} />
        ))}
      </nav>

      {/* Bottom area: UserButton */}
      <div
        className={[
          "border-t border-[#303039] p-3",
          isSidebarCollapsed ? "flex justify-center" : "flex items-center gap-3",
        ].join(" ")}
      >
        <UserButton
          appearance={{
            elements: {
              avatarBox: "w-7 h-7",
            },
          }}
        />
        {!isSidebarCollapsed && (
          <span className="text-[#858593] text-xs truncate">Account</span>
        )}
      </div>

      {/* Collapse toggle */}
      <button
        onClick={toggleSidebar}
        title={isSidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
        className="absolute -right-3 bottom-20 z-10 flex items-center justify-center w-6 h-6 rounded-full bg-[#1E1E26] border border-[#303039] text-[#858593] hover:text-[#EDEDF2] hover:bg-[#292932] transition-colors duration-150 cursor-pointer"
      >
        {isSidebarCollapsed ? (
          <ChevronRight size={12} />
        ) : (
          <ChevronLeft size={12} />
        )}
      </button>
    </aside>
  );
}
