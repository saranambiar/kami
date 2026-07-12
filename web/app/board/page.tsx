"use client";

import { useEffect, useState } from "react";

interface BoardTask {
  id: string;
  title: string;
  status: "ready" | "running" | "blocked" | "done";
  meta: string;
  source: "hermes" | "kami";
}

const COLUMNS: { key: BoardTask["status"]; label: string; color: string }[] = [
  { key: "ready", label: "Ready", color: "var(--outline)" },
  { key: "running", label: "Running", color: "var(--hanko)" },
  { key: "blocked", label: "Blocked", color: "var(--ink)" },
  { key: "done", label: "Done", color: "var(--moss)" },
];

export default function BoardPage() {
  const [tasks, setTasks] = useState<BoardTask[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let alive = true;
    async function load() {
      try {
        const res = await fetch("/api/kanban");
        const json = await res.json();
        if (alive) setTasks(json.tasks ?? []);
      } catch {
        /* board stays empty */
      } finally {
        if (alive) setLoaded(true);
      }
    }
    load();
    const t = setInterval(load, 10_000); // live-ish refresh
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  return (
    <main className="container-wide" style={{ paddingBottom: "var(--stack-lg)" }}>
      <div style={{ paddingTop: "var(--stack-md)" }}>
        <h2>
          Task Board <span style={{ color: "var(--hanko)" }}>· agency work in flight</span>
        </h2>
        <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "0.25rem" }}>
          hermes kanban + kami opportunities · refreshes every 10s
        </p>
      </div>
      <hr className="crease" />

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "var(--stack-md)",
        }}
      >
        {COLUMNS.map((col) => {
          const items = tasks.filter((t) => t.status === col.key);
          return (
            <div key={col.key}>
              <p
                className="label-caps"
                style={{ borderBottom: `3px solid ${col.color}`, paddingBottom: "0.4rem" }}
              >
                {col.label} <span style={{ color: col.color }}>({items.length})</span>
              </p>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--stack-sm)",
                  marginTop: "var(--stack-sm)",
                }}
              >
                {items.map((t) => (
                  <div className="kraft-card" key={t.id} style={{ padding: "0.75rem" }}>
                    <p style={{ fontSize: 14, fontWeight: 700 }}>{t.title}</p>
                    <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "0.3rem" }}>
                      {t.source === "hermes" ? "⚙ hermes" : "紙 kami"}
                      {t.meta ? ` · ${t.meta}` : ""}
                    </p>
                  </div>
                ))}
                {loaded && items.length === 0 && (
                  <p className="mono" style={{ color: "var(--outline)" }}>
                    — empty —
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}
