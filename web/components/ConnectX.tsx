"use client";

import { useEffect, useState } from "react";

// One-click "Log in with X" (OAuth 2.0 + PKCE). No key pasting —
// the user authorizes Kami on x.com and we act with their token.

export default function ConnectX() {
  const [handle, setHandle] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // returning from the OAuth callback?
    const params = new URLSearchParams(window.location.search);
    if (params.get("x_connect") === "ok") {
      setHandle(params.get("handle"));
      window.history.replaceState({}, "", "/");
      return;
    }
    if (params.get("x_connect") === "error") {
      setError(params.get("reason") ?? "connection failed");
      window.history.replaceState({}, "", "/");
    }
    // otherwise load current status
    fetch("/api/accounts")
      .then((r) => r.json())
      .then((json) => {
        const x = (json.accounts ?? []).find(
          (a: { platform: string; status: string }) => a.platform === "x" && a.status === "connected",
        );
        if (x) setHandle(x.handle);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "0.4rem",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap", justifyContent: "center" }}>
        <span className="label-caps">Outreach accounts:</span>
        {handle ? (
          <span
            className="mono"
            style={{
              border: "1px solid var(--ink)",
              background: "var(--moss)",
              color: "var(--paper)",
              padding: "0.35rem 0.75rem",
            }}
          >
            ✓ X connected ({handle})
          </span>
        ) : (
          <a
            href="/api/auth/x/login"
            className="mono"
            style={{
              border: "1px solid var(--ink)",
              padding: "0.35rem 0.75rem",
              color: "var(--ink)",
            }}
          >
            𝕏 Log in with X
          </a>
        )}
        <span className="mono" style={{ color: "var(--outline)" }}>
          Reddit · soon
        </span>
        <span className="mono" style={{ color: "var(--outline)" }}>
          Discord · soon
        </span>
      </div>
      {error && (
        <p className="mono" style={{ color: "var(--hanko)" }}>
          ⚠ {error}
        </p>
      )}
    </div>
  );
}
