"use client";

import { useState } from "react";
import ActivityFeed, { type ActivityEvent } from "@/components/ActivityFeed";
import ApprovalCard, { type OpportunityStatus } from "@/components/ApprovalCard";
import ChannelRail from "@/components/ChannelRail";
import IntelPanel from "@/components/IntelPanel";
import CmoChat from "@/components/CmoChat";
import CampaignTabs from "@/components/CampaignTabs";
import MarketingPanel from "@/components/MarketingPanel";
import type { Dossier } from "@/lib/hermes";
import type { CampaignTab, MarketingConfig } from "@/lib/marketingTypes";

interface DashboardProps {
  domain: string;
  events: ActivityEvent[];
  running: boolean;
  dossier: Dossier | null;
  oppStatus: Record<string, OpportunityStatus>;
  executing: boolean;
  sessionId: string;
  sessionDbId: string | null;
  connectedChannels: string[];
  marketingConfig: MarketingConfig | null;
  onConnect: (platform: string) => void;
  onNewCampaign: () => void;
  onApprove: (title: string, playbook: string) => void;
  onDismiss: (title: string) => void;
  onMarketingSetup: (config: MarketingConfig) => void;
}

export default function Dashboard({
  domain,
  events,
  running,
  dossier,
  oppStatus,
  executing,
  sessionId,
  sessionDbId,
  connectedChannels,
  marketingConfig,
  onConnect,
  onNewCampaign,
  onApprove,
  onDismiss,
  onMarketingSetup,
}: DashboardProps) {
  const [tab, setTab] = useState<CampaignTab>("overview");

  return (
    <div style={{ paddingTop: "var(--stack-md)", paddingBottom: "var(--stack-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
        <h2>
          {domain} <span style={{ color: "var(--hanko)" }}>· campaigns</span>
        </h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span className="mono" style={{ color: "var(--ink-soft)" }}>
            session {sessionId.slice(-8)}
          </span>
          <button
            type="button"
            className="mono"
            onClick={onNewCampaign}
            style={{
              border: "1px solid var(--ink)",
              background: "transparent",
              padding: "0.3rem 0.7rem",
              cursor: "pointer",
            }}
          >
            + new campaign
          </button>
        </div>
      </div>

      <CampaignTabs active={tab} onChange={setTab} />

      {tab === "overview" && (
        <>
          <hr className="crease" />
          <div className="dashboard-grid">
            {/* LEFT — channels */}
            <ChannelRail connected={connectedChannels} onConnect={onConnect} />

            {/* CENTER — activity + approvals + chat */}
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-md)" }}>
              <ActivityFeed events={events} running={running} />

              {dossier && (
                <div>
                  <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>
                    Awaiting your approval
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
                    {dossier.opportunities.map((o) => (
                      <ApprovalCard
                        key={o.title}
                        opportunity={o}
                        status={oppStatus[o.title] ?? "proposed"}
                        busy={executing}
                        onApprove={() => onApprove(o.title, o.playbook)}
                        onDismiss={() => onDismiss(o.title)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {dossier && <CmoChat sessionId={sessionId} />}
            </div>

            {/* RIGHT — intelligence */}
            {dossier ? (
              <IntelPanel dossier={dossier} />
            ) : (
              <aside>
                <p className="label-caps">Intelligence</p>
                <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "var(--stack-sm)" }}>
                  folding dossier…
                </p>
              </aside>
            )}
          </div>
        </>
      )}

      {tab === "marketing" && (
        <MarketingPanel
          sessionDbId={sessionDbId}
          config={marketingConfig}
          dossierTone={dossier?.tone}
          onSetup={onMarketingSetup}
        />
      )}

      {tab === "sales" && (
        <div style={{ marginTop: "var(--stack-md)", textAlign: "center", padding: "var(--stack-lg) 0" }}>
          <p className="label-caps" style={{ color: "var(--outline)" }}>
            Sales — Coming Soon
          </p>
        </div>
      )}
    </div>
  );
}
