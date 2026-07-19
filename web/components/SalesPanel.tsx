"use client";

import { useCallback, useEffect, useState } from "react";
import type { SalesCampaignConfig, SalesPlan } from "@/lib/salesTypes";
import SalesSetup from "@/components/SalesSetup";
import SalesPlanView from "@/components/SalesPlanView";
import SalesDraftQueue from "@/components/SalesDraftQueue";
import SalesTargetReview from "@/components/SalesTargetReview";
import SalesPipeline from "@/components/SalesPipeline";
import SalesInbox from "@/components/SalesInbox";
import MeetingQueue from "@/components/MeetingQueue";
import SalesTaskBoard from "@/components/SalesTaskBoard";
import KillSwitch from "@/components/KillSwitch";

type OpsTab = "targets" | "pipeline" | "drafts" | "inbox" | "meetings" | "tasks";

interface SalesPanelProps {
  sessionDbId: string | null;
  config: SalesCampaignConfig | null;
  onSetup: (config: SalesCampaignConfig) => void;
}

export default function SalesPanel({ sessionDbId, config, onSetup }: SalesPanelProps) {
  const [plan, setPlan] = useState<SalesPlan | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [paused, setPaused] = useState(config?.autonomous_paused ?? false);
  const [pauseSaving, setPauseSaving] = useState(false);
  const [opsTab, setOpsTab] = useState<OpsTab>("pipeline");

  const fetchPlan = useCallback(() => {
    if (!sessionDbId) return;
    fetch(`/api/sales/plan?session_id=${sessionDbId}`)
      .then((r) => r.json())
      .then((j) => setPlan(j.plan ?? null))
      .catch(() => {});
  }, [sessionDbId]);

  useEffect(() => {
    setPaused(config?.autonomous_paused ?? false);
  }, [config?.autonomous_paused]);

  useEffect(() => {
    if (config) fetchPlan();
  }, [config, fetchPlan]);

  async function handlePauseChange(nextPaused: boolean) {
    if (!sessionDbId) return;
    setPaused(nextPaused);
    setPauseSaving(true);
    try {
      const res = await fetch("/api/sales/setup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionDbId, autonomous_paused: nextPaused }),
      });
      const json = await res.json();
      if (res.ok && json.config && config) {
        onSetup({ ...config, autonomous_paused: json.config.autonomous_paused });
      }
    } catch {
      setPaused(!nextPaused);
    } finally {
      setPauseSaving(false);
    }
  }

  if (!config || showSettings) {
    return (
      <SalesSetup
        sessionDbId={sessionDbId}
        onComplete={(c, planGenerated) => {
          onSetup(c);
          setShowSettings(false);
          if (planGenerated) fetchPlan();
        }}
      />
    );
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        <p className="label-caps">Sales Operations</p>
        <div style={{ display: "flex", gap: "var(--stack-sm)", alignItems: "center" }}>
          <button
            type="button"
            className="mono"
            onClick={() => setShowSettings(true)}
            style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: 12 }}
          >
            settings
          </button>
          <KillSwitch paused={paused} onChange={handlePauseChange} disabled={pauseSaving || !sessionDbId} />
        </div>
      </div>
      <hr className="crease" />

      <SalesPlanView
        sessionDbId={sessionDbId}
        plan={plan}
        onApproved={setPlan}
        onRevised={setPlan}
      />

      <div style={{ marginTop: "var(--stack-md)" }}>
        <div className="campaign-tabs" style={{ marginBottom: "var(--stack-sm)" }}>
          {(["targets", "pipeline", "drafts", "inbox", "meetings", "tasks"] as OpsTab[]).map((tab) => (
            <button
              key={tab}
              type="button"
              className="campaign-tab"
              data-active={opsTab === tab}
              onClick={() => setOpsTab(tab)}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>
        <hr className="crease" />
        {opsTab === "targets" && <SalesTargetReview sessionDbId={sessionDbId} plan={plan} paused={paused} />}
        {opsTab === "pipeline" && <SalesPipeline sessionDbId={sessionDbId} />}
        {opsTab === "drafts" && <SalesDraftQueue sessionDbId={sessionDbId} paused={paused} />}
        {opsTab === "inbox" && <SalesInbox sessionDbId={sessionDbId} />}
        {opsTab === "meetings" && <MeetingQueue sessionDbId={sessionDbId} />}
        {opsTab === "tasks" && <SalesTaskBoard sessionDbId={sessionDbId} />}
      </div>
    </div>
  );
}
