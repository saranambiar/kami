"use client";

import type { CampaignTab } from "@/lib/marketingTypes";

interface CampaignTabsProps {
  active: CampaignTab;
  onChange: (tab: CampaignTab) => void;
}

const TABS: { key: CampaignTab | "coming1" | "coming2"; label: string; disabled?: boolean }[] = [
  { key: "overview", label: "Overview" },
  { key: "sales", label: "Sales", disabled: true },
  { key: "marketing", label: "Marketing" },
  { key: "coming1", label: "Coming Soon", disabled: true },
  { key: "coming2", label: "Coming Soon", disabled: true },
];

export default function CampaignTabs({ active, onChange }: CampaignTabsProps) {
  return (
    <div className="campaign-tabs">
      {TABS.map((t, i) => (
        <button
          key={`${t.key}-${i}`}
          type="button"
          className="campaign-tab"
          data-active={t.key === active}
          disabled={t.disabled}
          onClick={() => {
            if (!t.disabled && t.key !== "coming1" && t.key !== "coming2") {
              onChange(t.key);
            }
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
