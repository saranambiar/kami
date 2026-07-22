"use client";

import { useEffect, useRef, useState } from "react";
import Landing, { type LaunchParams } from "@/components/Landing";
import Dashboard from "@/components/Dashboard";
import { parseActivity, type ActivityEvent } from "@/components/ActivityFeed";
import type { OpportunityStatus } from "@/components/ApprovalCard";
import { newSessionId, parseDossierRaw, streamChat, type Dossier as DossierData } from "@/lib/hermes";
import { createSession, persist } from "@/lib/persist";
import { executePrompt, onboardingPrompt } from "@/lib/prompts";
import { validateDossier } from "@/lib/dossierValidation";
import type { DomainIdentity } from "@/lib/domainIdentity";
import type { ResearchSnapshot } from "@/lib/linkup";
import type { MarketingConfig } from "@/lib/marketingTypes";
import type { SalesCampaignConfig } from "@/lib/salesTypes";

type View = "landing" | "dashboard";

interface ResumePrompt {
  domain: string;
  dbId: string;
  hermesId: string;
}

export default function Home() {
  const [view, setView] = useState<View>("landing");
  const [domain, setDomain] = useState("");
  const [running, setRunning] = useState(false);
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [dossier, setDossier] = useState<DossierData | null>(null);
  const [oppStatus, setOppStatus] = useState<Record<string, OpportunityStatus>>({});
  const [executing, setExecuting] = useState(false);
  const [connectedChannels, setConnectedChannels] = useState<string[]>([]);
  const [marketingConfig, setMarketingConfig] = useState<MarketingConfig | null>(null);
  const [salesConfig, setSalesConfig] = useState<SalesCampaignConfig | null>(null);
  const [launchError, setLaunchError] = useState<string | null>(null);
  const [resumePrompt, setResumePrompt] = useState<ResumePrompt | null>(null);
  const [identityMeta, setIdentityMeta] = useState<{
    company?: string | null;
    confidence?: number;
    evidenceCount?: number;
  } | null>(null);
  const sessionRef = useRef(newSessionId());
  const dbIdRef = useRef<string | null>(null);
  const persistedCount = useRef(0);
  const goalsRef = useRef<string[]>([]);
  const stageRef = useRef<string | null>(null);

  useEffect(() => {
    const saved = localStorage.getItem("kami_session");
    if (!saved) return;
    try {
      const { dbId, hermesId } = JSON.parse(saved) as { dbId: string; hermesId: string };
      if (!dbId) return;
      fetch(`/api/sessions/${dbId}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((data) => {
          if (!data?.session) return;
          setResumePrompt({
            domain: data.session.domain,
            dbId,
            hermesId: hermesId || data.session.hermes_session_id,
          });
        })
        .catch(() => {});
    } catch {
      /* ignore */
    }
  }, []);

  async function loadSession(dbId: string, hermesId: string) {
    const data = await fetch(`/api/sessions/${dbId}`).then((r) => (r.ok ? r.json() : null));
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
    const check = data.session.domain_check;
    if (check?.company_name || check?.confidence) {
      setIdentityMeta({
        company: check.company_name,
        confidence: check.confidence,
        evidenceCount: data.session.research_snapshot?.sources?.length,
      });
    }
    fetch(`/api/marketing/setup?session_id=${dbId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((mc) => {
        if (mc?.config) setMarketingConfig(mc.config as MarketingConfig);
      })
      .catch(() => {});
    fetch(`/api/sales/setup?session_id=${dbId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((sc) => {
        if (sc?.config) setSalesConfig(sc.config as SalesCampaignConfig);
      })
      .catch(() => {});
    setView("dashboard");
    setResumePrompt(null);
  }

  function syncEvents(fullText: string) {
    const parsed = parseActivity(fullText);
    setEvents(parsed);
    for (let i = persistedCount.current; i < parsed.length; i++) {
      persist(dbIdRef.current, "activity", { phase: parsed[i].phase, message: parsed[i].message });
    }
    persistedCount.current = parsed.length;
  }

  async function launch(params: LaunchParams) {
    setLaunchError(null);
    setRunning(true);
    goalsRef.current = params.goals;
    stageRef.current = params.stage;

    // 1) Validate exact domain BEFORE session / Hermes
    const validateRes = await fetch("/api/domain/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: params.domain }),
    });
    const validateJson = await validateRes.json();
    if (!validateJson.ok || !validateJson.identity) {
      setLaunchError(validateJson.reason ?? "Domain not found");
      setRunning(false);
      setView("landing");
      return;
    }

    const identity = validateJson.identity as DomainIdentity;
    setDomain(identity.canonical_domain);
    setView("dashboard");
    setEvents([]);
    setDossier(null);
    setOppStatus({});
    persistedCount.current = 0;
    sessionRef.current = newSessionId();
    setIdentityMeta({
      company: identity.company_name,
      confidence: identity.confidence,
      evidenceCount: 1,
    });

    setEvents([
      {
        phase: "research",
        message: `validated ${identity.canonical_domain} · ${identity.company_name ?? "company"} · extracting first-party evidence…`,
        at: "",
      },
    ]);

    // 2) Research + session create
    const researchRes = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ identity }),
    });
    const researchJson = await researchRes.json();
    if (!researchJson.ok || !researchJson.snapshot) {
      setEvents((e) => [
        ...e,
        {
          phase: "agent",
          message: `⚠ ${researchJson.reason ?? "Research failed"} — fix the domain or retry.`,
          at: "",
        },
      ]);
      setLaunchError(researchJson.reason ?? "Research failed");
      setRunning(false);
      return;
    }

    const snapshot = researchJson.snapshot as ResearchSnapshot;
    setIdentityMeta({
      company: identity.company_name,
      confidence: identity.confidence,
      evidenceCount: snapshot.sources?.length ?? 1,
    });

    const dbId = await createSession({
      hermesSessionId: sessionRef.current,
      domain: identity.canonical_domain,
      goals: params.goals,
      stage: params.stage,
      canonical_domain: identity.canonical_domain,
      domain_validated_at: identity.validated_at,
      domain_check: identity as unknown as Record<string, unknown>,
      research_snapshot: snapshot as unknown as Record<string, unknown>,
    });
    dbIdRef.current = dbId;
    if (dbId) {
      localStorage.setItem(
        "kami_session",
        JSON.stringify({ dbId, hermesId: sessionRef.current }),
      );
    }

    setEvents((e) => [
      ...e,
      {
        phase: "research",
        message: `research ready · ${snapshot.sources.length} sources (${snapshot.sources.filter((s) => s.source_class === "first_party").length} first-party)`,
        at: "",
      },
    ]);

    let full = "";
    try {
      full = await streamChat(
        onboardingPrompt({
          domain: identity.canonical_domain,
          goals: params.goals,
          stage: params.stage,
          identity,
          researchSnapshot: snapshot,
        }),
        sessionRef.current,
        (delta) => {
          full += delta;
          syncEvents(full);
        },
      );

      const raw = parseDossierRaw(full);
      const validated = validateDossier(raw, identity);
      if (validated.ok && validated.dossier) {
        setDossier(validated.dossier);
        persist(dbIdRef.current, "dossier", validated.dossier as unknown as Record<string, unknown>);
      } else {
        setDossier(null);
        persist(dbIdRef.current, "status", { status: "failed" });
        setEvents((e) => [
          ...e,
          {
            phase: "agent",
            message: `⚠ dossier rejected — ${validated.errors.slice(0, 3).join("; ") || "invalid"}. Retry research.`,
            at: "",
          },
        ]);
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
      if (
        parsed?.text &&
        (parsed.surface === "x" || (parsed.surface === "email" && parsed.to && parsed.subject))
      ) {
        return { deliverable: parsed as Deliverable, needsInput: null };
      }
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
              {
                phase: "execute",
                message: `⚠ send failed: ${json.error ?? res.status} — logged as draft`,
                at: "",
              },
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
    setMarketingConfig(null);
    setSalesConfig(null);
    setIdentityMeta(null);
    setLaunchError(null);
    setResumePrompt(null);
    dbIdRef.current = null;
    persistedCount.current = 0;
    sessionRef.current = newSessionId();
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
        <Landing
          onLaunch={launch}
          busy={running}
          error={launchError}
          resumePrompt={resumePrompt}
          onResume={() => resumePrompt && loadSession(resumePrompt.dbId, resumePrompt.hermesId)}
          onDismissResume={() => {
            localStorage.removeItem("kami_session");
            setResumePrompt(null);
          }}
        />
      ) : (
        <Dashboard
          domain={domain}
          events={events}
          running={running}
          dossier={dossier}
          oppStatus={oppStatus}
          executing={executing}
          sessionId={sessionRef.current}
          sessionDbId={dbIdRef.current}
          connectedChannels={connectedChannels}
          marketingConfig={marketingConfig}
          salesConfig={salesConfig}
          identityMeta={identityMeta}
          sessionGoals={goalsRef.current}
          onConnect={connectChannel}
          onApprove={approve}
          onDismiss={dismiss}
          onNewCampaign={newCampaign}
          onMarketingSetup={setMarketingConfig}
          onSalesSetup={setSalesConfig}
        />
      )}
    </main>
  );
}
