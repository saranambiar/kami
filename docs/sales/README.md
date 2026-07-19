# Kami Sales Vertical

This directory is the implementation contract for Kami's Sales vertical. It defines the intended behavior before code is written, so a future review can compare each shipped feature with the original scope.

## Product outcome

A user can create a bounded sales campaign from a company brief, revise its strategy, approve evidence-backed targets and drafts, send a real email, inspect the provider receipt and CRM history, handle an interested reply, and create a confirmed calendar invitation.

Kami is not a bulk outreach tool. Hermes coordinates research, planning, drafting, review, and conversation triage; server-side policy gates execute privileged provider actions.

## Delivery order

1. Merge `feature/marketing` into `dev`, correcting its missing migrations, inconsistent session identifiers, global CRM keys, and UI-only pause control.
2. Create `feature/sales` from the updated `dev`.
3. Ship a trustworthy Sales campaign/plan/approval foundation.
4. Add source-backed discovery, account tiering, and reviewable target selection.
5. Add approval-gated AgentMail execution and receipts.
6. Add reply triage, calendar booking, pipeline visibility, and notifications.
7. Validate the controlled email-to-meeting loop before adding higher-risk channels.

## Documentation map

- [Requirements and acceptance criteria](./requirements.md)
- [Brainstorm-derived requirements](./brainstorm-requirements.md)
- [Hermes agents, contracts, and tool boundaries](./agents-and-tools.md)
- [Sales operating model and playbooks](./operating-model.md)
- [Data model and state machines](./data-model.md)
- [Autonomy, compliance, and execution policy](./compliance-and-autonomy.md)
- [Provider and integration matrix](./provider-integration-matrix.md)
- [UI and information architecture](./ui-information-architecture.md)
- [Measurement, evaluations, and rollout](./measurement-and-evals.md)
- [Verification checklist (post-implementation)](./verification-checklist.md)

## Non-goals for MVP

- Bulk, identical, or unreviewed X DMs.
- Cold SMS or WhatsApp outreach.
- Automated LinkedIn outreach.
- Autonomous pricing, legal, security, contract, or custom-deliverable commitments.
- Claims, contacts, signals, or metrics that cannot be traced to a source or provider receipt.
