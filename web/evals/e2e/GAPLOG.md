# E2E GAPLOG

Durable gap log for multi-company Kami E2E runs. Append-only; do not delete failing fixtures to go green.

| Date | Fixture | Class | Severity | Symptom | Status |
|------|---------|-------|----------|---------|--------|

<!-- Runner appends dated sections below. Fill Human RCA review after triage. -->

## 2026-07-23 · argus · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `c8a4cf1c-5ca9-481b-8b07-41e80d953a3b` |
| Run logs | `018b0402-b585-4963-8e15-4a03b2aa0d65`, `8129d8b7-971e-4ec5-8efe-c7a85b1206f1`, `cc42de12-9b06-4732-ba7e-6fec87a0d5f4`, `2bc02910-1f40-4435-ae86-6223aaa0babc`, `937eb088-a2e4-47d0-a512-613f79af02ae`, `edc12730-136b-415e-b4f3-a81a20eb3782`, `f5854791-381b-486b-b865-0649eecc352c` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, sales_segments, sales_plan, sales_discover

**Actual:** contact_find, sales_plan, sales_segments, dossier_persist, dossier_research, research, domain_validate

**Evidence:** GET /api/observability/runs

**Next action:** Raise `/api/sales/discover` `maxDuration` + log `sales_discover` even on partial/timeout paths; harden harness client timeout and/or re-collect accounts after fetch fail.

**Human RCA review:** Confirm **environment/timeout**, not migration. Discover largely succeeded server-side (20 accounts, 19 contacts, `contact_find` logged) but client got `fetch failed` at ~307s and `sales_discover` kind was never written (logged only at end of route). Identity/evidence/route gates passed. Fix timeout + end-of-route logging; re-run `argus`.

---

## 2026-07-23 · mirage · (pass)

No gaps. Marketing path: domain → research → dossier → distribution setup → opportunities. 7/7 steps.

## 2026-07-24 · argus · (pass — rerun)

Re-run PASS. 11/11 steps, 0 gaps. Prior discover timeout did not reproduce. Identity/evidence/route/observability (incl. `sales_discover`) all passed. Session artifact: `results/argus-2026-07-24T04-34-13-281Z.json`.

## 2026-07-24 · nike-in · (pass)

Marketing/D2C path PASS. 7/7 steps, 0 gaps. Artifact: `results/nike-in-2026-07-24T05-02-56-531Z.json`.

## 2026-07-24 · linear · (pass)

Sales path PASS. 11/11 steps, 0 gaps. Artifact: `results/linear-2026-07-24T05-06-04-485Z.json`.

## 2026-07-24 · browserbase · environment (FIXED) → pass

First runs: client `fetch failed` ~300s while server returned 200 at ~5.1min (undici headersTimeout). Fixed harness long Agent + discover early `sales_discover` log. **Rerun PASS** — `results/browserbase-2026-07-24T05-30-53-158Z.json`, 11/11.

## 2026-07-24 · notion · architecture (FIXED) → pass

Blocked on domain validate: `notion.so` → `notion.com`. Allowed same-brand apex redirects; evidence host becomes live TLD. **Rerun PASS** — `results/notion-2026-07-24T05-41-26-761Z.json`, 11/11 (Sales branch of mixed).

## 2026-07-24 · duolingo · data_research (FIXED) → pass

SPA shell had ~8 chars body text; meta cards held product language but apostrophe-regex truncated them. Enrich excerpt from og/twitter + fix meta parsing. **Rerun PASS** — `results/duolingo-2026-07-24T06-25-49-167Z.json`, 7/7 Marketing.





## 2026-07-24 · cal · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `61e88340-cd9b-4bad-8b3a-2be44aa611cc` |
| Run logs | `8abef736-0c80-49aa-9973-7b3c11f9349a`, `c36882ad-0814-4be8-afd7-146772100b06`, `b4804690-a4fb-4711-a94a-da5b0d6364e3` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Identity lock failed

**Expected:** Hints Cal.com, Cal; exclude (none)

**Actual:**     [] []

**Evidence:** session=61e88340-cd9b-4bad-8b3a-2be44aa611cc

**Next action:** Inspect dossier_research run log and domain_check; tighten identity prompt/validation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · cal · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `61e88340-cd9b-4bad-8b3a-2be44aa611cc` |
| Run logs | `8abef736-0c80-49aa-9973-7b3c11f9349a`, `c36882ad-0814-4be8-afd7-146772100b06`, `b4804690-a4fb-4711-a94a-da5b0d6364e3` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** schedul, booking, calendar

**Actual:**     [] []

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · cal · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `61e88340-cd9b-4bad-8b3a-2be44aa611cc` |
| Run logs | `8abef736-0c80-49aa-9973-7b3c11f9349a`, `c36882ad-0814-4be8-afd7-146772100b06`, `b4804690-a4fb-4711-a94a-da5b0d6364e3` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Wrong job route for fixture

**Expected:** find_customers

**Actual:** blocked

**Evidence:** harness branch selection + fixture job_primary

**Next action:** Align fixture routing or product job recommendation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · cal · data_research / prompt_skill (PRIMARY) — FIXED

Downstream gaps were **cascade** from dossier 422 / PLG confirm.

**Human RCA review:** Fixed (1) `validateDossier` now grounds scheduling claims against research + broader tokens; (2) harness seeds PLG example users like UI. **Rerun PASS** 2026-07-24 — `results/cal-2026-07-24T04-54-27-858Z.json`, 11/11 steps.


## 2026-07-24 · cal · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `a4c8da7d-6a58-4b49-aa37-8c34a2b4dab0` |
| Run logs | `fc9f61f9-4d2b-43fb-9575-6aab09f6d57d`, `94d516c6-ac79-44c8-b306-986b0bba3a1b`, `a459b62e-0544-4839-9cd4-72338bed50a7`, `90ad7d83-9f24-42dc-86b7-0de99a92c808`, `5e0f96c2-6715-4f45-8d76-3c7f3f646703` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** schedul, booking, calendar

**Actual:** cal.com cal.com sells customizable scheduling software for individuals, businesses taking calls, and developers building scheduling platforms. its differentiators, grounded in first-party evidence, are open-source roots, self-hosting and api extensibility, advanced routing and workflow automation, white-label branding, and enterprise controls like sso, scim, and rbac. it also positions directly ag

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · cal · data_research

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `a4c8da7d-6a58-4b49-aa37-8c34a2b4dab0` |
| Run logs | `fc9f61f9-4d2b-43fb-9575-6aab09f6d57d`, `94d516c6-ac79-44c8-b306-986b0bba3a1b`, `a459b62e-0544-4839-9cd4-72338bed50a7`, `90ad7d83-9f24-42dc-86b7-0de99a92c808`, `5e0f96c2-6715-4f45-8d76-3c7f3f646703` |
| Environment | local @ http://localhost:3000 |

**Symptom:** B2B Find returned zero accounts

**Expected:** named candidate companies with domains

**Actual:** empty

**Evidence:** sales_discover

**Next action:** Inspect segment candidates + discovery research quality

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · cal · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `a4c8da7d-6a58-4b49-aa37-8c34a2b4dab0` |
| Run logs | `fc9f61f9-4d2b-43fb-9575-6aab09f6d57d`, `94d516c6-ac79-44c8-b306-986b0bba3a1b`, `a459b62e-0544-4839-9cd4-72338bed50a7`, `90ad7d83-9f24-42dc-86b7-0de99a92c808`, `5e0f96c2-6715-4f45-8d76-3c7f3f646703` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, sales_segments, sales_plan, sales_discover

**Actual:** sales_segments, dossier_persist, dossier_research, domain_validate, research

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · cal · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `311dee1f-6427-4716-b620-2cff0055f3f4` |
| Run logs | `3fe16410-2dd0-4f95-9fb7-8725866f7a4e`, `d1d1700a-af39-4f1c-8d2b-b52f6c9b237a`, `60700107-7c7a-4dc5-89e0-d9666e6a0bb9` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Identity lock failed

**Expected:** Hints Cal.com, Cal; exclude (none)

**Actual:**     [] []

**Evidence:** session=311dee1f-6427-4716-b620-2cff0055f3f4

**Next action:** Inspect dossier_research run log and domain_check; tighten identity prompt/validation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · cal · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `311dee1f-6427-4716-b620-2cff0055f3f4` |
| Run logs | `3fe16410-2dd0-4f95-9fb7-8725866f7a4e`, `d1d1700a-af39-4f1c-8d2b-b52f6c9b237a`, `60700107-7c7a-4dc5-89e0-d9666e6a0bb9` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** schedul, booking, calendar

**Actual:**     [] []

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · cal · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `311dee1f-6427-4716-b620-2cff0055f3f4` |
| Run logs | `3fe16410-2dd0-4f95-9fb7-8725866f7a4e`, `d1d1700a-af39-4f1c-8d2b-b52f6c9b237a`, `60700107-7c7a-4dc5-89e0-d9666e6a0bb9` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Wrong job route for fixture

**Expected:** find_customers

**Actual:** blocked

**Evidence:** harness branch selection + fixture job_primary

**Next action:** Align fixture routing or product job recommendation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · cal · data_research

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `311dee1f-6427-4716-b620-2cff0055f3f4` |
| Run logs | `3fe16410-2dd0-4f95-9fb7-8725866f7a4e`, `d1d1700a-af39-4f1c-8d2b-b52f6c9b237a`, `60700107-7c7a-4dc5-89e0-d9666e6a0bb9` |
| Environment | local @ http://localhost:3000 |

**Symptom:** B2B Find returned zero accounts

**Expected:** named candidate companies with domains

**Actual:** empty

**Evidence:** sales_discover

**Next action:** Inspect segment candidates + discovery research quality

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · cal · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `311dee1f-6427-4716-b620-2cff0055f3f4` |
| Run logs | `3fe16410-2dd0-4f95-9fb7-8725866f7a4e`, `d1d1700a-af39-4f1c-8d2b-b52f6c9b237a`, `60700107-7c7a-4dc5-89e0-d9666e6a0bb9` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, sales_segments, sales_plan, sales_discover

**Actual:** dossier_research, research, domain_validate

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · browserbase · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `d17503c1-19b0-4c8c-8a23-a90c6e13da6d` |
| Run logs | `f937f1b8-a344-4559-bb0e-e94f32ab0b4f`, `a3166f60-fae3-4247-bc08-b37bc78d1744`, `6b0cca1d-0143-4bbc-9274-7e86130eaa64`, `dae16576-98b4-42d1-acc0-90d7dc69b21b`, `fa518d78-2a1b-4083-b305-6bebe8726d37`, `8d806087-3251-4cee-81f4-993e8f8f86e0`, `3fd30b57-4858-4652-9ba6-790a7b44516a` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, sales_segments, sales_plan, sales_discover

**Actual:** contact_find, sales_plan, sales_segments, dossier_persist, dossier_research, domain_validate, research

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · browserbase · data_research

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `3781f7f9-73bd-4028-b6f6-948b1802203e` |
| Run logs | `7d6876da-915b-472b-8514-e47129332de1`, `0f28c446-3fa9-439d-8516-971e5ea5337a`, `59b67389-5814-4437-b0b6-0b81fbe0c9f5`, `add1444e-2c3e-4fb6-8598-5d97dfbe7e97`, `d755e52f-eb2b-447d-a330-821d36048500`, `acf05580-16de-44fa-9c09-2f1e6bd08357`, `858c4bf2-ed9b-428c-9b15-663d5fc931b2`, `c825ae1c-4e5c-4ae6-bd5c-245686fda467` |
| Environment | local @ http://localhost:3000 |

**Symptom:** B2B Find returned zero accounts

**Expected:** named candidate companies with domains

**Actual:** empty

**Evidence:** sales_discover

**Next action:** Inspect segment candidates + discovery research quality

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · browserbase · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `3781f7f9-73bd-4028-b6f6-948b1802203e` |
| Run logs | `7d6876da-915b-472b-8514-e47129332de1`, `0f28c446-3fa9-439d-8516-971e5ea5337a`, `59b67389-5814-4437-b0b6-0b81fbe0c9f5`, `add1444e-2c3e-4fb6-8598-5d97dfbe7e97`, `d755e52f-eb2b-447d-a330-821d36048500`, `acf05580-16de-44fa-9c09-2f1e6bd08357`, `858c4bf2-ed9b-428c-9b15-663d5fc931b2`, `c825ae1c-4e5c-4ae6-bd5c-245686fda467` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, sales_segments, sales_plan, sales_discover

**Actual:** contact_find, contact_find, sales_plan, sales_segments, dossier_persist, dossier_research, domain_validate, research

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · notion · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Identity lock failed

**Expected:** Hints Notion; exclude only note-taking, only enterprise

**Actual:**     [] []

**Evidence:** session=null

**Next action:** Inspect dossier_research run log and domain_check; tighten identity prompt/validation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · notion · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** workspace, docs

**Actual:**     [] []

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · notion · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Wrong job route for fixture

**Expected:** mixed

**Actual:** unknown

**Evidence:** harness branch selection + fixture job_primary

**Next action:** Align fixture routing or product job recommendation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · notion · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist

**Actual:** (none)

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · duolingo · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Identity lock failed

**Expected:** Hints Duolingo; exclude paid school SaaS only

**Actual:**     [] []

**Evidence:** session=null

**Next action:** Inspect dossier_research run log and domain_check; tighten identity prompt/validation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · duolingo · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** language, learn

**Actual:**     [] []

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · duolingo · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Wrong job route for fixture

**Expected:** create_distribution

**Actual:** unknown

**Evidence:** harness branch selection + fixture job_primary

**Next action:** Align fixture routing or product job recommendation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · duolingo · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** PLG/D2C honesty failed

**Expected:** create_distribution / marketing path

**Actual:** unknown

**Evidence:** accounts=0

**Next action:** Force marketing branch for sales_default_invalid fixtures

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · duolingo · data_research

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** No distribution opportunities returned

**Expected:** >=1 opportunity with URL/why_now/draft

**Actual:** 0

**Evidence:** distribution_opportunities

**Next action:** Check Hermes distribution research + migration 009

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · duolingo · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, distribution_research, distribution_opportunities

**Actual:** (none)

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · arc · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Identity lock failed

**Expected:** Hints Arc, Browser Company; exclude enterprise license for Arc, Dia security attributed to Arc

**Actual:**     [] []

**Evidence:** session=null

**Next action:** Inspect dossier_research run log and domain_check; tighten identity prompt/validation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** browser

**Actual:**     [] []

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Wrong job route for fixture

**Expected:** create_distribution

**Actual:** unknown

**Evidence:** harness branch selection + fixture job_primary

**Next action:** Align fixture routing or product job recommendation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** PLG/D2C honesty failed

**Expected:** create_distribution / marketing path

**Actual:** unknown

**Evidence:** accounts=0

**Next action:** Force marketing branch for sales_default_invalid fixtures

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · data_research

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** No distribution opportunities returned

**Expected:** >=1 opportunity with URL/why_now/draft

**Actual:** 0

**Evidence:** distribution_opportunities

**Next action:** Check Hermes distribution research + migration 009

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, distribution_research, distribution_opportunities

**Actual:** (none)

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · supabase · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `efc86d85-c195-4739-a7ad-c7aad1fa91a1` |
| Run logs | `df864255-f156-4ca5-8b9f-f03e3f496356`, `bdea00fe-06d2-401d-83b9-799408c70924`, `e9bf46e6-0b38-489f-865e-fd5f26067a45`, `675774e6-92c3-433e-a630-d094d0e57d27`, `3e24c938-f463-42e4-881c-3ba8f61a0e4a`, `7b7dbe16-bf54-41d3-9163-f19b7d35ba2a`, `b36aaf0b-f778-4ce3-8b93-c50436f0be64`, `34251574-e323-47b9-b6aa-27e7dcd2a3cf` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** postgres, firebase, open source

**Actual:** supabase supabase sells a postgres development platform that bundles database, authentication, instant apis, edge functions, realtime, storage, and vector embeddings into one platform. its differentiation, based on the site evidence, is that teams can start quickly with a full backend stack while staying on portable postgres and scaling toward production. the message consistently contrasts fast pr

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · supabase · data_research

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `efc86d85-c195-4739-a7ad-c7aad1fa91a1` |
| Run logs | `df864255-f156-4ca5-8b9f-f03e3f496356`, `bdea00fe-06d2-401d-83b9-799408c70924`, `e9bf46e6-0b38-489f-865e-fd5f26067a45`, `675774e6-92c3-433e-a630-d094d0e57d27`, `3e24c938-f463-42e4-881c-3ba8f61a0e4a`, `7b7dbe16-bf54-41d3-9163-f19b7d35ba2a`, `b36aaf0b-f778-4ce3-8b93-c50436f0be64`, `34251574-e323-47b9-b6aa-27e7dcd2a3cf` |
| Environment | local @ http://localhost:3000 |

**Symptom:** B2B Find returned zero accounts

**Expected:** named candidate companies with domains

**Actual:** empty

**Evidence:** sales_discover

**Next action:** Inspect segment candidates + discovery research quality

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · supabase · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `efc86d85-c195-4739-a7ad-c7aad1fa91a1` |
| Run logs | `df864255-f156-4ca5-8b9f-f03e3f496356`, `bdea00fe-06d2-401d-83b9-799408c70924`, `e9bf46e6-0b38-489f-865e-fd5f26067a45`, `675774e6-92c3-433e-a630-d094d0e57d27`, `3e24c938-f463-42e4-881c-3ba8f61a0e4a`, `7b7dbe16-bf54-41d3-9163-f19b7d35ba2a`, `b36aaf0b-f778-4ce3-8b93-c50436f0be64`, `34251574-e323-47b9-b6aa-27e7dcd2a3cf` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, sales_segments, sales_plan, sales_discover

**Actual:** contact_find, contact_find, sales_plan, sales_segments, dossier_persist, dossier_research, research, domain_validate

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · arc · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Identity lock failed

**Expected:** Hints Arc, Browser Company; exclude enterprise license for Arc, Dia security attributed to Arc

**Actual:**     [] []

**Evidence:** session=null

**Next action:** Inspect dossier_research run log and domain_check; tighten identity prompt/validation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** browser

**Actual:**     [] []

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Wrong job route for fixture

**Expected:** create_distribution

**Actual:** unknown

**Evidence:** harness branch selection + fixture job_primary

**Next action:** Align fixture routing or product job recommendation

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** PLG/D2C honesty failed

**Expected:** create_distribution / marketing path

**Actual:** unknown

**Evidence:** accounts=0

**Next action:** Force marketing branch for sales_default_invalid fixtures

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · data_research

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** No distribution opportunities returned

**Expected:** >=1 opportunity with URL/why_now/draft

**Actual:** 0

**Evidence:** distribution_opportunities

**Next action:** Check Hermes distribution research + migration 009

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `n/a` |
| Run logs | n/a |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, distribution_research, distribution_opportunities

**Actual:** (none)

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · supabase · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `75923543-f099-4b65-bddc-93d344b26214` |
| Run logs | `55a75831-db6e-4bb6-81e9-ececf455ff22`, `5c8d5fe0-1bff-4ac7-97b0-48488db1d79e`, `0f403af6-f3f3-410e-a8a0-eae668d551f4`, `0f6ad45c-7101-4646-b971-370e1675645b`, `d290d1e2-1a25-48e9-a12d-2796ea299b7d`, `8294d9a5-d830-460e-9af0-8dce75f1b9c3` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** postgres, firebase, open source

**Actual:** supabase supabase sells a postgres development platform that bundles a managed postgres database with authentication, instant apis, realtime, edge functions, storage, and vector embeddings. its differentiation, based on the site evidence, is letting developers start quickly, stay close to open postgres primitives, and scale production applications without assembling a fragmented backend stack. pos

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · supabase · data_research

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `75923543-f099-4b65-bddc-93d344b26214` |
| Run logs | `55a75831-db6e-4bb6-81e9-ececf455ff22`, `5c8d5fe0-1bff-4ac7-97b0-48488db1d79e`, `0f403af6-f3f3-410e-a8a0-eae668d551f4`, `0f6ad45c-7101-4646-b971-370e1675645b`, `d290d1e2-1a25-48e9-a12d-2796ea299b7d`, `8294d9a5-d830-460e-9af0-8dce75f1b9c3` |
| Environment | local @ http://localhost:3000 |

**Symptom:** B2B Find returned zero accounts

**Expected:** named candidate companies with domains

**Actual:** empty

**Evidence:** sales_discover

**Next action:** Inspect segment candidates + discovery research quality

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · supabase · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `75923543-f099-4b65-bddc-93d344b26214` |
| Run logs | `55a75831-db6e-4bb6-81e9-ececf455ff22`, `5c8d5fe0-1bff-4ac7-97b0-48488db1d79e`, `0f403af6-f3f3-410e-a8a0-eae668d551f4`, `0f6ad45c-7101-4646-b971-370e1675645b`, `d290d1e2-1a25-48e9-a12d-2796ea299b7d`, `8294d9a5-d830-460e-9af0-8dce75f1b9c3` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, sales_segments, sales_plan, sales_discover

**Actual:** sales_plan, sales_segments, dossier_persist, dossier_research, research, domain_validate

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · arc · data_research

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `06df9b48-152e-4ecd-83d8-9f47e3f5f02a` |
| Run logs | `d34616d5-5149-4a6b-9fab-2fef95981205`, `6dfff70f-8bdc-449e-abab-30efa7979951`, `d9539347-4da9-4640-8303-abbc8c2521a4` |
| Environment | local @ http://localhost:3000 |

**Symptom:** No distribution opportunities returned

**Expected:** >=1 opportunity with URL/why_now/draft

**Actual:** 0

**Evidence:** distribution_opportunities

**Next action:** Check Hermes distribution research + migration 009

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · arc · environment

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `06df9b48-152e-4ecd-83d8-9f47e3f5f02a` |
| Run logs | `d34616d5-5149-4a6b-9fab-2fef95981205`, `6dfff70f-8bdc-449e-abab-30efa7979951`, `d9539347-4da9-4640-8303-abbc8c2521a4` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Missing required agent_run_logs kinds

**Expected:** dossier_research, dossier_persist, distribution_research, distribution_opportunities

**Actual:** dossier_research, research, domain_validate

**Evidence:** GET /api/observability/runs

**Next action:** Apply migration 010; ensure kamiSessionId passed to Hermes calls

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · supabase · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `c5de7a2a-8cf1-49f5-91e9-89e113f2ea35` |
| Run logs | `6afa41ff-82c0-44c5-83bd-15eecb7de10f`, `d5e02afe-2e6d-43e4-8aef-64893331499d`, `96a26663-cf7f-44fa-b4c4-f39c481b64cb`, `516269fb-6690-412b-89f2-f20b2d9bb674`, `31e700a6-7ed3-4236-a8ed-5adea43d975b`, `d865416e-b9dc-4091-ab43-ceb9e83f83e2`, `0b678bed-2f0b-4c6d-9280-75261fbba1c5`, `311c865f-673b-4d15-bb20-ddbc48c957bf`, `a457adee-8291-4769-980e-051268849a1b` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** postgres, firebase, open source

**Actual:** supabase supabase sells a postgres development platform that bundles a full postgres database with authentication, instant apis, edge functions, realtime, storage, and vector embeddings. its evidence-backed differentiators are open-source positioning, postgres portability, fast onboarding for builders, and the ability to start quickly while scaling to production workloads and larger user bases. op

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · supabase · patch

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `c5de7a2a-8cf1-49f5-91e9-89e113f2ea35` |
| Run logs | `6afa41ff-82c0-44c5-83bd-15eecb7de10f`, `d5e02afe-2e6d-43e4-8aef-64893331499d`, `96a26663-cf7f-44fa-b4c4-f39c481b64cb`, `516269fb-6690-412b-89f2-f20b2d9bb674`, `31e700a6-7ed3-4236-a8ed-5adea43d975b`, `d865416e-b9dc-4091-ab43-ceb9e83f83e2`, `0b678bed-2f0b-4c6d-9280-75261fbba1c5`, `311c865f-673b-4d15-bb20-ddbc48c957bf`, `a457adee-8291-4769-980e-051268849a1b` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Non-buyer / role inboxes present among discovered contacts (diagnostic)

**Expected:** buyer-reachable contacts, or role_inbox marked non-sendable

**Actual:** hello@metabase.com, hello@glideapps.com, support@ghost.org, hello@plausible.io, support@cal.com, privacy@clerk.com, help@plain.com, hello@linear.app

**Evidence:** sales accounts/contacts

**Next action:** Confirm role_inbox/non_buyer_inbox mapping + sequence gates reject them

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · arc · architecture

| Field | Value |
|-------|-------|
| Severity | blocker |
| Status | open |
| Session | `1525cdf7-c638-44d2-ab40-ee4d40ce3f36` |
| Run logs | `48d94249-af04-4524-8891-de35ce048f46`, `e5c9da78-6176-493e-a517-1c8688ef7429`, `c6a88202-9f0f-4e2e-ac85-e90815f19bff`, `a1bd3211-452e-495f-b80a-3dd5b155dd3f`, `14f9d5b4-c188-4331-be7e-14a672602708`, `c7c7ded0-10d4-4258-a034-f89f30adde4a` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Marketing opportunities are scaffold/fallback while Hermes distribution_research was available

**Expected:** Persisted Hermes opportunities with real source_url + thread-tied why_now/draft

**Actual:** grounded=0; scaffoldMarked=true; log_status=fallback

**Evidence:** distribution_opportunities + distribution_research logs

**Next action:** Fix parseLastJsonBlock / opportunity contract so research evidence persists; do not green scaffold when Hermes ran

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_


## 2026-07-24 · supabase · prompt_skill

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `6c8c3c13-80bf-4555-baef-f184b5b627d2` |
| Run logs | `f02cf375-b97e-4f1c-9ae2-9ebaf7c569b0`, `aa7c7889-6a56-4d88-9948-2acf8129199d`, `11418477-0778-47c0-8330-bd021d0a0a68`, `005ad132-e89a-4298-bc25-10b456f8c394`, `0fb8a2ef-c033-4849-b1f9-653a40971c19`, `d5e91fab-f7c4-4302-b8de-61581e2509d0`, `2e4d48c8-715b-475a-974e-e3fbae53a887`, `c4a39d06-bbd4-4f70-aa54-2fd14445977a` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Dossier missing expected product language

**Expected:** postgres, firebase, open source

**Actual:** supabase supabase sells a postgres development platform that gives teams a full postgres database plus authentication, data apis, edge functions, realtime, storage, and vector embeddings. its differentiation, based on first-party evidence, is open-source positioning, postgres portability, fast onboarding for builders, and the promise that teams can start quickly and scale to millions on the same p

**Evidence:** brand_profiles.raw_dossier

**Next action:** Improve onboarding prompt / research quality for this domain

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

## 2026-07-24 · supabase · patch

| Field | Value |
|-------|-------|
| Severity | major |
| Status | open |
| Session | `6c8c3c13-80bf-4555-baef-f184b5b627d2` |
| Run logs | `f02cf375-b97e-4f1c-9ae2-9ebaf7c569b0`, `aa7c7889-6a56-4d88-9948-2acf8129199d`, `11418477-0778-47c0-8330-bd021d0a0a68`, `005ad132-e89a-4298-bc25-10b456f8c394`, `0fb8a2ef-c033-4849-b1f9-653a40971c19`, `d5e91fab-f7c4-4302-b8de-61581e2509d0`, `2e4d48c8-715b-475a-974e-e3fbae53a887`, `c4a39d06-bbd4-4f70-aa54-2fd14445977a` |
| Environment | local @ http://localhost:3000 |

**Symptom:** Non-buyer / role inboxes present among discovered contacts (diagnostic)

**Expected:** buyer-reachable contacts, or role_inbox marked non-sendable

**Actual:** help@remote.com, first@usepylon.com, hello@linear.app, help@airtop.ai, privacy@cognition.ai

**Evidence:** sales accounts/contacts

**Next action:** Confirm role_inbox/non_buyer_inbox mapping + sequence gates reject them

**Human RCA review:** _(fill after triage — confirm class / wontfix reason)_

