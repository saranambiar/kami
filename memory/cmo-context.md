# CMO shared context

## Phase 1 (shipped)

- Every CMO turn injects a **company context pack** built by [`web/lib/cmoContext.ts`](../web/lib/cmoContext.ts) from the Overview dossier (+ optional sales config summary).
- [`cmoPrompt(question, contextPack)`](../web/lib/prompts.ts) requires the pack and forbids inventing facts.
- [`CmoChat`](../web/components/CmoChat.tsx) takes `dossier`, `domain`, `sessionDbId`, `salesConfig`. If React dossier is null, it `GET /api/sessions/:id` and uses `brand.raw_dossier` (or flat brand columns).
- Pack is **re-injected every turn** so Hermes session timeouts cannot wipe company knowledge.
- [`Dashboard`](../web/components/Dashboard.tsx) shows CMO chat when dossier **or** `sessionDbId` is present.

Acceptance check: after a completed cal.com dossier, ask “what did you understand about this company?” — answer should cite positioning / ICP buckets without the user pasting anything.

## Phase 2 (deferred — after Sales schema settles)

- Durable `companies` table (domain, dossier jsonb, brand_summary); sessions/campaigns hang off `company_id`.
- Hermes MCP server `kami-context` with **named tools + fixed SQL** (never freeform `execute_sql`):
  - `get_company_dossier`, `get_icp_buckets`, `get_opportunities`, `get_sales_status`, `get_platform_capabilities`
- Skill `skills/cmo_context/SKILL.md` teaches when to call which tool.
- Prefer read-only DB role over service role for MCP.
- Auth later: Supabase Auth → `user_companies`; tools take `company_id` and enforce membership.
- Sequencing note: implement MCP **after** Sales pipeline overhaul so tools wrap stable tables.
