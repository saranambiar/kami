"use client";

import { useState } from "react";

interface ConnectXProps {
  connected: boolean;
  onConnected: (handle: string) => void;
}

export default function ConnectX({ connected, onConnected }: ConnectXProps) {
  const [open, setOpen] = useState(false);
  const [handle, setHandle] = useState("");
  const [busy, setBusy] = useState(false);

  async function connect() {
    const h = handle.trim().replace(/^@/, "");
    if (!h) return;
    setBusy(true);
    try {
      await fetch("/api/accounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ platform: "x", handle: h }),
      });
      onConnected(h);
      setOpen(false);
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
          {connected ? "✓ X connected" : "Connect X"}
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
            style={{ maxWidth: 420, background: "var(--paper)" }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3>Connect your X account</h3>
            <p style={{ marginTop: "var(--stack-sm)", color: "var(--ink-soft)" }}>
              Kami will use this account to post and conduct outreach on your behalf — every
              action reviewed and approved by you first. Full OAuth verification lands when the
              X app credentials are configured; for now we register the handle.
            </p>
            <hr className="crease" />
            <div className="form-line">
              <label className="mono label-caps" htmlFor="x-handle">
                X HANDLE
              </label>
              <input
                id="x-handle"
                value={handle}
                onChange={(e) => setHandle(e.target.value)}
                placeholder="@yourhandle"
                disabled={busy}
              />
            </div>
            <div style={{ marginTop: "var(--stack-md)", display: "flex", gap: "1rem" }}>
              <button className="hanko-btn" onClick={connect} disabled={busy}>
                {busy ? "…" : "Verify"}
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
