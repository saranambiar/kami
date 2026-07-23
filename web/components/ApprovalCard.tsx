"use client";

import type { Opportunity } from "@/lib/hermes";

export type OpportunityStatus = "proposed" | "approved" | "dismissed" | "executed";

interface ApprovalCardProps {
  opportunity: Opportunity;
  status: OpportunityStatus;
  onApprove: () => void;
  onDismiss: () => void;
  busy: boolean;
}

export default function ApprovalCard({
  opportunity,
  status,
  onApprove,
  onDismiss,
  busy,
}: ApprovalCardProps) {
  const settled = status === "dismissed" || status === "executed";
  return (
    <div className="kraft-card" style={{ opacity: status === "dismissed" ? 0.5 : 1 }}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: "1rem", flexWrap: "wrap" }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          <strong style={{ fontFamily: "var(--font-headline)" }}>{opportunity.title}</strong>
          <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "0.25rem" }}>
            PLAYBOOK · {opportunity.playbook}
          </p>
          <p style={{ marginTop: "var(--stack-sm)" }}>{opportunity.detail}</p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", alignItems: "flex-end" }}>
          {status === "executed" ? (
            <span className="mono" style={{ color: "var(--moss)", fontWeight: 700 }}>
              ✓ Executed — check Activity for receipt
            </span>
          ) : status === "dismissed" ? (
            <span className="mono" style={{ color: "var(--outline)" }}>
              dismissed
            </span>
          ) : (
            <>
              <button className="hanko-btn" onClick={onApprove} disabled={busy || settled}>
                Approve & Execute
              </button>
              <button
                type="button"
                className="mono"
                onClick={onDismiss}
                disabled={busy}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" }}
              >
                dismiss
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
