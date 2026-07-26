/**
 * Landing writes `goals`; Sales/dossier read `goals_list` (migration 008).
 * Prefer goals_list when present; fall back to goals for older rows.
 */
export function sessionGoalsFromRow(
  row: { goals_list?: unknown; goals?: unknown } | null | undefined,
): string[] {
  if (Array.isArray(row?.goals_list)) {
    return row.goals_list.filter((g): g is string => typeof g === "string");
  }
  if (Array.isArray(row?.goals)) {
    return row.goals.filter((g): g is string => typeof g === "string");
  }
  return [];
}
