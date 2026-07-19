"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AccountSignal,
  LeadScoreFactors,
  PipelineStage,
  SalesAccount,
  SalesPlan,
} from "@/lib/salesTypes";

interface AccountWithMeta extends SalesAccount {
  signals?: AccountSignal[];
  score?: {
    factors: LeadScoreFactors;
    explanation: string;
  };
}

interface SalesTargetReviewProps {
  sessionDbId: string | null;
  plan: SalesPlan | null;
  paused?: boolean;
}

function isIncluded(account: SalesAccount): boolean {
  if (account.pipeline_stage === "ready_for_approval" || account.pipeline_stage === "sequencing") {
    return !account.notes?.includes("excluded_from_cohort");
  }
  return false;
}

export default function SalesTargetReview({ sessionDbId, plan, paused }: SalesTargetReviewProps) {
  const [accounts, setAccounts] = useState<AccountWithMeta[]>([]);
  const [busy, setBusy] = useState(false);
  const [discoverMsg, setDiscoverMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const planApproved = plan?.status === "approved";

  const fetchAccounts = useCallback(async () => {
    if (!sessionDbId) return;
    const [accRes, scoreRes] = await Promise.all([
      fetch(`/api/sales/accounts?session_id=${sessionDbId}`),
      fetch(`/api/sales/scores?session_id=${sessionDbId}`),
    ]);
    const accJson = await accRes.json();
    const scoreJson = await scoreRes.json();

    const scoreByAccount: Record<string, { factors: LeadScoreFactors; explanation: string }> = {};
    for (const s of scoreJson.scores ?? []) {
      if (s.account_id && s.factors) {
        scoreByAccount[s.account_id] = { factors: s.factors, explanation: s.explanation };
      }
    }

    const merged = (accJson.accounts ?? []).map((a: AccountWithMeta) => ({
      ...a,
      score: a.id ? scoreByAccount[a.id] : undefined,
    }));
    setAccounts(merged);
  }, [sessionDbId]);

  useEffect(() => {
    if (planApproved) fetchAccounts();
  }, [planApproved, fetchAccounts]);

  async function runDiscovery() {
    if (!sessionDbId || paused) return;
    setBusy(true);
    setError(null);
    setDiscoverMsg(null);
    try {
      const res = await fetch("/api/sales/discover", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionDbId }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Discovery failed");
        return;
      }
      setDiscoverMsg(`Discovered ${json.count ?? 0} accounts`);
      await fetchAccounts();
    } finally {
      setBusy(false);
    }
  }

  async function toggleInclusion(account: AccountWithMeta, included: boolean) {
    if (!account.id) return;
    const res = await fetch("/api/sales/scores", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ account_id: account.id, included }),
    });
    if (res.ok) await fetchAccounts();
  }

  async function approveSelected() {
    if (!sessionDbId) return;
    const selected = accounts.filter((a) => a.id && isIncluded(a));
    if (!selected.length) return;

    setBusy(true);
    setError(null);
    try {
      await Promise.all(
        selected.map((acc) =>
          fetch(`/api/sales/accounts/${acc.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pipeline_stage: "sequencing" as PipelineStage, actor: "user" }),
          }),
        ),
      );

      await fetchAccounts();
    } finally {
      setBusy(false);
    }
  }

  if (!planApproved) {
    return (
      <div className="kraft-card" style={{ padding: "var(--stack-md)", marginTop: "var(--stack-md)" }}>
        <p className="label-caps" style={{ color: "var(--outline)" }}>Target Discovery</p>
        <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "var(--stack-sm)", fontSize: 13 }}>
          Approve the sales plan to unlock account discovery and target review.
        </p>
      </div>
    );
  }

  const includedCount = accounts.filter((a) => isIncluded(a)).length;

  return (
    <div className="kraft-card" style={{ padding: "var(--stack-md)", marginTop: "var(--stack-md)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        <p className="label-caps">Target Review</p>
        <div style={{ display: "flex", gap: "var(--stack-sm)" }}>
          <button
            type="button"
            className="mono"
            onClick={runDiscovery}
            disabled={busy || paused}
            style={{
              border: "1px solid var(--ink)",
              background: "transparent",
              padding: "0.3rem 0.7rem",
              cursor: paused || busy ? "not-allowed" : "pointer",
              opacity: paused ? 0.5 : 1,
            }}
          >
            {busy ? "…" : "Run discovery"}
          </button>
          <button
            className="hanko-btn"
            onClick={approveSelected}
            disabled={busy || includedCount === 0}
          >
            Approve selected ({includedCount})
          </button>
        </div>
      </div>
      <hr className="crease" />

      {error && (
        <p className="mono" style={{ color: "var(--hanko)", fontSize: 13, marginBottom: "var(--stack-sm)" }}>
          {error}
        </p>
      )}
      {discoverMsg && (
        <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 13, marginBottom: "var(--stack-sm)" }}>
          {discoverMsg}
        </p>
      )}

      {!accounts.length ? (
        <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 13, padding: "var(--stack-sm) 0" }}>
          No accounts yet — run discovery to populate targets from live web signals.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
          {accounts.map((acc) => {
            const included = isIncluded(acc);
            const factors = acc.score?.factors;
            return (
              <div
                key={acc.id}
                style={{
                  border: "1px solid var(--outline-variant)",
                  padding: "var(--stack-sm)",
                  opacity: included ? 1 : 0.65,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                  <div>
                    <strong>{acc.name}</strong>
                    {acc.domain && (
                      <span className="mono" style={{ marginLeft: "0.5rem", fontSize: 12, color: "var(--ink-soft)" }}>
                        {acc.domain}
                      </span>
                    )}
                  </div>
                  <div style={{ display: "flex", gap: "var(--stack-sm)", alignItems: "center" }}>
                    {acc.tier != null && (
                      <span className="mono" style={{ fontSize: 11, textTransform: "uppercase" }}>
                        Tier {acc.tier}
                      </span>
                    )}
                    <label className="mono" style={{ fontSize: 12, cursor: "pointer" }}>
                      <input
                        type="checkbox"
                        checked={included}
                        onChange={(e) => toggleInclusion(acc, e.target.checked)}
                        style={{ marginRight: "0.35rem" }}
                      />
                      include
                    </label>
                  </div>
                </div>

                {factors && (
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: "0.35rem" }}>
                    fit {(factors.fit * 100).toFixed(0)}% · intent {(factors.intent * 100).toFixed(0)}% ·
                    contact {(factors.contactability * 100).toFixed(0)}% · priority {(factors.priority * 100).toFixed(0)}%
                  </div>
                )}
                {acc.score?.explanation && (
                  <p style={{ fontSize: 13, color: "var(--ink-soft)", margin: "0.25rem 0" }}>
                    {acc.score.explanation}
                  </p>
                )}

                {acc.signals?.length ? (
                  <ul style={{ fontSize: 12, paddingLeft: "1.1rem", margin: "0.25rem 0 0" }}>
                    {acc.signals.map((sig, i) => (
                      <li key={sig.id ?? `${sig.source_url}-${i}`}>
                        <span className="mono">{sig.signal_type}</span>
                        {sig.source_url && (
                          <>
                            {" — "}
                            <a href={sig.source_url} target="_blank" rel="noopener noreferrer">
                              source
                            </a>
                          </>
                        )}
                        {sig.confidence != null && (
                          <span style={{ color: "var(--outline)" }}>
                            {" "}
                            ({(sig.confidence * 100).toFixed(0)}% conf)
                          </span>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mono" style={{ fontSize: 11, color: "var(--outline)", marginTop: "0.25rem" }}>
                    no verifiable signals
                  </p>
                )}

                <p className="mono" style={{ fontSize: 10, color: "var(--outline)", marginTop: "0.25rem", textTransform: "uppercase" }}>
                  {acc.pipeline_stage}
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
