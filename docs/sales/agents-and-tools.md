# Hermes Agents, Contracts, and Tool Boundaries

## Control model

The persistent Hermes manager session is the `orchestrator`. It reads campaign state, delegates bounded work to specialists, reports results to the user, and requests approval at policy boundaries.

Specialists return structured contracts, not unbounded execution instructions. Server-side API routes validate those contracts and own all privileged credentials. Hermes agents do not receive unrestricted database, email, X, or Calendar credentials.

## Agents

### Sales Manager

- Converts user chat into a scoped campaign instruction.
- Delegates planning, research, qualification, drafting, review, triage, and booking.
- Explains tradeoffs, records approvals, creates escalations, and reports receipts/outcomes.
- Cannot bypass DNC, activity caps, reviewer verdicts, approval boundaries, or provider receipts.

### Sales Strategist

- Input: campaign brief, prior results, approved claims, policy.
- Output: versioned plan with motions, ICP tiers, channel rationale, risks, prerequisites, activity estimate, and approval scope.
- Tools: read campaign/profile/history; write a draft plan only.
- No discovery or send tool.

### Sales Researcher

- Input: approved query plan, ICP, exclusions, target tiers.
- Output: accounts, contacts, dated signals, source provenance, confidence, and verification status.
- Tools: read-only research provider adapters; controlled account/contact/signal write endpoint.
- Must never invent a person, title, email, company event, funding round, or activity signal.

### Sales Qualifier

- Input: verified research records.
- Output: fit, intent, contactability, priority scores; buying-group recommendations; tier/channel recommendation.
- Tools: read evidence and campaign policy; controlled score/buying-group write endpoint.
- A score must include factor-level explanation and source IDs.

### Outreach Agent

- Input: approved target, evidence, claims, channel, sequence rule, prior touchpoints.
- Output: a send-ready draft, never a direct send.
- Tools: read campaign/target/evidence/suppression/history; draft-write endpoint.
- Reuses `skills/signal_cold_email/SKILL.md` and the future email/X playbooks.

### Sales Reviewer

- Input: target, draft, evidence, policy, suppression state, prior touchpoints.
- Output: `approved`, `revise`, or `rejected` verdict with concrete reasons.
- Checks factual basis, recipient fit, one CTA, allowed claims, consent/channel policy, duplicate contacts, caps, and required footer/opt-out content.
- Tools: read-only state plus reviewer-verdict endpoint. No send tool.

### Conversation Manager

- Input: normalized inbound message, account/conversation history, approved FAQ/proof, policy.
- Output: reply classification, bounded draft response if allowed, task, escalation, or suppression action.
- Tools: read conversations/policy; write classification, draft, task, notification.
- Escalates pricing, legal, security, procurement, custom work, complaint, ambiguous consent, and material buying intent.

### Meeting Coordinator

- Input: qualified conversation and confirmed participant details.
- Output: meeting proposal or provider-backed invite result.
- Tools: read conversation/campaign, Calendar availability adapter, controlled event-create endpoint, meeting-state write endpoint.
- Never invents availability or marks a meeting booked before the provider receipt exists.

## Required contracts

Extend `contracts/contracts.ts` with structured equivalents for:

- `SalesPlan`, `ApprovalPolicy`, `Account`, `AccountSignal`, `BuyingGroupMember`, `LeadScore`
- `Sequence`, `SequenceEnrollment`, `Touchpoint`, `Conversation`, `ConversationMessage`
- `ReplyClassification`, `Meeting`, `Task`, `Notification`, `Approval`, `AuditEvent`

Every contract must contain campaign/workspace scope, actor/agent identity, timestamp, version where relevant, and references to the evidence or provider receipt that justified it.
