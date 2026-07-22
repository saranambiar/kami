# Marketing Vertical — Design Spec

## Overview

Add a Marketing vertical inside the Campaigns tab of the Kami dashboard. The Marketing section handles two lanes: **X** (post boosting + cold DM outreach) and **Instagram** (creator discovery + autonomous negotiation). Kami operates autonomously — finding leads/creators, DMing as the user, negotiating deals, updating the CRM, and scheduling Google Calendar events — with human approval gates at key moments.

## Navigation

The existing sidebar (Overview, Strategy, Campaigns, People, Knowledge, Activity, Settings) stays unchanged. Inside Campaigns, a horizontal tab bar splits into:

- **Overview** — current dashboard view, untouched
- **Sales** — "Coming Soon" placeholder
- **Marketing** — the new vertical (this spec)
- **Coming Soon** x2 — greyed out placeholders

Tab bar styling: `label-caps` typography, `hanko` accent underline on active tab, `crease` divider below.

## Marketing Guided Setup

Shown inline (not modal) on first visit to the Marketing tab when no config exists. Single vertical form with three steps:

**Step 1 — Select Platforms:**
Two kraft-cards side by side with checkboxes:
- X: "Boost high-performing posts and cold outreach to potential customers"
- Instagram: "Find and negotiate with content creators in your niche"

**Step 2 — Budget & Preferences** (per selected platform):
- X: monthly boost budget (number input), outreach goal (chips: `drive_signups | book_demo | awareness`)
- Instagram: creator offer range (min/max), niche keywords (comma-separated text), min follower count (number, default 5000)

**Step 3 — Tone & Voice:**
- If dossier exists: show tone tags from dossier, user confirms or overrides
- If no dossier: tone chips (professional, casual, witty, direct)

Submit via hanko-btn "Launch Marketing". Config editable later from a "Settings" link in the platform rail.

## Marketing CRM (center column)

Two sub-tabs: **X Outreach** and **Creators**.

### X Outreach

**Boost Manager (top section):**
Compact card listing user's recent X posts fetched via API:
```
Post preview (first 80 chars)  |  Engagement  |  [ Boost ]
```
User clicks "Boost" to select posts. Selected posts move to "Active Boosts" section with status tracking (`pending → live → completed`), spend, impressions, clicks. Kami handles targeting, duration, optimization via X Ads API.

**Cold Outreach (below boost):**
Table of X leads Kami discovered:
```
Name  |  @handle  |  Relevance  |  Status  |  Last Action
```
Statuses: `identified → approved → contacted → in_conversation → converted → lost`

User approves which leads to contact. Kami DMs approved leads autonomously.

### Creators

Table of Instagram creators Kami discovered and ranked:
```
Creator  |  Followers  |  Eng. Rate  |  Niche Match  |  Offer  |  Status
```
Statuses: `identified → contacted → negotiating → agreed → content_live → paid → completed`

Expandable rows showing: bio snippet, relevance reasoning, proposed offer, content delivery date.

Batch approval flow: Kami surfaces a batch, user reviews, deselects unwanted, confirms with hanko-btn. Kami begins autonomous outreach to approved creators.

### Shared table patterns
- Kraft-card rows, mono for metadata, label-caps for column headers
- Status chips: moss (positive), hanko (action-needed), outline (terminal)
- Filter by status via chip bar above each table

## Conversations Panel (right column)

Replaces IntelPanel when on the Marketing tab. Shows all active autonomous conversations.

**List view:**
```
CONVERSATIONS (label-caps header)
[ All | X | Instagram ] filter chips

Each conversation card (kraft-card):
- @handle · status chip
- Last message preview (2 lines)
- Sender (KAMI / lead) · timestamp
```

Unread/action-needed conversations float to top.

**Expanded thread view (on click):**
Replaces the list, back arrow to return. Full message history in typewriter style — mono font on kraft backgrounds, no chat bubbles. Kami's messages and lead's messages distinguished by alignment/label, not color.

**Escalation banner:**
Hanko-colored banner at top of conversation when Kami needs user input:
```
⚠ ESCALATION — Creator asked for $500, above your $300 max.
[ Approve $500 ]  [ Counter-offer ]  [ Decline ]
```

**Manual takeover:** Text input at bottom of expanded view. User can type to take over the conversation directly.

**Kill switch:** Global pause button in Marketing tab header. Pauses all autonomous conversations immediately.

## Conversation Engine

### State machine
```
idle → first_msg_drafted → first_msg_reviewed → first_msg_sent →
awaiting_reply → reply_received → response_drafted → response_sent →
awaiting_reply (loop) → concluded | escalated | stalled
```

### Rules
- First message: Reviewer must approve before send (same pattern as existing outreach)
- Follow-up messages: auto-send without Reviewer (too slow for natural conversation). Guardrails baked into conversation-agent instead.
- Stalled: no reply for 3 days → one follow-up → mark `stalled`
- Escalation triggers: budget exceeded, unknown product question, lead requests something outside scope

### Polling
- Cron route `/api/conversations/poll` runs every 60 seconds
- Checks each `awaiting_reply` conversation for new platform messages
- On new message: triggers conversation-agent via Hermes → generates response → sends via platform API → updates state
- v1 is polling. WebSocket/webhook upgrade deferred.

### Safety guardrails (non-negotiable)
- Cannot promise features, discounts, or timelines not in the dossier
- Budget guardrail: counter-offer above user's max range → escalate, never auto-accept
- Rate limiting: max 20 new DMs per day per platform
- Persona drift detection: self-eval before send, regenerate if tone doesn't match
- Kill switch: user can pause all conversations globally
- All messages logged to DB before send — failed sends recorded with `failed` flag

### Calendar integration
On conversation conclusion:
- Meeting booked → create Google Calendar event with title, time, attendee email, context
- Creator deal agreed → calendar event for content delivery deadline + optional payment date
- CRM entry updated with `calendar_event_id`
- Events created directly via Google Calendar API, no confirmation step

## Backend

### New API routes

| Route | Method | Purpose |
|---|---|---|
| `/api/marketing/setup` | POST | Save marketing config |
| `/api/marketing/config` | GET | Retrieve saved config |
| `/api/marketing/crm` | GET | Fetch CRM entries (filterable by type: `x_lead`, `creator`) |
| `/api/marketing/crm` | POST | Create/update CRM entries |
| `/api/x/posts` | GET | Fetch user's recent posts with engagement metrics |
| `/api/x/boost` | POST | Create boost campaign for selected posts |
| `/api/x/boost/status` | GET | Poll active boost campaign metrics |
| `/api/marketing/discover` | POST | Trigger lead/creator discovery via Hermes |
| `/api/conversations` | GET | List active autonomous conversations |
| `/api/conversations/[id]` | GET | Full thread for a conversation |
| `/api/conversations/[id]/intervene` | POST | User resolves escalation or takes over |
| `/api/conversations/poll` | POST | Cron: check for new replies across all active conversations |
| `/api/calendar/event` | POST | Create Google Calendar event |

### New Supabase tables

**`marketing_config`**
- `id`, `session_id`, `platforms` (jsonb: selected platforms), `x_boost_budget`, `x_outreach_goal`, `ig_offer_min`, `ig_offer_max`, `ig_niche_keywords` (text[]), `ig_min_followers`, `tone` (text[]), `created_at`, `updated_at`

**`marketing_crm`**
- `id`, `session_id`, `type` (x_lead | creator), `platform`, `handle`, `name`, `followers`, `engagement_rate`, `niche_match_score`, `relevance_reasoning`, `offer_amount`, `status`, `calendar_event_id`, `created_at`, `updated_at`

**`conversations`**
- `id`, `crm_entry_id` (FK to marketing_crm), `platform`, `goal`, `persona_config` (jsonb), `budget_min`, `budget_max`, `status`, `escalation_reason`, `created_at`, `updated_at`

**`conversation_messages`**
- `id`, `conversation_id` (FK), `sender` (kami | lead), `content`, `platform_message_id`, `status` (sent | failed), `sent_at`

**`boost_campaigns`**
- `id`, `session_id`, `post_id`, `post_text`, `budget`, `status` (pending | live | completed), `impressions`, `clicks`, `spend`, `created_at`, `updated_at`

### New lib modules

| Module | Purpose |
|---|---|
| `lib/instagram.ts` | Instagram Graph API: search by hashtag, fetch profiles, extract business email from bio, engagement rate calc |
| `lib/xAds.ts` | X Ads API: create promoted tweet campaign, set budget/targeting, poll metrics |
| `lib/googleCalendar.ts` | Google Calendar API: create events with attendees |
| `lib/conversationEngine.ts` | Core conversation logic: persona loading, message generation via Hermes, goal tracking, escalation detection |

### Environment variables needed

| Key | Service | Purpose |
|---|---|---|
| `INSTAGRAM_ACCESS_TOKEN` | Meta Graph API | Creator discovery, profile data |
| `INSTAGRAM_APP_ID` | Meta Graph API | App identification |
| `INSTAGRAM_APP_SECRET` | Meta Graph API | App authentication |
| `X_ADS_ACCESS_TOKEN` | X Ads API | Boost campaign management |
| `X_ADS_ACCOUNT_ID` | X Ads API | Ad account billing |
| `GOOGLE_CLIENT_ID` | Google Calendar API | OAuth |
| `GOOGLE_CLIENT_SECRET` | Google Calendar API | OAuth |
| `GOOGLE_REFRESH_TOKEN` | Google Calendar API | Persistent calendar access |

## Hermes Agents

### New agent files

**`agents/marketing-researcher.md`** — Lead and creator discovery specialist. Two modes:
- X lead discovery: search for people engaging with competitors, posting about the problem space, matching ICP. Returns ranked leads with relevance scores.
- IG creator discovery: search by hashtag/niche + competitor collaboration analysis. Fetch profiles, extract business emails from bios, calculate engagement rates. Return ranked creators with niche match scores.

**`agents/conversation-agent.md`** — Autonomous DM agent. Receives persona (from dossier), product info, goal (`negotiate_collab` or `drive_signup`), constraints (budget range, calendar). Maintains per-thread state. Escalates on: budget exceeded, unknown product question, out-of-scope request. Closes on: deal agreed, meeting booked, explicit decline. Never fabricates product claims.

**`agents/boost-manager.md`** — Takes selected posts + budget, creates targeting strategy from dossier ICP, manages X Ads API campaigns, reports metrics.

### New Hermes skills

**`skills/creator_outreach/SKILL.md`** — Creator approach playbook: first message rules (reference their specific content, explain product fit, state offer range, keep casual), negotiation guidelines (counter within range, escalate above), deal closing (confirm deliverables, timeline, payment).

**`skills/x_cold_dm/SKILL.md`** — X DM outreach playbook: opener rules (reference recent post, 2-3 sentences, one value prop, no links), conversation flow (interest → qualify → book call), hard rules (no spam, no mass-identical, personalize every DM).

**`skills/persona_mimic/SKILL.md`** — User impersonation rules: load tone from dossier, match vocabulary, emoji usage, response length, things the persona would/wouldn't say.

### Conversation loop

```
1. Kami drafts first DM (per playbook, using persona)
2. Reviewer approves first message
3. Send first DM via platform API
4. Poll for reply (cron, every 60s)
5. On reply → conversation-agent generates response using:
   - Full thread history
   - Persona rules
   - Goal + constraints
   - Product dossier
6. Auto-send response (unless escalation triggered)
7. Repeat until: goal_met | rejected | stalled_3_days | escalated
8. On conclusion → update CRM + create calendar event
```

## Frontend Components

### Modified
- `Dashboard.tsx` — Add `CampaignTabs` below header, tab state controls rendered panel
- `page.tsx` — Add `marketingConfig` state, marketing handlers

### New

| Component | Purpose |
|---|---|
| `CampaignTabs.tsx` | Tab bar with hanko underline on active |
| `MarketingPanel.tsx` | Container: shows setup wizard or active 3-column layout |
| `MarketingSetup.tsx` | Guided wizard: platform cards, budgets, niche, tone |
| `PlatformRail.tsx` | Left column: X/IG cards with status summaries |
| `MarketingCRM.tsx` | Center column: sub-tabs for X Outreach and Creators |
| `BoostManager.tsx` | Recent posts with boost buttons + active boosts |
| `LeadTable.tsx` | X leads table with status, relevance, actions |
| `CreatorTable.tsx` | IG creators table with expandable rows |
| `ConversationsPanel.tsx` | Right column: conversation list with filters |
| `ConversationThread.tsx` | Expanded conversation view with message history |
| `EscalationBanner.tsx` | Action banner for user intervention |
| `StatusChip.tsx` | Reusable status chip (moss/hanko/outline) |
| `KillSwitch.tsx` | Global pause for all autonomous conversations |

### Design rules
- All components use existing CSS variables from `globals.css`
- Cards: `kraft-card` with dog-ear shadow
- Tables: `mono` data, `label-caps` headers
- Primary actions: `hanko-btn`; secondary: mono border-button
- 0px border-radius everywhere
- No new design patterns, colors, or fonts
