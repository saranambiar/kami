"use client";

import { useEffect, useState } from "react";
import type { Dossier, IcpBucket } from "@/lib/hermes";

const inputStyle: React.CSSProperties = {
  width: "100%",
  background: "var(--paper)",
  border: "1px solid var(--crease)",
  color: "var(--ink)",
  font: "inherit",
  fontSize: 14,
  padding: "0.4rem 0.5rem",
};

function Field({
  label,
  value,
  onChange,
  textarea,
  rows = 3,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
  rows?: number;
}) {
  return (
    <label style={{ display: "block", marginBottom: "0.6rem" }}>
      <span className="mono label-caps" style={{ display: "block", marginBottom: "0.25rem" }}>
        {label}
      </span>
      {textarea ? (
        <textarea style={{ ...inputStyle, resize: "vertical" }} rows={rows} value={value} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input style={inputStyle} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </label>
  );
}

function Section({
  title,
  children,
  defaultOpen = false,
  forceOpen = false,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = forceOpen || open;
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="label-caps"
        style={{
          background: "none",
          border: "none",
          cursor: forceOpen ? "default" : "pointer",
          padding: "0.5rem 0",
          width: "100%",
          textAlign: "left",
          display: "flex",
          justifyContent: "space-between",
          color: "var(--ink)",
        }}
      >
        {title}
        {!forceOpen && <span style={{ color: "var(--hanko)" }}>{isOpen ? "−" : "+"}</span>}
      </button>
      {isOpen && <div style={{ paddingBottom: "var(--stack-sm)" }}>{children}</div>}
      <hr className="crease" style={{ margin: "0.25rem 0" }} />
    </div>
  );
}

interface IntelPanelProps {
  dossier: Dossier;
  onSave: (next: Dossier) => void;
}

function clone(d: Dossier): Dossier {
  return JSON.parse(JSON.stringify(d)) as Dossier;
}

export default function IntelPanel({ dossier, onSave }: IntelPanelProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState<Dossier>(() => clone(dossier));

  // Keep the draft in sync when a new dossier loads and we're not mid-edit.
  useEffect(() => {
    if (!editing) setDraft(clone(dossier));
  }, [dossier, editing]);

  function save() {
    const cleaned: Dossier = {
      ...draft,
      tone: (draft.tone ?? []).map((t) => t.trim()).filter(Boolean),
      competitor_analysis: draft.competitor_analysis.filter((c) => c.name.trim() || c.insight.trim()),
      icp_buckets: draft.icp_buckets.filter((b) => b.label.trim()),
    };
    onSave(cleaned);
    setEditing(false);
  }

  function cancel() {
    setDraft(clone(dossier));
    setEditing(false);
  }

  const view = editing ? draft : dossier;

  return (
    <aside>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "var(--stack-sm)",
        }}
      >
        <p className="label-caps" style={{ margin: 0 }}>
          Intelligence — {view.company}
        </p>
        {editing ? (
          <div style={{ display: "flex", gap: "0.4rem" }}>
            <button type="button" className="mono" onClick={save} style={btnStyle(true)}>
              save
            </button>
            <button type="button" className="mono" onClick={cancel} style={btnStyle(false)}>
              cancel
            </button>
          </div>
        ) : (
          <button type="button" className="mono" onClick={() => setEditing(true)} style={btnStyle(false)}>
            edit
          </button>
        )}
      </div>

      {editing && (
        <div style={{ marginBottom: "0.6rem" }}>
          <Field label="Company" value={draft.company} onChange={(v) => setDraft({ ...draft, company: v })} />
        </div>
      )}

      <Section title="Brand Analysis" defaultOpen forceOpen={editing}>
        {editing ? (
          <Field
            label="Brand voice"
            textarea
            rows={4}
            value={draft.brand_voice}
            onChange={(v) => setDraft({ ...draft, brand_voice: v })}
          />
        ) : (
          <p style={{ fontSize: 14 }}>{view.brand_voice}</p>
        )}
      </Section>

      <Section title="Positioning" forceOpen={editing}>
        {editing ? (
          <Field
            label="Positioning"
            textarea
            rows={4}
            value={draft.positioning}
            onChange={(v) => setDraft({ ...draft, positioning: v })}
          />
        ) : (
          <p style={{ fontSize: 14 }}>{view.positioning}</p>
        )}
      </Section>

      {(editing || (view.tone && view.tone.length > 0)) && (
        <Section title="Tone" forceOpen={editing}>
          {editing ? (
            <Field
              label="Tone (comma-separated)"
              value={(draft.tone ?? []).join(", ")}
              onChange={(v) => setDraft({ ...draft, tone: v.split(",").map((t) => t.trimStart()) })}
            />
          ) : (
            <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
              {view.tone!.map((t) => (
                <span key={t} className="mono" style={{ border: "1px solid var(--crease)", padding: "0.15rem 0.5rem" }}>
                  {t}
                </span>
              ))}
            </div>
          )}
        </Section>
      )}

      <Section title="Competitors" forceOpen={editing}>
        {editing ? (
          <div>
            {draft.competitor_analysis.map((c, i) => (
              <div key={i} style={{ border: "1px solid var(--crease)", padding: "0.5rem", marginBottom: "0.5rem" }}>
                <Field
                  label="Name"
                  value={c.name}
                  onChange={(v) => {
                    const next = [...draft.competitor_analysis];
                    next[i] = { ...next[i], name: v };
                    setDraft({ ...draft, competitor_analysis: next });
                  }}
                />
                <Field
                  label="Insight"
                  textarea
                  value={c.insight}
                  onChange={(v) => {
                    const next = [...draft.competitor_analysis];
                    next[i] = { ...next[i], insight: v };
                    setDraft({ ...draft, competitor_analysis: next });
                  }}
                />
                <button
                  type="button"
                  className="mono"
                  onClick={() =>
                    setDraft({
                      ...draft,
                      competitor_analysis: draft.competitor_analysis.filter((_, j) => j !== i),
                    })
                  }
                  style={btnStyle(false)}
                >
                  remove
                </button>
              </div>
            ))}
            <button
              type="button"
              className="mono"
              onClick={() =>
                setDraft({
                  ...draft,
                  competitor_analysis: [...draft.competitor_analysis, { name: "", insight: "" }],
                })
              }
              style={btnStyle(false)}
            >
              + add competitor
            </button>
          </div>
        ) : (
          view.competitor_analysis.map((c) => (
            <p key={c.name} style={{ fontSize: 14, marginBottom: "0.5rem" }}>
              <strong>{c.name}</strong> — {c.insight}
            </p>
          ))
        )}
      </Section>

      <Section title={`ICP Buckets (${view.icp_buckets.length})`} defaultOpen forceOpen={editing}>
        {editing ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
            {draft.icp_buckets.map((b, i) => {
              const setBucket = (patch: Partial<IcpBucket>) => {
                const next = [...draft.icp_buckets];
                next[i] = { ...next[i], ...patch };
                setDraft({ ...draft, icp_buckets: next });
              };
              return (
                <div key={i} style={{ border: "1px solid var(--crease)", padding: "0.5rem" }}>
                  <Field label="Label" value={b.label} onChange={(v) => setBucket({ label: v })} />
                  <Field label="Where they live" value={b.where_they_live} onChange={(v) => setBucket({ where_they_live: v })} />
                  <Field label="Trigger signal" value={b.trigger_signal} onChange={(v) => setBucket({ trigger_signal: v })} />
                  <Field label="Est. size" value={b.est_size} onChange={(v) => setBucket({ est_size: v })} />
                  <Field label="Angle" textarea value={b.angle} onChange={(v) => setBucket({ angle: v })} />
                  <button
                    type="button"
                    className="mono"
                    onClick={() => setDraft({ ...draft, icp_buckets: draft.icp_buckets.filter((_, j) => j !== i) })}
                    style={btnStyle(false)}
                  >
                    remove
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              className="mono"
              onClick={() =>
                setDraft({
                  ...draft,
                  icp_buckets: [
                    ...draft.icp_buckets,
                    { label: "", where_they_live: "", trigger_signal: "", est_size: "", angle: "" },
                  ],
                })
              }
              style={btnStyle(false)}
            >
              + add bucket
            </button>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
            {view.icp_buckets.map((b) => (
              <details key={b.label} style={{ border: "1px solid var(--crease)", padding: "0.5rem" }}>
                <summary style={{ cursor: "pointer", fontWeight: 700, fontSize: 14 }}>{b.label}</summary>
                <div style={{ marginTop: "0.5rem", fontSize: 13 }}>
                  <p className="mono">WHERE · {b.where_they_live}</p>
                  <p className="mono">SIGNAL · {b.trigger_signal}</p>
                  <p className="mono">SIZE · {b.est_size}</p>
                  <p style={{ marginTop: "0.4rem" }}>{b.angle}</p>
                </div>
              </details>
            ))}
          </div>
        )}
      </Section>
    </aside>
  );
}

function btnStyle(primary: boolean): React.CSSProperties {
  return {
    border: `1px solid ${primary ? "var(--hanko)" : "var(--ink)"}`,
    background: primary ? "var(--hanko)" : "transparent",
    color: primary ? "var(--paper)" : "var(--ink)",
    padding: "0.25rem 0.6rem",
    cursor: "pointer",
    textTransform: "none",
  };
}
