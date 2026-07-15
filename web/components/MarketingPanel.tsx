"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketingConfig, MarketingCrmEntry, Conversation } from "@/lib/marketingTypes";
import MarketingSetup from "@/components/MarketingSetup";
import PlatformRail from "@/components/PlatformRail";
import MarketingCRM from "@/components/MarketingCRM";
import ConversationsPanel from "@/components/ConversationsPanel";
import KillSwitch from "@/components/KillSwitch";

interface MarketingPanelProps {
  sessionId: string;
  sessionDbId: string | null;
  config: MarketingConfig | null;
  dossierTone?: string[];
  onSetup: (config: MarketingConfig) => void;
}

export default function MarketingPanel({ sessionId, sessionDbId, config, dossierTone, onSetup }: MarketingPanelProps) {
  const [entries, setEntries] = useState<MarketingCrmEntry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [platformFilter, setPlatformFilter] = useState<"all" | "x" | "instagram">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [paused, setPaused] = useState(false);

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

  if (!config || showSettings) {
    return (
      <MarketingSetup
        sessionId={sessionId}
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
        <KillSwitch paused={paused} onToggle={() => setPaused(!paused)} />
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
