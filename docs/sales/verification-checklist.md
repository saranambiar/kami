# Sales Vertical — End-to-End Verification Checklist

Run this checklist before demo or controlled production sends. Each item maps to acceptance criteria in `docs/sales/*`.

## 1. Database and schema

- [ ] Apply `web/supabase/migrations/003_marketing.sql` on the Supabase project
- [ ] Apply `web/supabase/migrations/004_sales.sql` on the Supabase project
- [ ] Confirm RLS policies allow the app service role for sales tables (`sales_campaigns`, `sales_touchpoints`, `sales_execution_receipts`, `do_not_contact`, `sales_suppression_entries`)
- [ ] **Acceptance:** [data-model.md](./data-model.md) — campaign-scoped entities and immutable touchpoints/receipts exist

## 2. Environment and providers

- [ ] `LINKUP_API_KEY` set — research/discovery returns cited signals
- [ ] `AGENTMAIL_*` (or configured AgentMail MCP credentials) set — outbound email path works
- [ ] `GOOGLE_*` calendar credentials set — meeting invite creation works
- [ ] Supabase URL + service key configured for the web app
- [ ] **Acceptance:** [provider-integration-matrix.md](./provider-integration-matrix.md) — email + calendar MVP paths documented and reachable

## 3. Setup → plan → discovery → sequences

- [ ] **Setup:** Create sales campaign with ICP, offer, geo, exclusions, approved claims, sender, caps, autonomy policy
- [ ] **Plan:** Manager proposes motions/tiers; user approves plan version in UI or chat
- [ ] **Discover:** Run target discovery; every account card shows evidence URL, signal date, and score explanation
- [ ] **Approve targets:** User approves Tier 1 accounts/recipients before sequencing
- [ ] **Sequences:** System generates 3-step sequence (opener → value-add → close-the-loop); reviewer verdict stored on drafts
- [ ] **Acceptance:** [requirements.md](./requirements.md) — Setup and planning, Research and targeting, Outreach and review

## 4. Review → approve → controlled send

- [ ] Draft reviewer rejects unsupported claims, missing subject, length/CTA/opt-out violations (see `npm run eval:sales`)
- [ ] User approves draft touchpoint before send
- [ ] First send requires explicit `first_send` approval when `require_first_send_approval=true`
- [ ] Send only to approved, non-DNC recipients within daily cap
- [ ] Provider receipt persisted before touchpoint shows `sent`
- [ ] **Acceptance:** [compliance-and-autonomy.md](./compliance-and-autonomy.md) — Server-side send gate (all 8 checks)

## 5. Reply ingest → classification → escalation

- [ ] Inbound reply stored as immutable conversation message
- [ ] Classifier labels: positive, objection, not_now, unsubscribe, spam_risk, etc.
- [ ] Unsubscribe/complaint triggers suppression + escalation notification
- [ ] Positive/meeting language creates task or meeting-proposed state
- [ ] **Acceptance:** [requirements.md](./requirements.md) — Conversation and conversion

## 6. Meeting booking

- [ ] Calendar availability lookup works
- [ ] Calendar invite created only after user approval (`calendar_invite` scope)
- [ ] Pipeline shows `invited` only after provider returns event/invitation ID
- [ ] Failed calendar API does **not** mark meeting as booked
- [ ] **Acceptance:** [requirements.md](./requirements.md) — “Booked” not shown until provider event exists

## 7. Policy and suppression assertions

- [ ] **DNC blocks:** Recipient on `do_not_contact` → send returns 403
- [ ] **Pause blocks:** `autonomous_paused=true` → send returns 403
- [ ] **No sent without receipt:** Touchpoint cannot reach `sent` without `sales_execution_receipts` row
- [ ] **Cap blocks:** Daily send cap enforced server-side (429 when exceeded)
- [ ] **Acceptance:** [measurement-and-evals.md](./measurement-and-evals.md) — Required evaluation checks; [compliance-and-autonomy.md](./compliance-and-autonomy.md) — Never automate DNC bypass

## 8. Observability and audit

- [ ] Audit events recorded for plan approval, target approval, send, reply, meeting actions
- [ ] CRM pipeline stage transitions follow `PIPELINE_TRANSITIONS` (no illegal jumps)
- [ ] Kill switch / pause visible in UI and enforced on API
- [ ] **Acceptance:** [operating-model.md](./operating-model.md) — traceable automated actions; [ui-information-architecture.md](./ui-information-architecture.md) — escalation and meeting queues

## 9. Automated fixture evals (local, no Supabase)

From `web/`:

```bash
npm run eval:sales
```

- [ ] All automated brief/draft/reply/sequence fixtures pass
- [ ] Manual policy scenarios printed (pause, draft approval, reviewer, first_send) — verify via API in staging
- [ ] **Acceptance:** [measurement-and-evals.md](./measurement-and-evals.md) — Evaluation corpus and required checks

## Sign-off

| Check | Owner | Date | Notes |
|-------|-------|------|-------|
| Schema applied | | | |
| Env verified | | | |
| Controlled send + receipt | | | |
| Reply + meeting flow | | | |
| Policy blocks verified | | | |
| Fixture evals green | | | |
