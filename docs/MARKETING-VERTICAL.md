# Marketing Vertical — Codebase Overview

> Living doc. Updated 2026-07-23 for Community MVP.
>
> **Primary product loop** = distribution opportunities ([product-loops.md](product-loops.md)).
> **X/IG CRM + cold DMs** below = preserved as a **later Advanced feature** (do not delete;
> keep on a later CRM feature branch / behind Advanced UI). Not the default founder journey.

## Status: Distribution queue is MVP; CRM is Advanced / later

---


## Session ID rule

Marketing persistence uses **`sessionDbId`** — the Supabase UUID from `agent_sessions.id`.

- **Do not** pass the Hermes `X-Hermes-Session-Id` string to marketing APIs.
- Frontend: `page.tsx` holds `dbIdRef.current`; passes `sessionDbId` to `MarketingPanel` / `MarketingSetup`.
- All marketing API routes expect `session_id` = Supabase UUID.

---

## Supabase tables (`web/supabase/migrations/003_marketing.sql`)

Namespaced to avoid Sales vertical clash:

| Table | Purpose |
|-------|---------|
| `marketing_config` | Platform selection, budgets, niche, tone, **`autonomous_paused`** per session (`session_id` unique → `agent_sessions.id`) |
| `marketing_crm` | X leads + IG creators. **Unique on `(session_id, platform, handle)`** — not global |
| `marketing_conversations` | Autonomous DM threads (was `conversations`) |
| `marketing_conversation_messages` | Messages per thread (was `conversation_messages`) |
| `boost_campaigns` | X post boost records |

Apply migration in Supabase before using marketing features in production.

---

## Kill switch (persisted)

- DB column: `marketing_config.autonomous_paused` (default `false`)
- UI: `KillSwitch.tsx` — controlled component; `onChange` persists via `PATCH /api/marketing/setup`
- Server enforcement:
  - `POST /api/marketing/discover` → **423** when paused
  - `POST /api/conversations/poll` → skips stalled/reply checks for paused sessions
- Frontend: discovery button disabled when paused; config reloaded on session resume via `GET /api/marketing/setup`

---

## API routes

| Route | Method | Notes |
|-------|--------|-------|
| `marketing/setup` | GET, POST, PATCH | GET by `session_id`; POST upserts config; PATCH updates `autonomous_paused` only |
| `marketing/crm` | GET, POST | GET filtered by session; POST upserts by `(session_id, platform, handle)` or updates by `id` + `status` (approve flows) |
| `marketing/discover` | POST | Stub Hermes dispatch; returns 423 if paused |
| `conversations` | GET | Queries `marketing_conversations` joined to `marketing_crm` |
| `conversations/[id]` | GET, POST | Uses `marketing_conversation_messages` |
| `conversations/poll` | POST | Cron stub; respects `autonomous_paused` |
| `x/boost` | GET, POST | `boost_campaigns` table |

---

## Frontend components

| File | Role |
|------|------|
| `MarketingSetup.tsx` | POSTs setup with `sessionDbId` |
| `MarketingPanel.tsx` | Wires kill switch persistence; passes `sessionDbId` |
| `KillSwitch.tsx` | Controlled pause toggle |
| `MarketingCRM.tsx` | Approve-by-id via CRM POST; discovery respects pause |
| `page.tsx` | Loads marketing config on resume; clears on new campaign |

---

## Architecture

```
Dashboard
└── CampaignTabs [Overview | Sales | Marketing]
    └── MarketingPanel
        ├── KillSwitch → PATCH marketing/setup
        ├── PlatformRail
        ├── MarketingCRM → POST marketing/crm (approve by id)
        └── ConversationsPanel → marketing_conversations API
```

---

## Remaining stubs (not yet wired)

1. **Discovery** — `POST /api/marketing/discover` returns success without calling Hermes `marketing-researcher`
2. **X Ads** — `POST /api/x/boost` inserts `boost_campaigns` row only; no X Ads API
3. **Reply poll** — `POST /api/conversations/poll` marks stale threads only; no platform inbox/API polling

---

## For Sales vertical

Sales tab shows "Coming Soon". Sales can use its own tables (e.g. `conversations`, `conversation_messages`) without conflicting with marketing's renamed tables.
