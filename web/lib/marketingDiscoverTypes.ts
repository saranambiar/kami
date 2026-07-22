export type MarketingPlatform = "x" | "instagram";

export interface DiscoveredCrmEntry {
  type: "x_lead" | "creator";
  platform: MarketingPlatform;
  handle: string;
  name?: string;
  followers?: number;
  engagement_rate?: number;
  niche_match_score?: number;
  relevance_reasoning?: string;
  offer_amount?: number;
  status?: string;
}

export interface DiscoverResult {
  entries: DiscoveredCrmEntry[];
  needsInput?: { code: string; message: string };
  warnings?: string[];
  raw?: string;
}
