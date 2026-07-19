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

export type SalesGuidedStep = "confirm" | "plan" | "find" | "emails" | "needs";

const STEPS: { key: SalesGuidedStep; label: string }[] = [
  { key: "confirm", label: "Confirm" },
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

function defaultStep(config: SalesCampaignConfig | null, plan: SalesPlan | null): SalesGuidedStep {
  if (!config) return "confirm";
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
  const [step, setStep] = useState<SalesGuidedStep>(() => focusStep ?? defaultStep(config, null));
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
        if (p?.status === "approved" && step === "plan") setStep("find");
      })
      .catch(() => {});
  }, [sessionDbId, step]);

  useEffect(() => {
    setPaused(config?.autonomous_paused ?? false);
  }, [config?.autonomous_paused]);

  useEffect(() => {
    if (config) fetchPlan();
  }, [config, fetchPlan]);

  useEffect(() => {
    if (focusStep) setStep(focusStep);
  }, [focusStep]);

  const stepIndex = STEPS.findIndex((s) => s.key === step);
  const planApproved = plan?.status === "approved";

  const unlockedThrough = useMemo(() => {
    if (!config) return 0;
    if (!planApproved) return 1;
    if (!sequencesCreated && step !== "emails" && step !== "needs") return 2;
    if (!hasSent && step !== "needs") return 3;
    return 4;
  }, [config, planApproved, sequencesCreated, hasSent, step]);

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

  function goToStep(key: SalesGuidedStep, idx: number) {
    if (idx <= unlockedThrough || (planApproved && key !== "confirm")) {
      setStep(key);
    }
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
            title="Settings"
          >
            ⚙
          </button>
          <KillSwitch paused={paused} onChange={handlePauseChange} disabled={pauseSaving || !sessionDbId} />
        </div>
      </div>
      <hr className="crease" />

      <nav className="sales-stepper" aria-label="Sales progress">
        {STEPS.map((s, idx) => (
          <button
            key={s.key}
            type="button"
            className="sales-step"
            data-active={step === s.key}
            data-done={idx < stepIndex}
            onClick={() => goToStep(s.key, idx)}
            disabled={idx > unlockedThrough && s.key !== "confirm"}
          >
            {idx < stepIndex ? "✓ " : ""}
            {s.label}
          </button>
        ))}
      </nav>

      {step === "plan" && (
        <SalesPlanView
          sessionDbId={sessionDbId}
          plan={plan}
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
