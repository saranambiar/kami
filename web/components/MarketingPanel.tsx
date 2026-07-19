"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketingConfig, MarketingCrmEntry, Conversation } from "@/lib/marketingTypes";
import MarketingSetup from "@/components/MarketingSetup";
import PlatformRail from "@/components/PlatformRail";
import MarketingCRM from "@/components/MarketingCRM";
import ConversationsPanel from "@/components/ConversationsPanel";
import KillSwitch from "@/components/KillSwitch";

interface MarketingPanelProps {
  sessionDbId: string | null;
  config: MarketingConfig | null;
  dossierTone?: string[];
  onSetup: (config: MarketingConfig) => void;
}

export default function MarketingPanel({ sessionDbId, config, dossierTone, onSetup }: MarketingPanelProps) {
  const [entries, setEntries] = useState<MarketingCrmEntry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [platformFilter, setPlatformFilter] = useState<"all" | "x" | "instagram">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [paused, setPaused] = useState(config?.autonomous_paused ?? false);
  const [pauseSaving, setPauseSaving] = useState(false);

  useEffect(() => {
    setPaused(config?.autonomous_paused ?? false);
  }, [config?.autonomous_paused]);

  const fetchCrm = useCallback(() => {
    if (!sessionDbId) return;
    fetch(`/api/marketing/crm?session_id=${sessionDbId}`)
      .then((r) => r.json())
      .then((j) => setEntries(j.entries ?? []))
      .catch(() => {});
  }, [sessionDbId]);

  const fetchConversations = useCallback(() => {
    if (!sessionDbId) return;
    fetch(`/api/conversations?session_id=${sessionDbId}`)
      .then((r) => r.json())
      .then((j) => setConversations(j.conversations ?? []))
      .catch(() => {});
  }, [sessionDbId]);

  useEffect(() => {
    fetchCrm();
    fetchConversations();
  }, [fetchCrm, fetchConversations]);

  async function handlePauseChange(nextPaused: boolean) {
    if (!sessionDbId) return;
    setPaused(nextPaused);
    setPauseSaving(true);
    try {
      const res = await fetch("/api/marketing/setup", {
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
      <MarketingSetup
        sessionDbId={sessionDbId}
        existingTone={dossierTone}
        onComplete={(c) => {
          onSetup(c);
          setShowSettings(false);
        }}
      />
    );
  }

  const filtered = platformFilter === "all"
    ? entries
    : entries.filter((e) => e.platform === platformFilter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        <p className="label-caps">Marketing Operations</p>
        <KillSwitch paused={paused} onChange={handlePauseChange} disabled={pauseSaving || !sessionDbId} />
      </div>
      <hr className="crease" />
      <div className="dashboard-grid">
        <PlatformRail
          config={config}
          entries={entries}
          activeFilter={platformFilter}
          onFilter={setPlatformFilter}
          onOpenSettings={() => setShowSettings(true)}
        />
        <MarketingCRM
          entries={filtered}
          config={config}
          sessionDbId={sessionDbId}
          paused={paused}
          onRefresh={fetchCrm}
        />
        <ConversationsPanel
          conversations={conversations}
          entries={entries}
          onRefresh={fetchConversations}
        />
      </div>
    </div>
  );
}
