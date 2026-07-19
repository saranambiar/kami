---
name: suppression_and_consent
description: Enforce DNC, opt-out, bounce suppression, and channel consent before any outreach. Use before send, on reply triage, and on policy checks.
---

# Suppression and Consent

## Procedure

1. Before any send, check:
   - Global `do_not_contact` (email, domain, @handle)
   - Session `sales_suppression_entries`
   - Contact `do_not_contact` flag
   - Enrollment terminal states (unsubscribed, bounced, suppressed)
2. On unsubscribe/complaint inbound:
   - Add suppression entry with reason, source, actor
   - Cancel active sequence enrollments
   - Set account `pipeline_stage: suppressed` if applicable
3. On hard bounce from provider receipt:
   - Suppress email identifier
   - Mark enrollment `bounced`
4. Channel consent:
   - Email: verified address + not on any suppression list
   - X: individual researched interaction only; each DM requires reviewer approval in MVP

## Output

Pass/fail for send gate; suppression records when blocking.

## Hard rules

- Server-side gate is authoritative — agent checks are advisory only
- Never remove suppression without explicit user action
- Log every suppression decision as `AuditEvent`
