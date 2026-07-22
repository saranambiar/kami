"use client";

import { useCallback, useEffect, useState } from "react";
import type { CandidateCompany, SalesSegment } from "@/lib/salesSegments";
import { validateSegmentsForConfirm } from "@/lib/salesSegmentGates";

interface SegmentConfirmProps {
  sessionDbId: string;
  onConfirmed: (segments: SalesSegment[]) => void;
}

export default function SegmentConfirm({ sessionDbId, onConfirmed }: SegmentConfirmProps) {
  const [segments, setSegments] = useState<SalesSegment[]>([]);
  const [source, setSource] = useState<string>("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedAt, setConfirmedAt] = useState<string | null>(null);

  const load = useCallback(async () => {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch(`/api/sales/segments?session_id=${sessionDbId}`);
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not load segments");
        return;
      }
      setSegments(json.segments ?? []);
      setSource(json.source ?? "");
      setConfirmedAt(json.confirmed_at ?? null);
    } finally {
      setBusy(false);
    }
  }, [sessionDbId]);

  useEffect(() => {
    load();
  }, [load]);

  function updateSegment(index: number, patch: Partial<SalesSegment>) {
    setSegments((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
  }

  function updateCandidate(segIndex: number, candIndex: number, patch: Partial<CandidateCompany>) {
    setSegments((prev) =>
      prev.map((s, i) => {
        if (i !== segIndex) return s;
        const companies = [...(s.candidate_companies ?? [])];
        companies[candIndex] = { ...companies[candIndex], ...patch };
        return { ...s, candidate_companies: companies };
      }),
    );
  }

  function addCandidate(segIndex: number) {
    setSegments((prev) =>
      prev.map((s, i) =>
        i === segIndex
          ? {
              ...s,
              candidate_companies: [
                ...(s.candidate_companies ?? []),
                { name: "", domain: "", why: "" },
              ],
            }
          : s,
      ),
    );
  }

  function removeCandidate(segIndex: number, candIndex: number) {
    setSegments((prev) =>
      prev.map((s, i) =>
        i === segIndex
          ? {
              ...s,
              candidate_companies: (s.candidate_companies ?? []).filter((_, j) => j !== candIndex),
            }
          : s,
      ),
    );
  }

  function removeSegment(index: number) {
    setSegments((prev) => prev.filter((_, i) => i !== index));
  }

  function addSegment() {
    setSegments((prev) => [
      ...prev,
      {
        key: `custom-${Date.now()}`,
        name: "New segment",
        why_fit: "Why they'd buy this product — grounded in Overview research",
        firmographic: "",
        technographic: "",
        trigger_signal: "",
        motion: "b2b_sales_assisted",
        target_persona: "Decision-maker",
        target_count: 5,
        candidate_companies: [{ name: "", domain: "", why: "" }],
        example_user_personas: [],
      },
    ]);
  }

  async function confirm() {
    const validationError = validateSegmentsForConfirm(segments);
    if (validationError) {
      setError(validationError);
      return;
    }
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sales/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionDbId, action: "confirm", segments }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not confirm segments");
        return;
      }
      setConfirmedAt(json.confirmed_at);
      onConfirmed(json.segments ?? segments);
    } finally {
      setBusy(false);
    }
  }

  async function rederive() {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/sales/segments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionDbId, action: "derive" }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Could not re-derive segments");
        return;
      }
      setSegments(json.segments ?? []);
      setSource(json.source ?? "");
      setConfirmedAt(null);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="kraft-card" style={{ padding: "var(--stack-md)", marginBottom: "var(--stack-md)" }}>
      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>
        Confirm who you&apos;re selling to
      </p>
      <p className="sales-intro" style={{ marginBottom: "var(--stack-md)" }}>
        These are the customer segments Kami will research. Edit or remove anything that doesn&apos;t
        fit — discovery stays locked until you confirm. B2B segments need at least one real company
        domain seed. PLG segments need an example user persona (not email blast lists).
      </p>

      {source && (
        <p className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: "var(--stack-sm)" }}>
          Source: {source}
          {confirmedAt ? ` · confirmed ${new Date(confirmedAt).toLocaleString()}` : " · not confirmed yet"}
        </p>
      )}

      {error && (
        <p className="mono" style={{ color: "var(--hanko)", fontSize: 13, marginBottom: "var(--stack-sm)" }}>
          {error}
        </p>
      )}

      {!segments.length && !busy && (
        <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 13 }}>
          No segments yet — click Refresh to derive from your dossier.
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {segments.map((seg, i) => (
          <div key={seg.key} style={{ border: "1px solid var(--outline-variant)", padding: "var(--stack-sm)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", gap: "0.5rem", flexWrap: "wrap" }}>
              <input
                value={seg.name}
                onChange={(e) => updateSegment(i, { name: e.target.value })}
                style={{ flex: 1, minWidth: 160, fontWeight: 600 }}
              />
              <select
                value={seg.motion}
                onChange={(e) =>
                  updateSegment(i, {
                    motion: e.target.value as SalesSegment["motion"],
                  })
                }
                className="mono"
                style={{ fontSize: 12 }}
              >
                <option value="b2b_sales_assisted">B2B sales-assisted</option>
                <option value="plg_self_serve">PLG / self-serve</option>
              </select>
              <button
                type="button"
                className="mono"
                onClick={() => removeSegment(i)}
                style={{ border: "1px solid var(--outline)", background: "transparent", fontSize: 11, cursor: "pointer" }}
              >
                Remove
              </button>
            </div>
            <p className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: "0.35rem" }}>
              Why they&apos;d buy this product
            </p>
            <textarea
              value={seg.why_fit}
              onChange={(e) => updateSegment(i, { why_fit: e.target.value })}
              rows={2}
              style={{ width: "100%", fontSize: 13 }}
            />
            <div style={{ display: "flex", gap: "0.75rem", flexWrap: "wrap", marginTop: "0.35rem" }}>
              <label className="mono" style={{ fontSize: 11, flex: 1, minWidth: 140 }}>
                Who to contact
                <input
                  value={seg.target_persona}
                  onChange={(e) => updateSegment(i, { target_persona: e.target.value })}
                  style={{ display: "block", width: "100%", marginTop: 2 }}
                />
              </label>
              <label className="mono" style={{ fontSize: 11, width: 80 }}>
                Budget
                <input
                  type="number"
                  min={1}
                  max={20}
                  value={seg.target_count}
                  onChange={(e) => updateSegment(i, { target_count: Number(e.target.value) || 1 })}
                  style={{ display: "block", width: "100%", marginTop: 2 }}
                />
              </label>
              <label className="mono" style={{ fontSize: 11, flex: 1, minWidth: 140 }}>
                Trigger signal
                <input
                  value={seg.trigger_signal}
                  onChange={(e) => updateSegment(i, { trigger_signal: e.target.value })}
                  style={{ display: "block", width: "100%", marginTop: 2 }}
                  placeholder="e.g. hiring AI eng, launched agent product"
                />
              </label>
            </div>

            {seg.motion === "b2b_sales_assisted" && (
              <div style={{ marginTop: "0.5rem" }}>
                <p className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                  Seed companies (editable — required for Find)
                </p>
                {(seg.candidate_companies ?? []).map((c, ci) => (
                  <div
                    key={`${seg.key}-c-${ci}`}
                    style={{ display: "flex", gap: "0.35rem", flexWrap: "wrap", marginTop: 4 }}
                  >
                    <input
                      placeholder="Name"
                      value={c.name}
                      onChange={(e) => updateCandidate(i, ci, { name: e.target.value })}
                      style={{ flex: 1, minWidth: 100, fontSize: 12 }}
                    />
                    <input
                      placeholder="domain.com"
                      value={c.domain}
                      onChange={(e) => updateCandidate(i, ci, { domain: e.target.value })}
                      style={{ flex: 1, minWidth: 120, fontSize: 12 }}
                    />
                    <input
                      placeholder="Why fit"
                      value={c.why ?? ""}
                      onChange={(e) => updateCandidate(i, ci, { why: e.target.value })}
                      style={{ flex: 1.5, minWidth: 140, fontSize: 12 }}
                    />
                    <button
                      type="button"
                      className="mono"
                      onClick={() => removeCandidate(i, ci)}
                      style={{ border: "1px solid var(--outline)", background: "transparent", fontSize: 11, cursor: "pointer" }}
                    >
                      ×
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  className="mono"
                  onClick={() => addCandidate(i)}
                  style={{
                    marginTop: 6,
                    border: "1px solid var(--outline)",
                    background: "transparent",
                    fontSize: 11,
                    cursor: "pointer",
                    padding: "0.2rem 0.5rem",
                  }}
                >
                  + Add company
                </button>
              </div>
            )}

            {seg.motion === "plg_self_serve" && (
              <p className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: "0.35rem" }}>
                PLG motion — Find will not blast company emails. Example users:{" "}
                {seg.example_user_personas?.length
                  ? seg.example_user_personas.map((p) => p.label).join("; ")
                  : "(add personas via Refresh or confirm will require at least one)"}
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "var(--stack-sm)", marginTop: "var(--stack-md)", flexWrap: "wrap" }}>
        <button type="button" className="mono" onClick={addSegment} disabled={busy} style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.4rem 0.75rem", cursor: "pointer" }}>
          + Add segment
        </button>
        <button type="button" className="mono" onClick={rederive} disabled={busy} style={{ border: "1px solid var(--outline)", background: "transparent", padding: "0.4rem 0.75rem", cursor: "pointer" }}>
          Refresh from dossier
        </button>
        <button type="button" className="hanko-btn" onClick={confirm} disabled={busy || !segments.length}>
          {busy ? "…" : "Confirm segments"}
        </button>
      </div>
    </div>
  );
}
