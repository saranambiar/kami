"use client";

import { useEffect, useMemo, useState } from "react";
import type { Dossier } from "@/lib/hermes";
import {
  configToNlPrefill,
  dossierToNlPrefill,
  nlPrefillToConfig,
  salesWhoLabel,
  type SalesNlPrefill,
} from "@/lib/salesDossierPrefill";
import type { SalesCampaignConfig, SalesChannel } from "@/lib/salesTypes";

interface SalesSetupProps {
  sessionDbId: string | null;
  dossier: Dossier | null;
  domain: string;
  existingConfig?: SalesCampaignConfig | null;
  goals?: string[];
  onComplete: (config: SalesCampaignConfig, planGenerated: boolean) => void;
}

const QTY_OPTIONS = [10, 15, 25] as const;

export default function SalesSetup({
  sessionDbId,
  dossier,
  domain,
  existingConfig,
  goals,
  onComplete,
}: SalesSetupProps) {
  const initial = useMemo(
    () =>
      existingConfig
        ? configToNlPrefill(existingConfig)
        : dossierToNlPrefill(dossier, domain, null, goals),
    [existingConfig, dossier, domain, goals],
  );

  const [whoSentence, setWhoSentence] = useState(initial.whoSentence);
  const [whatSentence, setWhatSentence] = useState(initial.whatSentence);
  const [targetQty, setTargetQty] = useState(initial.targetQty);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [icpTitles, setIcpTitles] = useState(initial.icpTitles);
  const [icpIndustries, setIcpIndustries] = useState(initial.icpIndustries);
  const [geo, setGeo] = useState(initial.geo);
  const [exclusions, setExclusions] = useState("");
  const [dealMin, setDealMin] = useState("");
  const [dealMax, setDealMax] = useState("");
  const [dailyCap, setDailyCap] = useState(existingConfig?.daily_send_cap ?? 35);
  const [senderName, setSenderName] = useState(existingConfig?.sender_identity?.name ?? "");
  const [senderEmail, setSenderEmail] = useState(existingConfig?.sender_identity?.email ?? "");
  const [autoFollowups, setAutoFollowups] = useState(existingConfig?.autonomy?.auto_followups ?? true);
  const [requireFirstSendApproval, setRequireFirstSendApproval] = useState(
    existingConfig?.autonomy?.require_first_send_approval ?? true,
  );
  const [channels] = useState<SalesChannel[]>(existingConfig?.allowed_channels ?? ["email"]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setWhoSentence(initial.whoSentence);
    setWhatSentence(initial.whatSentence);
    setTargetQty(initial.targetQty);
    setIcpTitles(initial.icpTitles);
    setIcpIndustries(initial.icpIndustries);
    setGeo(initial.geo);
  }, [initial]);

  async function submit() {
    if (!sessionDbId || !whatSentence.trim()) return;
    setSaving(true);

    const prefill: SalesNlPrefill = {
      whoSentence,
      whatSentence,
      targetQty,
      icpTitles,
      icpIndustries,
      geo,
      offer: whatSentence.slice(0, 280),
      positioningLine: whatSentence.slice(0, 140),
    };

    const payload = nlPrefillToConfig(sessionDbId, prefill, {
      exclusions,
      dealMin,
      dealMax,
      dailyCap,
      senderName,
      senderEmail,
      autoFollowups,
      requireFirstSendApproval,
      channels,
    });

    try {
      const res = await fetch("/api/sales/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      const config = (json.config ?? payload) as SalesCampaignConfig;

      // Plan is generated after ICP segments are confirmed (failsafe).
      onComplete(config, false);
    } catch {
      onComplete(payload, false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="sales-panel" style={{ paddingTop: "var(--stack-md)" }}>
      <h3 style={{ marginBottom: "var(--stack-sm)" }}>Confirm who and what</h3>
      <p className="sales-intro">
        We filled this from your company research. Edit anything that looks wrong, then confirm your ICP segments.
      </p>

      {!sessionDbId && (
        <p className="mono" style={{ color: "var(--hanko)", marginBottom: "var(--stack-md)" }}>
          Waiting for session — launch a campaign first.
        </p>
      )}

      <div className="form-line" style={{ marginBottom: "var(--stack-md)" }}>
        <label className="mono label-caps" htmlFor="who-sentence">
          {salesWhoLabel(goals)}
        </label>
        <textarea
          id="who-sentence"
          className="sales-textarea"
          value={whoSentence}
          onChange={(e) => setWhoSentence(e.target.value)}
        />
      </div>

      <div className="form-line" style={{ marginBottom: "var(--stack-md)" }}>
        <label className="mono label-caps" htmlFor="what-sentence">
          What should we say you help with?
        </label>
        <textarea
          id="what-sentence"
          className="sales-textarea"
          value={whatSentence}
          onChange={(e) => setWhatSentence(e.target.value)}
        />
      </div>

      <div className="form-line" style={{ marginBottom: "var(--stack-md)" }}>
        <label className="mono label-caps">How many companies should we research first?</label>
        <div className="sales-qty-chips">
          {QTY_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              className="sales-qty-chip"
              data-active={targetQty === n}
              onClick={() => setTargetQty(n)}
            >
              {n}
            </button>
          ))}
        </div>
      </div>

      <button
        type="button"
        className="mono"
        onClick={() => setShowDetails(!showDetails)}
        style={{
          border: "none",
          background: "none",
          padding: 0,
          cursor: "pointer",
          textDecoration: "underline",
          fontSize: 12,
          marginBottom: "var(--stack-md)",
        }}
      >
        {showDetails ? "Hide details" : "Edit details"}
      </button>

      {showDetails && (
        <div style={{ display: "flex", gap: "var(--stack-md)", flexWrap: "wrap", marginBottom: "var(--stack-md)" }}>
          <div className="form-line" style={{ flex: 1, minWidth: 180 }}>
            <label className="mono label-caps" htmlFor="icp-titles">Titles</label>
            <input id="icp-titles" value={icpTitles} onChange={(e) => setIcpTitles(e.target.value)} />
          </div>
          <div className="form-line" style={{ flex: 1, minWidth: 180 }}>
            <label className="mono label-caps" htmlFor="icp-industries">Industries</label>
            <input id="icp-industries" value={icpIndustries} onChange={(e) => setIcpIndustries(e.target.value)} />
          </div>
          <div className="form-line" style={{ flex: 1, minWidth: 120 }}>
            <label className="mono label-caps" htmlFor="geo">Geography</label>
            <input id="geo" value={geo} onChange={(e) => setGeo(e.target.value)} placeholder="US, UK" />
          </div>
        </div>
      )}

      <details className="sales-disclosure" style={{ marginBottom: "var(--stack-lg)" }}>
        <summary>Advanced</summary>
        <div style={{ paddingTop: "var(--stack-sm)" }}>
          <div className="form-line" style={{ marginBottom: "var(--stack-sm)" }}>
            <label className="mono label-caps" htmlFor="exclusions">Exclusions (one per line)</label>
            <textarea id="exclusions" className="sales-textarea" rows={2} value={exclusions} onChange={(e) => setExclusions(e.target.value)} />
          </div>
          <div style={{ display: "flex", gap: "var(--stack-md)", flexWrap: "wrap", marginBottom: "var(--stack-sm)" }}>
            <div className="form-line" style={{ flex: 1, minWidth: 100 }}>
              <label className="mono label-caps" htmlFor="deal-min">Deal min ($)</label>
              <input id="deal-min" type="number" value={dealMin} onChange={(e) => setDealMin(e.target.value)} />
            </div>
            <div className="form-line" style={{ flex: 1, minWidth: 100 }}>
              <label className="mono label-caps" htmlFor="deal-max">Deal max ($)</label>
              <input id="deal-max" type="number" value={dealMax} onChange={(e) => setDealMax(e.target.value)} />
            </div>
            <div className="form-line" style={{ flex: 1, minWidth: 100 }}>
              <label className="mono label-caps" htmlFor="daily-cap">Daily send cap</label>
              <input id="daily-cap" type="number" min={1} value={dailyCap} onChange={(e) => setDailyCap(Number(e.target.value))} />
            </div>
          </div>
          <div style={{ display: "flex", gap: "var(--stack-md)", marginBottom: "var(--stack-sm)" }}>
            <div className="form-line" style={{ flex: 1 }}>
              <label className="mono label-caps" htmlFor="sender-name">Sender name</label>
              <input id="sender-name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
            </div>
            <div className="form-line" style={{ flex: 1 }}>
              <label className="mono label-caps" htmlFor="sender-email">Sender email</label>
              <input id="sender-email" type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <button
              type="button"
              className="mono"
              onClick={() => setAutoFollowups(!autoFollowups)}
              style={{ background: autoFollowups ? "var(--kraft)" : "transparent", border: "1px solid var(--ink)", padding: "0.4rem 0.75rem", cursor: "pointer", textAlign: "left" }}
            >
              {autoFollowups ? "✓" : "·"} Auto follow-ups
            </button>
            <button
              type="button"
              className="mono"
              onClick={() => setRequireFirstSendApproval(!requireFirstSendApproval)}
              style={{ background: requireFirstSendApproval ? "var(--kraft)" : "transparent", border: "1px solid var(--ink)", padding: "0.4rem 0.75rem", cursor: "pointer", textAlign: "left" }}
            >
              {requireFirstSendApproval ? "✓" : "·"} Require approval before first send
            </button>
          </div>
        </div>
      </details>

      <button className="hanko-btn" onClick={submit} disabled={!sessionDbId || !whatSentence.trim() || saving}>
        {saving ? "Saving…" : "Looks good — show plan"}
      </button>
    </div>
  );
}
