"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { Dossier } from "@/lib/hermes";
import type { SalesCampaignConfig, SalesPlan } from "@/lib/salesTypes";
import SalesSetup from "@/components/SalesSetup";
import SalesPlanView from "@/components/SalesPlanView";
import SalesDraftQueue from "@/components/SalesDraftQueue";
import SalesTargetReview from "@/components/SalesTargetReview";
import SalesNeedsYou from "@/components/SalesNeedsYou";
import SalesPipeline from "@/components/SalesPipeline";
import SalesInbox from "@/components/SalesInbox";
import MeetingQueue from "@/components/MeetingQueue";
import SalesTaskBoard from "@/components/SalesTaskBoard";
import KillSwitch from "@/components/KillSwitch";

/** Steps shown after setup is complete (Confirm is full-screen SalesSetup only). */
export type SalesGuidedStep = "confirm" | "plan" | "find" | "emails" | "needs";

type OpsStep = "plan" | "find" | "emails" | "needs";

const OPS_STEPS: { key: OpsStep; label: string }[] = [
  { key: "plan", label: "Plan" },
  { key: "find", label: "Find" },
  { key: "emails", label: "Emails" },
  { key: "needs", label: "Needs you" },
];

interface SalesPanelProps {
  sessionDbId: string | null;
  config: SalesCampaignConfig | null;
  dossier: Dossier | null;
  domain: string;
  focusStep?: SalesGuidedStep | null;
  onSetup: (config: SalesCampaignConfig) => void;
}

function defaultOpsStep(plan: SalesPlan | null): OpsStep {
  if (!plan || plan.status !== "approved") return "plan";
  return "find";
}

export default function SalesPanel({
  sessionDbId,
  config,
  dossier,
  domain,
  focusStep,
  onSetup,
}: SalesPanelProps) {
  const [plan, setPlan] = useState<SalesPlan | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [paused, setPaused] = useState(config?.autonomous_paused ?? false);
  const [pauseSaving, setPauseSaving] = useState(false);
  const [step, setStep] = useState<OpsStep>("plan");
  const [showMore, setShowMore] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [sequencesCreated, setSequencesCreated] = useState(false);

  const fetchPlan = useCallback(() => {
    if (!sessionDbId) return;
    fetch(`/api/sales/plan?session_id=${sessionDbId}`)
      .then((r) => r.json())
      .then((j) => {
        const p = j.plan ?? null;
        setPlan(p);
        setStep((prev) => {
          if (p?.status === "approved" && prev === "plan") return "find";
          return prev;
        });
      })
      .catch(() => {});
  }, [sessionDbId]);

  useEffect(() => {
    setPaused(config?.autonomous_paused ?? false);
  }, [config?.autonomous_paused]);

  useEffect(() => {
    if (config) fetchPlan();
  }, [config, fetchPlan]);

  useEffect(() => {
    if (!focusStep || focusStep === "confirm") return;
    setStep(focusStep);
  }, [focusStep]);

  useEffect(() => {
    if (config && !focusStep) {
      setStep(defaultOpsStep(plan));
    }
    // Only re-default when config first appears or plan status flips to approved from null
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [config?.session_id, plan?.status]);

  const planApproved = plan?.status === "approved";

  const stepDone = useMemo(
    () => ({
      plan: planApproved,
      find: sequencesCreated,
      emails: hasSent,
      needs: hasSent,
    }),
    [planApproved, sequencesCreated, hasSent],
  );

  function canVisit(key: OpsStep): boolean {
    if (key === "plan") return true;
    if (key === "find") return planApproved;
    if (key === "emails") return planApproved && sequencesCreated;
    if (key === "needs") return planApproved && (sequencesCreated || hasSent);
    return false;
  }

  async function handlePauseChange(nextPaused: boolean) {
    if (!sessionDbId) return;
    setPaused(nextPaused);
    setPauseSaving(true);
    try {
      const res = await fetch("/api/sales/setup", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session_id: sessionDbId, autonomous_paused: nextPaused }),
      });
      const json = await res.json();
      if (res.ok && json.config && config) {
        onSetup({ ...config, autonomous_paused: json.config.autonomous_paused });
      }
    } catch {
      setPaused(!nextPaused);
    } finally {
      setPauseSaving(false);
    }
  }

  if (!config || showSettings) {
    return (
      <SalesSetup
        sessionDbId={sessionDbId}
        dossier={dossier}
        domain={domain}
        existingConfig={showSettings ? config : null}
        onComplete={(c, planGenerated) => {
          onSetup(c);
          setShowSettings(false);
          setStep("plan");
          if (planGenerated) fetchPlan();
        }}
      />
    );
  }

  return (
    <div className="sales-panel">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        <p className="label-caps">Outbound sales</p>
        <div style={{ display: "flex", gap: "var(--stack-sm)", alignItems: "center" }}>
          <button
            type="button"
            className="mono"
            onClick={() => setShowSettings(true)}
            style={{ border: "1px solid var(--ink)", background: "transparent", padding: "0.3rem 0.6rem", cursor: "pointer", fontSize: 12 }}
            title="Edit who and what"
          >
            ⚙
          </button>
          <KillSwitch paused={paused} onChange={handlePauseChange} disabled={pauseSaving || !sessionDbId} />
        </div>
      </div>
      <hr className="crease" />

      <nav className="sales-stepper" aria-label="Sales progress">
        {OPS_STEPS.map((s) => {
          const done = stepDone[s.key];
          const active = step === s.key;
          const unlocked = canVisit(s.key);
          return (
            <button
              key={s.key}
              type="button"
              className="sales-step"
              data-active={active}
              data-done={done && !active}
              onClick={() => unlocked && setStep(s.key)}
              disabled={!unlocked}
            >
              {done && !active ? "✓ " : ""}
              {s.label}
            </button>
          );
        })}
      </nav>

      {step === "plan" && (
        <SalesPlanView
          sessionDbId={sessionDbId}
          plan={plan}
          offer={config.offer}
          onApproved={(p) => {
            setPlan(p);
            setStep("find");
          }}
          onRevised={setPlan}
        />
      )}

      {step === "find" && planApproved && (
        <SalesTargetReview
          sessionDbId={sessionDbId}
          plan={plan}
          offer={config.offer}
          paused={paused}
          onContinue={() => {
            setSequencesCreated(true);
            setStep("emails");
          }}
        />
      )}

      {step === "emails" && planApproved && (
        <SalesDraftQueue
          sessionDbId={sessionDbId}
          paused={paused}
          onSent={() => {
            setHasSent(true);
            setStep("needs");
          }}
        />
      )}

      {step === "needs" && planApproved && <SalesNeedsYou sessionDbId={sessionDbId} />}

      {planApproved && (hasSent || showMore) && (
        <div style={{ marginTop: "var(--stack-lg)" }}>
          <button
            type="button"
            className="mono"
            onClick={() => setShowMore(!showMore)}
            style={{ border: "1px solid var(--outline)", background: "transparent", padding: "0.35rem 0.65rem", cursor: "pointer", fontSize: 11, marginBottom: "var(--stack-sm)" }}
          >
            {showMore ? "Hide More" : "More — Pipeline, Inbox, Meetings, Tasks"}
          </button>
          {showMore && (
            <>
              <SalesPipeline sessionDbId={sessionDbId} />
              <SalesInbox sessionDbId={sessionDbId} />
              <MeetingQueue sessionDbId={sessionDbId} />
              <SalesTaskBoard sessionDbId={sessionDbId} />
            </>
          )}
        </div>
      )}
    </div>
  );
}
