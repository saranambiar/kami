# Marketing Vertical — Codebase Overview

> Living doc. Updated as features land on `feature/marketing`.
> Last updated: 2026-07-15

## Status: MVP code complete, not yet merged to `dev`/`main`

---

## Where everything lives

### Frontend Components (`web/components/`)

| File | What it does |
|------|-------------|
| `CampaignTabs.tsx` | Tab bar added to Dashboard — Overview, Sales (disabled), Marketing, 2x Coming Soon |
| `MarketingPanel.tsx` | Container for the whole marketing tab. Shows setup wizard if no config, otherwise the 3-column layout |
| `MarketingSetup.tsx` | Guided setup wizard — platform selection (X/Instagram), budgets, niche keywords, tone |
| `PlatformRail.tsx` | Left column — X and IG summary cards with lead/creator counts, budget info |
| `MarketingCRM.tsx` | Center column — sub-tabs for X Outreach and Creators, discovery trigger button |
| `BoostManager.tsx` | Inside CRM center — shows user's X posts with boost buttons + active boost metrics |
| `LeadTable.tsx` | X leads table — batch approve, relevance scores, status chips |
| `CreatorTable.tsx` | IG creators table — expandable rows with reasoning, niche match, calendar status |
| `ConversationsPanel.tsx` | Right column — list of all active DM conversations, platform filter |
| `ConversationThread.tsx` | Expanded view of a single conversation — message history, manual takeover input |
| `EscalationBanner.tsx` | Red banner when Kami needs user approval — approve/counter/decline buttons |
| `StatusChip.tsx` | Reusable colored chip (positive/action/neutral/terminal variants) |
| `KillSwitch.tsx` | Global pause/resume toggle for all autonomous conversations |

### Modified existing files

| File | What changed |
|------|-------------|
| `web/components/Dashboard.tsx` | Added tab state, CampaignTabs bar, conditional rendering by tab. Marketing tab renders `<MarketingPanel>` |
| `web/app/page.tsx` | Added `marketingConfig` state, passes it + `sessionDbId` to Dashboard |
| `web/app/globals.css` | Added `.campaign-tabs` and `.campaign-tab` styles |

### API Routes (`web/app/api/`)

| Route | Method | What it does |
|-------|--------|-------------|
| `marketing/setup` | GET, POST | Fetch or upsert marketing config (platforms, budgets, niche, tone) |
| `marketing/crm` | GET, POST | List CRM entries (filterable) or create/upsert by platform+handle |
| `marketing/discover` | POST | Triggers lead/creator discovery (delegates to Hermes agent) |
| `conversations` | GET | List conversations with CRM join, filterable by session_id |
| `conversations/[id]` | GET, POST | Get message thread / send manual message / handle escalation |
| `conversations/poll` | POST | Cron endpoint — checks for stale conversations (3+ days no reply) |
| `x/posts` | GET | Fetch user's recent X posts with engagement metrics |
| `x/boost` | GET, POST | Create boost campaign record / list active boosts |
| `calendar/event` | POST | Create Google Calendar event with attendees |

### Lib Modules (`web/lib/`)

| File | What it does |
|------|-------------|
| `marketingTypes.ts` | All TypeScript types for the marketing vertical |
| `googleCalendar.ts` | Google Calendar API client — token refresh + event creation |
| `instagram.ts` | Instagram Graph API client — hashtag search, email extraction |

### Hermes Agents (`agents/`)

| File | Role |
|------|------|
| `marketing-researcher.md` | Discovers and ranks X leads + IG creators from ICP/niche keywords |
| `conversation-agent.md` | Autonomous DM specialist — impersonates user, follows persona rules |
| `boost-manager.md` | X Ads campaign planning — budget allocation, targeting strategy |

### Runtime Skills (`skills/`)

| Skill | Purpose |
|-------|---------|
| `creator_outreach/SKILL.md` | Playbook for first message, negotiation, deal closing with IG creators |
| `x_cold_dm/SKILL.md` | Cold DM opener rules, conversation flow, rate limits |
| `persona_mimic/SKILL.md` | User impersonation rules — tone matching, drift detection, anti-AI-detection |

---

## Supabase Tables (need to be created)

These tables are referenced by the API routes but need to be created in Supabase:

- `marketing_config` — platform selection, budgets, niche, tone per session
- `marketing_crm` — leads (X) and creators (IG) with status, scores, metadata
- `conversations` — autonomous DM conversations linked to CRM entries
- `conversation_messages` — individual messages in each conversation
- `boost_campaigns` — X post boost campaign records with spend/metrics

SQL for these is in the implementation plan: `docs/superpowers/plans/2026-07-15-marketing-vertical.md`

---

## Architecture at a glance

```
Dashboard
└── CampaignTabs [Overview | Sales | Marketing | ...]
    └── MarketingPanel (marketing tab)
        ├── PlatformRail (left) — X/IG summary cards
        ├── MarketingCRM (center)
        │   ├── BoostManager — post boosting
        │   ├── LeadTable — X cold outreach targets
        │   └── CreatorTable — IG creator partnerships
        └── ConversationsPanel (right)
            └── ConversationThread — expanded DM view
                └── EscalationBanner — when Kami needs approval
```

## What's NOT done yet

- Real X Ads API integration (boost campaigns log intent, don't call X Ads yet)
- Real platform reply detection in poll route (hook point exists, no API calls)
- Hermes gateway wiring for discovery + conversation agents (routes return placeholder responses)
- Supabase table creation (SQL is written, needs to be applied)

---

## For Sales vertical

The tab system is ready. Sales tab currently shows "Coming Soon" placeholder. To build it:

1. Create a `SalesPanel.tsx` (same pattern as `MarketingPanel.tsx`)
2. Add your tab content inside the `{tab === "sales" && ...}` block in `Dashboard.tsx`
3. The `CampaignTab` type in `marketingTypes.ts` already includes `"sales"`
4. CampaignTabs component already has the Sales tab (currently disabled) — flip `disabled` to `false` when ready
