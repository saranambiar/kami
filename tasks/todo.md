# Marketing discovery + onboarding (`feature/marketing`) — 2026-07-22

## Done
- [x] Checkout `feature/marketing`; cherry-pick Phase 0 `8992c9b`; leave `feature/sales` untouched
- [x] Credentials scaffolding: `.env.example` + `docs/marketing-credentials.md`
- [x] Landing `ConnectSocials` (X + Instagram)
- [x] Instagram OAuth (`igOauth.ts`, login/callback)
- [x] Discovery rewrite: X user-token search + Apify IG; Hermes ranks only
- [x] Boost queue honesty + MarketingSetup connection gates
- [x] Session-bound accounts (`kami_claim` + migration 005) + session-scoped token helpers
- [x] Cold DM send `POST /api/marketing/dm` + CRM approve→send
- [x] Credentials doc expanded (free vs paid, step-by-step)

## User still needs to add to `.env.local`
- `INSTAGRAM_APP_ID` / `INSTAGRAM_APP_SECRET` / `INSTAGRAM_REDIRECT_URI`
- `APIFY_API_TOKEN`
- Optional: `X_ADS_ACCESS_TOKEN` / `X_ADS_ACCOUNT_ID`
- Apply Supabase migration `005_connected_accounts_session.sql`

## Review
- Sends use the end user's OAuth token for that campaign session, not developer personal accounts.
- App keys identify Kami; Apify is discovery-only; Ads keys optional for boosts.

---

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
- 2026-07-18: Sales research/implementation contract is documented in `docs/sales/`; its merge → `feature/sales` execution plan lives in Cursor plan `sales-vertical`.

## Blocked on provisioning (ping user)
- [ ] **AgentMail key** → real send (agentmail.to, free tier)
- [ ] Exa key (optional) → real prospect research in Research agent

## Next sprints (per PLAN.md)
- [ ] Convex swap-in for state/campaign.json; Strategist + Loop 0 dossier; LiteLLM+Langfuse; frontend per DESIGN.md; X content; evals; infra/domain

## Sales vertical (`feature/sales`) — 2026-07-18
- [x] Merge Marketing into base + persistence/policy fixes (`003_marketing.sql`, sessionDbId, kill switch, scoped CRM)
- [x] Sales docs contract in `docs/sales/`
- [x] Foundation: types, `004_sales.sql`, setup/plan APIs, Sales tab UI, agents/skills
- [x] Discovery: Linkup provenance, scores, target review
- [x] Execution: sequences, reviewer, AgentMail send gate + receipts
- [x] Ops: pipeline, inbox, conversations, meetings, tasks
- [x] Evals: `web/evals/sales` (15 pass) + verification checklist
- [x] Founder UX plan executed: `docs/product-loops.md`, NL confirm, stepper, Run outbound, hybrid send, Needs you
- [x] RCA logged: `docs/sales/founder-ux-rca.md` (RC-1–RC-10 + P0/P1/P2 next steps)
- [x] **RCA P0:** Confirm chrome fix, opt-in Find inclusion, Continue feedback, publisher domain blocklist
- [x] **RCA P1:** dossier→config mapping, product-aware plan copy, discovery entity model (company domains from content)
- [x] **RCA P2:** eval gates for blocklist/listicle/offer; RCA decision log updated
- [ ] **User:** re-test cal.com path — Find unchecked by default; no wellfound listicles; Continue banner when emails missing

