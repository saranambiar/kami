# E2E evaluation harness — 2026-07-23

## Done
- [x] Fixtures `web/evals/e2e/fixtures/companies.json` (10 companies)
- [x] `POST /api/dossier/generate` + observability
- [x] Runner `web/evals/e2e/run.ts` (Sales + Marketing, safe stop)
- [x] Collector + hard-gate scorer + aggregate report + `GAPLOG.md`
- [x] `npm run eval:e2e` + README + docs/memory links

## Next
- [x] Live dry-run: `argus` (first FAIL timeout; **rerun PASS** 2026-07-24) + `mirage` (PASS)
- [ ] Optional harden: discover `maxDuration` + earlier `sales_discover` log (flake guard)
- [ ] Full corpus → triage GAPLOG
- [ ] Optional nightly staging gate (non-blocking)

## User still needs
- [ ] Apply Supabase migrations `009` + `010` if not applied
- [ ] Hermes + web env up for live runs

---

# Evaluation & iteration plan doc — 2026-07-23

- [x] Wrote `docs/evaluation-and-iteration-plan.md` (API harness, fixtures, rubric, RCA, cadence)
- [x] Linked from product-loops, sales measurement-and-evals, memory index
- [x] Researched and locked 10-company corpus in `docs/gold-standard-test-corpus.md`
- [x] Encoded fixtures + built API harness (`web/evals/e2e/`)

---

# End-to-end observability — 2026-07-23

## Done
- [x] Migration `010_agent_run_logs.sql` + `logAgentRun`
- [x] Auto-log `hermesChatOnce` + `/api/chat` streams
- [x] Pipeline logs: dossier persist, discover, distribution opportunities
- [x] `GET /api/observability/runs` + Ledger Supabase section
- [x] SETUP/memory docs

## User still needs
- [ ] Apply `010_agent_run_logs.sql` on Supabase

---

# Overview UX + dossier correction — 2026-07-23

## Done
- [x] Confirm layout + Intel open + Ask Kami full-height rail
- [x] DossierConfirm edit/save + `POST /api/dossier/revise` regenerate
- [x] Sales Advanced MVP cleanup
- [x] PLG/D2C Find → Create distribution path
- [x] Migration 009 error UX + SETUP/product-loops notes
- [x] `npm run build` (web) passed

## User still needs
- [ ] Apply `009_distribution_opportunities.sql` on Supabase, then retry Marketing Early users

---

# Marketing discovery + onboarding (`feature/marketing`) — 2026-07-22

## Review: Community MVP execution — 2026-07-23

- Documented narrative + loops in `docs/product-loops.md`; Community Edition in `docs/community-edition.md` + `SETUP.md` + `README.md`.
- Founder shell: dossier confirm → Find customers / Create distribution; Ask Kami drawer; global kill switch; Nav More.
- Marketing: distribution opportunity queue default; CRM under Advanced; skills `*_distribution`; migration `009`.
- Capabilities + readiness/sync scripts; MIT LICENSE; CI; sales real-send checklist (human-gated).
- **User still needs:** apply migrations incl. `009`; supply AgentMail + controlled recipient for real Sales proof; connect dedicated Chrome CDP for browser research.

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

## CMO shared context — Phase 1 (2026-07-22)
- [x] `web/lib/cmoContext.ts` — compact company pack from dossier/domain (+ sales summary)
- [x] `cmoPrompt(question, contextPack)` — pack required; never invent
- [x] Wire `CmoChat` + `Dashboard` (dossier / domain / sessionDbId / salesConfig); Supabase `raw_dossier` fallback
- [x] Memory: `memory/cmo-context.md` (Phase 2 = kami-context MCP + companies + auth)
- [ ] **User:** after cal.com dossier, ask CMO “what did you understand about this company?” — should answer from pack without paste

## Sales pipeline overhaul (2026-07-22)
- [x] `hermesServer.ts` + `salesSegments.ts` (Hermes derive + dossier fallback)
- [x] Discovery rewrite: `researchFromSegments` + `salesContactFinder` + hardened blocklist/listicle/shortener reject + Fit×Intent scoring
- [x] `/api/sales/segments` confirm gate; discover requires `segments_confirmed_at`; auto-persist verified emails
- [x] Clean positioning + plain-English plan tiers; funnel budgets UI
- [x] Stepper: ICP → Plan → Find → Emails → Needs you
- [x] Skills `icp_segmentation` + signal_cold_email updates; evals **39 passed**
- [ ] **User:** apply `007_sales_segments.sql` on Supabase, then re-test Confirm ICP → Plan → Find
- [x] Domain identity gate + `/api/domain/validate` + migration `008_domain_truth.sql`
- [x] Anchored Linkup research + dossier validation + failed-research UX + resume Continue/Start new
- [x] Product-neutral Sales/CMO/CTA/segments (no Calendly/healthcare defaults)
- [x] Hermes sales strategist, editable candidates, setup invalidation, signal-backed Find + discovery runs
- [x] Evals + SETUP/memory/lessons
- [ ] **User:** apply `008_domain_truth.sql` (and `007` if missing); test `arguslabs.in` + a bad domain on Landing
- Note: teammate marketing migration is `005_connected_accounts_session.sql` — our sales migrations are `007`/`008` to avoid collision.
