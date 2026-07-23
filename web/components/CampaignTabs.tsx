"use client";

import type { CampaignTab } from "@/lib/marketingTypes";

interface CampaignTabsProps {
  active: CampaignTab;
  onChange: (tab: CampaignTab) => void;
}

const TABS: { key: CampaignTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "sales", label: "Sales" },
  { key: "marketing", label: "Marketing" },
];

export default function CampaignTabs({ active, onChange }: CampaignTabsProps) {
  return (
    <div className="campaign-tabs">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          className="campaign-tab"
          data-active={t.key === active}
          onClick={() => onChange(t.key)}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
