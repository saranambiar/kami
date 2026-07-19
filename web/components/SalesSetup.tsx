"use client";

import { useState } from "react";
import type { SalesCampaignConfig, SalesChannel, SalesIcp } from "@/lib/salesTypes";

interface SalesSetupProps {
  sessionDbId: string | null;
  onComplete: (config: SalesCampaignConfig, planGenerated: boolean) => void;
}

const CHANNELS: { key: SalesChannel; label: string }[] = [
  { key: "email", label: "Email" },
  { key: "x", label: "X (DM)" },
];

export default function SalesSetup({ sessionDbId, onComplete }: SalesSetupProps) {
  const [offer, setOffer] = useState("");
  const [icpTitles, setIcpTitles] = useState("");
  const [icpIndustries, setIcpIndustries] = useState("");
  const [icpSize, setIcpSize] = useState("50-500");
  const [geo, setGeo] = useState("");
  const [exclusions, setExclusions] = useState("");
  const [dealMin, setDealMin] = useState("");
  const [dealMax, setDealMax] = useState("");
  const [targetQty, setTargetQty] = useState(50);
  const [dailyCap, setDailyCap] = useState(35);
  const [channels, setChannels] = useState<SalesChannel[]>(["email"]);
  const [approvedClaims, setApprovedClaims] = useState("");
  const [senderName, setSenderName] = useState("");
  const [senderEmail, setSenderEmail] = useState("");
  const [autoFollowups, setAutoFollowups] = useState(true);
  const [requireFirstSendApproval, setRequireFirstSendApproval] = useState(true);
  const [saving, setSaving] = useState(false);

  function toggleChannel(c: SalesChannel) {
    setChannels((prev) => (prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]));
  }

  async function submit() {
    if (!sessionDbId || !offer || channels.length === 0) return;
    setSaving(true);

    const icp: SalesIcp = {
      titles: icpTitles.split(",").map((s) => s.trim()).filter(Boolean),
      industries: icpIndustries.split(",").map((s) => s.trim()).filter(Boolean),
      size: icpSize,
      geo,
    };

    const payload: SalesCampaignConfig = {
      session_id: sessionDbId,
      offer,
      icp,
      geo,
      exclusions: exclusions.split("\n").map((s) => s.trim()).filter(Boolean),
      deal_range: {
        min: dealMin ? Number(dealMin) : undefined,
        max: dealMax ? Number(dealMax) : undefined,
        currency: "USD",
      },
      approved_claims: approvedClaims.split("\n").map((s) => s.trim()).filter(Boolean),
      target_quantity: targetQty,
      daily_send_cap: dailyCap,
      allowed_channels: channels,
      sender_identity: senderName
        ? { name: senderName, email: senderEmail || undefined }
        : undefined,
      autonomy: {
        paused: false,
        auto_followups: autoFollowups,
        require_first_send_approval: requireFirstSendApproval,
      },
    };

    try {
      const res = await fetch("/api/sales/setup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      const config = (json.config ?? payload) as SalesCampaignConfig;

      let planGenerated = false;
      if (res.ok) {
        const planRes = await fetch("/api/sales/plan", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session_id: sessionDbId }),
        });
        planGenerated = planRes.ok;
      }

      onComplete(config, planGenerated);
    } catch {
      onComplete(payload, false);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: "var(--stack-lg)" }}>
      <h3 style={{ marginBottom: "var(--stack-md)" }}>Set up Sales</h3>

      {!sessionDbId && (
        <p className="mono" style={{ color: "var(--hanko)", marginBottom: "var(--stack-md)" }}>
          Waiting for session — launch a campaign first.
        </p>
      )}

      <div className="form-line" style={{ marginBottom: "var(--stack-md)" }}>
        <label className="mono label-caps" htmlFor="offer">Offer / value prop</label>
        <input id="offer" value={offer} onChange={(e) => setOffer(e.target.value)} placeholder="What are you selling?" />
      </div>

      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>ICP</p>
      <div style={{ display: "flex", gap: "var(--stack-md)", flexWrap: "wrap", marginBottom: "var(--stack-md)" }}>
        <div className="form-line" style={{ flex: 1, minWidth: 180 }}>
          <label className="mono label-caps" htmlFor="icp-titles">Titles (comma-separated)</label>
          <input id="icp-titles" value={icpTitles} onChange={(e) => setIcpTitles(e.target.value)} placeholder="VP Sales, Head of Growth" />
        </div>
        <div className="form-line" style={{ flex: 1, minWidth: 180 }}>
          <label className="mono label-caps" htmlFor="icp-industries">Industries</label>
          <input id="icp-industries" value={icpIndustries} onChange={(e) => setIcpIndustries(e.target.value)} placeholder="SaaS, fintech" />
        </div>
        <div className="form-line" style={{ flex: 1, minWidth: 120 }}>
          <label className="mono label-caps" htmlFor="icp-size">Company size</label>
          <input id="icp-size" value={icpSize} onChange={(e) => setIcpSize(e.target.value)} />
        </div>
        <div className="form-line" style={{ flex: 1, minWidth: 120 }}>
          <label className="mono label-caps" htmlFor="geo">Geography</label>
          <input id="geo" value={geo} onChange={(e) => setGeo(e.target.value)} placeholder="US, UK" />
        </div>
      </div>

      <div className="form-line" style={{ marginBottom: "var(--stack-md)" }}>
        <label className="mono label-caps" htmlFor="exclusions">Exclusions (one per line: domains, companies)</label>
        <textarea id="exclusions" rows={2} value={exclusions} onChange={(e) => setExclusions(e.target.value)} />
      </div>

      <div style={{ display: "flex", gap: "var(--stack-md)", flexWrap: "wrap", marginBottom: "var(--stack-md)" }}>
        <div className="form-line" style={{ flex: 1, minWidth: 100 }}>
          <label className="mono label-caps" htmlFor="deal-min">Deal min ($)</label>
          <input id="deal-min" type="number" value={dealMin} onChange={(e) => setDealMin(e.target.value)} />
        </div>
        <div className="form-line" style={{ flex: 1, minWidth: 100 }}>
          <label className="mono label-caps" htmlFor="deal-max">Deal max ($)</label>
          <input id="deal-max" type="number" value={dealMax} onChange={(e) => setDealMax(e.target.value)} />
        </div>
        <div className="form-line" style={{ flex: 1, minWidth: 100 }}>
          <label className="mono label-caps" htmlFor="target-qty">Target accounts</label>
          <input id="target-qty" type="number" min={1} value={targetQty} onChange={(e) => setTargetQty(Number(e.target.value))} />
        </div>
        <div className="form-line" style={{ flex: 1, minWidth: 100 }}>
          <label className="mono label-caps" htmlFor="daily-cap">Daily send cap</label>
          <input id="daily-cap" type="number" min={1} value={dailyCap} onChange={(e) => setDailyCap(Number(e.target.value))} />
        </div>
      </div>

      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Channels</p>
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "var(--stack-md)" }}>
        {CHANNELS.map((c) => (
          <button
            key={c.key}
            type="button"
            className="mono"
            onClick={() => toggleChannel(c.key)}
            style={{
              background: channels.includes(c.key) ? "var(--kraft)" : "transparent",
              border: "1px solid var(--ink)",
              padding: "0.4rem 0.75rem",
              cursor: "pointer",
            }}
          >
            {channels.includes(c.key) ? "✓ " : "· "}{c.label}
          </button>
        ))}
      </div>

      <div className="form-line" style={{ marginBottom: "var(--stack-md)" }}>
        <label className="mono label-caps" htmlFor="claims">Approved claims (one per line)</label>
        <textarea id="claims" rows={3} value={approvedClaims} onChange={(e) => setApprovedClaims(e.target.value)} placeholder="3x reply rate with signal-based outreach" />
      </div>

      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Sender identity</p>
      <div style={{ display: "flex", gap: "var(--stack-md)", marginBottom: "var(--stack-md)" }}>
        <div className="form-line" style={{ flex: 1 }}>
          <label className="mono label-caps" htmlFor="sender-name">Name</label>
          <input id="sender-name" value={senderName} onChange={(e) => setSenderName(e.target.value)} />
        </div>
        <div className="form-line" style={{ flex: 1 }}>
          <label className="mono label-caps" htmlFor="sender-email">Email</label>
          <input id="sender-email" type="email" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} />
        </div>
      </div>

      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Autonomy</p>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", marginBottom: "var(--stack-lg)" }}>
        <button
          type="button"
          className="mono"
          onClick={() => setAutoFollowups(!autoFollowups)}
          style={{ background: autoFollowups ? "var(--kraft)" : "transparent", border: "1px solid var(--ink)", padding: "0.4rem 0.75rem", cursor: "pointer", textAlign: "left" }}
        >
          {autoFollowups ? "✓" : "·"} Auto follow-ups (within approved sequence)
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

      <button className="hanko-btn" onClick={submit} disabled={!sessionDbId || !offer || channels.length === 0 || saving}>
        {saving ? "Saving…" : "Launch Sales"}
      </button>
    </div>
  );
}
