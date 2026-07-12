# Outreach engine — build state (sprint 1, branch `dev`)

## What exists
- `contracts/contracts.ts` — all typed handoffs (CampaignBrief, WorkOrder, Result, Prospect, Draft, Verdict, Receipt, CampaignState). Agency-workflow extras: `sequence_step`, `followup_at`, prospect status pipeline `sourced→…→replied`, suppression.
- `skills/` — `signal_cold_email` (incl. 4-step follow-up cadence day 0/3/7/14), `planning` (manager rules), `review_rubric` (deterministic checklists), `business_rules` (send caps, suppression, investor rules). Synced to `~/.hermes/skills/gtm/`.
- `agents/` — manager.md (orchestrator, no domain tools), research.md (Mode B; refuses to fabricate prospects), outreach.md (playbook-as-parameter, doesn't send), reviewer.md (no tools).
- `state/state.py` — campaign state CLI (read/append/suppress-check/suppress-add + `demo` self-check). `state/campaign.json` local now; same shape planned for Convex.

## Key decisions
- Send tool is Manager-gated: Reviewer approval + email verification + suppression check before any real send. Receipt (provider_message_id) is the only proof-of-send.
- Follow-up sequencing + reply handling added to contracts now, wired to real sends later (AgentMail supports receive).
- Research returns structured `NO_RESEARCH_TOOL` error rather than fabricating prospects until Exa/Apollo keys exist.

## Gates
- Real email send blocked on AgentMail key. Real research blocked on Exa key.
