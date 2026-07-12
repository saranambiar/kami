"use client";

export const GOALS = ["Book meetings", "Get signups", "Build awareness", "Raise funding"];
export const STAGES = ["Idea", "Pre-seed", "Seed", "Growth"];

interface GoalChipsProps {
  goals: string[];
  stage: string | null;
  onGoalsChange: (goals: string[]) => void;
  onStageChange: (stage: string | null) => void;
  disabled: boolean;
}

function Chip({
  label,
  selected,
  onClick,
  disabled,
}: {
  label: string;
  selected: boolean;
  onClick: () => void;
  disabled: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mono"
      style={{
        background: selected ? "var(--kraft)" : "transparent",
        border: "1px solid var(--ink)",
        padding: "0.4rem 0.75rem",
        cursor: disabled ? "default" : "pointer",
        color: "var(--ink)",
        display: "inline-flex",
        gap: "0.4rem",
        alignItems: "center",
      }}
    >
      <span style={{ fontWeight: 700, color: selected ? "var(--hanko)" : "var(--outline)" }}>
        {selected ? "✓" : "·"}
      </span>
      {label}
    </button>
  );
}

export default function GoalChips({
  goals,
  stage,
  onGoalsChange,
  onStageChange,
  disabled,
}: GoalChipsProps) {
  function toggleGoal(g: string) {
    onGoalsChange(goals.includes(g) ? goals.filter((x) => x !== g) : [...goals, g]);
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
      <p className="label-caps">What are you after?</p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {GOALS.map((g) => (
          <Chip
            key={g}
            label={g}
            selected={goals.includes(g)}
            onClick={() => toggleGoal(g)}
            disabled={disabled}
          />
        ))}
      </div>
      <p className="label-caps" style={{ marginTop: "var(--stack-sm)" }}>
        Your stage
      </p>
      <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", justifyContent: "center" }}>
        {STAGES.map((s) => (
          <Chip
            key={s}
            label={s}
            selected={stage === s}
            onClick={() => onStageChange(stage === s ? null : s)}
            disabled={disabled}
          />
        ))}
      </div>
    </div>
  );
}
