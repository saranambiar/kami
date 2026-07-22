# Sales pipeline overhaul (shipped)

Hybrid Hermes + deterministic verification for outbound.

## Flow
Confirm who/what → **Confirm ICP segments** (failsafe) → Plan → Find (verify companies + public emails) → Emails → Needs you.

## Key modules
- [`web/lib/hermesServer.ts`](../web/lib/hermesServer.ts) — non-streaming gateway call with timeout
- [`web/lib/salesSegments.ts`](../web/lib/salesSegments.ts) — Hermes-derived segments + dossier fallback
- [`web/lib/salesResearch.ts`](../web/lib/salesResearch.ts) — `researchFromSegments`, blocklists, Fit×Intent scoring
- [`web/lib/salesContactFinder.ts`](../web/lib/salesContactFinder.ts) — scrape public/role emails (never invent)
- [`web/app/api/sales/segments/route.ts`](../web/app/api/sales/segments/route.ts)
- Migration [`007_sales_segments.sql`](../web/supabase/migrations/007_sales_segments.sql) — **must apply on Supabase**

## Skills
- `skills/icp_segmentation/SKILL.md`
- Updated `skills/signal_cold_email/SKILL.md`
