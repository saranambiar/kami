/**
 * Typed handoff contracts — every hop between agents passes one of these
 * objects (referenced by ID in state, never prose). Source: PLAN.md
 * §"Typed handoff contracts" + real-agency workflow extensions
 * (sequence_step / followup_at / reply handling).
 */

export type Goal = "book_meetings" | "drive_signups" | "press" | "awareness";

export type ProspectStatus =
  | "sourced"
  | "verified"
  | "researched"
  | "drafted"
  | "approved"
  | "sent"
  | "replied"
  | "bounced"
  | "do_not_contact";

export interface CampaignBrief {
  campaign_id: string;
  company: { name: string; url: string; one_liner: string };
  icp: { titles: string[]; industries: string[]; size: string; geo: string };
  goal: Goal;
  targets: string[]; // freeform target descriptors or bucket labels
  tone: string;
  constraints: {
    surfaces: ("email" | "x")[];
    do_not_contact: string[]; // emails or domains
    deadline?: string; // ISO date
  };
}

export interface WorkOrder {
  work_order_id: string;
  campaign_id: string;
  assigned_to: "research" | "strategist" | "outreach" | "content" | string;
  playbook: string; // e.g. "signal_cold_email" | "vc_6line" | "influencer"
  objective: string;
  inputs: Record<string, unknown>;
  acceptance_criteria: string[];
  context_refs: { memory_keys: string[] };
  budget: { max_tokens: number; max_tool_calls: number };
  depends_on?: string[]; // work_order_ids
}

export interface Result {
  result_id: string;
  work_order_id: string;
  status: "ok" | "needs_input" | "failed" | "escalate";
  output: { type: string; payload: unknown };
  provenance: {
    sources: string[];
    tools_used: string[];
    signals_found: Signal[];
  };
  self_check: { passed: boolean; notes: string };
  cost: { tokens_in: number; tokens_out: number; usd: number; latency_ms: number };
  error?: { code: string; reason: string }; // never return empty output — structured error instead
  next_suggested?: string;
}

export interface Signal {
  type: "funding" | "hiring" | "exec_hire" | "launch" | "community_post";
  detail: string;
  date: string; // ISO; must be within ~30-90 days
  source_url: string;
}

export interface Prospect {
  prospect_id: string;
  campaign_id: string;
  name: string;
  title: string;
  company: string;
  email: string;
  email_verification: "valid" | "safe_to_send" | "catch_all" | "unknown" | "invalid";
  status: ProspectStatus;
  signals: Signal[];
  // real-agency workflow: sequencing + reply handling
  sequence_step: number; // 0 = not yet contacted; first email captures ~58% of replies
  followup_at?: string; // ISO datetime of next scheduled follow-up (max sequence 4)
  last_contacted_at?: string;
  replied_at?: string;
}

export interface Draft {
  draft_id: string;
  work_order_id: string;
  prospect_id?: string; // email drafts
  surface: "email" | "x";
  playbook: string;
  subject?: string; // email only; <50-60 chars, thesis-fit
  body: string; // plain text; email <=150 words, 3-5 sentences
  cta: string; // exactly one
  signal_ref?: Signal; // the dated signal the hook ties to
  sequence_step: number;
  self_check: { word_count: number; cta_count: number; has_signal: boolean };
}

export interface Verdict {
  verdict_id: string;
  draft_id: string;
  approved: boolean;
  score: number;
  failed_criteria: string[];
  required_fixes: string[]; // concrete; manager bounces once with these
}

export interface Receipt {
  receipt_id: string;
  draft_id: string;
  surface: "email" | "x";
  provider_message_id: string; // AgentMail message id / X post URL — the real proof
  sent_at: string;
  recipient?: string;
}

/** Campaign state persisted in state/campaign.json (Convex later, same shape). */
export interface CampaignState {
  briefs: CampaignBrief[];
  work_orders: WorkOrder[];
  results: Result[];
  prospects: Prospect[];
  drafts: Draft[];
  verdicts: Verdict[];
  receipts: Receipt[];
  do_not_contact: string[]; // global suppression list (emails/domains)
  business_rules: { max_sends_per_day: number; max_sequence_steps: number };
  runs: { run_id: string; campaign_id: string; started_at: string; status: string }[];
}

// --- Sales vertical contracts (mirrors web/lib/salesTypes.ts) ---

export type SalesChannel = "email" | "x";

export type PipelineStage =
  | "researching"
  | "ready_for_approval"
  | "sequencing"
  | "sent"
  | "engaged"
  | "qualified"
  | "meeting_proposed"
  | "invited"
  | "accepted"
  | "closed_won"
  | "closed_lost"
  | "invalid"
  | "suppressed";

export type ApprovalScope =
  | "first_send"
  | "sequence_activation"
  | "x_dm"
  | "calendar_invite"
  | "claims_change"
  | "target_cohort";

export interface ApprovalPolicy {
  require_first_send_approval: boolean;
  auto_followups: boolean;
  allowed_channels: SalesChannel[];
  daily_send_cap: number;
  approval_scope: ApprovalScope[];
}

export interface SalesPlanMotion {
  motion: string;
  rationale: string;
  primary_channel: SalesChannel;
}

export interface SalesPlanTier {
  tier: 1 | 2 | 3;
  label: string;
  criteria: string;
  target_count: number;
  channels: SalesChannel[];
}

export interface SalesPlan {
  plan_id: string;
  session_id: string;
  sales_campaign_id: string;
  version: number;
  motions: SalesPlanMotion[];
  tiers: SalesPlanTier[];
  channel_rationale: string;
  risks: string[];
  prerequisites: string[];
  estimated_activity: {
    accounts_to_research: number;
    contacts_expected: number;
    sends_per_week: number;
    followups_per_week: number;
  };
  approval_scope: ApprovalScope[];
  status: "draft" | "approved" | "superseded";
  actor: string;
  timestamp: string;
}

export interface Account {
  account_id: string;
  session_id: string;
  name: string;
  domain?: string;
  industry?: string;
  pipeline_stage: PipelineStage;
  tier?: 1 | 2 | 3;
  timestamp: string;
}

export interface AccountSignal {
  signal_id: string;
  account_id: string;
  provider: string;
  signal_type: string;
  detail: string;
  source_url: string;
  observed_at: string;
  confidence: number;
  evidence_text?: string;
}

export interface BuyingGroupMember {
  member_id: string;
  account_id: string;
  contact_id: string;
  role: "champion" | "economic_buyer" | "evaluator" | "blocker" | "sponsor";
  evidence_refs: string[];
  confidence: number;
}

export interface LeadScore {
  score_id: string;
  account_id?: string;
  contact_id?: string;
  model_version: string;
  factors: { fit: number; intent: number; contactability: number; priority: number };
  explanation: string;
  evidence_refs: string[];
  recommended_tier?: 1 | 2 | 3;
  recommended_channel?: SalesChannel;
  timestamp: string;
}

export interface Sequence {
  sequence_id: string;
  session_id: string;
  name: string;
  channel: SalesChannel;
  steps: { step: number; delay_days: number }[];
  status: "draft" | "active" | "paused" | "archived";
}

export interface SequenceEnrollment {
  enrollment_id: string;
  sequence_id: string;
  contact_id: string;
  status: string;
  current_step: number;
}

export interface Touchpoint {
  touchpoint_id: string;
  enrollment_id: string;
  channel: SalesChannel;
  step: number;
  provider_receipt_id?: string;
  sent_at?: string;
}

export interface Conversation {
  conversation_id: string;
  session_id: string;
  account_id?: string;
  contact_id?: string;
  channel: SalesChannel;
  status: string;
}

export interface ConversationMessage {
  message_id: string;
  conversation_id: string;
  direction: "inbound" | "outbound";
  content: string;
  provider_message_id?: string;
  sent_at: string;
}

export interface ReplyClassification {
  classification_id: string;
  message_id: string;
  label: string;
  confidence: number;
  escalation_required: boolean;
  actor: string;
  timestamp: string;
}

export interface Meeting {
  meeting_id: string;
  session_id: string;
  account_id?: string;
  contact_id?: string;
  status: string;
  calendar_event_id?: string;
  provider_receipt?: Record<string, unknown>;
  timestamp: string;
}

export interface Task {
  task_id: string;
  session_id: string;
  title: string;
  status: "open" | "in_progress" | "done" | "cancelled";
  priority: "low" | "medium" | "high" | "urgent";
  timestamp: string;
}

export interface Notification {
  notification_id: string;
  session_id: string;
  kind: string;
  title: string;
  read: boolean;
  timestamp: string;
}

export interface Approval {
  approval_id: string;
  session_id: string;
  scope: ApprovalScope;
  entity_type: string;
  entity_id: string;
  status: "pending" | "approved" | "rejected" | "revoked";
  decided_by?: string;
  timestamp: string;
}

export interface AuditEvent {
  audit_id: string;
  session_id: string;
  actor: string;
  action: string;
  entity_type: string;
  entity_id?: string;
  payload?: Record<string, unknown>;
  timestamp: string;
}
