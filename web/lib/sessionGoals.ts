/** Prefer goals_list; fall back to goals for older sessions. */
export function sessionGoalsFromRow(
  row: { goals_list?: unknown; goals?: unknown } | null | undefined,
): string[] {
  const pick = (v: unknown) =>
    Array.isArray(v) ? v.filter((g): g is string => typeof g === "string") : [];
  const fromList = pick(row?.goals_list);
  return fromList.length > 0 ? fromList : pick(row?.goals);
}
