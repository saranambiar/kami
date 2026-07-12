"use client";

import { useState } from "react";

interface ConnectXProps {
  connected: boolean;
  onConnected: (handle: string) => void;
}

const FIELDS = [
  { key: "consumerKey", label: "API KEY" },
  { key: "consumerSecret", label: "API KEY SECRET" },
  { key: "accessToken", label: "ACCESS TOKEN" },
  { key: "accessSecret", label: "ACCESS TOKEN SECRET" },
] as const;

export default function ConnectX({ connected, onConnected }: ConnectXProps) {
  const [open, setOpen] = useState(false);
  const [keys, setKeys] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [handle, setHandle] = useState<string | null>(null);

  const allFilled = FIELDS.every((f) => keys[f.key]?.trim());

  async function connect() {
    if (!allFilled) return;
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "x",
          keys: Object.fromEntries(FIELDS.map((f) => [f.key, keys[f.key].trim()])),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.connected) {
        setError(json.error ?? "verification failed — check the keys");
        return;
      }
      setHandle(json.handle);
      onConnected(json.handle);
      setOpen(false);
    } catch {
      setError("connection failed — is the server running?");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <span className="label-caps">Outreach accounts:</span>
        <button
          type="button"
          className="mono"
          onClick={() => !connected && setOpen(true)}
          style={{
            border: "1px solid var(--ink)",
            background: connected ? "var(--moss)" : "transparent",
            color: connected ? "var(--paper)" : "var(--ink)",
            padding: "0.35rem 0.75rem",
            cursor: connected ? "default" : "pointer",
          }}
        >
          {connected ? `✓ X connected${handle ? ` (${handle})` : ""}` : "Connect X"}
        </button>
        <span className="mono" style={{ color: "var(--outline)" }}>
          Reddit · soon
        </span>
        <span className="mono" style={{ color: "var(--outline)" }}>
          Discord · soon
        </span>
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(29,28,20,0.4)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
          onClick={() => setOpen(false)}
        >
          <div
            className="kraft-card"
            style={{ maxWidth: 460, width: "90%", background: "var(--paper)", maxHeight: "85vh", overflowY: "auto" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Connect your X account</h3>
            <p style={{ marginTop: "var(--stack-sm)", color: "var(--ink-soft)", fontSize: 14 }}>
              Kami posts and monitors outreach <em>from your account, with your keys</em> — every
              send approved by you first. Grab all four values from{" "}
              <span className="mono">developer.x.com</span> → your app → Keys and tokens (access
              token must be Read and Write). Keys are verified live and stored securely; we never
              display them again.
            </p>
            <hr className="crease" />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-md)" }}>
              {FIELDS.map((f) => (
                <div className="form-line" key={f.key}>
                  <label className="mono label-caps" htmlFor={`x-${f.key}`}>
                    {f.label}
                  </label>
                  <input
                    id={`x-${f.key}`}
                    type="password"
                    autoComplete="off"
                    value={keys[f.key] ?? ""}
                    onChange={(e) => setKeys((k) => ({ ...k, [f.key]: e.target.value }))}
                    disabled={busy}
                  />
                </div>
              ))}
            </div>
            {error && (
              <p className="mono" style={{ color: "var(--hanko)", marginTop: "var(--stack-sm)" }}>
                ⚠ {error}
              </p>
            )}
            <div style={{ marginTop: "var(--stack-md)", display: "flex", gap: "1rem", alignItems: "center" }}>
              <button className="hanko-btn" onClick={connect} disabled={busy || !allFilled}>
                {busy ? "verifying with X…" : "Verify & Connect"}
              </button>
              <button
                type="button"
                className="mono"
                onClick={() => setOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)" }}
              >
                cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
