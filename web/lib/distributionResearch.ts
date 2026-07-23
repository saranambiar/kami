/**
 * Build distribution opportunities from dossier + goal.
 * Uses Hermes when available; otherwise returns honest scaffold opportunities
 * that require founder-supplied URLs for non-X platforms.
 */

import { capabilitiesPromptBlock, detectCapabilities } from "@/lib/capabilities";
import type {
  DistributionGoal,
  DistributionOpportunity,
  DistributionPlatform,
} from "@/lib/distributionTypes";
import type { Dossier } from "@/lib/hermes";
import { hermesChatOnce, hermesGatewayConfigured, parseLastJsonBlock } from "@/lib/hermesServer";

export type OpportunityDraft = Omit<
  DistributionOpportunity,
  "id" | "session_id" | "created_at" | "updated_at"
>;

function scaffoldOpportunities(
  goal: DistributionGoal,
  angle: string,
  dossier: Dossier | null,
  domain: string,
): OpportunityDraft[] {
  const company = dossier?.company || domain;
  const problem =
    dossier?.positioning?.slice(0, 160) ||
    `what ${company} helps people do`;

  return [
    {
      campaign_id: null,
      platform: "x",
      source_url: "https://x.com/search?q=" + encodeURIComponent(problem.slice(0, 40)),
      evidence: "Scaffold — refine with live X search or browser research",
      why_now: `People discussing ${problem} are active; a founder-native take can create early attention.`,
      suggested_action: "Post a short insight or reply in a relevant thread; product mention only if natural.",
      draft: `Working on ${company}: ${angle}\n\nIf you're dealing with ${problem}, I'd love to hear what you've tried.`,
      risks: "Avoid hard sells. Prefer usefulness and specificity.",
      approval_status: "needs_review",
      action_status: "draft",
      outcome: "none",
      agent_skill: "x_distribution",
    },
    {
      campaign_id: null,
      platform: "reddit",
      source_url: "manual://paste-thread-url",
      evidence: "Manual mode — paste a real thread URL after you find one",
      why_now: `Reddit discussions about ${problem} reward value-first comments.`,
      suggested_action: "Answer the question helpfully; mention the product only if rules allow and it fits.",
      draft: `I've been deep in this problem while building ${company}. Here's what worked for us…`,
      risks: "Read subreddit rules. Never spam. Prefer communities the founder already participates in.",
      approval_status: "needs_review",
      action_status: "draft",
      outcome: "none",
      agent_skill: "reddit_distribution",
    },
    {
      campaign_id: null,
      platform: "linkedin",
      source_url: "https://www.linkedin.com/feed/",
      evidence: "Founder-post draft — publish manually",
      why_now: "Founder-led posts outperform brand pages for early-stage credibility.",
      suggested_action: "Post as the founder; invite comments from people who've felt the pain.",
      draft: `${angle}\n\nBuilding ${company} taught me something specific about ${problem}.\n\nCurious: how are you solving this today?`,
      risks: "Keep it personal and specific. No engagement-bait templates.",
      approval_status: "needs_review",
      action_status: "draft",
      outcome: "none",
      agent_skill: "linkedin_distribution",
    },
  ];
}

export async function researchDistributionOpportunities(input: {
  sessionId: string;
  goal: DistributionGoal;
  angle: string;
  domain: string;
  dossier: Dossier | null;
  hermesSessionId?: string;
}): Promise<{ opportunities: OpportunityDraft[]; source: "hermes" | "scaffold"; note?: string }> {
  const caps = detectCapabilities();
  const scaffold = scaffoldOpportunities(input.goal, input.angle, input.dossier, input.domain);

  if (!hermesGatewayConfigured()) {
    return {
      opportunities: scaffold,
      source: "scaffold",
      note: "Hermes unavailable — showing starter opportunities. Connect Hermes or paste real thread URLs.",
    };
  }

  const prompt = [
    "You are Kami's marketing platform specialist.",
    capabilitiesPromptBlock(caps),
    `Company domain: ${input.domain}`,
    `Company: ${input.dossier?.company ?? input.domain}`,
    `Positioning: ${input.dossier?.positioning ?? "(unknown)"}`,
    `Goal: ${input.goal}`,
    `Campaign angle: ${input.angle}`,
    "Return ONLY a JSON array (max 5) of distribution opportunities with keys:",
    "platform (x|reddit|hackernews|linkedin|producthunt|discord), source_url, evidence, why_now,",
    "suggested_action, draft, risks.",
    "Prefer real public URLs when you know them; otherwise use honest placeholders and say so in evidence.",
    "Never invent that you posted or messaged anyone. Manual-first. Value-first. No spam.",
  ].join("\n");

  try {
    const text = await hermesChatOnce({
      content: prompt,
      sessionId: input.hermesSessionId ?? `kami-dist-${input.sessionId}`,
      kamiSessionId: input.sessionId,
      kind: "distribution_research",
      agent: "marketing_strategist",
      timeoutMs: 120_000,
      meta: { goal: input.goal, angle: input.angle },
    });
    if (!text) {
      return {
        opportunities: scaffold,
        source: "scaffold",
        note: "Hermes returned empty — showing starter opportunities.",
      };
    }
    const parsed = parseLastJsonBlock(text);
    const arr = Array.isArray(parsed) ? parsed : Array.isArray((parsed as { opportunities?: unknown })?.opportunities)
      ? ((parsed as { opportunities: unknown[] }).opportunities)
      : null;
    if (!arr?.length) {
      return { opportunities: scaffold, source: "scaffold", note: "Hermes returned no parseable opportunities." };
    }

    const platforms: DistributionPlatform[] = [
      "x",
      "reddit",
      "hackernews",
      "linkedin",
      "producthunt",
      "discord",
    ];
    const opportunities: OpportunityDraft[] = [];
    for (const raw of arr.slice(0, 5)) {
      if (!raw || typeof raw !== "object") continue;
      const o = raw as Record<string, unknown>;
      const platform = platforms.includes(o.platform as DistributionPlatform)
        ? (o.platform as DistributionPlatform)
        : "x";
      const source_url = typeof o.source_url === "string" ? o.source_url : "manual://paste-url";
      const why_now = typeof o.why_now === "string" ? o.why_now : "";
      const suggested_action = typeof o.suggested_action === "string" ? o.suggested_action : "";
      const draft = typeof o.draft === "string" ? o.draft : "";
      if (!why_now || !suggested_action || !draft) continue;
      opportunities.push({
        campaign_id: null,
        platform,
        source_url,
        evidence: typeof o.evidence === "string" ? o.evidence : null,
        why_now,
        suggested_action,
        draft,
        risks: typeof o.risks === "string" ? o.risks : null,
        approval_status: "needs_review",
        action_status: "draft",
        outcome: "none",
        agent_skill: `${platform}_distribution`,
      });
    }
    if (!opportunities.length) {
      return { opportunities: scaffold, source: "scaffold", note: "Hermes output invalid — using starter queue." };
    }
    return { opportunities, source: "hermes" };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "hermes failed";
    return { opportunities: scaffold, source: "scaffold", note: msg };
  }
}
