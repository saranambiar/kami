"use client";

import { useState } from "react";
import Image from "next/image";
import { signInWithGoogle } from "@/lib/supabaseBrowser";

export interface LaunchParams {
  domain: string;
  goals: string[];
  stage: string | null;
}

interface LandingProps {
  onLaunch: (params: LaunchParams) => void;
  busy: boolean;
  authed: boolean;
  authEnabled: boolean;
}

const FEATURES = [
  { title: "Brand dossier from your domain", body: "One URL in. Voice, positioning, and competitor recon folded into a working dossier." },
  { title: "Signal-based ICP buckets", body: "Not \u201cmid-market SaaS.\u201d Hyper-specific segments with a dated trigger, a size, and an angle." },
  { title: "Reviewed outreach, really sent", body: "Every draft passes a strict reviewer before it touches a real inbox or feed." },
  { title: "One approval, full execution", body: "You approve the play. The agency researches, drafts, reviews, and executes it." },
  { title: "A CMO you can talk to", body: "Ask anything about your market. Answers grounded in your dossier, not vibes." },
  { title: "Minimalist by design", body: "No dashboards full of noise. Paper, ink, and the work that matters." },
];

function GoogleButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => signInWithGoogle()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.6rem",
        background: "var(--paper)",
        border: "1px solid var(--ink)",
        color: "var(--ink)",
        fontFamily: "var(--font-body)",
        fontSize: 16,
        padding: "0.7rem 1.4rem",
        cursor: "pointer",
      }}
    >
      <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden>
        <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62z" />
        <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.03-3.7H.96v2.33A9 9 0 0 0 9 18z" />
        <path fill="#FBBC05" d="M3.97 10.72a5.4 5.4 0 0 1 0-3.44V4.95H.96a9 9 0 0 0 0 8.1l3.01-2.33z" />
        <path fill="#EA4335" d="M9 3.58c1.32 0 2.5.45 3.44 1.35l2.58-2.58A9 9 0 0 0 .96 4.95l3.01 2.33C4.68 5.16 6.66 3.58 9 3.58z" />
      </svg>
      {label}
    </button>
  );
}

export default function Landing({ onLaunch, busy, authed, authEnabled }: LandingProps) {
  const [domain, setDomain] = useState("");

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(cleaned)) return;
    // page.launch() handles the login gate when the user isn't signed in.
    onLaunch({ domain: cleaned, goals: [], stage: null });
  }

  const needsLogin = authEnabled && !authed;

  return (
    <div>
      {/* Hero — only this is visible above the fold */}
      <section
        style={{
          minHeight: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "var(--stack-md)",
          padding: "var(--stack-lg) 0 var(--stack-md)",
        }}
      >
        <Image
          src="/kami-logo.png"
          alt="Kami"
          width={132}
          height={132}
          priority
          style={{ objectFit: "contain" }}
        />
        <p style={{ color: "var(--ink-soft)", fontSize: 20, marginTop: "-0.25rem" }}>
          Your AI Marketing Team
        </p>

        {needsLogin && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "0.5rem" }}>
            <GoogleButton label="Continue with Google" />
            <span className="mono" style={{ color: "var(--ink-soft)" }}>
              one click to start — your campaigns are saved to your account
            </span>
          </div>
        )}

        <form
          onSubmit={submit}
          style={{
            display: "flex",
            gap: "1.25rem",
            alignItems: "flex-end",
            flexWrap: "wrap",
            justifyContent: "center",
            marginTop: "var(--stack-sm)",
          }}
        >
          <div className="form-line" style={{ minWidth: 300, textAlign: "left" }}>
            <label className="mono label-caps" htmlFor="domain-input">
              ENTER YOUR DOMAIN TO START
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

        {/* scroll affordance */}
        <a
          href="#what"
          className="mono"
          style={{ color: "var(--ink-soft)", marginTop: "var(--stack-md)" }}
        >
          what kami runs for you ↓
        </a>
      </section>

      {/* Below the fold — feature cards */}
      <section id="what" style={{ paddingBottom: "var(--stack-lg)" }}>
        <hr className="crease" />
        <p className="label-caps" style={{ textAlign: "center", margin: "var(--stack-md) 0" }}>
          What Kami runs for you
        </p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "var(--stack-md)",
          }}
        >
          {FEATURES.map((f) => (
            <div className="kraft-card" key={f.title}>
              <strong style={{ fontFamily: "var(--font-headline)" }}>{f.title}</strong>
              <p style={{ marginTop: "var(--stack-sm)", color: "var(--ink-soft)" }}>{f.body}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
