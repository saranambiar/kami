# Brainstorm-Derived Sales Requirements

Source: `references/kami-brainstorm.pdf`, reviewed page by page on 2026-07-18.

## Sales requirements retained for implementation

- Kami becomes a workspace with Sales, Marketing, Engagement, and Analytics pillars; Sales is a section view rather than an isolated one-off flow.
- Sales supports X outreach, email outreach, and later Instagram/LinkedIn capability.
- Lead records need contact, handle, platform, channel, stage, last touch/action, response context, and sentiment.
- Prospect stages include contacted, replied, meeting, and closed; the implementation expands these into explicit research, approval, sequencing, and suppression states.
- Outreach monitoring should capture replies and relevant per-channel engagement signals.
- X uses personalized replies/posts for ICP buckets and a human-approved connect → value → ask DM sequence.
- Email evolves from one-off send into an intro → day-3 follow-up → day-7 close-the-loop sequence, with terminal-event stops.
- Meeting language should lead to a Calendar suggestion/invite and a CRM update, but only after participant/slot confirmation.
- CRM needs Notion-style table, Kanban, timeline, and calendar views, plus AI suggested next actions and automatic interaction logging.
- Reply/engagement signals update status and create agent/user actions; negative sentiment pauses the sequence for review.

## Priorities retained

1. X end-to-end, monitoring, and CRM were the brainstorm’s buildathon focus.
2. Instagram/Reels, then email sequences, unified CRM, and Calendar follow.
3. Desktop/Tauri and LinkedIn are later-stage work.

## Adjustments made by the Sales plan

- Email is implemented before X DMs because AgentMail send/reply monitoring is the existing real execution surface.
- X DMs remain low-volume and human approved because automated unsolicited DM activity has platform/reputational risk.
- SMS/WhatsApp are explicitly deferred from cold sales because they require opt-in and provider registration/template controls.
- The brainstorm’s automatic CRM update goal is retained, but state transitions are server-validated and receipt/evidence-backed rather than a free-form agent update.
