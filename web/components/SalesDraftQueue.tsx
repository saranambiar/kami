"use client";

import { useCallback, useEffect, useState } from "react";
import type { ReviewerVerdict } from "@/lib/salesTypes";

interface DraftRow {
  id: string;
  step: number;
  status: string;
  draft_subject?: string;
  draft_body?: string;
  draft_cta?: string;
  reviewer_verdict?: ReviewerVerdict;
  approved_at?: string;
  sent_at?: string;
  sales_sequence_enrollments?: {
    status: string;
    sales_contacts?: { name?: string; email?: string };
    sales_accounts?: { name?: string; domain?: string };
  };
}

interface SalesDraftQueueProps {
  sessionDbId: string | null;
  paused?: boolean;
}

export default function SalesDraftQueue({ sessionDbId, paused }: SalesDraftQueueProps) {
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDrafts = useCallback(() => {
    if (!sessionDbId) return;
    setLoading(true);
    fetch(`/api/sales/drafts?session_id=${sessionDbId}`)
      .then((r) => r.json())
      .then((j) => setDrafts(j.drafts ?? []))
      .catch(() => setDrafts([]))
      .finally(() => setLoading(false));
  }, [sessionDbId]);

  useEffect(() => {
    fetchDrafts();
  }, [fetchDrafts]);

  async function runAction(draftId: string, action: "review" | "approve" | "send") {
    if (!sessionDbId || paused) return;
    setBusyId(draftId);
    setError(null);
    try {
      const res = await fetch("/api/sales/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, touchpoint_id: draftId, session_id: sessionDbId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? `Action ${action} failed`);
        return;
      }
      fetchDrafts();
    } catch {
      setError(`Action ${action} failed`);
    } finally {
      setBusyId(null);
    }
  }

  const pendingDrafts = drafts.filter((d) => d.status !== "sent");

  return (
    <div style={{ marginTop: "var(--stack-md)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        <p className="label-caps">Drafts</p>
        <button
          type="button"
          className="mono"
          onClick={fetchDrafts}
          disabled={!sessionDbId || loading}
          style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: 12 }}
        >
          refresh
        </button>
      </div>
      <hr className="crease" />

      {error && (
        <p className="mono" style={{ color: "var(--accent)", fontSize: 12, marginBottom: "var(--stack-sm)" }}>
          {error}
        </p>
      )}

      {!sessionDbId && (
        <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 13 }}>
          Start a session to manage email drafts.
        </p>
      )}

      {sessionDbId && !loading && pendingDrafts.length === 0 && (
        <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 13 }}>
          No pending drafts. Create a sequence for approved targets first.
        </p>
      )}

      {pendingDrafts.map((draft) => {
        const contact = draft.sales_sequence_enrollments?.sales_contacts;
        const account = draft.sales_sequence_enrollments?.sales_accounts;
        const verdict = draft.reviewer_verdict;
        const isBusy = busyId === draft.id;

        return (
          <div key={draft.id} className="kraft-card" style={{ padding: "var(--stack-md)", marginBottom: "var(--stack-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "var(--stack-sm)", flexWrap: "wrap" }}>
              <div>
                <p className="mono" style={{ fontSize: 13 }}>
                  {contact?.name ?? account?.name ?? "Unknown"} · step {draft.step}
                </p>
                <p className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                  {contact?.email ?? "no email"} · {draft.status}
                </p>
              </div>
              <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
                <button
                  type="button"
                  className="mono"
                  disabled={paused || isBusy || draft.status === "sent"}
                  onClick={() => runAction(draft.id, "review")}
                  style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.25rem 0.5rem", fontSize: 11, cursor: "pointer" }}
                >
                  review
                </button>
                <button
                  type="button"
                  className="mono"
                  disabled={paused || isBusy || !verdict?.approved || draft.status === "approved" || draft.status === "sent"}
                  onClick={() => runAction(draft.id, "approve")}
                  style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.25rem 0.5rem", fontSize: 11, cursor: "pointer" }}
                >
                  approve
                </button>
                <button
                  type="button"
                  className="mono"
                  disabled={paused || isBusy || draft.status !== "approved"}
                  onClick={() => runAction(draft.id, "send")}
                  style={{ border: "1px solid var(--ink)", background: "var(--ink)", color: "var(--paper)", padding: "0.25rem 0.5rem", fontSize: 11, cursor: "pointer" }}
                >
                  send
                </button>
              </div>
            </div>

            {draft.draft_subject && (
              <p className="mono" style={{ fontSize: 12, marginTop: "var(--stack-sm)" }}>
                Subject: {draft.draft_subject}
              </p>
            )}

            {draft.draft_body && (
              <pre
                className="mono"
                style={{
                  fontSize: 11,
                  whiteSpace: "pre-wrap",
                  marginTop: "var(--stack-sm)",
                  color: "var(--ink-soft)",
                  maxHeight: 120,
                  overflow: "auto",
                }}
              >
                {draft.draft_body}
              </pre>
            )}

            {verdict && (
              <div style={{ marginTop: "var(--stack-sm)" }}>
                <p className="mono" style={{ fontSize: 11, color: verdict.approved ? "var(--ink)" : "var(--accent)" }}>
                  Review: {verdict.approved ? "pass" : "fail"} · score {verdict.score}
                </p>
                {!verdict.approved && verdict.required_fixes.length > 0 && (
                  <ul style={{ margin: "0.25rem 0 0", paddingLeft: "1.2rem", fontSize: 11 }} className="mono">
                    {verdict.required_fixes.map((fix) => (
                      <li key={fix} style={{ color: "var(--accent)" }}>{fix}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
