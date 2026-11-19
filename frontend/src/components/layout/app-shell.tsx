"use client";

import React from "react";
import { Sidebar } from "./sidebar";

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <main className="flex-1 min-h-screen overflow-y-auto bg-[#101014]">
        {children}
      </main>
    </div>
  );
}
