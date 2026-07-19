"use client";

interface KillSwitchProps {
  paused: boolean;
  onChange: (paused: boolean) => void;
  disabled?: boolean;
}

export default function KillSwitch({ paused, onChange, disabled }: KillSwitchProps) {
  return (
    <button
      type="button"
      className="mono"
      onClick={() => onChange(!paused)}
      disabled={disabled}
      style={{
        background: paused ? "var(--hanko)" : "transparent",
        color: paused ? "var(--paper)" : "var(--ink-soft)",
        border: `1px solid ${paused ? "var(--hanko)" : "var(--ink)"}`,
        padding: "0.3rem 0.7rem",
        cursor: disabled ? "not-allowed" : "pointer",
        fontSize: 11,
        fontWeight: 700,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      {paused ? "▶ Resume all" : "⏸ Pause all"}
    </button>
  );
}
