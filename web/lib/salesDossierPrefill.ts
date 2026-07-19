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

export function dossierToNlPrefill(dossier: Dossier | null, domain: string): SalesNlPrefill {
  const bucket = dossier?.icp_buckets?.[0];
  const company = dossier?.company ?? domain.replace(/^www\./, "").split(".")[0];

  const whoSentence = bucket
    ? `${bucket.label} at ${bucket.est_size} companies — especially where ${bucket.trigger_signal.toLowerCase()}. They tend to be on ${bucket.where_they_live}.`
    : `Decision-makers at B2B companies that look like ${company}'s ideal customers.`;

  const whatSentence =
    dossier?.positioning ??
    `${company} helps teams with ${dossier?.brand_voice ?? "growth"} — ${dossier?.opportunities?.[0]?.detail ?? "we should lead with the clearest outcome we deliver"}.`;

  const icpTitles = bucket?.label ?? "VP Sales, Head of Growth";
  const icpIndustries =
    dossier?.icp_buckets?.map((b) => b.label).filter(Boolean).join(", ") || "SaaS, B2B";

  return {
    whoSentence,
    whatSentence,
    targetQty: 15,
    icpTitles,
    icpIndustries,
    geo: "",
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
  const icp: SalesIcp = {
    titles: prefill.icpTitles.split(",").map((s) => s.trim()).filter(Boolean),
    industries: prefill.icpIndustries.split(",").map((s) => s.trim()).filter(Boolean),
    size: "50-500",
    geo: prefill.geo || undefined,
  };

  return {
    session_id: sessionId,
    offer: prefill.offer || prefill.whatSentence.slice(0, 280),
    icp,
    geo: prefill.geo || undefined,
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
    geo: config.geo ?? "",
    offer: config.offer,
  };
}
