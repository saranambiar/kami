"use client";

import { useState } from "react";
import { streamChat } from "@/lib/hermes";
import { cmoPrompt } from "@/lib/prompts";

interface Message {
  role: "you" | "cmo";
  text: string;
}

interface CmoChatProps {
  sessionId: string;
}

export default function CmoChat({ sessionId }: CmoChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  async function send() {
    const question = input.trim();
    if (!question || busy) return;
    setInput("");
    setBusy(true);
    setMessages((m) => [...m, { role: "you", text: question }, { role: "cmo", text: "" }]);
    try {
      await streamChat(cmoPrompt(question), sessionId, (delta) => {
        setMessages((m) => {
          const last = m[m.length - 1];
          return [...m.slice(0, -1), { ...last, text: last.text + delta }];
        });
      });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "request failed";
      setMessages((m) => [...m.slice(0, -1), { role: "cmo", text: `⚠ ${msg}` }]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ marginTop: "var(--stack-lg)", marginBottom: "var(--stack-lg)" }}>
      <h3 style={{ marginBottom: "var(--stack-sm)" }}>Talk to your CMO</h3>
      <div className="kraft-card">
        {messages.length === 0 && (
          <p style={{ color: "var(--ink-soft)" }}>
            Ask anything about the dossier — buckets, angles, next moves.
          </p>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ marginBottom: "var(--stack-sm)" }}>
            <span className="label-caps">{m.role === "you" ? "You" : "CMO"}</span>
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
