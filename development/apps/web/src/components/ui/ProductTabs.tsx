"use client";

import { useState, type ReactNode } from "react";

// ─── Product Tabs Component ─────────────────────────────────────
// Matches Figma: DESCRIPTION | SPECIFICATIONS | WARRANTY & SHIPPING
// Underline style active indicator on the selected tab.
interface Tab {
  label: string;
  content: ReactNode;
}

interface ProductTabsProps {
  tabs: Tab[];
}

export function ProductTabs({ tabs }: ProductTabsProps) {
  const [activeTab, setActiveTab] = useState(0);

  return (
    <div>
      {/* Tab headers — horizontal with underline indicator */}
      <div className="flex gap-0 border-b border-gray-200 overflow-x-auto whitespace-nowrap scrollbar-hide">
        {tabs.map((tab, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setActiveTab(idx)}
            className={`px-6 py-3 text-sm font-bold uppercase tracking-wide transition-all relative ${
              idx === activeTab
                ? "text-gray-900"
                : "text-gray-400 hover:text-gray-600"
            }`}
          >
            {tab.label}
            {/* Active underline indicator */}
            {idx === activeTab && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-ushop-purple" />
            )}
          </button>
        ))}
      </div>

      {/* Tab content — only the active tab renders */}
      <div className="py-6">{tabs[activeTab].content}</div>
    </div>
  );
}
