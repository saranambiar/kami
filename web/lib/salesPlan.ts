import type {
  ApprovalScope,
  EstimatedActivity,
  SalesCampaignConfig,
  SalesChannel,
  SalesPlan,
  SalesPlanMotion,
  SalesPlanTier,
} from "@/lib/salesTypes";

/** Local strategist scaffold — synthesizes a draft plan from campaign config when Hermes is not wired yet. */
export function synthesizePlanFromConfig(
  config: SalesCampaignConfig,
  campaignId: string,
  version: number,
): Omit<SalesPlan, "id" | "created_at" | "updated_at"> {
  const channels: SalesChannel[] = config.allowed_channels ?? ["email"];
  const targetQty = config.target_quantity ?? 50;
  const hasEmail = channels.includes("email");
  const hasX = channels.includes("x");
  const titles = config.icp.titles?.join(", ") || "ICP decision-makers";
  const industries = config.icp.industries?.join(", ") || "target industries";
  const geo = config.geo || config.icp.geo || "US";
  const offerSlice = (config.offer || "your product").trim().slice(0, 160);

  const motions: SalesPlanMotion[] = [];
  if (hasEmail) {
    motions.push({
      motion: "signal_outreach",
      rationale: `For teams selling "${offerSlice}": research-backed cold email to ${titles} at ${industries} companies in ${geo}. Hooks tie to recent funding, hiring, or launch signals that make scheduling/outbound pain acute.`,
      primary_channel: "email",
    });
  }
  if (hasX) {
    motions.push({
      motion: "x_dm",
      rationale: `Individualized X outreach for high-intent accounts with visible public activity related to ${offerSlice}. Each DM requires manual approval in MVP.`,
      primary_channel: "x",
    });
  }
  if (motions.length === 0) {
    motions.push({
      motion: "outbound_email",
      rationale: `Outbound email introducing ${offerSlice} to ${titles}.`,
      primary_channel: "email",
    });
  }

  const tiers: SalesPlanTier[] = [
    {
      tier: 1,
      label: "High-intent",
      criteria: "ICP bullseye + dated signal within 60 days + verified contact",
      target_count: Math.ceil(targetQty * 0.3),
      channels: hasEmail ? ["email"] : channels,
    },
    {
      tier: 2,
      label: "Strong fit",
      criteria: "ICP match with moderate or older signals",
      target_count: Math.ceil(targetQty * 0.4),
      channels: hasEmail ? ["email"] : channels,
    },
    {
      tier: 3,
      label: "Broad fit",
      criteria: "Partial ICP match, lower touch cadence",
      target_count: Math.max(1, targetQty - Math.ceil(targetQty * 0.3) - Math.ceil(targetQty * 0.4)),
      channels,
    },
  ];

  const approvalScope: ApprovalScope[] = ["sequence_activation", "target_cohort"];
  if (config.autonomy?.require_first_send_approval !== false) {
    approvalScope.push("first_send");
  }
  if (hasX) approvalScope.push("x_dm");
  approvalScope.push("calendar_invite");

  const estimated: EstimatedActivity = {
    accounts_to_research: targetQty,
    contacts_expected: Math.ceil(targetQty * 1.5),
    sends_per_week: Math.min(config.daily_send_cap ?? 35, 35) * 5,
    followups_per_week: Math.ceil(targetQty * 0.2),
  };

  return {
    session_id: config.session_id,
    sales_campaign_id: campaignId,
    version,
    motions,
    tiers,
    channel_rationale: hasEmail
      ? `Selling "${offerSlice}" into ${industries}. Email is primary for ${titles} in ${geo} — signal hooks lift reply rates. ${hasX ? "X supplements Tier 1 with public-activity personalization." : ""}`
      : `X-only motion for "${offerSlice}" — individually reviewed, no bulk DMs.`,
    risks: [
      "Deliverability depends on sender DNS (SPF/DKIM/DMARC)",
      "Thin signal coverage may limit Tier 1 volume",
      ...(config.exclusions?.length
        ? [`Exclusions may shrink addressable market: ${config.exclusions.length} rules`]
        : []),
    ],
    prerequisites: [
      "Approved claims locked in campaign config",
      ...(hasEmail ? ["AgentMail sender verified", "Working opt-out / suppression process"] : []),
      ...(hasX ? ["Connected X account", "Per-DM reviewer approval enabled"] : []),
    ],
    estimated_activity: estimated,
    approval_scope: approvalScope,
    status: "draft",
  };
}
