"use client";

import { useState } from "react";

interface DomainFormProps {
  onSubmit: (domain: string) => void;
  busy: boolean;
}

export default function DomainForm({ onSubmit, busy }: DomainFormProps) {
  const [domain, setDomain] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(cleaned)) return;
    onSubmit(cleaned);
  }

  return (
    <section style={{ paddingTop: "var(--stack-lg)" }}>
      <h1>
        Your domain in.
        <br />
        <span style={{ color: "var(--hanko)" }}>A full campaign out.</span>
      </h1>
      <p style={{ marginTop: "var(--stack-md)", maxWidth: 560, color: "var(--ink-soft)" }}>
        Kami is an AI GTM agency. Drop your domain — our agents research your market, fold a
        campaign dossier, and execute real outreach.
      </p>

      <form
        onSubmit={submit}
        style={{
          marginTop: "var(--stack-lg)",
          display: "flex",
          gap: "1.5rem",
          alignItems: "flex-end",
          flexWrap: "wrap",
        }}
      >
        <div className="form-line" style={{ flex: 1, minWidth: 260, maxWidth: 420 }}>
          <label className="mono label-caps" htmlFor="domain-input">
            COMPANY DOMAIN
          </label>
          <input
            id="domain-input"
            value={domain}
            onChange={(e) => setDomain(e.target.value)}
            placeholder="yourcompany.com"
            disabled={busy}
            autoFocus
          />
        </div>
        <button className="hanko-btn" type="submit" disabled={busy}>
          {busy ? "Folding…" : "Begin"}
        </button>
      </form>
    </section>
  );
}
