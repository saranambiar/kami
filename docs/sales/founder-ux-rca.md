# Founder Sales UX — Root Cause Analysis & Remediation Log

**Date:** 2026-07-19 (updated 2026-07-21)  
**Branch:** `feature/sales`  
**Status:** Open — UI shell shipped; Plan + Find logic still scaffold-quality  
**Related:** [product-loops.md](../product-loops.md) · [plans/sales-founder-ux.md](../plans/sales-founder-ux.md) · [ui-information-architecture.md](./ui-information-architecture.md) · [tests/sales-end-to-end-test.md](../../tests/sales-end-to-end-test.md)

This document captures the product intent for the Domain → Overview → Sales founder flow, the current implementation state after the founder-UX pass, every root cause found during live testing (cal.com), and prioritized next steps. It is the handoff for the next coding agent — do not rediscover these issues from screenshots alone.

---

## 1. Product intent (what “good” looks like)

### Philosophy

**Domain-first → recommend → confirm → act → escalate.**

A founder should never open Sales to a blank SDR jargon form. Kami researches their company on Overview, proposes who/what/how many in plain language, gets confirmation, shows a plan that clearly relates to *their* product, finds real companies that look like buyers, lets the founder add real emails, then drafts and sends with a trust gate.

### Canonical loop

```text
1. START      Domain + goals + stage
2. UNDERSTAND Overview dossier (that's us)
3. CHOOSE     Run outbound → Sales
4. CONFIRM    NL: who / what / how many (prefilled from dossier)
5. PLAN       Plain-English next steps that reflect THIS company → Approve
6. FIND       Real companies + why they fit → Include/exclude → Continue
7. CONTACT    Ensure email on included companies (never invent)
8. DRAFT      Emails appear without console hacks
9. SEND       Hybrid review/send (1–3 individual, then batch)
10. WATCH     Needs you (replies, meetings)
```

### Success criteria (acceptance)

| Criterion | Intent |
|-----------|--------|
| Confirm | Prefills from Overview dossier; founder edits in NL; no ICP jargon as default |
| Plan | Founder understands what Kami will do *for their product* (e.g. Cal.com = scheduling for revenue teams) |
| Find | Cards are **companies** (name + company domain), with a short “why,” Fit/Timing that makes sense, opt-in include |
| Continue | With 1–2 included + emails saved → lands on Emails with drafts |
| Send | Hybrid send works; first-send approval has UI |
| Chrome | One primary CTA per step; Confirm is not a blank clickable step |

### Non-goals (still)

- Full Apollo/Clay enrichment in MVP (manual/test email is enough)
- Marketing tab redesign
- Perfect Hermes strategist if local plan can be *product-aware* first

---

## 2. Current state — what exists today

### Shipped and working (UI / plumbing)

| Area | Status | Key files |
|------|--------|-----------|
| Product loops doc | Done | `docs/product-loops.md`, AGENTS.md §7 |
| Overview **Run outbound** CTA | Done | `web/components/Dashboard.tsx` |
| NL confirm (SalesSetup) | Done | `web/components/SalesSetup.tsx`, `web/lib/salesDossierPrefill.ts` |
| Guided stepper chrome | Partial | `web/components/SalesPanel.tsx` — steps exist; Confirm has no body |
| Plan view (plain-English labels) | Partial | `web/components/SalesPlanView.tsx` + labels in `salesMotionLabels.ts` |
| Find UI (discover, include, add email, Continue) | Partial | `web/components/SalesTargetReview.tsx` |
| Contacts API | Done | `POST /api/sales/contacts` |
| First-send approval API + banner | Done | `POST /api/sales/approvals`, `SalesDraftQueue.tsx` |
| Hybrid send (1–3 then batch) | Done | `SalesDraftQueue.tsx` |
| Needs you surface | Done | `SalesNeedsYou.tsx` |
| More (Pipeline/Inbox/Meetings/Tasks) | Done | Progressive disclosure after first send |
| Sequences API | Done | `POST /api/sales/sequences` |
| Send gate / policy | Done | `web/lib/salesPolicy.ts`, drafts route |
| Evals | Green | `npm run eval:sales` — 15 automated pass |

### Shipped but scaffold / broken for founder intent

| Area | Status | Reality |
|------|--------|---------|
| Plan generation | Scaffold | `synthesizePlanFromConfig()` — template fill-in, **not** Hermes, **not** product-aware |
| Dossier → Sales config | Lossy | ICP industries pulled from bucket *labels*; geo often empty |
| Discovery entity model | Wrong | Linkup result **URL host** treated as company (listicle publishers) |
| Inclusion default | Wrong | All discovered accounts land as `ready_for_approval` → auto-included |
| Confirm step in stepper | Misleading | Clickable after setup but **renders nothing**; ✓ is positional |
| Continue UX | Fragile | Email gate error easy to miss; sequence `enrolled_count: 0` can feel like no-op |
| Cal.com relevance | Broken | Overview dossier may be good; Plan + Find do not carry product narrative |

### Not shipped / deferred

- Hermes-backed sales strategist (live plan per brief)
- Company extraction from listicles / firmographic provider
- Opt-in default for Find (unchecked unless user includes)
- Confirm step re-entry that shows NL form without ⚙ only
- Contact enrichment provider
- Strong empty/error states for Continue / zero enrollments

---

## 3. Root causes (complete list)

### RC-1 — Confirm step has no content after first setup

**Symptom:** Clicking **Confirm** in the stepper shows a blank panel; Plan appears as the first real screen after return.

**Cause:**

1. After **Looks good — show plan**, `salesConfig` is persisted. `SalesPanel` only renders `SalesSetup` when `!config || showSettings`.
2. With config present, initial step is `plan` (or `find` if approved) via `defaultStep()`.
3. The stepper still lists Confirm as a navigable step, but there is **no** `{step === "confirm" && …}` body — only Plan / Find / Emails / Needs you.

**Evidence:** `web/components/SalesPanel.tsx` — early return for setup vs main chrome; Confirm missing from render branches.

**Intent gap:** Founder should be able to re-read/edit who/what without hunting for ⚙, or Confirm should not appear as an empty step.

---

### RC-2 — Step checkmarks are positional, not completion signals

**Symptom:** Confirm shows ✓ even when the user never saw Confirm this session.

**Cause:**

```tsx
{idx < stepIndex ? "✓ " : ""}
```

Any step with a lower index than the current step gets a checkmark. Being on Find ⇒ Confirm and Plan both show ✓.

**Evidence:** `SalesPanel.tsx` stepper map.

**Intent gap:** ✓ should mean “user completed this” or “config/plan exists,” not “you scrolled past this index.”

---

### RC-3 — Plan is a local template, not a Cal.com (or any company) strategist

**Symptom:** Plan reads as generic SDR (“signal-based cold email to VP Sales…”) and does not explain how it relates to the seller’s product (e.g. Cal.com scheduling).

**Cause:**

1. `synthesizePlanFromConfig()` in `web/app/api/sales/plan/route.ts` fills motions/tiers/risks from `SalesCampaignConfig` fields with hard-coded phrasing.
2. Comment in code: *“Local strategist scaffold — … when Hermes is not wired yet.”*
3. Template uses ICP titles/geo/industries but does **not** turn `config.offer` / dossier positioning into a product-specific narrative.
4. No Hermes sales-strategist call on plan create.

**Evidence:** Plan screenshot language matches template strings; route exports `synthesizePlanFromConfig`.

**Intent gap:** Plan should answer: “For *this* company, here’s who we reach, what we say we help with, and what happens next.”

---

### RC-4 — Dossier → Sales config mapping is lossy and mis-typed

**Symptom:** Plan industries/titles feel wrong or generic even when Overview dossier was good.

**Cause:** `dossierToNlPrefill()` / `nlPrefillToConfig()` in `web/lib/salesDossierPrefill.ts`:

| Field | Current mapping | Problem |
|-------|-----------------|---------|
| `icpIndustries` | Joined ICP **bucket labels** | Labels are personas (“VP Sales at…”), not industries |
| `icpTitles` | First bucket `label` | Same conflation |
| `geo` | Often `""` | Not inferred from dossier; Advanced/Edit details required |
| `offer` | Positioning or truncated what-sentence | OK-ish, but unused by plan template narrative |

**Intent gap:** Prefill should map dossier fields to the right schema slots (industry ≠ persona label; geo from dossier when present).

---

### RC-5 — Discovery treats Linkup page hosts as companies (entity model bug)

**Symptom:** Find shows “Best SaaS Companies to Work for in United Kingdom 2026” with domain `wellfound.com` — listicles/recruiting blogs, not outbound targets. Feels unrelated to Cal.com.

**Cause:** `researchSalesTargets()` in `web/lib/salesResearch.ts`:

1. Builds queries that *mention* the seller domain (`similar to ${domain}`).
2. For each Linkup hit, `accountDomain = extractDomainFromUrl(result.url)` → **publisher domain**.
3. Display name = truncated article title via `extractAccountName(result.name, domain)`.
4. Blocklist excludes LinkedIn/Twitter/etc. but **not** listicle hosts (wellfound, underdog, gogloby, etc.).
5. Cal.com only appears in the **query string**, not as a filter that requires results to be peer companies.

**Evidence:** Live Find UI (cal.com session) — wellfound.com / gogloby.com / underdog.io cards with Fit 0–25%.

**Intent gap:** Each card must be a **company** (buyer org) with that company’s domain, plus a why tied to the seller’s ICP/offer.

---

### RC-6 — Fit / Timing / Reachable scores are applied to the wrong entity

**Symptom:** Fit 0%, Timing 15–45%, Reachable 25%, explanations about “no verified contact in source.”

**Cause:** Scoring runs on **article page text** and publisher domain:

- Fit = keyword overlap with ICP strings on combined content  
- Intent = regex “funding/hiring” hits on listicle copy  
- Contactability default **0.25** when no email in page (`scoreContactability`)

Scores look precise but measure the wrong thing.

**Intent gap:** Scores should describe company↔ICP fit and real contactability, or be hidden until entity extraction is trustworthy.

---

### RC-7 — All discovered accounts are auto-included

**Symptom:** “Continue with selected (9)” with all checkboxes already ticked after Find.

**Cause:**

1. Discover route inserts accounts with `pipeline_stage: "ready_for_approval"`.
2. `isIncluded()` returns true for `ready_for_approval` and `sequencing` unless notes contain `excluded_from_cohort`.

So discovery = select-all. Contradicts “pick who to pursue.”

**Evidence:** `web/app/api/sales/discover/route.ts` + `isIncluded` in `SalesTargetReview.tsx`.

**Intent gap:** Default = researching / unchecked; user opts in.

---

### RC-8 — Continue appears to do nothing (email gate + weak feedback)

**Symptom:** Click **Continue with selected** → no navigation, no obvious feedback.

**Cause (primary):** `continueWithSelected()` requires every included account to have a contact email (saved or draft with `@`). With 9 auto-included listicle “companies” and empty email fields, it hits:

```text
Add a contact email for each selected company before continuing.
```

and returns early. Error is small red mono text — easy to miss.

**Cause (secondary):**

- Even after emails, `POST /api/sales/sequences` can return 200 with `enrolled_count: 0` and `skipped[]` — UI may call `onContinue()` and land on empty Emails.
- Account PATCH via `Promise.all` does not check `res.ok` before sequence create.
- Typing email without Save can still work if draft is in React state, but user may not know that.

**Intent gap:** Block with a clear banner (“9 of 9 need emails — or uncheck companies”); never advance on zero enrollments; surface `skipped` reasons.

---

### RC-9 — Product narrative does not carry from Overview → Plan → Find

**Symptom:** User cannot see how the flow relates to Cal.com after leaving Overview.

**Cause (compound of RC-3, RC-4, RC-5):**

| Stage | Carries Cal.com? |
|-------|------------------|
| Overview dossier | Yes (when Hermes/Linkup work) |
| NL confirm | Partially (prefill from dossier) |
| Plan | No — generic template |
| Find | No — publisher entities; seller only in search query |

**Intent gap:** Offer + ICP + “why these companies” should stay visible on Plan and Find headers.

---

### RC-10 — Eval suite does not cover founder UX / discovery entity quality

**Symptom:** `npm run eval:sales` is green while the live founder path feels broken.

**Cause:** Evals cover brief/draft/reply/sequence **text fixtures**, not Linkup entity extraction, stepper UX, or Continue gating.

**Intent gap:** Add fixture or integration checks for: discovery rejects publisher domains; Continue blocked without email; plan includes offer snippet.

---

## 4. Symptom → root cause map (quick reference)

| User symptom | Primary RCs |
|--------------|-------------|
| Plan shows first; Confirm blank | RC-1, RC-2 |
| Confirm already ✓ | RC-2 |
| Plan doesn’t align with Cal.com | RC-3, RC-4, RC-9 |
| Find shows listicles / job boards | RC-5, RC-6 |
| Fit 0% / not actionable | RC-5, RC-6 |
| 9 pre-selected | RC-7 |
| Continue does nothing | RC-8 (often + RC-7 amplifying required emails) |
| Feels unrelated to seller company | RC-5, RC-9 |

---

## 5. Next steps (prioritized)

Do these in order. Prefer depth on Find entity model over more UI chrome.

### P0 — Unblock a trustworthy demo path

1. **Fix Confirm chrome (RC-1, RC-2)**  
   - Either render Confirm content when `step === "confirm"` (reuse SalesSetup with `existingConfig`)  
   - Or remove Confirm from the clickable stepper after setup (only Plan → Find → Emails → Needs you; edit via ⚙)  
   - Make ✓ reflect real completion (config exists / plan approved / sequences created / sent)

2. **Opt-in inclusion (RC-7)**  
   - Discover → `pipeline_stage: "researching"` (or equivalent)  
   - `isIncluded` only true after explicit include  
   - Continue default count starts at 0

3. **Continue feedback (RC-8)**  
   - Prominent error/banner when emails missing (count of missing)  
   - Do not call `onContinue` unless `enrolled_count > 0`  
   - Surface `skipped` reasons from sequences API  
   - Check PATCH/`res.ok` before sequence create

4. **Publisher / listicle filter (RC-5 — minimum viable)**  
   - Expand domain blocklist (wellfound, underdog, gogloby, medium, substack, etc.)  
   - Prefer results where extracted name looks like a company, not “Top N …” titles  
   - Cap and prefer higher fit; hide or demote Fit &lt; threshold with explanation

### P1 — Make Plan and Find product-aware

5. **Fix dossier → config mapping (RC-4)**  
   - Industries from dossier competitor/positioning/industry fields (not bucket labels)  
   - Titles from ICP bucket labels  
   - Geo from dossier or session when available  
   - Keep NL sentences as display; structured fields as source of truth for APIs

6. **Product-aware plan copy (RC-3, RC-9)**  
   - Template must include `offer` / company name in intro and motion rationale  
   - Show “For {company}: …” on Plan and Find headers  
   - Longer-term: Hermes sales-strategist skill for plan generation; keep scaffold as fallback

7. **Discovery entity model (RC-5 — real fix)**  
   - Do not use publisher domain as account domain  
   - Options (pick one and ship):  
     a. Query patterns that return company sites; extract company domains from content  
     b. Two-pass: find company names → resolve domains  
     c. Provider with firmographic company search (if keys available)  
   - Persist account.name = company, account.domain = company site  
   - Re-score only after entity is a company

### P2 — Harden trust and measurement

8. **Score honesty (RC-6)**  
   - Until entities are companies, show qualitative “weak evidence” instead of false precision  
   - Or hide Fit/Timing until contactability path exists

9. **Eval / verification (RC-10)**  
   - Add tests: blocklist rejects publisher domains; Continue without email stays put; plan JSON contains offer substring  
   - Update E2E guide with “bad Find = listicle domains” as a known fail signal  
   - Manual checklist item: Supabase `sales_accounts.domain` must not be wellfound/underdog for a pass

10. **Docs sync**  
    - Keep this RCA current when P0/P1 land  
    - Tick verification checklist items that become true

### Explicitly out of order (do not jump here first)

- Full Clay/Apollo enrichment  
- Marketing redesign  
- Perfect async Hermes strategist before Find entity fix  
- More ops tabs / dashboard chrome

---

## 6. Suggested verification after fixes

### Manual (cal.com or equivalent)

1. **+ new campaign** → domain → wait for dossier  
2. **Run outbound** → Confirm shows NL prefill (not blank)  
3. Confirm → Plan intro mentions seller product/offer  
4. Approve → Find → **Find companies**  
5. Assert: cards are company names + company domains (not listicle hosts)  
6. Include 1–2 only (default unchecked) → add **your** email → Continue  
7. Land on Emails with ≥1 draft → review → approve → send (hybrid)

### Automated

```bash
cd web && npm run eval:sales
```

Plus any new unit/integration tests added under P2.

### Data sniff test

```sql
-- domains should look like company sites, not media/listicle hosts
select name, domain, pipeline_stage from sales_accounts
where session_id = '<session>'
order by updated_at desc;
```

---

## 7. Key code pointers

| Concern | Location |
|---------|----------|
| Stepper / Confirm empty | `web/components/SalesPanel.tsx` |
| NL prefill mapping | `web/lib/salesDossierPrefill.ts` |
| Plan template | `web/app/api/sales/plan/route.ts` → `synthesizePlanFromConfig` |
| Discovery + scoring | `web/lib/salesResearch.ts` |
| Discover persist + stage | `web/app/api/sales/discover/route.ts` |
| Include / Continue / email UI | `web/components/SalesTargetReview.tsx` |
| Sequences enroll | `web/app/api/sales/sequences/route.ts` |
| Contacts upsert | `web/app/api/sales/contacts/route.ts` |
| Hybrid send / first-send UI | `web/components/SalesDraftQueue.tsx` |

---

## 8. Decision log

| Date | Decision |
|------|----------|
| 2026-07-19 | Founder UX UI pass shipped (stepper, NL confirm, hybrid send, Needs you) without fixing discovery entity model |
| 2026-07-19 | Live cal.com test exposed RC-1–RC-9; analysis only (no code change that day) |
| 2026-07-21 | This RCA logged as implementation contract for remediation; P0 = Confirm chrome + opt-in include + Continue feedback + publisher blocklist before strategist work |
| 2026-07-21 | Remediation shipped: Confirm removed from post-setup stepper; discover → `researching`; Continue banner + enrolled_count gate; publisher/listicle filters + content company-domain extract; product-aware plan + dossier industry mapping; eval gates added |

---

## 9. One-line summary for agents

**The founder UX shell is real; Plan is a template and Find is scoring Linkup publishers as companies. Fix entity model + inclusion defaults + Confirm/Continue feedback before polishing copy or adding more agents.**
