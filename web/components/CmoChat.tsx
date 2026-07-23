"use client";

import { useState } from "react";
import type { Dossier } from "@/lib/hermes";
import { streamChat } from "@/lib/hermes";
import { cmoPrompt } from "@/lib/prompts";
import {
  buildCompanyContextPack,
  dossierFromBrandPayload,
} from "@/lib/cmoContext";
import type { SalesCampaignConfig } from "@/lib/salesTypes";

interface Message {
  role: "you" | "cmo";
  text: string;
}

interface CmoChatProps {
  sessionId: string;
  domain: string;
  dossier: Dossier | null;
  sessionDbId?: string | null;
  salesConfig?: SalesCampaignConfig | null;
  goals?: string[] | null;
}

export default function CmoChat({
  sessionId,
  domain,
  dossier,
  sessionDbId = null,
  salesConfig = null,
  goals = null,
}: CmoChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function resolveDossier(): Promise<Dossier | null> {
    if (dossier) return dossier;
    if (!sessionDbId) return null;
    try {
      const res = await fetch(`/api/sessions/${sessionDbId}`);
      if (!res.ok) return null;
      const json = await res.json();
      return dossierFromBrandPayload(json.brand);
    } catch {
      return null;
    }
  }

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "you", text: question }, { role: "cmo", text: "" }]);
    try {
      const resolved = await resolveDossier();
      const contextPack = buildCompanyContextPack({
        dossier: resolved,
        domain,
        salesConfig,
        goals,
        canonicalDomain: resolved?.canonical_domain ?? domain,
        researchProvenance: resolved
          ? {
              confidence: resolved.identity_confidence,
              evidenceUrls: resolved.evidence_urls,
              sourceCount: resolved.evidence_urls?.length,
            }
          : null,
      });
      // Reinject pack every turn so gateway timeouts cannot wipe company knowledge.
      await streamChat(
        cmoPrompt(question, contextPack),
        sessionId,
        (delta) => {
          setMessages((m) => {
            const last = m[m.length - 1];
            return [...m.slice(0, -1), { ...last, text: last.text + delta }];
          });
        },
        {
          kamiSessionId: sessionDbId,
          kind: "cmo_chat",
          agent: "cmo",
        },
      );
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "request failed";
      setMessages((m) => [...m.slice(0, -1), { role: "cmo", text: `⚠ ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ marginTop: "var(--stack-lg)", marginBottom: "var(--stack-lg)" }}>
      <h3 style={{ marginBottom: "var(--stack-sm)" }}>Ask Kami</h3>
      <div className="kraft-card">
        {messages.length === 0 && (
          <p style={{ color: "var(--ink-soft)" }}>
            Ask anything about the dossier — buckets, angles, next moves. Company context is
            injected every turn so answers stay grounded even after a session timeout.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "var(--stack-sm)" }}>
            <span className="label-caps">{m.role === "you" ? "You" : "Kami"}</span>
            <p style={{ whiteSpace: "pre-wrap" }}>{m.text || "…"}</p>
          </div>
        ))}
        <hr className="crease" />
        <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end" }}>
          <div className="form-line" style={{ flex: 1 }}>
            <label className="mono label-caps" htmlFor="cmo-input">
              YOUR QUESTION
            </label>
            <input
              id="cmo-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Which bucket should we hit first?"
              disabled={busy}
            />
          </div>
          <button className="hanko-btn" onClick={send} disabled={busy}>
            {busy ? "…" : "Ask"}
          </button>
        </div>
      </div>
    </section>
  );
}
