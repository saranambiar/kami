# Evaluation & iteration plan — multi-company MVP loop

Reference plan for **API-scripted** end-to-end evaluation of Kami’s founder MVP across a fixed company corpus. Humans still click through demos; this harness exists so we can run many use cases without UI automation and judge Hermes output against pre-agreed “good.”

Related:

- Product UX loops: [product-loops.md](./product-loops.md)
- Sales fixture unit evals: [sales/measurement-and-evals.md](./sales/measurement-and-evals.md) (`npm run eval:sales`)
- Observability: [../memory/observability.md](../memory/observability.md) · migration `010_agent_run_logs.sql`
- Setup: [../SETUP.md](../SETUP.md)

---

## 1. Goal

For each company in a curated set (~10):

1. Run the **same ordered API path** a founder would take in the UI (no browser clicking).
2. Capture every visible agent/pipeline output in Supabase (`agent_run_logs` + product tables).
3. Score output against a **written “good looks like” spec** for that company.
4. Log gaps with a root-cause class (patch / prompt / architecture / data / env).
5. Fix the highest-leverage class, **re-run the same fixtures**, measure delta.

Success is not “Hermes said something.” Success is: **identity-correct dossier + correct job path (Sales vs Marketing) + honest PLG/D2C handling + no invented emails + actionable next step.**

---

## 2. What this is / is not

| This plan | Not this plan |
|-----------|----------------|
| Headless **script** calling Next API routes in founder order | Playwright / agent clicking the UI |
| Live Hermes + Supabase (staging or local) | Replacing `npm run eval:sales` offline unit tests |
| Quality of *judgments* (dossier, segments, plan, discover, distribution) | Full real-send soak to strangers (keep send human-gated / test inbox) |
| Growing fixture corpus in git | One-off chat screenshots as the only evidence |

Keep `npm run eval:sales` for fast CI on pure functions (draft reviewer, reply classify, etc.). Use **this E2E loop** for live Hermes + product path quality.

---

## 3. Corpus design (ideate before coding the runner)

### 3.1 Target size

Start with **10 companies**. Enough diversity to stress the MVP; small enough to re-run after each fix.

### 3.2 Diversity axes (cover all)

Pick domains so the set spans:

| Axis | Examples of coverage |
|------|----------------------|
| Motion | B2B sales-assisted · PLG/self-serve · D2C/consumer · mixed |
| Clarity | Clean product site · thin/marketing-only · ambiguous multi-product |
| Geo / brand | Global brand, India `.in`, US SaaS, open-source tool |
| Risk | Homonym risk (same name, wrong vertical) · publisher/listicle-prone |
| Job | Should prefer **Find customers** vs **Create distribution** |

### 3.3 Fixture file shape (proposed)

Implemented under `web/evals/e2e/`:

```text
web/evals/e2e/
  fixtures/companies.json   # 10 locked machine fixtures
  lib/                      # apiClient, collect, score, gapLog, types
  run.ts                    # ordered API runner
  results/                  # gitignored run outputs
  GAPLOG.md                 # durable gap log (committed)
  README.md                 # commands + safety boundary
```

Run: `npm run eval:e2e -- --fixture argus` (see `web/evals/e2e/README.md`).

Per-company fixture fields (minimum):

```yaml
id: nike-in
domain: nike.in
tags: [d2c, plg, consumer, india]
expected:
  product_category_contains: ["footwear", "apparel", "sport"]   # soft match
  motion: plg_or_d2c                    # not b2b_company_blast
  job_primary: create_distribution      # after dossier confirm
  must_not:
    - invent_consumer_emails
    - force_find_companies_as_only_path
  dossier:
    company_name_hints: ["Nike"]
    positioning_must_not_claim: ["enterprise SaaS", "B2B CRM"]
  sales:
    if_entered: expect_plg_empty_or_distribution_cta
  marketing:
    if_entered: expect_opportunities_or_clear_setup_error
notes: "Famous D2C — distribution path is the honest MVP."
```

**Do not invent the 10 domains in this doc until we ideate them together.** Use a short working table in §8 once decided.

### 3.4 “Good looks like” — shared rubric

Score each run **0–2** per dimension (0 fail, 1 partial, 2 pass). Hard gates fail the whole company run.

| Dimension | Pass (2) | Hard gate? |
|-----------|----------|------------|
| **Identity lock** | Dossier/company about *this* domain, not a homonym | Yes |
| **Evidence** | Positioning grounded in research / first-party; no invented vertical | Yes |
| **Job routing** | Primary path matches expected Sales vs Marketing | Yes for PLG/D2C |
| **Never invent emails** | No guessed consumer/`firstname.lastname` without evidence | Yes |
| **PLG honesty** | No dead-end “Find companies” only; distribution CTA or clear B2B seeds | Yes if tagged PLG/D2C |
| **Plan usefulness** | Plain-English next steps, small batch, approval-shaped | No |
| **Discover quality** (B2B) | Real company domains, not listicles/publishers | Yes for B2B |
| **Distribution quality** | Opportunities have why_now + draft + risks; no fake “posted” | No |
| **Observability** | `agent_run_logs` rows exist for each Hermes step | Soft |

Optional: LLM-as-judge *only after* hard gates pass — never to excuse identity/email failures.

---

## 4. Scripted founder path (API order)

One company = one `session_id`. Steps mirror [product-loops.md](./product-loops.md).

```text
A. START / UNDERSTAND
   1. POST /api/domain/validate          { domain }
   2. POST /api/research                 { identity }
   3. POST /api/sessions                 create agent_sessions + research_snapshot
   4. Dossier generate                   POST /api/chat (stream) with onboarding prompt
                                         OR future POST /api/dossier/generate (preferred for harness)
   5. Persist dossier                    PATCH /api/sessions/:id  type=dossier
   6. (optional) POST /api/dossier/revise  NL correction fixture

B. CHOOSE — branch by fixture.expected.job_primary

B1. FIND CUSTOMERS (Sales)
   7.  POST /api/sales/setup
   8.  GET/POST /api/sales/segments      derive → confirm (use fixture or Hermes output)
   9.  POST /api/sales/plan              → approve
   10. POST /api/sales/discover          Find companies / PLG path
   11. (B2B only) POST /api/sales/contacts/find
   12. Stop before real send unless TEST_INBOX configured

B2. CREATE DISTRIBUTION (Marketing)
   7.  POST /api/marketing/distribution/setup   { goal }
   8.  POST /api/marketing/distribution/opportunities  action=research
   9.  Stop before real publish unless explicit publish fixture

C. OBSERVE
   13. GET /api/observability/runs?session_id=…
   14. Load brand_profiles.raw_dossier, sales_*, distribution_*
   15. Write results/<id>-<timestamp>.json + scorecard
```

### 4.1 Harness principles

- **Same order every time** — no skipping steps that founders must hit.
- **Deterministic branch** from fixture tags, not from “whatever Hermes felt like,” then *score* whether Hermes recommended the right branch.
- **No silent fallbacks counted as pass** — if Hermes is down and we scaffold, mark `status: fallback` and fail hard gates that require Hermes judgment.
- **Idempotent-ish** — new session per run; don’t pollute prior campaign state mid-comparison.
- **Secrets** — harness uses env (Supabase service role, Hermes key). Never commit keys.

### 4.2 Headless dossier (implemented)

`POST /api/dossier/generate` runs onboarding server-side, validates, persists, and writes `dossier_research` / `dossier_persist` to `agent_run_logs`. The harness uses this — not the browser SSE path.

Migrations required on the target project: through **`009`** (Marketing) and **`010`** (agent_run_logs).

---

## 5. Scoring & evidence

### 5.1 Primary evidence sources

1. **`agent_run_logs`** — kind/agent/status/input_preview/output_text/output_json/duration  
   Expected kinds include: `dossier_research`, `dossier_revise`, `ask_kami`, `sales_segments`, `sales_plan`, `sales_discover`, `contact_find`, `distribution_research`, `distribution_opportunities`, `dossier_persist`, …
2. **Product tables** — `brand_profiles.raw_dossier`, `sales_campaigns` / plans / accounts, `distribution_opportunities`
3. **Harness scorecard** — pass/fail per rubric dimension + quotes from outputs

### 5.2 Result artifact (per company run)

```json
{
  "fixture_id": "nike-in",
  "session_id": "…",
  "started_at": "…",
  "steps": [{ "name": "domain_validate", "ok": true, "ms": 120 }],
  "hard_gates": { "identity_lock": "pass", "never_invent_emails": "pass" },
  "scores": { "identity_lock": 2, "job_routing": 2, "plg_honesty": 2 },
  "gaps": [],
  "run_log_ids": ["…"]
}
```

Aggregate: `results/summary-<timestamp>.md` with pass rate by tag (B2B vs PLG, etc.).

---

## 6. Gap log & RCA taxonomy

Append every failure to `web/evals/e2e/GAPLOG.md` (or `docs/evals/gap-log.md`):

| Field | Example |
|-------|---------|
| Date | 2026-07-23 |
| Fixture | nike-in |
| Symptom | Find path only; Hermes email disabled; zero accounts |
| Expected | Distribution CTA / PLG honesty |
| Actual | Dead-end company Find |
| Class | **product UX** (fixed) / **prompt** / **architecture** / **data** / **env** |
| Evidence | run_log id, session id |
| Next step | … |
| Status | open / fixed / wontfix |

**Class meanings:**

- **Patch** — small code/copy fix; re-run fixture same day.
- **Prompt / skill** — Hermes instruction wrong; change skill or prompt; re-run.
- **Architecture** — wrong abstraction (e.g. D2C forced through company email); design change.
- **Data / research** — Linkup/first-party thin or homonym; improve research gate.
- **Env** — Hermes down, migration missing, capability off; not a model bug.

Do not “fix” env failures by weakening hard gates.

---

## 7. Iteration cadence

```text
1. Ideate fixtures + rubrics (human + agent)     → commit fixtures
2. Implement/adjust harness                     → dry-run 1 company
3. Full corpus run                              → results + GAPLOG
4. Triage gaps (severity by class + demo risk) → pick 1–3 fixes
5. Patch / prompt / arch change                 → re-run failed fixtures only, then full set
6. Record delta (pass rate before/after)        → update memory + lessons
```

Rules:

- **Never delete a failing fixture** to go green — fix or mark `wontfix` with reason.
- After architectural changes, re-run **entire** corpus.
- After prompt-only changes, re-run affected tags first, then full set before calling it done.
- Tie demo rehearsal to the **hardest three** fixtures, not only the happy path.

---

## 8. Working company set (locked 2026-07-23)

Detailed, source-backed acceptance criteria: [gold-standard-test-corpus.md](./gold-standard-test-corpus.md).

| # | id | domain | tags | expected job | Role in corpus |
|---|----|--------|------|--------------|----------------|
| 1 | mirage | trymirage.app | plg, consumer_ai, browser | create_distribution | Seed — early-user / attention loop |
| 2 | argus | arguslabs.in | b2b, ai_infra, homonym_risk | find_customers | Seed — identity lock + B2B Find |
| 3 | cal | cal.com | b2b, saas, scheduling | find_customers | Happy-path B2B Sales |
| 4 | nike-in | nike.in | d2c, consumer, india | create_distribution | PLG/D2C honesty (no email invent) |
| 5 | linear | linear.app | b2b, saas, productivity | find_customers | Clean ICP / company Find |
| 6 | browserbase | browserbase.com | b2b, ai_infra, browser_agents | find_customers | Browser-workflow evidence quality |
| 7 | notion | notion.so | plg, b2b, multi_product | mixed | Ambiguous motion — don’t overfit one ICP |
| 8 | duolingo | duolingo.com | plg, consumer, education | create_distribution | Consumer brand → distribution |
| 9 | supabase | supabase.com | b2b, plg, developer | find_customers | Platform / platform-eng ICP |
| 10 | arc | arc.net | plg, consumer, browser, product_ambiguity | create_distribution | Consumer PLG + Arc/Dia disambiguation |

Mix check: B2B Find ~5 · PLG/D2C distribution ~4 · ambiguous/mixed ~1 · identity/product ambiguity stress (Argus, Mirage, Arc) ~3.

### 8.1 Gold standards (per company)

Shared hard gates always apply (identity lock, no invented emails, observability rows). Below is **what “good” means** for each fixture.

#### 1. `trymirage.app` — Mirage
- **Product truth:** In-browser AI that reshapes any website’s look/layout/flow in plain English (not Strukto’s unrelated “Mirage” VFS; not video-gen Mirage).
- **Dossier good:** Consumer/prosumer browser agent; personalization / “see the web your way”; must not call it B2B sales CRM or agent filesystem infra.
- **Job:** Primary **Create distribution** (launch / early_users). Sales only if founder forces it → expect PLG honesty, not company blast.
- **Fail if:** Homonym to Strukto Mirage / Captions Mirage; enterprise IT outbound as the only path.

#### 2. `arguslabs.in` — Argus
- **Product truth:** Observability / debugging for AI agent pipelines (silent failures, traces, replay) — **not** biomedical/security “Argus” brands.
- **Dossier good:** Agent observability, LangGraph/pipeline debugging, eng buyers; evidence from arguslabs.in / their materials.
- **Job:** **Find customers** — B2B segments with real candidate companies (AI platform teams, agent infra, ML platform).
- **Fail if:** Biomedical, military, generic “security camera,” or wrong Argus vertical (known prior failure mode).

#### 3. `cal.com` — Cal.com
- **Product truth:** Open-source / scheduling infrastructure for meetings (B2B + self-serve).
- **Dossier good:** Scheduling, bookings, calendar links for businesses/teams — **not** a random healthcare default.
- **Job:** **Find customers** — companies that need scheduling (agencies, SaaS, professional services).
- **Fail if:** Invented vertical from thin dossier defaults; listicle “top scheduling tools” domains as accounts.

#### 4. `nike.in` — Nike India
- **Product truth:** Global athletic apparel/footwear D2C / retail brand.
- **Dossier good:** Consumer athletic brand; India site OK.
- **Job:** **Create distribution** (or PLG “Find people to reach” → distribution CTA). Never invent shopper emails.
- **Fail if:** Only path is greyed “Find emails with Hermes” with zero accounts and no Marketing route.

#### 5. `linear.app` — Linear
- **Product truth:** Issue tracking / project management for software teams.
- **Dossier good:** B2B SaaS for eng/product teams; competitors like Jira/Asana OK if evidenced.
- **Job:** **Find customers** — software companies / eng leaders as personas; real company domains.
- **Fail if:** Consumer social app positioning; empty PLG-only with no B2B seeds when site clearly sells teams.

#### 6. `browserbase.com` — Browserbase
- **Product truth:** Browser-agent platform with managed browser sessions plus Search, Fetch, Identity, Functions and model access for dynamic/authenticated web workflows.
- **Dossier good:** Browser-agent infrastructure, not only a scraper; distinguish web interaction, Search/Fetch and enterprise trust/scale.
- **Job:** **Find customers** — B2B AI/automation/data teams with public evidence of a browser-dependent workflow.
- **Fail if:** Guarantees CAPTCHA bypass/universal web access; assigns HIPAA/SSO/enterprise claims to every tier; invents browser-workflow signals or contacts.

#### 7. `notion.so` — Notion
- **Product truth:** All-in-one workspace (docs, wiki, projects) — PLG with team/enterprise upsell.
- **Dossier good:** Collaboration workspace; may mention teams + individuals.
- **Job:** **mixed** — gold is *not wrong*: either distribution for PLG growth **or** B2B Find for team/enterprise seats is OK if segments match. Bad = forcing a single narrow ICP that contradicts the site.
- **Fail if:** One invented niche (e.g. “only law firms”) with no evidence; company Find that returns media listicles.

#### 8. `duolingo.com` — Duolingo
- **Product truth:** Consumer language-learning app (PLG).
- **Dossier good:** Education / language learning for individuals.
- **Job:** **Create distribution**; Sales path must be PLG-honest.
- **Fail if:** B2B “sell Duolingo to enterprises” as the only motion without school/enterprise evidence path; invents learner emails.

#### 9. `supabase.com` — Supabase
- **Product truth:** Open-source Firebase alternative — Postgres, auth, storage for builders.
- **Dossier good:** Developer platform / backend-as-a-service.
- **Job:** **Find customers** — startups and product teams needing a backend; eng/founder personas.
- **Fail if:** Positioned as generic “database consulting agency”; consumer social app.

#### 10. `arc.net` — Arc
- **Product truth:** Free desktop browser from The Browser Company; current public site distinguishes Arc from Dia and says Arc receives Chromium updates only.
- **Dossier good:** Consumer/prosumer browser product with Spaces/Profiles/Split View; do not treat Arc as Dia or an active enterprise AI-browser offer.
- **Job:** **Create distribution** — browser-switch/onboarding/activation, not company outbound.
- **Fail if:** Conflates Arc and Dia; invents enterprise license/team plan/security cadence; infers Chrome-user contacts.

### 8.2 Scorecard shortcuts for the harness

| Fixture | Must pass job_routing | Must pass homonym/identity | Discover companies expected? |
|---------|----------------------|----------------------------|------------------------------|
| mirage | distribution | vs other “Mirage” products | No (unless B2B seeds added) |
| argus | sales | vs biomedical Argus | Yes |
| cal | sales | — | Yes |
| nike-in | distribution | — | No |
| linear | sales | — | Yes |
| browserbase | sales | browser workflow evidence | Yes |
| notion | mixed (non-absurd) | — | Optional |
| duolingo | distribution | — | No |
| supabase | sales | — | Yes |
| arc | distribution | Arc vs Dia | No |

---

## 9. Environment checklist (before a corpus run)

- [ ] Hermes gateway up; `HERMES_API_KEY` / gateway URL set for the web app
- [ ] Supabase migrations through **010** applied
- [ ] Linkup optional — if off, expect thinner research; don’t fail identity if first-party holds
- [ ] AgentMail only if a **test inbox** send fixture is included
- [ ] Harness `BASE_URL` points at local or staging (not production judges casually)
- [ ] `agent_run_logs` writable (verify one Ask Kami or dossier run appears in `/ledger`)

---

## 10. Harness status

1. [x] §8 companies + machine fixtures (`web/evals/e2e/fixtures/companies.json`)
2. [x] `POST /api/dossier/generate`
3. [x] `web/evals/e2e/run.ts` (Sales + Marketing, stop before send/publish)
4. [x] Hard-gate scorer + aggregate markdown + `GAPLOG.md`
5. [ ] First live corpus run → triage GAPLOG → prioritize fixes
6. [ ] Optional CI **nightly** staging gate (not PR-blocking until stable)

Commands: `npm run eval:e2e` · offline units remain `npm run eval:sales`.

---

## 11. How to use this doc

1. **Ideation session** — fill §8 and fixture YAMLs; argue about “good” until hard gates are boringly clear.
2. **Implementation session** — harness + dossier generate endpoint.
3. **Eval session** — run corpus, fill GAPLOG, no feature creep mid-run.
4. **Fix session** — only items from GAPLOG; re-run.
5. **Demo prep** — pick 2–3 fixtures that show identity lock, B2B Find, and PLG → distribution.

Manual founder click-through remains required for UX confidence; this plan makes **judgment quality** scalable across companies.
