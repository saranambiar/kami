import type { SalesIcp } from "@/lib/salesTypes";

function normalizeIcp(icp: unknown): SalesIcp {
  if (!icp || typeof icp !== "object") return { titles: [], industries: [] };
  const o = icp as Record<string, unknown>;
  return {
    titles: Array.isArray(o.titles) ? o.titles.map(String) : [],
    industries: Array.isArray(o.industries) ? o.industries.map(String) : [],
    size: typeof o.size === "string" ? o.size : undefined,
    geo: typeof o.geo === "string" ? o.geo : undefined,
  };
}

/** Material setup changes invalidate confirmed segments so Find cannot use a stale ICP. */
export function setupInvalidatesSegments(
  existing: {
    offer?: string | null;
    icp?: unknown;
    geo?: string | null;
  } | null,
  next: { offer: string; icp: SalesIcp; geo?: string | null },
): boolean {
  if (!existing) return false;
  const prevOffer = (existing.offer ?? "").trim();
  const nextOffer = (next.offer ?? "").trim();
  if (prevOffer && prevOffer !== nextOffer) return true;

  const prevIcp = normalizeIcp(existing.icp);
  const titlesChanged =
    JSON.stringify([...prevIcp.titles].sort()) !== JSON.stringify([...next.icp.titles].sort());
  const industriesChanged =
    JSON.stringify([...prevIcp.industries].sort()) !==
    JSON.stringify([...next.icp.industries].sort());
  if (titlesChanged || industriesChanged) return true;

  const prevGeo = (existing.geo ?? prevIcp.geo ?? "").trim();
  const nextGeo = (next.geo ?? next.icp.geo ?? "").trim();
  if (prevGeo !== nextGeo) return true;

  return false;
}
