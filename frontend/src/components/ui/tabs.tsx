"use client";

import * as React from "react";
import { cn } from "../../lib/utils";

// Context
interface TabsContextValue {
  activeTab: string;
  setActiveTab: (value: string) => void;
}

const TabsContext = React.createContext<TabsContextValue | null>(null);

function useTabsContext() {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("Tabs components must be used within <Tabs>");
  return ctx;
}

// Tabs (root)
export interface TabsProps {
  defaultValue?: string;
  value?: string;
  onValueChange?: (value: string) => void;
  className?: string;
  children: React.ReactNode;
}

export function Tabs({ defaultValue = "", value, onValueChange, className, children }: TabsProps) {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeTab = value !== undefined ? value : internalValue;

  const setActiveTab = React.useCallback(
    (newVal: string) => {
      if (value === undefined) setInternalValue(newVal);
      onValueChange?.(newVal);
    },
    [value, onValueChange]
  );

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={cn("w-full", className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// TabsList
export interface TabsListProps extends React.HTMLAttributes<HTMLDivElement> {}

export function TabsList({ className, children, ...props }: TabsListProps) {
  return (
    <div
      role="tablist"
      className={cn("flex border-b border-[#303039] gap-0", className)}
      {...props}
    >
      {children}
    </div>
  );
}

// TabsTrigger
export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { activeTab, setActiveTab } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-2.5 text-[13px] font-medium transition-colors relative",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#8B7CF6]/50",
        isActive
          ? "text-[#EDEDF2] border-b-2 border-[#8B7CF6] -mb-px"
          : "text-[#858593] hover:text-[#EDEDF2]",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

// TabsContent
export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { activeTab } = useTabsContext();
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("pt-4", className)}
      {...props}
    >
      {children}
    </div>
  );
}
