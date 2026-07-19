"use client";

import { useState } from "react";
import type { MarketingConfig, MarketingCrmEntry } from "@/lib/marketingTypes";
import BoostManager from "@/components/BoostManager";
import LeadTable from "@/components/LeadTable";
import CreatorTable from "@/components/CreatorTable";

type CrmSubTab = "x_outreach" | "creators";

interface MarketingCRMProps {
  entries: MarketingCrmEntry[];
  config: MarketingConfig;
  sessionDbId: string | null;
  paused?: boolean;
  onRefresh: () => void;
}

export default function MarketingCRM({ entries, config, sessionDbId, paused, onRefresh }: MarketingCRMProps) {
  const hasX = config.platforms.includes("x");
  const hasIg = config.platforms.includes("instagram");
  const defaultTab: CrmSubTab = hasX ? "x_outreach" : "creators";
  const [subTab, setSubTab] = useState<CrmSubTab>(defaultTab);

  const leads = entries.filter((e) => e.type === "x_lead");
  const creators = entries.filter((e) => e.type === "creator");

  async function approveLeads(ids: string[]) {
    for (const id of ids) {
      await fetch("/api/marketing/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "approved" }),
      });
    }
    onRefresh();
  }

  async function approveCreatorOutreach(ids: string[]) {
    for (const id of ids) {
      await fetch("/api/marketing/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "contacted" }),
      });
    }
    onRefresh();
  }

  async function triggerDiscovery() {
    if (paused) return;
    const res = await fetch("/api/marketing/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionDbId }),
    });
    if (res.status === 423) return;
    setTimeout(onRefresh, 3000);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        {(hasX && hasIg) && (
          <div style={{ display: "flex", gap: "0" }}>
            <button
              type="button"
              className="campaign-tab"
              data-active={subTab === "x_outreach"}
              onClick={() => setSubTab("x_outreach")}
            >
              X Outreach
            </button>
            <button
              type="button"
              className="campaign-tab"
              data-active={subTab === "creators"}
              onClick={() => setSubTab("creators")}
            >
              Creators
            </button>
          </div>
        )}
        <button
          className="mono"
          onClick={triggerDiscovery}
          disabled={paused}
          style={{
            border: "1px solid var(--ink)",
            background: "transparent",
            padding: "0.3rem 0.7rem",
            cursor: paused ? "not-allowed" : "pointer",
            opacity: paused ? 0.5 : 1,
          }}
        >
          Run discovery
        </button>
      </div>
      <hr className="crease" />

      {subTab === "x_outreach" && hasX && (
        <>
          <BoostManager sessionDbId={sessionDbId} />
          <hr className="crease" />
          <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Cold Outreach</p>
          <LeadTable leads={leads} onApprove={approveLeads} />
        </>
      )}

      {subTab === "creators" && hasIg && (
        <CreatorTable creators={creators} onApproveOutreach={approveCreatorOutreach} />
      )}
    </div>
  );
}
