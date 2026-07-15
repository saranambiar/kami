"use client";

interface KillSwitchProps {
  paused: boolean;
  onToggle: () => void;
}

export default function KillSwitch({ paused, onToggle }: KillSwitchProps) {
  return (
    <button
      type="button"
      className="mono"
      onClick={onToggle}
      style={{
        background: paused ? "var(--hanko)" : "transparent",
        color: paused ? "var(--paper)" : "var(--ink-soft)",
        border: `1px solid ${paused ? "var(--hanko)" : "var(--ink)"}`,
        padding: "0.3rem 0.7rem",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {paused ? "▶ Resume all" : "⏸ Pause all"}
    </button>
  );
}
