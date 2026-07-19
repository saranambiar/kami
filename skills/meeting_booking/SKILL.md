---
name: meeting_booking
description: Propose and book sales meetings via calendar provider after qualification. Use when a lead agrees to meet or requests a call.
---

# Meeting Booking

## Procedure

1. Confirm conversation status is `qualified` or classification is `positive` with explicit meeting interest.
2. Collect required fields: attendee name, email, timezone, preferred windows (if provided).
3. Query calendar availability via server adapter — never invent slots.
4. Propose 2–3 options; create `Meeting` with status `proposed`.
5. On user approval, create calendar event via provider; store `calendar_event_id` and `provider_receipt`.
6. Transition to `invited` only after provider confirms event creation.
7. Transition to `accepted` only after attendee/provider confirmation — poll or webhook.

## Output

`Meeting` record + `SalesNotification` + optional account stage → `meeting_proposed` / `invited` / `accepted`.

## Hard rules

- Never show "Booked" in UI until status is `invited` with receipt
- Calendar invite requires `calendar_invite` approval on first use per campaign
- No-show handling: status `no_show`, create follow-up task, do not auto-re-enroll sequence
