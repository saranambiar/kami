"use client";

import { useCallback, useEffect, useState } from "react";
import type {
  AccountSignal,
  LeadScoreFactors,
  PipelineStage,
  SalesAccount,
  SalesPlan,
} from "@/lib/salesTypes";
import { scoreLabel } from "@/lib/salesMotionLabels";

interface AccountContact {
  id?: string;
  name?: string;
  email?: string;
}

interface AccountWithMeta extends SalesAccount {
  signals?: AccountSignal[];
  contact?: AccountContact | null;
  score?: {
    factors: LeadScoreFactors;
    explanation: string;
  };
}

interface SalesTargetReviewProps {
  sessionDbId: string | null;
  plan: SalesPlan | null;
  paused?: boolean;
  onContinue?: () => void;
}

function isIncluded(account: SalesAccount): boolean {
  if (account.pipeline_stage === "ready_for_approval" || account.pipeline_stage === "sequencing") {
    return !account.notes?.includes("excluded_from_cohort");
  }
  return false;
}

export default function SalesTargetReview({ sessionDbId, plan, paused, onContinue }: SalesTargetReviewProps) {
  const [accounts, setAccounts] = useState<AccountWithMeta[]>([]);
  const [busy, setBusy] = useState(false);
  const [discoverMsg, setDiscoverMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [emailDrafts, setEmailDrafts] = useState<Record<string, string>>({});
  const [savingEmailId, setSavingEmailId] = useState<string | null>(null);

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
      setDiscoverMsg(`Found ${json.count ?? 0} companies`);
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

  async function saveEmail(account: AccountWithMeta) {
    if (!sessionDbId || !account.id) return;
    const email = (emailDrafts[account.id] ?? account.contact?.email ?? "").trim();
    if (!email.includes("@")) return;

    setSavingEmailId(account.id);
    setError(null);
    try {
      const res = await fetch("/api/sales/contacts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session_id: sessionDbId,
          account_id: account.id,
          name: account.name,
          email,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not save email");
        return;
      }
      await fetchAccounts();
    } finally {
      setSavingEmailId(null);
    }
  }

  async function continueWithSelected() {
    if (!sessionDbId) return;
    const selected = accounts.filter((a) => a.id && isIncluded(a));
    if (!selected.length) {
      setError("Select at least one company to continue.");
      return;
    }

    for (const acc of selected) {
      const draft = emailDrafts[acc.id!]?.trim();
      if (!acc.contact?.email && draft?.includes("@")) {
        await saveEmail({ ...acc, contact: undefined });
      } else if (!acc.contact?.email && !draft?.includes("@")) {
        setError("Add a contact email for each selected company before continuing.");
        return;
      }
    }

    setBusy(true);
    setError(null);
    try {
      const accRes = await fetch(`/api/sales/accounts?session_id=${sessionDbId}`);
      const accJson = await accRes.json();
      const fresh = (accJson.accounts ?? []) as AccountWithMeta[];
      const accountIds = fresh.filter((a) => a.id && isIncluded(a)).map((a) => a.id!);

      if (!accountIds.length) {
        setError("No selected companies found.");
        return;
      }

      const missing = fresh.filter((a) => a.id && isIncluded(a) && !a.contact?.email);
      if (missing.length) {
        setError("Add a contact email for each selected company before continuing.");
        return;
      }

      await Promise.all(
        accountIds.map((id) =>
          fetch(`/api/sales/accounts/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ pipeline_stage: "sequencing" as PipelineStage, actor: "user" }),
          }),
        ),
      );

      const seqRes = await fetch("/api/sales/sequences", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionDbId, account_ids: accountIds }),
      });
      const seqJson = await seqRes.json();
      if (!seqRes.ok) {
        setError(seqJson.error ?? "Could not create email sequences");
        return;
      }

      await fetchAccounts();
      onContinue?.();
    } finally {
      setBusy(false);
    }
  }

  if (!planApproved) {
    return (
      <div className="kraft-card" style={{ padding: "var(--stack-md)", marginTop: "var(--stack-md)" }}>
        <p className="label-caps" style={{ color: "var(--outline)" }}>Find companies</p>
        <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "var(--stack-sm)", fontSize: 13 }}>
          Approve your plan first, then we&apos;ll research companies that match.
        </p>
      </div>
    );
  }

  const included = accounts.filter((a) => isIncluded(a));
  const includedCount = included.length;

  return (
    <div className="kraft-card" style={{ padding: "var(--stack-md)", marginTop: "var(--stack-md)" }}>
      <p className="sales-intro" style={{ marginBottom: "var(--stack-md)" }}>
        Research companies, pick who to pursue, and add a real email for anyone you want to reach.
      </p>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)", flexWrap: "wrap", gap: "var(--stack-sm)" }}>
        <p className="label-caps">Find companies</p>
        <div style={{ display: "flex", gap: "var(--stack-sm)" }}>
          <button
            type="button"
            className="hanko-btn"
            onClick={runDiscovery}
            disabled={busy || paused}
            style={{ opacity: paused ? 0.5 : 1 }}
          >
            {busy ? "…" : "Find companies"}
          </button>
          {includedCount > 0 && (
            <button
              type="button"
              className="mono"
              onClick={continueWithSelected}
              disabled={busy}
              style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.4rem 0.75rem", cursor: "pointer" }}
            >
              Continue with selected ({includedCount})
            </button>
          )}
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
          No companies yet — click Find companies to research targets from live web signals.
        </p>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
          {accounts.map((acc) => {
            const selected = isIncluded(acc);
            const factors = acc.score?.factors;
            const contactEmail = acc.contact?.email ?? emailDrafts[acc.id ?? ""] ?? "";

            return (
              <div
                key={acc.id}
                style={{
                  border: "1px solid var(--outline-variant)",
                  padding: "var(--stack-sm)",
                  opacity: selected ? 1 : 0.75,
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap", gap: "0.5rem" }}>
                  <div>
                    <strong>{acc.name}</strong>
                    {acc.domain && (
                      <span className="mono" style={{ marginLeft: "0.5rem", fontSize: 12, color: "var(--ink-soft)" }}>
                        {acc.domain}
                      </span>
                    )}
                  </div>
                  <label className="mono" style={{ fontSize: 12, cursor: "pointer" }}>
                    <input
                      type="checkbox"
                      checked={selected}
                      onChange={(e) => toggleInclusion(acc, e.target.checked)}
                      style={{ marginRight: "0.35rem" }}
                    />
                    Include
                  </label>
                </div>

                {factors && (
                  <div className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: "0.35rem" }}>
                    {scoreLabel("fit", factors.fit)} · {scoreLabel("intent", factors.intent)} ·{" "}
                    {scoreLabel("contactability", factors.contactability)}
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
                        {sig.detail ?? sig.signal_type}
                        {sig.source_url && (
                          <>
                            {" — "}
                            <a href={sig.source_url} target="_blank" rel="noopener noreferrer">
                              source
                            </a>
                          </>
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="mono" style={{ fontSize: 11, color: "var(--outline)", marginTop: "0.25rem" }}>
                    No public signal yet — you can still include if they fit your ICP.
                  </p>
                )}

                {selected && (
                  <div className="sales-inline-email">
                    {acc.contact?.email ? (
                      <span className="mono" style={{ fontSize: 12 }}>Email: {acc.contact.email}</span>
                    ) : (
                      <>
                        <input
                          type="email"
                          placeholder="Add contact email"
                          value={emailDrafts[acc.id ?? ""] ?? ""}
                          onChange={(e) =>
                            setEmailDrafts((d) => ({ ...d, [acc.id!]: e.target.value }))
                          }
                        />
                        <button
                          type="button"
                          className="mono"
                          disabled={savingEmailId === acc.id}
                          onClick={() => saveEmail(acc)}
                          style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: 11 }}
                        >
                          Save
                        </button>
                      </>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
