# Sales Measurement, Evaluations, and Rollout

## Metrics

Measure by campaign, segment, account tier, signal type, message angle, channel, and sequence step:

- researched and verified accounts/contacts;
- target approval rate and exclusion reasons;
- delivered, bounced, suppressed, and unsubscribed messages;
- positive, neutral, negative, and objection reply rates;
- qualified conversations, meetings proposed/invited/accepted, no-shows;
- pipeline stage progression, opportunities, and closed outcomes;
- reviewer revision/rejection rate and policy-block rate.

Do not treat email open rate as a primary optimization metric; privacy protections make it unreliable.

## Evaluation corpus

Fixture cases live in [`web/evals/sales/fixtures.json`](../../web/evals/sales/fixtures.json):

- **Briefs:** precise ICP, overbroad ICP, conflicting constraints (geo vs exclusions, cap vs volume).
- **Drafts:** good signal email, too long, missing CTA, unsafe `%` claim, missing subject.
- **Replies:** positive, objection, unsubscribe, not_now, meeting request, spam-ish short reply.
- **Sequences:** signal-backed 3-step builder output checked against reviewer rubric.
- **Policy scenarios:** pause blocks, missing draft approval, missing reviewer, first_send without approval — documented as manual Supabase/API checks in eval output.

Additional corpus items to add over time:

- good, stale, ambiguous, duplicated, and fabricated-looking research signals;
- qualified and unqualified account/contact examples;
- DNC, opt-out, bounce, duplicate, and activity-cap conditions (integration tests);
- confirmed, declined, rescheduled, and no-show meeting scenarios.

### Running automated evals

From the `web/` directory:

```bash
npm run eval:sales
```

Equivalent:

```bash
npx --yes tsx evals/sales/run.ts
```

The harness imports `reviewEmailDraft`, `classifyReplyContent`, and `buildEmailSequence`, asserts fixture expectations, prints pass/fail counts, and exits non-zero on failure. Policy scenarios that require Supabase are listed as **MANUAL** checks and do not fail CI.

End-to-end staging verification: [`verification-checklist.md`](./verification-checklist.md).

Multi-company live Hermes loop (API harness, not UI clicks): [`../evaluation-and-iteration-plan.md`](../evaluation-and-iteration-plan.md).

## Required evaluation checks

- Research output must cite real evidence and refuse unsupported details.
- Scores must expose their factors and evidence.
- Reviewer must reject unsupported claims, invalid recipients, DNC records, and missing approval.
- Server must block sends even if an agent proposes them when policy/suppression/cap conditions fail.
- Receipt verification must be required before a send appears complete.
- Reply triage must suppress opt-outs/complaints and escalate high-risk or commercially material cases.
- Calendar state must require a provider event/invitation before “booked.”

## Rollout sequence

1. Validate schema, scope, and policy checks locally with fixtures.
2. Validate research → plan → targets → drafts without provider sends.
3. Run a controlled AgentMail campaign with explicit target/draft approval.
4. Verify receipt, reply monitoring, CRM update, notification, and human escalation.
5. Verify Calendar invite creation and meeting-state updates.
6. Review cohort outcomes and provider-policy compliance before enabling any bounded autonomous follow-up.
7. Add X only after API/policy validation; defer WhatsApp/SMS and LinkedIn.
