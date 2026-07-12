"use client";

import ActivityFeed, { type ActivityEvent } from "@/components/ActivityFeed";
import ApprovalCard, { type OpportunityStatus } from "@/components/ApprovalCard";
import ChannelRail from "@/components/ChannelRail";
import IntelPanel from "@/components/IntelPanel";
import CmoChat from "@/components/CmoChat";
import type { Dossier } from "@/lib/hermes";

interface DashboardProps {
  domain: string;
  events: ActivityEvent[];
  running: boolean;
  dossier: Dossier | null;
  oppStatus: Record<string, OpportunityStatus>;
  executing: boolean;
  sessionId: string;
  connectedChannels: string[];
  onConnect: (platform: string) => void;
  onApprove: (title: string, playbook: string) => void;
  onDismiss: (title: string) => void;
}

export default function Dashboard({
  domain,
  events,
  running,
  dossier,
  oppStatus,
  executing,
  sessionId,
  connectedChannels,
  onConnect,
  onApprove,
  onDismiss,
}: DashboardProps) {
  return (
    <div style={{ paddingTop: "var(--stack-md)", paddingBottom: "var(--stack-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
        <h2>
          {domain} <span style={{ color: "var(--hanko)" }}>· campaign</span>
        </h2>
        <span className="mono" style={{ color: "var(--ink-soft)" }}>
          session {sessionId.slice(-8)}
        </span>
      </div>
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
    </div>
  );
}
