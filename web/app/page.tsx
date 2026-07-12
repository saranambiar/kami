"use client";

import { useEffect, useRef, useState } from "react";
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

  // Resume the last session from Supabase on mount — no token burn on navigation.
  useEffect(() => {
    const saved = localStorage.getItem("kami_session");
    if (!saved) return;
    const { dbId, hermesId } = JSON.parse(saved) as { dbId: string; hermesId: string };
    if (!dbId) return;
    fetch(`/api/sessions/${dbId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (!data?.session) return;
        sessionRef.current = hermesId;
        dbIdRef.current = dbId;
        setDomain(data.session.domain);
        setEvents(
          (data.activity ?? []).map((a: { phase: string; message: string }) => ({
            phase: a.phase ?? "agent",
            message: a.message,
            at: "",
          })),
        );
        persistedCount.current = (data.activity ?? []).length;
        if (data.brand?.raw_dossier) setDossier(data.brand.raw_dossier as DossierData);
        const statuses: Record<string, OpportunityStatus> = {};
        for (const o of data.opportunities ?? []) statuses[o.title] = o.status;
        setOppStatus(statuses);
        setView("dashboard");
      })
      .catch(() => {});
  }, []);

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

    setEvents([{ phase: "research", message: `linkup: live web scrape of ${params.domain}…`, at: "" }]);

    // Research pre-step (Linkup) runs in parallel with session creation.
    const [dbId, research] = await Promise.all([
      createSession({
        hermesSessionId: sessionRef.current,
        domain: params.domain,
        goals: params.goals,
        stage: params.stage,
      }),
      fetch("/api/research", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ domain: params.domain }),
      })
        .then((r) => r.json())
        .then((j) => (j.facts as string) ?? "")
        .catch(() => ""),
    ]);
    dbIdRef.current = dbId;
    if (dbId) {
      localStorage.setItem(
        "kami_session",
        JSON.stringify({ dbId, hermesId: sessionRef.current }),
      );
    }

    let full = "";
    try {
      full = await streamChat(
        onboardingPrompt({ ...params, researchFacts: research }),
        sessionRef.current,
        (delta) => {
          full += delta;
          syncEvents(full);
        },
      );
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

  interface Deliverable {
    surface: "x" | "email";
    text: string;
    to?: string;
    subject?: string;
  }

  function parseDeliverable(
    text: string,
  ): { deliverable: Deliverable | null; needsInput: string[] | null } {
    const matches = [...text.matchAll(/```json\s*([\s\S]*?)```/g)];
    const last = matches.at(-1)?.[1];
    if (!last) return { deliverable: null, needsInput: null };
    try {
      const parsed = JSON.parse(last);
      if (parsed?.status === "needs_input") {
        return { deliverable: null, needsInput: parsed.missing ?? [] };
      }
      // sendable = complete: X needs text; email additionally needs to + subject
      if (
        parsed?.text &&
        (parsed.surface === "x" || (parsed.surface === "email" && parsed.to && parsed.subject))
      ) {
        return { deliverable: parsed as Deliverable, needsInput: null };
      }
      // deliverable present but incomplete → treat as blocked, not a failed send
      if (parsed?.surface) {
        return { deliverable: null, needsInput: ["complete recipient details"] };
      }
      return { deliverable: null, needsInput: null };
    } catch {
      return { deliverable: null, needsInput: null };
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
      persist(dbIdRef.current, "message", { role: "assistant", content: full });

      const { deliverable, needsInput } = parseDeliverable(full);
      let receipt: Record<string, unknown> = { mode: "dry_run", output: full.slice(0, 4000) };

      if (needsInput) {
        // agents correctly blocked the send — surface what's missing, keep as draft
        setEvents((e) => [
          ...e,
          {
            phase: "result",
            message: `⏸ blocked by the agency's own rules — needs: ${needsInput.join("; ") || "more input"}. Kept as draft.`,
            at: "",
          },
        ]);
        receipt = { mode: "needs_input", missing: needsInput, output: full.slice(0, 4000) };
      } else if (deliverable) {
        const target =
          deliverable.surface === "x"
            ? "post publicly on X from the connected account"
            : `send a real email to ${deliverable.to ?? "the prospect"}`;
        const confirmed = window.confirm(
          `Reviewer approved. This will ${target}:\n\n${deliverable.text.slice(0, 500)}\n\nProceed with the real send?`,
        );

        if (confirmed) {
          const endpoint = deliverable.surface === "x" ? "/api/x/post" : "/api/email/send";
          const res = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              text: deliverable.text,
              to: deliverable.to,
              subject: deliverable.subject,
              sessionDbId: dbIdRef.current,
            }),
          });
          const json = await res.json();
          if (res.ok && json.sent) {
            receipt = { mode: "real", ...json.receipt };
            const proof = json.receipt.url ?? json.receipt.message_id;
            setEvents((e) => [
              ...e,
              { phase: "execute", message: `✓ REAL SEND complete — ${proof}`, at: "" },
            ]);
          } else {
            setEvents((e) => [
              ...e,
              { phase: "execute", message: `⚠ send failed: ${json.error ?? res.status} — logged as draft`, at: "" },
            ]);
            receipt = { mode: "failed_send", error: json.error ?? res.status };
          }
        } else {
          setEvents((e) => [
            ...e,
            { phase: "execute", message: "send cancelled by user — kept as draft", at: "" },
          ]);
          receipt = { mode: "cancelled", output: deliverable.text };
        }
      } else {
        // no parseable deliverable → log the drafting output for the CRM as before
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
      }

      setOppStatus((s) => ({ ...s, [title]: "executed" }));
      persist(dbIdRef.current, "opportunity_status", { title, status: "executed", receipt });
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

  function newCampaign() {
    localStorage.removeItem("kami_session");
    setView("landing");
    setDomain("");
    setEvents([]);
    setDossier(null);
    setOppStatus({});
    dbIdRef.current = null;
    persistedCount.current = 0;
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
    <main className={view === "landing" ? "container" : "container-wide"}>
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
          onNewCampaign={newCampaign}
        />
      )}
    </main>
  );
}
