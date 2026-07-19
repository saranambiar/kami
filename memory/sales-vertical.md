# Sales Vertical Research and Plan

- 2026-07-18: Added `docs/sales/` as the implementation contract for a Hermes-led Sales vertical.
- 2026-07-18: Implemented on branch `feature/sales` (Marketing merged + base fixes first).
- Current real foundation: Hermes manager gateway, Linkup research, AgentMail send/reply monitoring, X post/monitoring, Supabase CRM/DNC, board, and ledger.
- Sales MVP order: plan/approval → source-backed targets → reviewed AgentMail send/receipt → reply triage/escalation → confirmed Calendar booking.
- Hermes coordinates; server-side routes enforce policy and own privileged provider credentials.
- Marketing UI patterns reused; marketing tables namespaced (`marketing_conversations`); kill switch persisted; CRM uniqueness session-scoped.
- Cold SMS/WhatsApp and automated LinkedIn deferred; X DMs individual/human-approved only.
- Evals: `cd web && npm run eval:sales` — 15 automated checks green.
- **User action required before live E2E:** apply `003_marketing.sql` + `004_sales.sql` in Supabase; ensure `LINKUP_API_KEY`, AgentMail, and Google Calendar env vars for real send/invite verification.

See [Sales documentation](../docs/sales/README.md).
