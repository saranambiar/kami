"use client";

import { useRef, useState } from "react";
import Landing, { type LaunchParams } from "@/components/Landing";
import Dashboard from "@/components/Dashboard";
import { parseActivity, type ActivityEvent } from "@/components/ActivityFeed";
import type { OpportunityStatus } from "@/components/ApprovalCard";
import { newSessionId, parseDossier, streamChat, type Dossier as DossierData } from "@/lib/hermes";
import { createSession, persist } from "@/lib/persist";
import { executePrompt, onboardingPrompt } from "@/lib/prompts";

type View = "landing" | "dashboard";

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [domain, setDomain] = useState("");
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [oppStatus, setOppStatus] = useState<Record<string, OpportunityStatus>>({});
  const [executing, setExecuting] = useState(false);
  const [connectedChannels, setConnectedChannels] = useState<string[]>([]);
  const sessionRef = useRef(newSessionId());
  const dbIdRef = useRef<string | null>(null);
  const persistedCount = useRef(0);

  function syncEvents(fullText: string) {
    const parsed = parseActivity(fullText);
    setEvents(parsed);
    // persist only newly seen events
    for (let i = persistedCount.current; i < parsed.length; i++) {
      persist(dbIdRef.current, "activity", { phase: parsed[i].phase, message: parsed[i].message });
    }
    persistedCount.current = parsed.length;
  }

  async function launch(params: LaunchParams) {
    setView("dashboard");
    setDomain(params.domain);
    setRunning(true);
    setEvents([]);
    setDossier(null);
    setOppStatus({});
    persistedCount.current = 0;
    sessionRef.current = newSessionId();

    dbIdRef.current = await createSession({
      hermesSessionId: sessionRef.current,
      domain: params.domain,
      goals: params.goals,
      stage: params.stage,
    });

    let full = "";
    try {
      full = await streamChat(onboardingPrompt(params), sessionRef.current, (delta) => {
        full += delta;
        syncEvents(full);
      });
      const parsed = parseDossier(full);
      setDossier(parsed);
      if (parsed) {
        persist(dbIdRef.current, "dossier", parsed as unknown as Record<string, unknown>);
      } else {
        persist(dbIdRef.current, "status", { status: "failed" });
      }
      persist(dbIdRef.current, "message", { role: "assistant", content: full });
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "request failed";
      setEvents((e) => [...e, { phase: "agent", message: `⚠ ${msg}`, at: "" }]);
      persist(dbIdRef.current, "status", { status: "failed" });
    } finally {
      setRunning(false);
    }
  }

  async function approve(title: string, playbook: string) {
    setExecuting(true);
    setOppStatus((s) => ({ ...s, [title]: "approved" }));
    persist(dbIdRef.current, "opportunity_status", { title, status: "approved" });
    setRunning(true);
    let full = "";
    try {
      full = await streamChat(executePrompt(title, playbook), sessionRef.current, (delta) => {
        full += delta;
        syncEvents(full);
      });
      setOppStatus((s) => ({ ...s, [title]: "executed" }));
      persist(dbIdRef.current, "opportunity_status", {
        title,
        status: "executed",
        receipt: { mode: "dry_run", output: full.slice(0, 4000) },
      });
      persist(dbIdRef.current, "message", { role: "assistant", content: full });
      // CRM: log the executed outreach (dry run receipt until real surfaces are wired)
      void fetch("/api/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          surface: playbook === "content_post" ? "x" : "email",
          draft: full.slice(0, 4000),
          status: "drafted",
          receipt: { mode: "dry_run", opportunity: title },
          sessionDbId: dbIdRef.current,
        }),
      }).catch(() => {});
    } catch (error: unknown) {
      const msg = error instanceof Error ? error.message : "request failed";
      setEvents((e) => [...e, { phase: "execute", message: `⚠ ${msg}`, at: "" }]);
      setOppStatus((s) => ({ ...s, [title]: "proposed" }));
    } finally {
      setExecuting(false);
      setRunning(false);
    }
  }

  function dismiss(title: string) {
    setOppStatus((s) => ({ ...s, [title]: "dismissed" }));
    persist(dbIdRef.current, "opportunity_status", { title, status: "dismissed" });
  }

  async function connectChannel(platform: string) {
    setConnectedChannels((c) => (c.includes(platform) ? c : [...c, platform]));
    void fetch("/api/accounts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ platform }),
    }).catch(() => {});
  }

  return (
    <main className="container">
      {view === "landing" ? (
        <Landing onLaunch={launch} busy={running} />
      ) : (
        <Dashboard
          domain={domain}
          events={events}
          running={running}
          dossier={dossier}
          oppStatus={oppStatus}
          executing={executing}
          sessionId={sessionRef.current}
          connectedChannels={connectedChannels}
          onConnect={connectChannel}
          onApprove={approve}
          onDismiss={dismiss}
        />
      )}
    </main>
  );
}
