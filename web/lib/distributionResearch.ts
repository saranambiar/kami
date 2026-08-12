/**
 * Distribution opportunity research — delegates to Hermes Distribution Manager.
 * @see distributionManager.ts
 */

import {
  researchViaManager,
  type OpportunityDraft,
  type ResearchResult,
} from "@/lib/distributionManager";
import type { DistributionPlan } from "@/lib/distributionTypes";
import type { Dossier } from "@/lib/hermes";

export type { OpportunityDraft };

/** @deprecated Prefer researchViaManager with a full DistributionPlan. */
export async function researchDistributionOpportunities(input: {
  sessionId: string;
  goal: string;
  angle: string;
  domain: string;
  dossier: Dossier | null;
  hermesSessionId?: string;
  surfaces?: DistributionPlan["surfaces"];
  plan?: DistributionPlan;
}): Promise<ResearchResult> {
  const plan: DistributionPlan =
    input.plan ??
    ({
      session_id: input.sessionId,
      goal: input.goal,
      angle: input.angle,
      surfaces: input.surfaces?.length ? input.surfaces : ["x", "reddit", "linkedin"],
      status: "approved",
    } satisfies DistributionPlan);

  return researchViaManager({
    sessionId: input.sessionId,
    plan,
    domain: input.domain,
    dossier: input.dossier,
    hermesSessionId: input.hermesSessionId,
  });
}
