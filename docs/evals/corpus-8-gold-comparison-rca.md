# Corpus-8 vs gold standard — comparison & RCA

**Date:** 2026-07-24  
**Scope:** Passing E2E runs for mirage, argus, cal, nike-in, linear, browserbase, notion, duolingo  
**Outstanding fixtures (not in this denominator):** supabase, arc  
**Evidence base:** [corpus-8-output-notes.md](./corpus-8-output-notes.md) · [gold-standard-test-corpus.md](../gold-standard-test-corpus.md) · [companies.json](../../web/evals/e2e/fixtures/companies.json) · session-linked `agent_run_logs`

---

## 0. How to read this document

| Term | Meaning |
|------|---------|
| **Mechanical pass** | Harness hard gates in `web/evals/e2e/lib/score.ts` were green (identity terms, route branch, no send, log kinds present). |
| **Qualitative gold** | Acceptance criteria in the gold corpus that the current scorer does **not** fully enforce (buyer-email quality, thread-specific why_now, lane selection, manager judgment). |
| **Confidence** | `direct` = live session evidence · `inference` = pattern from code + outputs · `untested` = not exercised in corpus-8 |

**Release rule:** Do not open-source while a known scaffold is reported as researched, a non-buyer email is send-eligible, or an external action cannot be explained and traced.

---

## 1. Executive summary

All **8/8** fixtures **mechanically passed**. That is **not** the same as gold-standard quality.

| Layer | Status |
|-------|--------|
| Identity lock / PLG routing / no invented consumer emails / observability chain | Strong |
| Contact sendability / Marketing research→queue contract / Cal lane / evaluator honesty | Broken or incomplete — **release blockers** |
| Manager decision provenance / mixed-motion dual branch / Sales drafts E2E | Untested / architectural gaps |

---

## 2. Per-fixture matrix

Legend: **M** = mechanical · **Q** = qualitative gold · **P** = pass · **Δ** = partial · **F** = fail

| Fixture | Route M | Identity Q | Discover / Marketing Q | Biggest gap | Session |
|---------|---------|------------|------------------------|-------------|---------|
| mirage | P | P | Δ — research had threads; queue looks scaffold-like | Marketing research→persist contract | `689dc4e2-4aeb-451a-af28-9793c78a0efb` |
| argus | P | P (homonym) | Δ — 20 accounts; weak role emails | Contact taxonomy | `9aa793a9-1c97-4ea3-a8ac-23c08f2ee560` |
| cal | P | Δ — healthcare industries OK on site but over-used | F — Clinic/HCA/Talkspace without founder lane | Lane + discover filter | `9f754c62-1c82-4173-956c-6791faca7d18` |
| nike-in | P | Δ — missing Nykaa operator | Δ — real Reddit in research; why_now = positioning | Product truth + Marketing writer | `c638d07a-2ea6-40a2-a5c5-97f6fe5a0feb` |
| linear | P | P | Δ — sensible domains; weak inboxes | Contact taxonomy | `bfeafc31-6943-40ae-a921-72accd8c93c9` |
| browserbase | P | P (not scraper-only) | Δ — good AI/GTM names; weak inboxes + echo | Contact + signal scoring | `f66d3768-78c0-493d-8f64-47173019f478` |
| notion | P mixed→sales | Δ — company field sometimes tagline | Δ — Sales only; marketing branch untested | Mixed-motion eval coverage | `a75eff25-5f98-4c21-93d2-c74b459906f8` |
| duolingo | P | Δ — Schools sunset / breadth incomplete | Δ — research thread lost in queue drafts | Product truth + Marketing writer | `a0147299-0d05-498e-9aca-86f9d8ee250f` |

### 2.1 Detail by fixture

#### mirage (`trymirage.app`) — Create distribution
| Gold expectation | Observed | Verdict | Confidence |
|------------------|----------|---------|------------|
| Browser personalization; not Strukto/video Mirage | Dossier: agent reshapes look/layout/flow; userscripts | P | direct |
| Primary job: Create distribution | Marketing path 7/7 | P | direct |
| No consumer email blast | 0 sales accounts | P | direct |
| Opportunities: real URL + thread why_now + useful draft | Research logs show real Reddit; persisted why_now often positioning/scaffold-shaped; `distribution_opportunities` may log `fallback` | F / Δ | direct + inference |
| Early-access unknowns stay unknown | Dossier assertive on persistence; privacy nuance thin | Δ | inference |

#### argus (`arguslabs.in`) — Find customers
| Gold expectation | Observed | Verdict | Confidence |
|------------------|----------|---------|------------|
| Agent-pipeline observability; not biomedical Argus | Research discarded same-name domains; LangGraph positioning | P | direct |
| B2B Find with real domains | 20 accounts | P | direct |
| Public/verified **buyer** emails | Many `press@`/`privacy@`/role aliases treated as contacts | F | direct |
| Beta / no pricing / no logos caveats | Not emphasized | Δ | inference |

#### cal (`cal.com`) — Find customers
| Gold expectation | Observed | Verdict | Confidence |
|------------------|----------|---------|------------|
| Scheduling infrastructure; no forced healthcare-only | Dossier includes Healthcare/Telehealth; discover returned Cleveland Clinic, HCA, Talkspace | F | direct |
| Founder lane selection before narrow Find | No lane step; harness went straight to Sales | F | direct |
| Plan warns about vertical drift | Plan risks mention healthcare; discover still includes health systems | Δ | direct |

#### nike-in (`nike.in`) — Create distribution
| Gold expectation | Observed | Verdict | Confidence |
|------------------|----------|---------|------------|
| Athletic D2C; Nykaa operates nike.in | Dossier: official store; **Nykaa not stated** | F | direct |
| Distribution; no shopper emails | Marketing 7/7; 0 consumer emails | P | direct |
| Thread-specific opportunities | Research had r/india delivery thread; queue why_now restates positioning | F | direct |

#### linear (`linear.app`) — Find customers
| Gold expectation | Observed | Verdict | Confidence |
|------------------|----------|---------|------------|
| Product/eng system; not consumer to-do | AI-era product development positioning | P | direct |
| Trigger-backed accounts | 19 accounts incl. Vercel/PostHog; Tier inflation possible | Δ | inference |
| Buyer emails | Role/shared inboxes present | F | direct |

#### browserbase (`browserbase.com`) — Find customers
| Gold expectation | Observed | Verdict | Confidence |
|------------------|----------|---------|------------|
| Browser-agent infra; not scraper-only | Platform + Stagehand positioning | P | direct |
| Workflow-signal accounts | Clay/Apollo/Anthropic-type names; signal quality uneven | Δ | inference |
| No invented compliance claims | Not observed as invented HIPAA blast | P | inference |

#### notion (`notion.so` → `notion.com`) — Mixed
| Gold expectation | Observed | Verdict | Confidence |
|------------------|----------|---------|------------|
| Mixed motion; either branch OK with rationale | Harness forced Sales; Marketing never scored | Δ | direct |
| Company name “Notion” | Sometimes tagline-as-company | Δ | direct |
| Full branch log chain | Sales chain present; no distribution | Δ | direct |

#### duolingo (`duolingo.com`) — Create distribution
| Gold expectation | Observed | Verdict | Confidence |
|------------------|----------|---------|------------|
| Consumer language PLG; Schools free/sunset | Dossier may still frame teacher/Schools activation | F / Δ | inference |
| Thread-specific drafts | Research found r/languagelearning affordability; drafts generic “building Duolingo” | F | direct |
| No learner emails | Marketing only | P | direct |

---

## 3. RCA taxonomy (all validated gaps)

Classes (from [evaluation-and-iteration-plan.md](../evaluation-and-iteration-plan.md) §6):

| Class | Meaning |
|-------|---------|
| **patch** | Small code/policy fix; re-run same day |
| **prompt_skill** | Hermes prompt or `SKILL.md` wrong |
| **architecture** | Wrong abstraction / pipeline contract / missing product step |
| **data_research** | Thin or incomplete first-party/Linkup grounding |
| **evaluator** | Scorer/harness false green or incomplete coverage |
| **environment** | Hermes/Supabase/migration/timeout — not a model bug |

### 3.1 Release blockers

| ID | Gap | Class | Severity | Evidence | Primary files |
|----|-----|-------|----------|----------|---------------|
| **RB1** | Non-buyer / role / malformed emails marked sendable (`role_inbox` → `safe_to_send`; `press@`/`privacy@` as `valid`) | **patch** | blocker | Corpus account tables | `web/lib/salesContactFinder.ts`, `web/app/api/sales/discover/route.ts`, `web/app/api/sales/contacts/find/route.ts`, `web/app/api/sales/sequences/route.ts` |
| **RB2** | Marketing: Hermes `distribution_research` has real threads; persisted opps are scaffold; why_now pastes positioning | **architecture** (+ prompt_skill on scaffold) | blocker | `distribution_opportunities` status=fallback; research vs queue mismatch | `web/lib/hermesServer.ts` (`parseLastJsonBlock`), `web/lib/distributionResearch.ts`, `web/app/api/marketing/distribution/opportunities/route.ts` |
| **RB3** | E2E passes when Marketing source is scaffold/fallback | **evaluator** | blocker | `score.ts` only checks `opportunities.length > 0` | `web/evals/e2e/lib/score.ts` |
| **RB4** | Cal healthcare discover without founder lane | **architecture** + **prompt_skill** | blocker | Clinic/HCA/Talkspace in accounts | Sales setup + `web/lib/salesSegments.ts`, `web/lib/salesResearch.ts` |
| **RB5** | Linkup generic mention / any email → Tier 1 / high contactability | **architecture** + **patch** | major | Tier 1 + `support@` pattern | `web/lib/salesResearch.ts` |
| **RB6** | Manager route is fixture-selected; not scored as agent judgment | **architecture** + **evaluator** | major | `run.ts` `pickRoute` | `web/evals/e2e/run.ts`, new decision log kind |

### 3.2 Product-truth / research

| ID | Gap | Class | Severity | Fixtures | Files |
|----|-----|-------|----------|----------|-------|
| **PT1** | Nike.in missing Nykaa operator | **data_research** + **prompt_skill** | major | nike-in | `web/lib/prompts.ts`, research path |
| **PT2** | Duolingo Schools sunset / multi-subject breadth | **prompt_skill** + **data_research** | major | duolingo | `web/lib/prompts.ts` |
| **PT3** | Argus/Mirage uncertainty bounds thin | **prompt_skill** | minor–major | argus, mirage | `web/lib/prompts.ts` |
| **PT4** | Notion company = tagline | **prompt_skill** + **patch** | minor | notion | `web/lib/dossierValidation.ts` |

### 3.3 Quality / coverage (P1–P2)

| ID | Gap | Class | Severity | Notes |
|----|-----|-------|----------|-------|
| **Q1** | Cross-fixture account echo (Figma/Canva/Ramp…) | **prompt_skill** + **data_research** | major | Segment prompt diversity |
| **Q2** | Discover volume 15–20 vs gold “small batch” | **architecture** | major | Cap to `target_quantity` |
| **Q3** | Mixed-motion Marketing branch never run for notion | **evaluator** | major | `pickRoute` always Sales for mixed |
| **Q4** | Sales drafts/sequences not in E2E | **evaluator** | minor | Scope; human test covers Mirage publish |
| **Q5** | PLG dossier still suggests cold-email playbooks | **prompt_skill** | minor | Motion-aware onboarding opps |
| **Q6** | Scaffold drafts use “building {Company}” voice | **prompt_skill** | major | After RB2 |

### 3.4 What is aligned (do not regress)

| Area | Confidence |
|------|------------|
| Argus homonym identity lock | direct |
| PLG/D2C → Marketing; no shopper/learner emails | direct |
| Browserbase not scraper-only | direct |
| Plan risk honesty (thin signals, vertical drift) | direct |
| Full `agent_run_logs` on taken path | direct |
| Never invent emails (finder does not fabricate) | direct |
| Safe-stop before harness send/publish | direct |

---

## 4. Implementation sequence (agreed priority + rerun gates)

### Phase A — P0 patches (same day)

| Step | Change | Acceptance | Rerun |
|------|--------|------------|-------|
| A1 | Expand non-buyer local-parts; stop `role_inbox` → `safe_to_send`; sequences reject non-buyer | `press@`/`privacy@`/`e@` not sequence-eligible; UI can show found-not-sendable | `eval:sales` + E2E `argus`,`cal`,`linear` |
| A2 | Fix bare JSON parse; persist Hermes opportunities; never silent-upgrade scaffold to “researched” | `distribution_opportunities` source=hermes when research OK; why_now cites thread | E2E `mirage`,`nike-in`,`duolingo` |
| A3 | Scorer: fail Marketing quality when Hermes configured and source=scaffold/fallback | Mechanical fail on fallback | Same Marketing three |
| A4 | Signal scoring: Tier 1 needs trigger-aligned signal; `hasVerifiedContact` = buyer-reachable only | Weak Linkup + role email ≠ Tier 1 hot | `cal`,`browserbase` |

**Gate:** A1–A3 green before any open-source claim.

### Phase B — P0/P1 architecture

| Step | Change | Acceptance | Rerun |
|------|--------|------------|-------|
| B1 | Founder lane on Sales setup (required when dossier has multiple industry lanes); filter discover by lane | Cal without healthcare lane has no hospital systems | `cal` then all Sales |
| B2 | Cap discover to `target_quantity`; diversify segment candidates | ≤ campaign target; fewer marquee repeats | Sales five |
| B3 | Manager `job_recommendation` log + harness compare to fixture | Decision artifact exists before branch | Full corpus |
| B4 | Product-truth prompt/research: Nykaa, Schools sunset, unknowns | Dossier asserts Nykaa; no paid Schools sell | `nike-in`,`duolingo`,`argus`,`mirage` |

### Phase C — Evaluator + remaining corpus

| Step | Change | Acceptance | Rerun |
|------|--------|------------|-------|
| C1 | Diagnostic scores: contact quality, opportunity grounding, placeholder URL | Partial/fail visible in scorecard | All 10 |
| C2 | Mixed-motion: optional dual branch or score recommendation only | Notion Marketing expect documented | `notion` |
| C3 | Run **supabase** + **arc** | Pass or GAPLOG with class | those two |
| C4 | Full 10-fixture corpus | Aggregate report + GAPLOG delta | `--all` |

### Phase D — Human acceptance (`trymirage.app`)

After C4 green: start Hermes + Next; click-through checklist in chat (distribution-first, sourced opps, review, controlled publish, Ledger).

---

## 5. Why these classes (discussion notes)

**Why RB2 is architecture, not “better prompt”:**  
The specialist already returns thread-level JSON. The product loses it at parse/persist and substitutes scaffold. Prompt-only changes cannot fix a broken handoff.

**Why RB1 is patch, not “better research”:**  
Emails are often real public aliases. The bug is **sendability semantics** — treating any address as a buyer contact.

**Why RB4 is architecture:**  
Gold requires a founder lane before narrowing Cal. Filtering healthcare after the fact is a band-aid; the missing step is the decision gate.

**Why RB6 matters for open source:**  
Judges/users will ask whether the manager plans. Today E2E proves endpoints, not judgment. Shipping without decision provenance overclaims orchestration.

**Why we still ship after Phase A–C:**  
Identity, PLG honesty, and no-invent are already strong. Blocking open source on RB1–RB3 is correct; waiting for perfect discover diversity is not.

---

## 6. Metric deltas to expect after fixes

| Metric | Before (corpus-8) | Target after Phase A |
|--------|-------------------|----------------------|
| Marketing opps with real non-manual URL when Hermes ok | Often scaffold | ≥1 thread URL per Marketing fixture |
| why_now contains company positioning paste | Common | Rare / fail eval |
| Sequence-eligible non-buyer emails | Common | 0 |
| Cal healthcare accounts without lane | Present | 0 |
| Mechanical pass with `source=scaffold` (Hermes up) | Possible | Fail |

---

## 7. Artifact index

| Kind | Path |
|------|------|
| Output notes | [corpus-8-output-notes.md](./corpus-8-output-notes.md) |
| This RCA | `docs/evals/corpus-8-gold-comparison-rca.md` |
| GAPLOG | [../../web/evals/e2e/GAPLOG.md](../../web/evals/e2e/GAPLOG.md) |
| Snapshot JSON | `web/evals/e2e/results/corpus-8-snapshot.json` (gitignored) |
| Eval plan | [../evaluation-and-iteration-plan.md](../evaluation-and-iteration-plan.md) |

---

## 8. Decision log (for maintainers)

| Decision | Status |
|----------|--------|
| Mechanical pass ≠ gold pass | Adopted |
| Scaffold/fallback must not pass quality when Hermes available | Adopted — implement in Phase A3 |
| Non-buyer email ≠ sendable | Adopted — Phase A1 |
| Cal lane required before discover | Adopted — Phase B1 |
| Open source blocked until Phase A green + full corpus baseline | Adopted |
| Human Mirage test includes controlled real publish | Adopted — Phase D |
