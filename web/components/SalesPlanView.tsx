"use client";

import { useState } from "react";
import type { SalesPlan } from "@/lib/salesTypes";
import { channelLabel, motionLabel } from "@/lib/salesMotionLabels";

interface SalesPlanViewProps {
  sessionDbId: string | null;
  plan: SalesPlan | null;
  onApproved: (plan: SalesPlan) => void;
  onRevised: (plan: SalesPlan) => void;
}

export default function SalesPlanView({ sessionDbId, plan, onApproved, onRevised }: SalesPlanViewProps) {
  const [reviseNote, setReviseNote] = useState("");
  const [busy, setBusy] = useState(false);

  if (!plan) {
    return (
      <p className="mono" style={{ color: "var(--ink-soft)", padding: "var(--stack-md) 0" }}>
        Building your plan… if this persists, go back and confirm who and what again.
      </p>
    );
  }

  const currentPlan = plan;

  async function approve() {
    if (!sessionDbId || !currentPlan.id) return;
    setBusy(true);
    try {
      const res = await fetch("/api/sales/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionDbId, action: "approve", plan_id: currentPlan.id }),
      });
      const json = await res.json();
      if (res.ok && json.plan) onApproved(json.plan as SalesPlan);
    } finally {
      setBusy(false);
    }
  }

  async function revise() {
    if (!sessionDbId) return;
    setBusy(true);
    try {
      const res = await fetch("/api/sales/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionDbId, revise_note: reviseNote }),
      });
      const json = await res.json();
      if (res.ok && json.plan) {
        setReviseNote("");
        onRevised(json.plan as SalesPlan);
      }
    } finally {
      setBusy(false);
    }
  }

  const statusColor = plan.status === "approved" ? "var(--hanko)" : "var(--ink-soft)";

  return (
    <div className="kraft-card" style={{ padding: "var(--stack-md)", marginBottom: "var(--stack-md)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "var(--stack-sm)" }}>
        <p className="label-caps">Your outbound plan</p>
        <span className="mono" style={{ color: statusColor, textTransform: "uppercase", fontSize: 12 }}>
          {plan.status === "approved" ? "Approved" : "Draft"}
        </span>
      </div>

      <p className="sales-intro" style={{ marginBottom: "var(--stack-md)" }}>
        Here&apos;s what Kami will do next — research companies that match, draft personalized emails, and pause for your OK before anything sends.
      </p>

      <p style={{ marginBottom: "var(--stack-sm)" }}>{plan.channel_rationale}</p>

      <p className="label-caps" style={{ marginBottom: "0.25rem" }}>What we&apos;ll do</p>
      <ul style={{ marginBottom: "var(--stack-sm)", paddingLeft: "1.2rem" }}>
        {plan.motions.map((m, i) => (
          <li key={i} style={{ fontSize: 14 }}>
            <strong>{motionLabel(m.motion)}</strong> via {channelLabel(m.primary_channel)} — {m.rationale}
          </li>
        ))}
      </ul>

      <p className="label-caps" style={{ marginBottom: "0.25rem" }}>Who we&apos;ll prioritize</p>
      <div style={{ display: "flex", gap: "var(--stack-sm)", flexWrap: "wrap", marginBottom: "var(--stack-sm)" }}>
        {plan.tiers.map((t) => (
          <div key={t.tier} style={{ border: "1px solid var(--outline)", padding: "0.5rem", flex: "1 1 140px", fontSize: 13 }}>
            <strong>{t.label}</strong>
            <p style={{ color: "var(--ink-soft)", margin: "0.25rem 0" }}>{t.criteria}</p>
            <p className="mono">{t.target_count} companies · {t.channels.map(channelLabel).join(", ")}</p>
          </div>
        ))}
      </div>

      {plan.estimated_activity && (
        <p className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: "var(--stack-sm)" }}>
          ~{plan.estimated_activity.accounts_to_research} companies researched · ~{plan.estimated_activity.sends_per_week} emails/week
        </p>
      )}

      {plan.risks?.length ? (
        <>
          <p className="label-caps" style={{ marginBottom: "0.25rem" }}>Heads up</p>
          <ul style={{ fontSize: 13, paddingLeft: "1.2rem", marginBottom: "var(--stack-sm)" }}>
            {plan.risks.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </>
      ) : null}

      {plan.status === "draft" && (
        <div style={{ marginTop: "var(--stack-md)" }}>
          <div className="form-line" style={{ marginBottom: "var(--stack-sm)" }}>
            <label className="mono label-caps" htmlFor="revise-note">Want changes? (optional)</label>
            <input id="revise-note" value={reviseNote} onChange={(e) => setReviseNote(e.target.value)} placeholder="Focus on fintech only, fewer companies…" />
          </div>
          <div style={{ display: "flex", gap: "var(--stack-sm)" }}>
            <button className="hanko-btn" onClick={approve} disabled={busy || !plan.id}>
              {busy ? "…" : "Approve plan"}
            </button>
            <button
              type="button"
              className="mono"
              onClick={revise}
              disabled={busy}
              style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.4rem 0.75rem", cursor: "pointer" }}
            >
              Regenerate with note
            </button>
          </div>
        </div>
      )}

      {plan.status === "approved" && (
        <p className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: "var(--stack-sm)" }}>
          Plan approved — continue to Find companies.
        </p>
      )}
    </div>
  );
}
