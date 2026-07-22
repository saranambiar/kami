import type { Dossier } from "@/lib/hermes";
import type { SalesCampaignConfig, SalesIcp } from "@/lib/salesTypes";

export interface SalesNlPrefill {
  whoSentence: string;
  whatSentence: string;
  targetQty: number;
  icpTitles: string;
  icpIndustries: string;
  geo: string;
  offer: string;
}

const INDUSTRY_HINTS = [
  "SaaS",
  "B2B",
  "fintech",
  "developer tools",
  "devtools",
  "healthcare",
  "ecommerce",
  "e-commerce",
  "marketplace",
  "AI",
  "infrastructure",
  "security",
  "HR",
  "marketing",
  "sales",
  "scheduling",
  "productivity",
];

function inferIndustriesFromDossier(dossier: Dossier | null): string {
  const blob = [
    dossier?.positioning ?? "",
    dossier?.brand_voice ?? "",
    ...(dossier?.competitor_analysis?.map((c) => `${c.name} ${c.insight}`) ?? []),
    ...(dossier?.opportunities?.map((o) => `${o.title} ${o.detail} ${o.playbook}`) ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const hits = INDUSTRY_HINTS.filter((h) => blob.includes(h.toLowerCase()));
  if (hits.length) return [...new Set(hits)].slice(0, 4).join(", ");
  return "B2B SaaS";
}

function inferTitlesFromDossier(dossier: Dossier | null): string {
  const labels = dossier?.icp_buckets?.map((b) => b.label).filter(Boolean) ?? [];
  if (labels.length) return labels.slice(0, 3).join(", ");
  return "VP Sales, Head of Growth, Head of Revenue";
}

export function dossierToNlPrefill(dossier: Dossier | null, domain: string): SalesNlPrefill {
  const bucket = dossier?.icp_buckets?.[0];
  const company = dossier?.company ?? domain.replace(/^www\./, "").split(".")[0];

  const whoSentence = bucket
    ? `${bucket.label} at ${bucket.est_size} companies — especially where ${bucket.trigger_signal.toLowerCase()}. They tend to be on ${bucket.where_they_live}.`
    : `Decision-makers at B2B companies that look like ${company}'s ideal customers.`;

  const whatSentence =
    dossier?.positioning ??
    `${company} helps teams with ${dossier?.brand_voice ?? "growth"} — ${dossier?.opportunities?.[0]?.detail ?? "we should lead with the clearest outcome we deliver"}.`;

  const icpTitles = inferTitlesFromDossier(dossier);
  const icpIndustries = inferIndustriesFromDossier(dossier);

  return {
    whoSentence,
    whatSentence,
    targetQty: 15,
    icpTitles,
    icpIndustries,
    geo: "US",
    offer: whatSentence.slice(0, 280),
  };
}

export function nlPrefillToConfig(
  sessionId: string,
  prefill: SalesNlPrefill,
  advanced: {
    exclusions: string;
    dealMin: string;
    dealMax: string;
    dailyCap: number;
    senderName: string;
    senderEmail: string;
    autoFollowups: boolean;
    requireFirstSendApproval: boolean;
    channels: SalesCampaignConfig["allowed_channels"];
  },
): SalesCampaignConfig {
  const geo = prefill.geo?.trim() || "US";
  const icp: SalesIcp = {
    titles: prefill.icpTitles.split(",").map((s) => s.trim()).filter(Boolean),
    industries: prefill.icpIndustries.split(",").map((s) => s.trim()).filter(Boolean),
    size: "50-500",
    geo,
  };

  return {
    session_id: sessionId,
    offer: prefill.offer || prefill.whatSentence.slice(0, 280),
    icp,
    geo,
    exclusions: advanced.exclusions.split("\n").map((s) => s.trim()).filter(Boolean),
    deal_range: {
      min: advanced.dealMin ? Number(advanced.dealMin) : undefined,
      max: advanced.dealMax ? Number(advanced.dealMax) : undefined,
      currency: "USD",
    },
    target_quantity: prefill.targetQty,
    daily_send_cap: advanced.dailyCap,
    allowed_channels: advanced.channels,
    sender_identity: advanced.senderName
      ? { name: advanced.senderName, email: advanced.senderEmail || undefined }
      : undefined,
    autonomy: {
      paused: false,
      auto_followups: advanced.autoFollowups,
      require_first_send_approval: advanced.requireFirstSendApproval,
    },
  };
}

export function configToNlPrefill(config: SalesCampaignConfig): SalesNlPrefill {
  const titles = config.icp?.titles?.join(", ") ?? "";
  const industries = config.icp?.industries?.join(", ") ?? "";
  const whoSentence = titles
    ? `${titles} at ${config.icp?.size ?? "mid-market"} companies${config.geo ? ` in ${config.geo}` : ""}.`
    : "Decision-makers at companies that match our ICP.";

  return {
    whoSentence,
    whatSentence: config.offer,
    targetQty: config.target_quantity ?? 15,
    icpTitles: titles,
    icpIndustries: industries,
    geo: config.geo ?? "US",
    offer: config.offer,
  };
}
