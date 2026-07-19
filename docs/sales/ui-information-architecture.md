# Sales UI and Information Architecture

> Canonical product loops: [docs/product-loops.md](../product-loops.md)

## Founder journey (default)

1. **Overview** — dossier + **Run outbound** CTA  
2. **Confirm** — NL who / what / how many (prefilled from dossier) + Advanced  
3. **Plan** — plain-English motions → Approve  
4. **Find** — explicit Find companies → include + add email → Continue  
5. **Emails** — review → approve → hybrid send (1–3, then batch)  
6. **Needs you** — replies, meetings, tasks  
7. **More** (after first send) — Pipeline, Inbox, Meetings, Tasks  

One Hanko-red primary CTA per step. No six equal ops tabs on first run.

## Design constraints

Follow `DESIGN.md`: cream paper, black ink, Hanko-red primary action, kraft cards, moss success states, sharp edges, crease dividers, Domine/Source Sans 3/Space Mono hierarchy. Preserve the Marketing tab’s desktop operations-desk pattern but make every Sales state visibly evidence- and approval-driven.

## Sales workspace

### Setup and plan

- Sales setup captures campaign constraints and channel policy.
- Plan view presents recommended motion, target tiers, channel selection, estimated activity, risks, prerequisites, and approval scope.
- Manager chat lets users revise constraints; changes create a new plan version.
- Primary action: approve/revise the plan.

### Targeting workspace

- Account list displays tier, score, signal, recommended contact/channel, verification state, and inclusion decision.
- Account drawer exposes sources, scoring factors, buying group, historical touchpoints, approvals, tasks, and conversation.
- Primary action: approve selected targets/sequence.

### Pipeline

- Kanban: researching, ready for approval, sequencing, sent, engaged, qualified, meeting proposed, invited, accepted, closed won/lost, suppressed.
- Table view: sorting/filtering by tier, score, channel, owner, date, stage, and next action.
- Timeline: sequence execution and future follow-ups.
- Calendar: proposed and confirmed meetings.

### Inbox and meeting queue

- Inbox prioritizes decisions: interested reply, meeting request, objection, policy issue, opt-out/complaint, stale follow-up.
- Conversation detail shows immutable thread, AI classification/rationale, suggested draft, required approval, and account context.
- Meeting queue distinguishes proposal, invitation, RSVP, and completed/no-show states.

### Agent task board and observability

- Show research, review, follow-up, and escalation tasks with owner/agent, status, evidence, and result.
- Link all visible actions to CRM timeline receipts and existing `/board` / `/ledger` where cross-vertical visibility is useful.

## Responsive behavior

Desktop: rail → pipeline/targeting center → account/conversation detail.

Mobile: ordered unfold from urgent queue → pipeline → account/conversation/approval detail. No critical approval should be hidden behind a hover or ephemeral toast.
