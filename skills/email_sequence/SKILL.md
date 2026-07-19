---
name: email_sequence
description: Design and enroll conditional email sequences (opener, value-add follow-up, close-the-loop). Use when activating outreach for approved targets.
---

# Email Sequence Design

## Procedure

1. Confirm target is approved, scored, not suppressed, email verification `valid`/`safe_to_send`.
2. Define sequence (max 3 steps MVP):
   - Step 1 (day 0): signal-based opener — reuse `signal_cold_email` skill
   - Step 2 (day 3): new angle or proof point, not a bump
   - Step 3 (day 7): close-the-loop, single CTA
3. Set stop conditions: reply, bounce, unsubscribe, DNC, meeting_created.
4. Create `Sequence` record and `SequenceEnrollment` with status `awaiting_approval` until user approves cohort.
5. Each step produces a `Draft` — never auto-send step 1 without reviewer + policy pass.

## Output

`Sequence`, `SequenceEnrollment`, and per-step `Draft` references.

## Hard rules

- Respect `daily_send_cap` and `max_sends_per_day` from campaign
- Follow-ups must add NEW value — reference `skills/signal_cold_email/SKILL.md` cadence
- Stop sequence immediately on any terminal enrollment status
- First send requires explicit approval when `require_first_send_approval` is true
