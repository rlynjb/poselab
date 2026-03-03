"use client";

import type { SidebarTab } from "@/types";

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  children: React.ReactNode;
}

const TABS: { id: SidebarTab; label: string }[] = [
  { id: "angles", label: "Angles" },
  { id: "landmarks", label: "Landmarks" },
  { id: "metrics", label: "Metrics" },
  { id: "config", label: "Config" },
];

export default function Sidebar({ activeTab, onTabChange, children }: SidebarProps) {
  return (
    <div className="flex w-[380px] shrink-0 flex-col border-l border-border bg-bg-secondary">
      {/* Tab bar */}
      <div className="flex border-b border-border">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 px-3 py-2.5 font-mono text-[11px] uppercase tracking-wider transition-colors ${
              activeTab === tab.id
                ? "border-b-2 border-accent text-accent"
                : "text-text-muted hover:text-text-secondary"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto p-4">{children}</div>
    </div>
  );
}
