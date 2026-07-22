import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { classifyReplyContent } from "../../lib/salesClassify";
import { reviewEmailDraft, type ReviewDraftInput } from "../../lib/salesReview";
import { buildEmailSequence } from "../../lib/salesSequences";
import {
  extractCompanyDomainsFromContent,
  isDomainBlocked,
  isListicleTitle,
} from "../../lib/salesResearch";
import { synthesizePlanFromConfig } from "../../lib/salesPlan";
import type { SalesCampaignConfig } from "../../lib/salesTypes";

const __dirname = dirname(fileURLToPath(import.meta.url));
const fixturesPath = join(__dirname, "fixtures.json");

interface BriefFixture {
  id: string;
  config: Partial<SalesCampaignConfig>;
  expect: {
    quality: "precise" | "overbroad" | "conflicting";
    actionable: boolean;
    has_blockers: boolean;
  };
}

interface DraftFixture {
  id: string;
  input: ReviewDraftInput;
  expect: {
    approved: boolean;
    failed_criteria?: string[];
    failed_criteria_includes?: string[];
  };
}

interface ReplyFixture {
  id: string;
  content: string;
  expect: {
    label: string;
    escalation_required: boolean;
  };
}

interface SequenceFixture {
  id: string;
  params: Parameters<typeof buildEmailSequence>[0];
  expect: {
    step_count: number;
    step1_has_signal_ref: boolean;
    step1_reviewer_approved: boolean;
    all_have_opt_out: boolean;
    max_body_words: number;
  };
}

interface PolicyScenario {
  id: string;
  description: string;
  manual_check: string;
  acceptance_ref: string;
}

interface Fixtures {
  briefs: BriefFixture[];
  drafts: DraftFixture[];
  replies: ReplyFixture[];
  sequences: SequenceFixture[];
  policy_scenarios: PolicyScenario[];
}

interface BriefEvaluation {
  quality: "precise" | "overbroad" | "conflicting";
  actionable: boolean;
  blockers: string[];
}

function loadFixtures(): Fixtures {
  return JSON.parse(readFileSync(fixturesPath, "utf8")) as Fixtures;
}

/** Inline brief rubric — mirrors plan/research prerequisites without Supabase. */
function evaluateBrief(config: Partial<SalesCampaignConfig>): BriefEvaluation {
  const icp = config.icp ?? { titles: [], industries: [] };
  const blockers: string[] = [];

  const hasTitles = (icp.titles?.length ?? 0) >= 1;
  const hasIndustries = (icp.industries?.length ?? 0) >= 1;
  const hasSize = Boolean(icp.size?.trim());
  const hasGeo = Boolean(config.geo?.trim() || icp.geo?.trim());
  const specificityScore = [hasTitles, hasIndustries, hasSize, hasGeo].filter(Boolean).length;

  const geo = (config.geo || icp.geo || "").toLowerCase();
  for (const rule of config.exclusions ?? []) {
    const normalized = rule.toLowerCase();
    if (geo && (geo.includes(normalized) || normalized.includes(geo))) {
      blockers.push("geo_conflicts_with_exclusions");
      break;
    }
  }

  const cap = config.daily_send_cap ?? 35;
  const qty = config.target_quantity ?? 50;
  if (qty > cap * 30) {
    blockers.push("target_quantity_exceeds_monthly_cap");
  }

  if (config.autonomy?.auto_followups && config.autonomous_paused) {
    blockers.push("auto_followups_while_paused");
  }

  let quality: BriefEvaluation["quality"];
  if (blockers.length > 0) {
    quality = "conflicting";
  } else if (specificityScore >= 3 && (icp.titles?.length ?? 0) >= 2) {
    quality = "precise";
  } else {
    quality = "overbroad";
  }

  const actionable = quality === "precise" && blockers.length === 0;
  return { quality, actionable, blockers };
}

function wordCount(text: string): number {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function assertEqual<T>(actual: T, expected: T, label: string, errors: string[]): void {
  if (actual !== expected) {
    errors.push(`${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`);
  }
}

function assertIncludes(actual: string[], expected: string, label: string, errors: string[]): void {
  if (!actual.includes(expected)) {
    errors.push(`${label}: expected failed_criteria to include "${expected}", got ${JSON.stringify(actual)}`);
  }
}

function runBriefs(fixtures: BriefFixture[], passed: string[], failed: string[]): void {
  for (const fixture of fixtures) {
    const result = evaluateBrief(fixture.config);
    const errors: string[] = [];

    assertEqual(result.quality, fixture.expect.quality, "quality", errors);
    assertEqual(result.actionable, fixture.expect.actionable, "actionable", errors);
    assertEqual(result.blockers.length > 0, fixture.expect.has_blockers, "has_blockers", errors);

    if (errors.length) {
      failed.push(`brief/${fixture.id}: ${errors.join("; ")}`);
    } else {
      passed.push(`brief/${fixture.id}`);
    }
  }
}

function runDrafts(fixtures: DraftFixture[], passed: string[], failed: string[]): void {
  for (const fixture of fixtures) {
    const verdict = reviewEmailDraft(fixture.input);
    const errors: string[] = [];

    assertEqual(verdict.approved, fixture.expect.approved, "approved", errors);

    if (fixture.expect.failed_criteria) {
      assertEqual(
        [...verdict.failed_criteria].sort().join(","),
        [...fixture.expect.failed_criteria].sort().join(","),
        "failed_criteria",
        errors,
      );
    }

    for (const criterion of fixture.expect.failed_criteria_includes ?? []) {
      assertIncludes(verdict.failed_criteria, criterion, "failed_criteria", errors);
    }

    if (errors.length) {
      failed.push(`draft/${fixture.id}: ${errors.join("; ")}`);
    } else {
      passed.push(`draft/${fixture.id}`);
    }
  }
}

function runReplies(fixtures: ReplyFixture[], passed: string[], failed: string[]): void {
  for (const fixture of fixtures) {
    const result = classifyReplyContent(fixture.content);
    const errors: string[] = [];

    assertEqual(result.label, fixture.expect.label, "label", errors);
    assertEqual(result.escalation_required, fixture.expect.escalation_required, "escalation_required", errors);

    if (errors.length) {
      failed.push(`reply/${fixture.id}: ${errors.join("; ")}`);
    } else {
      passed.push(`reply/${fixture.id}`);
    }
  }
}

function runSequences(fixtures: SequenceFixture[], passed: string[], failed: string[]): void {
  for (const fixture of fixtures) {
    const drafts = buildEmailSequence(fixture.params);
    const errors: string[] = [];
    const step1 = drafts[0];

    assertEqual(drafts.length, fixture.expect.step_count, "step_count", errors);
    assertEqual(Boolean(step1?.signal_ref), fixture.expect.step1_has_signal_ref, "step1_has_signal_ref", errors);

    const step1Verdict = step1
      ? reviewEmailDraft({
          subject: step1.subject,
          body: step1.body,
          cta: step1.cta,
          sequence_step: step1.sequence_step,
          signal_ref: step1.signal_ref,
          approved_claims: fixture.params.claims,
        })
      : null;

    assertEqual(step1Verdict?.approved ?? false, fixture.expect.step1_reviewer_approved, "step1_reviewer_approved", errors);

    const allOptOut = drafts.every(
      (d) => d.body.includes("unsubscribe") || d.body.includes("won't follow up"),
    );
    assertEqual(allOptOut, fixture.expect.all_have_opt_out, "all_have_opt_out", errors);

    const maxWords = Math.max(...drafts.map((d) => wordCount(d.body)));
    if (maxWords > fixture.expect.max_body_words) {
      errors.push(`max_body_words: expected <= ${fixture.expect.max_body_words}, got ${maxWords}`);
    }

    if (errors.length) {
      failed.push(`sequence/${fixture.id}: ${errors.join("; ")}`);
    } else {
      passed.push(`sequence/${fixture.id}`);
    }
  }
}

function runResearchAndPlanGates(passed: string[], failed: string[]): void {
  const errors: string[] = [];

  if (!isDomainBlocked("wellfound.com")) {
    errors.push("wellfound.com should be blocked");
  } else {
    passed.push("research/blocklist_wellfound");
  }

  if (!isDomainBlocked("underdog.io")) {
    errors.push("underdog.io should be blocked");
  } else {
    passed.push("research/blocklist_underdog");
  }

  if (!isListicleTitle("Best SaaS Companies to Work for in United Kingdom 2026")) {
    errors.push("listicle title should be rejected");
  } else {
    passed.push("research/listicle_title_reject");
  }

  if (isListicleTitle("Acme Robotics")) {
    errors.push("company name should not be treated as listicle");
  } else {
    passed.push("research/company_title_ok");
  }

  const extracted = extractCompanyDomainsFromContent(
    "Visit https://acme.io/careers and https://wellfound.com/lists/saas for more.",
    "wellfound.com",
    "cal.com",
  );
  if (!extracted.includes("acme.io") || extracted.includes("wellfound.com")) {
    errors.push(`content domain extract expected acme.io only, got ${extracted.join(",")}`);
  } else {
    passed.push("research/extract_company_from_content");
  }

  const plan = synthesizePlanFromConfig(
    {
      session_id: "eval",
      offer: "Cal.com helps revenue teams book more qualified meetings",
      icp: { titles: ["VP Sales"], industries: ["B2B SaaS"], geo: "US" },
      allowed_channels: ["email"],
      target_quantity: 15,
      daily_send_cap: 5,
      autonomy: { paused: false, auto_followups: true, require_first_send_approval: true },
    },
    "campaign-eval",
    1,
  );
  const planText = `${plan.channel_rationale} ${plan.motions.map((m) => m.rationale).join(" ")}`;
  if (!planText.includes("Cal.com helps revenue teams")) {
    errors.push("plan synthesis should include offer substring");
  } else {
    passed.push("plan/offer_in_synthesis");
  }

  for (const e of errors) failed.push(`research_plan_gates: ${e}`);
}

function printManualPolicyChecks(scenarios: PolicyScenario[]): void {
  console.log("\nManual policy checks (require Supabase + API — not counted in pass/fail):");
  for (const scenario of scenarios) {
    console.log(`  [MANUAL] ${scenario.id}`);
    console.log(`           ${scenario.description}`);
    console.log(`           Check: ${scenario.manual_check}`);
    console.log(`           Ref:   ${scenario.acceptance_ref}`);
  }
}

function main(): void {
  const fixtures = loadFixtures();
  const passed: string[] = [];
  const failed: string[] = [];

  runBriefs(fixtures.briefs, passed, failed);
  runDrafts(fixtures.drafts, passed, failed);
  runReplies(fixtures.replies, passed, failed);
  runSequences(fixtures.sequences, passed, failed);
  runResearchAndPlanGates(passed, failed);

  console.log("Sales eval results");
  console.log("==================");
  for (const id of passed) console.log(`  PASS  ${id}`);
  for (const id of failed) console.log(`  FAIL  ${id}`);

  printManualPolicyChecks(fixtures.policy_scenarios);

  console.log(`\nAutomated: ${passed.length} passed, ${failed.length} failed`);
  console.log(`Manual policy scenarios: ${fixtures.policy_scenarios.length} (documented above)`);

  if (failed.length > 0) process.exit(1);
}

main();
