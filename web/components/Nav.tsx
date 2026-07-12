"use client";

import { usePathname, useRouter } from "next/navigation";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--crease)",
        padding: "1rem var(--margin-page)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        maxWidth: 1440,
        margin: "0 auto",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        {pathname !== "/" && (
          <button
            type="button"
            onClick={() => router.back()}
            aria-label="Go back"
            className="mono"
            style={{
              border: "1px solid var(--ink)",
              background: "transparent",
              padding: "0.3rem 0.7rem",
              cursor: "pointer",
              color: "var(--ink)",
            }}
          >
            ← back
          </button>
        )}
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          {/* placeholder seal logo */}
          <span
            aria-hidden
            style={{
              width: 28,
              height: 28,
              background: "var(--hanko)",
              display: "inline-flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--paper)",
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: 14,
            }}
          >
            紙
          </span>
          <span
            style={{
              fontFamily: "var(--font-headline)",
              fontWeight: 700,
              fontSize: 20,
              letterSpacing: "0.02em",
            }}
          >
            KAMI
          </span>
        </a>
      </div>
      <div style={{ display: "flex", gap: "1.5rem" }} className="label-caps">
        <a href="/board">Board</a>
        <a href="/ledger">Ledger</a>
        <a href="/crm">CRM</a>
      </div>
    </nav>
  );
}
