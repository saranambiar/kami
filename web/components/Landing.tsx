"use client";

import { useState } from "react";
import GoalChips from "@/components/GoalChips";
import ConnectSocials from "@/components/ConnectSocials";

export interface LaunchParams {
  domain: string;
  goals: string[];
  stage: string | null;
}

interface LandingProps {
  onLaunch: (params: LaunchParams) => void;
  busy: boolean;
}

const FEATURES = [
  { title: "Brand dossier from your domain", body: "One URL in. Voice, positioning, and competitor recon folded into a working dossier." },
  { title: "Signal-based ICP buckets", body: "Not \u201cmid-market SaaS.\u201d Hyper-specific segments with a dated trigger, a size, and an angle." },
  { title: "Reviewed outreach, really sent", body: "Every draft passes a strict reviewer before it touches a real inbox or feed." },
  { title: "One approval, full execution", body: "You approve the play. The agency researches, drafts, reviews, and executes it." },
  { title: "A CMO you can talk to", body: "Ask anything about your market. Answers grounded in your dossier, not vibes." },
  { title: "Minimalist by design", body: "No dashboards full of noise. Paper, ink, and the work that matters." },
];

export default function Landing({ onLaunch, busy }: LandingProps) {
  const [domain, setDomain] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [stage, setStage] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const cleaned = domain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, "")
      .replace(/\/.*$/, "");
    if (!/^[a-z0-9-]+(\.[a-z0-9-]+)+$/.test(cleaned)) return;
    onLaunch({ domain: cleaned, goals, stage });
  }

  return (
    <div>
      {/* Centered hero */}
      <section
        style={{
          minHeight: "calc(100vh - 140px)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          gap: "var(--stack-md)",
          padding: "var(--stack-lg) 0",
        }}
      >
        <h1 style={{ fontSize: 64, letterSpacing: "0.04em" }}>
          KAMI<span style={{ color: "var(--hanko)" }}>.</span>
        </h1>
        <p style={{ color: "var(--ink-soft)", fontSize: 20, marginTop: "-0.5rem" }}>
          Your AI Marketing Team
        </p>

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
          <div className="form-line" style={{ minWidth: 280, textAlign: "left" }}>
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

        <GoalChips
          goals={goals}
          stage={stage}
          onGoalsChange={setGoals}
          onStageChange={setStage}
          disabled={busy}
        />

        <div style={{ marginTop: "var(--stack-sm)" }}>
          <ConnectSocials />
        </div>
      </section>

      {/* Feature cards */}
      <section style={{ paddingBottom: "var(--stack-lg)" }}>
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
