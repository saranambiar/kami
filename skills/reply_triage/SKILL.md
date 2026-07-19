---
name: reply_triage
description: Classify inbound sales replies and route to auto-response, task, escalation, or suppression. Use when a new inbound message arrives.
---

# Reply Triage

## Procedure

1. Load full conversation thread and account/contact context.
2. Classify message into one label:
   - `positive` — interest, wants to learn more, agrees to call
   - `objection` — not fit, timing, competitor, budget pushback
   - `information_request` — asks for deck, pricing, security docs
   - `referral` — points to another contact
   - `not_now` — polite deferral with future potential
   - `unsubscribe` — explicit opt-out
   - `negative` — hostile or clear rejection
   - `spam_risk` — automated or suspicious
3. Set `escalation_required` for: positive with buying intent, pricing/legal/security, complaints, unclear consent.
4. Update account `pipeline_stage`: `engaged` on any human reply; `qualified` on positive; `suppressed` on unsubscribe.
5. Create `SalesTask` or `SalesNotification` per escalation rules.
6. Optional bounded draft only for simple `information_request` with approved FAQ content.

## Output

`ReplyClassification` + side effects (task, notification, suppression).

## Hard rules

- Unsubscribe → suppression entry + cancel enrollments — no further outreach
- Never auto-send pricing, contracts, or custom commitments
- Ambiguous consent → escalate, do not assume opt-in
