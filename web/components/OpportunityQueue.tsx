"use client";

import { useState } from "react";
import type { DistributionOpportunity, DistributionOutcome } from "@/lib/distributionTypes";

interface OpportunityQueueProps {
  opportunities: DistributionOpportunity[];
  sessionDbId: string | null;
  researchNote?: string | null;
  researchSource?: string | null;
  busy?: boolean;
  onRefresh: () => void;
  onResearch: () => void;
}

const OUTCOMES: { key: DistributionOutcome; label: string }[] = [
  { key: "posted", label: "Posted" },
  { key: "got_reply", label: "Got a reply" },
  { key: "got_interest", label: "Got interest" },
  { key: "got_signup", label: "Got a signup" },
  { key: "not_relevant", label: "Not relevant" },
  { key: "skipped", label: "Skipped" },
];

export default function OpportunityQueue({
  opportunities,
  sessionDbId,
  researchNote,
  researchSource,
  busy,
  onRefresh,
  onResearch,
}: OpportunityQueueProps) {
  const [savingId, setSavingId] = useState<string | null>(null);

  async function patch(id: string, body: Record<string, unknown>) {
    if (!sessionDbId) return;
    setSavingId(id);
    try {
      await fetch("/api/marketing/distribution/opportunities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionDbId, id, ...body }),
      });
      onRefresh();
    } finally {
      setSavingId(null);
    }
  }

  async function copyDraft(text: string) {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      /* ignore */
    }
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        <p className="label-caps">Today&apos;s distribution opportunities</p>
        <button
          type="button"
          className="hanko-btn"
          onClick={onResearch}
          disabled={busy || !sessionDbId}
        >
          {busy ? "Researching…" : "Find opportunities"}
        </button>
      </div>

      {(researchSource || researchNote) && (
        <p className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: "var(--stack-sm)" }}>
          {researchSource === "scaffold" ? "Starter queue · " : "Hermes · "}
          {researchNote || "Review each item before posting."}
        </p>
      )}

      {opportunities.length === 0 && (
        <p style={{ color: "var(--ink-soft)" }}>
          No opportunities yet. Click <strong>Find opportunities</strong> for a short, reviewable queue.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {opportunities.map((o) => (
          <div key={o.id} className="kraft-card" style={{ padding: "var(--stack-md)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
              <p className="label-caps">{o.platform}</p>
              <span className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                {o.approval_status} · {o.action_status}
              </span>
            </div>
            <p style={{ marginTop: "0.5rem" }}>
              <strong>Why now:</strong> {o.why_now}
            </p>
            <p style={{ marginTop: "0.35rem", color: "var(--ink-soft)" }}>
              <strong>Action:</strong> {o.suggested_action}
            </p>
            {o.risks && (
              <p className="mono" style={{ fontSize: 12, marginTop: "0.35rem", color: "var(--hanko)" }}>
                Risk / rules: {o.risks}
              </p>
            )}
            <pre
              style={{
                whiteSpace: "pre-wrap",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                background: "var(--paper-deep, transparent)",
                border: "1px solid var(--outline)",
                padding: "0.75rem",
                marginTop: "0.75rem",
              }}
            >
              {o.draft}
            </pre>
            <p className="mono" style={{ fontSize: 12, marginTop: "0.5rem" }}>
              Source:{" "}
              {o.source_url.startsWith("http") ? (
                <a href={o.source_url} target="_blank" rel="noreferrer">
                  {o.source_url}
                </a>
              ) : (
                o.source_url
              )}
            </p>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.75rem" }}>
              <button type="button" className="hanko-btn" onClick={() => copyDraft(o.draft)} disabled={savingId === o.id}>
                Copy draft
              </button>
              <button
                type="button"
                className="mono"
                style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.4rem 0.75rem", cursor: "pointer" }}
                onClick={() =>
                  patch(o.id, {
                    approval_status: "approved",
                    action_status: "posted_manual",
                    outcome: "posted",
                  })
                }
                disabled={savingId === o.id}
              >
                I posted this
              </button>
              <button
                type="button"
                className="mono"
                style={{ border: "none", background: "transparent", cursor: "pointer", color: "var(--ink-soft)" }}
                onClick={() => patch(o.id, { approval_status: "skipped", outcome: "skipped", action_status: "draft" })}
                disabled={savingId === o.id}
              >
                Skip
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem", marginTop: "0.75rem" }}>
              <span className="mono label-caps" style={{ width: "100%" }}>
                What happened?
              </span>
              {OUTCOMES.map((out) => (
                <button
                  key={out.key}
                  type="button"
                  className="mono"
                  style={{
                    fontSize: 11,
                    border: o.outcome === out.key ? "1px solid var(--hanko)" : "1px solid var(--outline)",
                    background: "transparent",
                    padding: "0.25rem 0.5rem",
                    cursor: "pointer",
                  }}
                  onClick={() => patch(o.id, { outcome: out.key })}
                  disabled={savingId === o.id}
                >
                  {out.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
