"use client";

import { useEffect, useState } from "react";
import type { KamiCapabilities } from "@/lib/capabilities";

export default function CapabilityBanner() {
  const [caps, setCaps] = useState<KamiCapabilities | null>(null);

  useEffect(() => {
    fetch("/api/capabilities")
      .then((r) => r.json())
      .then((j) => setCaps(j))
      .catch(() => {});
  }, []);

  if (!caps?.notes?.length) return null;

  return (
    <div
      className="mono"
      style={{
        fontSize: 12,
        color: "var(--ink-soft)",
        border: "1px solid var(--outline)",
        padding: "0.5rem 0.75rem",
        marginBottom: "var(--stack-sm)",
      }}
    >
      <strong style={{ color: "var(--ink)" }}>Capabilities · </strong>
      research: {caps.researchModes.join(", ")}
      {" · "}
      email: {caps.canSendEmail ? "send ready" : "drafts only"}
      {" · "}
      X: {caps.canPublishX ? "publish ready" : "drafts only"}
      {caps.notes[0] ? ` · ${caps.notes[0]}` : ""}
    </div>
  );
}
