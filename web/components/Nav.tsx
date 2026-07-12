"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { supabaseBrowser, signInWithGoogle, signOut } from "@/lib/supabaseBrowser";

export default function Nav() {
  const router = useRouter();
  const pathname = usePathname();
  const [email, setEmail] = useState<string | null>(null);
  const [authEnabled, setAuthEnabled] = useState(false);

  useEffect(() => {
    const sb = supabaseBrowser();
    if (!sb) return;
    setAuthEnabled(true);
    sb.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
    const { data: sub } = sb.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  return (
    <nav
      style={{
        borderBottom: "1px solid var(--crease)",
        padding: "0.75rem var(--margin-page)",
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
        <a href="/" style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
          <Image
            src="/kami-logo.png"
            alt="Kami"
            width={32}
            height={32}
            style={{ objectFit: "contain" }}
            priority
          />
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

      <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }} className="label-caps">
        <a href="/board">Board</a>
        <a href="/ledger">Ledger</a>
        <a href="/crm">CRM</a>
        {authEnabled &&
          (email ? (
            <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
              <span className="mono" style={{ textTransform: "none", color: "var(--ink-soft)" }}>
                {email}
              </span>
              <button
                type="button"
                onClick={() => signOut()}
                className="mono"
                style={{
                  border: "1px solid var(--ink)",
                  background: "transparent",
                  padding: "0.25rem 0.6rem",
                  cursor: "pointer",
                  color: "var(--ink)",
                  textTransform: "none",
                }}
              >
                log out
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => signInWithGoogle()}
              className="mono"
              style={{
                border: "1px solid var(--ink)",
                background: "transparent",
                padding: "0.25rem 0.6rem",
                cursor: "pointer",
                color: "var(--ink)",
                textTransform: "none",
              }}
            >
              log in
            </button>
          ))}
      </div>
    </nav>
  );
}
