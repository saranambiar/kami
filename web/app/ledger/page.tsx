"use client";

import { useEffect, useState } from "react";

interface Run {
  id: string;
  source: string;
  started_at: string | null;
  duration_s: number | null;
  messages: number;
  tool_calls: number;
  input_tokens: number;
  output_tokens: number;
  cost_usd: number;
  model: string | null;
}

interface Totals {
  runs: number;
  input_tokens: number;
  output_tokens: number;
  tool_calls: number;
}

function fmt(n: number | null | undefined): string {
  if (n == null) return "—";
  return n.toLocaleString();
}

export default function LedgerPage() {
  const [runs, setRuns] = useState<Run[]>([]);
  const [totals, setTotals] = useState<Totals | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/observability")
      .then((r) => r.json())
      .then((json) => {
        setRuns(json.runs ?? []);
        setTotals(json.totals ?? null);
      })
      .catch(() => setError("run data unavailable (Hermes state.db not on this machine)"));
  }, []);

  const maxTokens = Math.max(1, ...runs.map((r) => r.input_tokens + r.output_tokens));

  return (
    <main className="container-wide" style={{ paddingBottom: "var(--stack-lg)" }}>
      <div style={{ paddingTop: "var(--stack-md)" }}>
        <h2>
          Run Ledger <span style={{ color: "var(--hanko)" }}>· every agent run, accounted</span>
        </h2>
        <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "0.25rem" }}>
          source: hermes state.db · kami sessions only
        </p>
      </div>
      <hr className="crease" />

      {totals && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
            gap: "var(--stack-md)",
            marginBottom: "var(--stack-md)",
          }}
        >
          {[
            ["Runs", fmt(totals.runs)],
            ["Input tokens", fmt(totals.input_tokens)],
            ["Output tokens", fmt(totals.output_tokens)],
            ["Tool calls", fmt(totals.tool_calls)],
          ].map(([label, value]) => (
            <div className="kraft-card" key={label} style={{ padding: "1rem", textAlign: "center" }}>
              <p className="label-caps">{label}</p>
              <p style={{ fontFamily: "var(--font-headline)", fontSize: 28, fontWeight: 700 }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {error && (
        <p className="mono" style={{ color: "var(--ink-soft)" }}>
          {error}
        </p>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {runs.map((r) => (
          <div className="kraft-card" key={r.id} style={{ padding: "0.9rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "0.5rem" }}>
              <span className="mono" style={{ fontWeight: 700 }}>
                {r.id}
              </span>
              <span className="mono" style={{ color: "var(--ink-soft)" }}>
                {r.started_at ? new Date(r.started_at).toLocaleString() : "—"}
                {r.duration_s != null ? ` · ${r.duration_s}s` : ""}
              </span>
            </div>
            {/* token bar */}
            <div
              style={{
                marginTop: "0.5rem",
                height: 8,
                background: "var(--paper)",
                border: "1px solid var(--crease)",
              }}
            >
              <div
                style={{
                  height: "100%",
                  width: `${((r.input_tokens + r.output_tokens) / maxTokens) * 100}%`,
                  background: "var(--hanko)",
                }}
              />
            </div>
            <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "0.4rem" }}>
              in {fmt(r.input_tokens)} · out {fmt(r.output_tokens)} · {r.messages} msgs ·{" "}
              {r.tool_calls} tool calls
              {r.model ? ` · ${r.model}` : ""}
            </p>
          </div>
        ))}
        {!error && runs.length === 0 && (
          <p className="mono" style={{ color: "var(--outline)" }}>
            no runs yet
          </p>
        )}
      </div>
    </main>
  );
}
