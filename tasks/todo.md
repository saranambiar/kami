# Sprint: outreach engine vertical slice (branch `dev`)

## Done
- [x] Pull PLAN.md + DESIGN.md; local Hermes gateway smoke-tested (:8642, OpenAI)
- [x] Typed handoff contracts (`contracts/contracts.ts`) incl. agency-workflow fields (sequence_step, followup_at, reply/suppression statuses)
- [x] Runtime skills: `signal_cold_email` (with follow-up cadence), `planning`, `review_rubric`, `business_rules` → synced to `~/.hermes/skills/gtm/`
- [x] Agent prompts: manager / research / outreach / reviewer (`agents/`)
- [x] Campaign state CLI (`state/state.py`) — JSON now, Convex-shaped; suppression self-check passing

## In progress
- [ ] Dry-run on local Hermes: Manager orchestrator → delegate_task → Outreach draft → Reviewer bounce → approve → stub Receipt

## Blocked on provisioning (ping user)
- [ ] **AgentMail key** → real send (agentmail.to, free tier)
- [ ] Exa key (optional) → real prospect research in Research agent

## Next sprints (per PLAN.md)
- [ ] Convex swap-in for state/campaign.json; Strategist + Loop 0 dossier; LiteLLM+Langfuse; frontend per DESIGN.md; X content; evals; infra/domain
