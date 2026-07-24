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
- 2026-07-19/21: Founder UX UI shipped (NL confirm, stepper, hybrid send, Needs you). Live cal.com test: Plan is local template; Find treats Linkup **publisher domains** as companies (listicles); Confirm step blank after setup; Continue blocked by email gate with weak feedback.
- 2026-07-21: RCA remediation shipped — opt-in Find (`researching`), Continue banner + enrolled_count gate, publisher/listicle filters + content company-domain extract, product-aware plan (`salesPlan.ts`), dossier industry mapping, 21 evals green.

See [Sales documentation](../docs/sales/README.md).
