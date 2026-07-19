# Sales Requirements and Acceptance Criteria

## User journey

1. The user enters company/domain, offer, ICP, target geography, deal range, exclusions, approved claims, sender identity, activity caps, and autonomy preferences.
2. Kami proposes one or two sales motions, target tiers, channel rationale, prerequisites, risks, estimated activity, and approval boundaries.
3. The user iterates on the plan in manager chat and approves a version.
4. Kami discovers accounts and contacts with dated source evidence, explains their scores, and maps a buying group for high-value accounts.
5. The user approves target accounts, recipients, sequences, and required drafts.
6. Kami executes only permitted sends, stores provider receipts, and updates the CRM/pipeline.
7. Kami monitors replies, creates tasks, escalates meaningful decisions, and coordinates confirmed meeting booking.
8. Kami summarizes performance and recommends a strategy change only with cohort-level evidence.

## Required features

### Setup and planning

- Sales campaign setup stores ICP, offer, target quantity, geography, exclusions, approved claims, sender, budget/activity caps, and autonomy policy.
- The plan is versioned and can be revised without losing prior decisions.
- A plan contains target tiers, recommended motion, selected channels, message angle, projected volume, risks, prerequisites, metrics, and explicit authorization boundaries.

### Research and targeting

- Every account/contact/signal includes provider, URL, capture time, confidence, and campaign scope.
- Scores expose fit, intent, contactability, and priority factors rather than one opaque number.
- Tier 1 accounts support buying-group roles: champion, economic buyer, evaluator, blocker, and sponsor where evidence exists.
- No discovered record may be treated as sendable until its channel/contact eligibility is verified.

### Outreach and review

- Drafts include one CTA, the source-backed personalization used, approved claims, channel, sender, recipient, policy version, reviewer verdict, and approval status.
- Email sequences are conditional: opener, differentiated value-add follow-up, close-the-loop. They stop on reply, bounce, unsubscribe, DNC, or meeting.
- AgentMail send requires approved target/draft, DNC pass, valid sender, reviewer pass, activity-cap pass, policy pass, and provider receipt.

### Conversation and conversion

- Incoming messages are stored as immutable conversation history and classified as positive, objection, information request, referral, not-now, unsubscribe, negative, or spam-risk.
- Positive interest, pricing/legal/security requests, unclear consent, complaints, and meeting requests create user-visible notifications.
- Calendar states distinguish proposed, held, invited, accepted, declined, rescheduled, no-show, and completed. “Booked” is not shown until the provider event/invitation exists.

### Operational visibility

- Sales provides plan approval, account pipeline, account drawer, message history, inbox/escalation queue, meeting queue, task board, and manager chat.
- CRM stages: researching, ready_for_approval, sequencing, sent, engaged, qualified, meeting_proposed, invited, accepted, closed_won, closed_lost, invalid, suppressed.
- Every automated or provider action is traceable through an immutable audit event and/or provider receipt.

## MVP acceptance checks

- [ ] A user can approve a campaign plan and selected Tier 1 accounts.
- [ ] Every target card links to its evidence and score explanation.
- [ ] An approved, reviewed email is delivered through AgentMail with a receipt recorded in CRM.
- [ ] An inbound reply changes the correct pipeline state, is classified, and creates the required notification/task.
- [ ] A confirmed meeting creates a Calendar event and stores its invitation state.
- [ ] A DNC, opt-out, bounce, cap, or policy failure blocks sending server-side.
