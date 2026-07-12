"use client";

import type { Dossier as DossierData } from "@/lib/hermes";

interface DossierProps {
  dossier: DossierData;
  onExecute: (title: string, playbook: string) => void;
  executing: boolean;
}

export default function Dossier({ dossier, onExecute, executing }: DossierProps) {
  return (
    <section id="dossier" style={{ marginTop: "var(--stack-lg)" }}>
      <h2>
        Campaign Dossier{" "}
        <span style={{ color: "var(--hanko)" }}>— {dossier.company}</span>
      </h2>

      <hr className="crease" />

      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-md)" }}>
        <div className="kraft-card">
          <p className="label-caps">Brand Voice</p>
          <p style={{ marginTop: "var(--stack-sm)" }}>{dossier.brand_voice}</p>
          <hr className="crease" />
          <p className="label-caps">Positioning</p>
          <p style={{ marginTop: "var(--stack-sm)" }}>{dossier.positioning}</p>
        </div>

        <div className="kraft-card">
          <p className="label-caps">Competitor Analysis</p>
          {dossier.competitor_analysis.map((c) => (
            <div key={c.name} style={{ marginTop: "var(--stack-sm)" }}>
              <strong>{c.name}</strong> — {c.insight}
            </div>
          ))}
        </div>

        <div>
          <h3 style={{ marginBottom: "var(--stack-sm)" }}>ICP Buckets</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-md)" }}>
            {dossier.icp_buckets.map((b) => (
              <div className="kraft-card" key={b.label}>
                <strong style={{ fontFamily: "var(--font-headline)" }}>{b.label}</strong>
                <hr className="crease" />
                <p className="mono">WHERE · {b.where_they_live}</p>
                <p className="mono">SIGNAL · {b.trigger_signal}</p>
                <p className="mono">SIZE · {b.est_size}</p>
                <p style={{ marginTop: "var(--stack-sm)" }}>{b.angle}</p>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 style={{ marginBottom: "var(--stack-sm)" }}>Opportunities</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
            {dossier.opportunities.map((o) => (
              <div
                className="kraft-card"
                key={o.title}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                  flexWrap: "wrap",
                }}
              >
                <div style={{ flex: 1, minWidth: 220 }}>
                  <strong>{o.title}</strong>
                  <p className="mono" style={{ color: "var(--ink-soft)" }}>
                    PLAYBOOK · {o.playbook}
                  </p>
                  <p style={{ marginTop: "0.25rem" }}>{o.detail}</p>
                </div>
                <button
                  className="hanko-btn"
                  disabled={executing}
                  onClick={() => onExecute(o.title, o.playbook)}
                >
                  Execute
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
