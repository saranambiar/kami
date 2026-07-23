# Observability (2026-07-23)

- Canonical product audit table: `agent_run_logs` (migration `010_agent_run_logs.sql`).
- Auto-logged at chokepoints:
  - `hermesChatOnce` → `source=hermes_once` (plan, segments, revise, contacts, distribution)
  - `/api/chat` streams → `source=hermes_stream` (dossier research, Ask Kami, CMO, execute)
  - Pipeline summaries → `source=pipeline` (dossier persist, sales discover, distribution opportunities)
- Read: `GET /api/observability/runs?session_id=&kind=&limit=` and `/ledger` (Supabase section + local Hermes token ledger).
- Also keep: `sales_audit_events`, `sales_discovery_runs`, `activity_events`, Langfuse (optional).
