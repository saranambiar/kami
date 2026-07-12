# Sprint: outreach engine vertical slice (branch `dev`)

## Done
- [x] Pull PLAN.md + DESIGN.md; local Hermes gateway smoke-tested (:8642, OpenAI)
- [x] Typed handoff contracts (`contracts/contracts.ts`) incl. agency-workflow fields (sequence_step, followup_at, reply/suppression statuses)
- [x] Runtime skills: `signal_cold_email` (with follow-up cadence), `planning`, `review_rubric`, `business_rules` → synced to `~/.hermes/skills/gtm/`
- [x] Agent prompts: manager / research / outreach / reviewer (`agents/`)
- [x] Campaign state CLI (`state/state.py`) — JSON now, Convex-shaped; suppression self-check passing

## Done (verified)
- [x] Dry-run via gateway api_server (session `kami-manager-dryrun-1`): Manager plan → delegate_task Outreach → Reviewer REJECTED on recipient-fit (real catch) → human escalation → bounce with CTA fix → re-review APPROVED → suppression check → stub Receipt logged. Evidence in `state/campaign.json`.

## Review / findings
- `delegate_task` is background-only on this install; Results only return inside a persistent process → manager sessions MUST run via gateway api_server (`X-Hermes-Session-Id`), which is the production path anyway.
- Reviewer checklist is genuinely strict (caught gmail-vs-corporate recipient mismatch unprompted).

## Blocked on provisioning (ping user)
- [ ] **AgentMail key** → real send (agentmail.to, free tier)
- [ ] Exa key (optional) → real prospect research in Research agent

## Next sprints (per PLAN.md)
- [ ] Convex swap-in for state/campaign.json; Strategist + Loop 0 dossier; LiteLLM+Langfuse; frontend per DESIGN.md; X content; evals; infra/domain
