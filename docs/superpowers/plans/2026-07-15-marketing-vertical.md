# Marketing Vertical Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a Marketing vertical inside the Campaigns tab — X post boosting, X cold DM outreach, Instagram creator discovery + autonomous negotiation, conversations panel, and Google Calendar integration.

**Architecture:** Tab-based inside existing Dashboard SPA. Marketing tab renders a 3-column layout (PlatformRail | CRM + BoostManager | ConversationsPanel). Backend: new API routes + Supabase tables + lib modules for Instagram, X Ads, Google Calendar, and the conversation engine. Hermes agents handle discovery, autonomous DMs, and boost management.

**Tech Stack:** Next.js (existing), Supabase (existing), X API v2 (existing OAuth), Instagram Graph API, X Ads API, Google Calendar API, Hermes gateway (existing)

**Spec:** `docs/superpowers/specs/2026-07-15-marketing-vertical-design.md`

---

## File Map

### New files — Frontend components
- `web/components/CampaignTabs.tsx` — Tab bar (Overview, Sales, Marketing, Coming Soon x2)
- `web/components/MarketingPanel.tsx` — Container: setup wizard or active 3-column layout
- `web/components/MarketingSetup.tsx` — Guided setup form (platforms, budgets, niche, tone)
- `web/components/PlatformRail.tsx` — Left column: X/IG summary cards
- `web/components/MarketingCRM.tsx` — Center column: sub-tabs for X Outreach and Creators
- `web/components/BoostManager.tsx` — Post list with boost buttons + active boosts
- `web/components/LeadTable.tsx` — X leads table
- `web/components/CreatorTable.tsx` — IG creators table with expandable rows
- `web/components/ConversationsPanel.tsx` — Right column: conversation list
- `web/components/ConversationThread.tsx` — Expanded conversation view
- `web/components/EscalationBanner.tsx` — Action banner for user intervention
- `web/components/StatusChip.tsx` — Reusable status chip
- `web/components/KillSwitch.tsx` — Global pause for autonomous conversations

### New files — API routes
- `web/app/api/marketing/setup/route.ts` — Save/retrieve marketing config
- `web/app/api/marketing/crm/route.ts` — CRUD for marketing CRM entries
- `web/app/api/marketing/discover/route.ts` — Trigger lead/creator discovery
- `web/app/api/x/posts/route.ts` — Fetch user's recent posts with metrics
- `web/app/api/x/boost/route.ts` — Create + poll boost campaigns
- `web/app/api/conversations/route.ts` — List conversations
- `web/app/api/conversations/[id]/route.ts` — Thread detail + intervene
- `web/app/api/conversations/poll/route.ts` — Cron: check for new replies
- `web/app/api/calendar/event/route.ts` — Create Google Calendar events

### New files — Lib modules
- `web/lib/instagram.ts` — Instagram Graph API client
- `web/lib/xAds.ts` — X Ads API client
- `web/lib/googleCalendar.ts` — Google Calendar API client
- `web/lib/conversationEngine.ts` — Autonomous conversation logic

### New files — Hermes agents & skills
- `agents/marketing-researcher.md` — Lead/creator discovery specialist
- `agents/conversation-agent.md` — Autonomous DM agent
- `agents/boost-manager.md` — X Ads boost specialist
- `skills/creator_outreach/SKILL.md` — Creator approach playbook
- `skills/x_cold_dm/SKILL.md` — X DM outreach playbook
- `skills/persona_mimic/SKILL.md` — User impersonation rules

### Modified files
- `web/components/Dashboard.tsx` — Add CampaignTabs, tab state, conditional panel rendering
- `web/app/page.tsx` — Add marketingConfig state + handlers
- `web/app/globals.css` — Add tab bar styles, status chip styles, conversation styles

### New files — Types
- `web/lib/marketingTypes.ts` — All Marketing-specific TypeScript types

---

## Task 1: Marketing types

**Files:**
- Create: `web/lib/marketingTypes.ts`

- [ ] **Step 1: Create the types file**

```typescript
// web/lib/marketingTypes.ts

export type MarketingPlatform = "x" | "instagram";
export type OutreachGoal = "drive_signups" | "book_demo" | "awareness";

export interface MarketingConfig {
  id?: string;
  session_id: string;
  platforms: MarketingPlatform[];
  x_boost_budget?: number;
  x_outreach_goal?: OutreachGoal;
  ig_offer_min?: number;
  ig_offer_max?: number;
  ig_niche_keywords?: string[];
  ig_min_followers?: number;
  tone?: string[];
}

export type XLeadStatus =
  | "identified"
  | "approved"
  | "contacted"
  | "in_conversation"
  | "converted"
  | "lost";

export type CreatorStatus =
  | "identified"
  | "contacted"
  | "negotiating"
  | "agreed"
  | "content_live"
  | "paid"
  | "completed";

export type CrmEntryType = "x_lead" | "creator";

export interface MarketingCrmEntry {
  id: string;
  session_id: string;
  type: CrmEntryType;
  platform: MarketingPlatform;
  handle: string;
  name?: string;
  followers?: number;
  engagement_rate?: number;
  niche_match_score?: number;
  relevance_reasoning?: string;
  offer_amount?: number;
  status: XLeadStatus | CreatorStatus;
  calendar_event_id?: string;
  created_at: string;
  updated_at: string;
}

export type ConversationStatus =
  | "idle"
  | "first_msg_drafted"
  | "first_msg_reviewed"
  | "first_msg_sent"
  | "awaiting_reply"
  | "reply_received"
  | "response_drafted"
  | "response_sent"
  | "concluded"
  | "escalated"
  | "stalled";

export type ConversationGoal = "negotiate_collab" | "drive_signup" | "book_demo";

export interface Conversation {
  id: string;
  crm_entry_id: string;
  platform: MarketingPlatform;
  goal: ConversationGoal;
  persona_config?: Record<string, unknown>;
  budget_min?: number;
  budget_max?: number;
  status: ConversationStatus;
  escalation_reason?: string;
  created_at: string;
  updated_at: string;
}

export type MessageSender = "kami" | "lead";

export interface ConversationMessage {
  id: string;
  conversation_id: string;
  sender: MessageSender;
  content: string;
  platform_message_id?: string;
  status: "sent" | "failed";
  sent_at: string;
}

export type BoostStatus = "pending" | "live" | "completed";

export interface BoostCampaign {
  id: string;
  session_id: string;
  post_id: string;
  post_text: string;
  budget: number;
  status: BoostStatus;
  impressions?: number;
  clicks?: number;
  spend?: number;
  created_at: string;
  updated_at: string;
}

export interface XPost {
  id: string;
  text: string;
  public_metrics: {
    like_count: number;
    retweet_count: number;
    reply_count: number;
    impression_count: number;
  };
  created_at: string;
}

export type CampaignTab = "overview" | "sales" | "marketing";
```

- [ ] **Step 2: Verify the file compiles**

Run: `cd /Users/varaddurge/Documents/kami/web && npx tsc --noEmit lib/marketingTypes.ts 2>&1 | head -20`
Expected: no errors (standalone types, no imports)

- [ ] **Step 3: Commit**

```bash
git add web/lib/marketingTypes.ts
git commit -m "feat(marketing): add typed contracts for marketing vertical"
```

---

## Task 2: StatusChip reusable component

**Files:**
- Create: `web/components/StatusChip.tsx`

- [ ] **Step 1: Create StatusChip**

```tsx
// web/components/StatusChip.tsx
"use client";

type ChipVariant = "positive" | "action" | "neutral" | "terminal";

interface StatusChipProps {
  label: string;
  variant?: ChipVariant;
}

const VARIANT_STYLES: Record<ChipVariant, { bg: string; color: string; border: string }> = {
  positive: { bg: "var(--moss)", color: "var(--paper)", border: "var(--moss)" },
  action: { bg: "var(--hanko)", color: "var(--paper)", border: "var(--hanko)" },
  neutral: { bg: "transparent", color: "var(--ink-soft)", border: "var(--outline)" },
  terminal: { bg: "var(--kraft-light)", color: "var(--ink-soft)", border: "var(--outline)" },
};

export function statusVariant(status: string): ChipVariant {
  const positives = ["connected", "approved", "agreed", "content_live", "completed", "converted", "concluded", "sent"];
  const actions = ["identified", "negotiating", "in_conversation", "awaiting_reply", "escalated", "first_msg_drafted"];
  const terminals = ["lost", "stalled", "paid"];
  if (positives.includes(status)) return "positive";
  if (actions.includes(status)) return "action";
  if (terminals.includes(status)) return "terminal";
  return "neutral";
}

export default function StatusChip({ label, variant }: StatusChipProps) {
  const v = variant ?? statusVariant(label);
  const s = VARIANT_STYLES[v];
  return (
    <span
      className="mono"
      style={{
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
        padding: "0.15rem 0.5rem",
        fontSize: 11,
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: "0.05em",
        whiteSpace: "nowrap",
      }}
    >
      {label.replace(/_/g, " ")}
    </span>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/components/StatusChip.tsx
git commit -m "feat(marketing): add reusable StatusChip component"
```

---

## Task 3: CampaignTabs component + Dashboard integration

**Files:**
- Create: `web/components/CampaignTabs.tsx`
- Modify: `web/components/Dashboard.tsx`
- Modify: `web/app/globals.css`

- [ ] **Step 1: Add tab bar CSS to globals.css**

Append to the end of `web/app/globals.css`:

```css
/* Campaign tab bar */
.campaign-tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid var(--crease);
  margin-top: var(--stack-sm);
}
.campaign-tab {
  background: none;
  border: none;
  font-family: var(--font-body);
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  color: var(--ink-soft);
  padding: 0.6rem 1.25rem;
  cursor: pointer;
  position: relative;
}
.campaign-tab:hover {
  color: var(--ink);
}
.campaign-tab[data-active="true"] {
  color: var(--ink);
}
.campaign-tab[data-active="true"]::after {
  content: "";
  position: absolute;
  bottom: -1px;
  left: 0;
  right: 0;
  height: 2px;
  background: var(--hanko);
}
.campaign-tab:disabled {
  color: var(--outline);
  cursor: default;
}
```

- [ ] **Step 2: Create CampaignTabs**

```tsx
// web/components/CampaignTabs.tsx
"use client";

import type { CampaignTab } from "@/lib/marketingTypes";

interface CampaignTabsProps {
  active: CampaignTab;
  onChange: (tab: CampaignTab) => void;
}

const TABS: { key: CampaignTab | "coming1" | "coming2"; label: string; disabled?: boolean }[] = [
  { key: "overview", label: "Overview" },
  { key: "sales", label: "Sales", disabled: true },
  { key: "marketing", label: "Marketing" },
  { key: "coming1", label: "Coming Soon", disabled: true },
  { key: "coming2", label: "Coming Soon", disabled: true },
];

export default function CampaignTabs({ active, onChange }: CampaignTabsProps) {
  return (
    <div className="campaign-tabs">
      {TABS.map((t, i) => (
        <button
          key={`${t.key}-${i}`}
          type="button"
          className="campaign-tab"
          data-active={t.key === active}
          disabled={t.disabled}
          onClick={() => {
            if (!t.disabled && t.key !== "coming1" && t.key !== "coming2") {
              onChange(t.key);
            }
          }}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: Modify Dashboard.tsx to add tabs**

Replace the entire `Dashboard.tsx` with:

```tsx
// web/components/Dashboard.tsx
"use client";

import { useState } from "react";
import ActivityFeed, { type ActivityEvent } from "@/components/ActivityFeed";
import ApprovalCard, { type OpportunityStatus } from "@/components/ApprovalCard";
import ChannelRail from "@/components/ChannelRail";
import IntelPanel from "@/components/IntelPanel";
import CmoChat from "@/components/CmoChat";
import CampaignTabs from "@/components/CampaignTabs";
import type { Dossier } from "@/lib/hermes";
import type { CampaignTab, MarketingConfig } from "@/lib/marketingTypes";

interface DashboardProps {
  domain: string;
  events: ActivityEvent[];
  running: boolean;
  dossier: Dossier | null;
  oppStatus: Record<string, OpportunityStatus>;
  executing: boolean;
  sessionId: string;
  connectedChannels: string[];
  marketingConfig: MarketingConfig | null;
  onConnect: (platform: string) => void;
  onNewCampaign: () => void;
  onApprove: (title: string, playbook: string) => void;
  onDismiss: (title: string) => void;
  onMarketingSetup: (config: MarketingConfig) => void;
}

export default function Dashboard({
  domain,
  events,
  running,
  dossier,
  oppStatus,
  executing,
  sessionId,
  connectedChannels,
  marketingConfig,
  onConnect,
  onNewCampaign,
  onApprove,
  onDismiss,
  onMarketingSetup,
}: DashboardProps) {
  const [tab, setTab] = useState<CampaignTab>("overview");

  return (
    <div style={{ paddingTop: "var(--stack-md)", paddingBottom: "var(--stack-lg)" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", flexWrap: "wrap" }}>
        <h2>
          {domain} <span style={{ color: "var(--hanko)" }}>· campaigns</span>
        </h2>
        <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
          <span className="mono" style={{ color: "var(--ink-soft)" }}>
            session {sessionId.slice(-8)}
          </span>
          <button
            type="button"
            className="mono"
            onClick={onNewCampaign}
            style={{
              border: "1px solid var(--ink)",
              background: "transparent",
              padding: "0.3rem 0.7rem",
              cursor: "pointer",
            }}
          >
            + new campaign
          </button>
        </div>
      </div>

      <CampaignTabs active={tab} onChange={setTab} />

      {tab === "overview" && (
        <>
          <hr className="crease" />
          <div className="dashboard-grid">
            <ChannelRail connected={connectedChannels} onConnect={onConnect} />
            <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-md)" }}>
              <ActivityFeed events={events} running={running} />
              {dossier && (
                <div>
                  <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>
                    Awaiting your approval
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
                    {dossier.opportunities.map((o) => (
                      <ApprovalCard
                        key={o.title}
                        opportunity={o}
                        status={oppStatus[o.title] ?? "proposed"}
                        busy={executing}
                        onApprove={() => onApprove(o.title, o.playbook)}
                        onDismiss={() => onDismiss(o.title)}
                      />
                    ))}
                  </div>
                </div>
              )}
              {dossier && <CmoChat sessionId={sessionId} />}
            </div>
            {dossier ? (
              <IntelPanel dossier={dossier} />
            ) : (
              <aside>
                <p className="label-caps">Intelligence</p>
                <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "var(--stack-sm)" }}>
                  folding dossier…
                </p>
              </aside>
            )}
          </div>
        </>
      )}

      {tab === "marketing" && (
        <div style={{ marginTop: "var(--stack-md)" }}>
          <p className="mono" style={{ color: "var(--ink-soft)" }}>
            Marketing panel loading…
          </p>
        </div>
      )}

      {tab === "sales" && (
        <div style={{ marginTop: "var(--stack-md)", textAlign: "center", padding: "var(--stack-lg) 0" }}>
          <p className="label-caps" style={{ color: "var(--outline)" }}>Sales — Coming Soon</p>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Update page.tsx to pass new props**

In `web/app/page.tsx`, add `marketingConfig` state and pass it to Dashboard.

Add after line 20 (`const [connectedChannels, setConnectedChannels] = useState<string[]>([]);`):
```typescript
const [marketingConfig, setMarketingConfig] = useState<MarketingConfig | null>(null);
```

Add the import at the top:
```typescript
import type { MarketingConfig } from "@/lib/marketingTypes";
```

Update the `<Dashboard` JSX to include the two new props:
```tsx
<Dashboard
  domain={domain}
  events={events}
  running={running}
  dossier={dossier}
  oppStatus={oppStatus}
  executing={executing}
  sessionId={sessionRef.current}
  connectedChannels={connectedChannels}
  marketingConfig={marketingConfig}
  onConnect={connectChannel}
  onNewCampaign={newCampaign}
  onApprove={approve}
  onDismiss={dismiss}
  onMarketingSetup={setMarketingConfig}
/>
```

- [ ] **Step 5: Verify the app compiles**

Run: `cd /Users/varaddurge/Documents/kami/web && npx next build 2>&1 | tail -20`
Expected: build succeeds

- [ ] **Step 6: Commit**

```bash
git add web/components/CampaignTabs.tsx web/components/Dashboard.tsx web/app/globals.css web/app/page.tsx
git commit -m "feat(marketing): add campaign tabs to dashboard (overview/sales/marketing)"
```

---

## Task 4: MarketingSetup wizard component

**Files:**
- Create: `web/components/MarketingSetup.tsx`

- [ ] **Step 1: Create the setup wizard**

```tsx
// web/components/MarketingSetup.tsx
"use client";

import { useState } from "react";
import type { MarketingConfig, MarketingPlatform, OutreachGoal } from "@/lib/marketingTypes";

interface MarketingSetupProps {
  sessionId: string;
  existingTone?: string[];
  onComplete: (config: MarketingConfig) => void;
}

const PLATFORM_INFO: { key: MarketingPlatform; name: string; blurb: string }[] = [
  { key: "x", name: "X (Twitter)", blurb: "Boost high-performing posts and cold outreach to potential customers." },
  { key: "instagram", name: "Instagram", blurb: "Find and negotiate with content creators in your niche." },
];

const GOALS: { key: OutreachGoal; label: string }[] = [
  { key: "drive_signups", label: "Drive signups" },
  { key: "book_demo", label: "Book demos" },
  { key: "awareness", label: "Build awareness" },
];

const TONES = ["professional", "casual", "witty", "direct"];

export default function MarketingSetup({ sessionId, existingTone, onComplete }: MarketingSetupProps) {
  const [platforms, setPlatforms] = useState<MarketingPlatform[]>([]);
  const [xBudget, setXBudget] = useState(200);
  const [xGoal, setXGoal] = useState<OutreachGoal>("drive_signups");
  const [igOfferMin, setIgOfferMin] = useState(50);
  const [igOfferMax, setIgOfferMax] = useState(300);
  const [igKeywords, setIgKeywords] = useState("");
  const [igMinFollowers, setIgMinFollowers] = useState(5000);
  const [tone, setTone] = useState<string[]>(existingTone ?? []);
  const [useDossierTone, setUseDossierTone] = useState(Boolean(existingTone?.length));

  function togglePlatform(p: MarketingPlatform) {
    setPlatforms((prev) => (prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]));
  }

  function toggleTone(t: string) {
    setTone((prev) => (prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]));
  }

  function submit() {
    if (platforms.length === 0) return;
    onComplete({
      session_id: sessionId,
      platforms,
      x_boost_budget: platforms.includes("x") ? xBudget : undefined,
      x_outreach_goal: platforms.includes("x") ? xGoal : undefined,
      ig_offer_min: platforms.includes("instagram") ? igOfferMin : undefined,
      ig_offer_max: platforms.includes("instagram") ? igOfferMax : undefined,
      ig_niche_keywords: platforms.includes("instagram") ? igKeywords.split(",").map((s) => s.trim()).filter(Boolean) : undefined,
      ig_min_followers: platforms.includes("instagram") ? igMinFollowers : undefined,
      tone: useDossierTone ? existingTone : tone,
    });
  }

  const hasX = platforms.includes("x");
  const hasIg = platforms.includes("instagram");

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", paddingTop: "var(--stack-lg)" }}>
      <h3 style={{ marginBottom: "var(--stack-md)" }}>Set up Marketing</h3>

      {/* Step 1: Platforms */}
      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Select platforms</p>
      <div style={{ display: "flex", gap: "var(--stack-md)", marginBottom: "var(--stack-lg)" }}>
        {PLATFORM_INFO.map((p) => (
          <button
            key={p.key}
            type="button"
            className="kraft-card"
            onClick={() => togglePlatform(p.key)}
            style={{
              flex: 1,
              cursor: "pointer",
              border: platforms.includes(p.key) ? "2px solid var(--hanko)" : "1px solid var(--ink)",
              textAlign: "left",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <strong style={{ fontFamily: "var(--font-headline)" }}>{p.name}</strong>
              <span style={{ color: platforms.includes(p.key) ? "var(--hanko)" : "var(--outline)", fontWeight: 700 }}>
                {platforms.includes(p.key) ? "✓" : "·"}
              </span>
            </div>
            <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: "0.4rem" }}>{p.blurb}</p>
          </button>
        ))}
      </div>

      {/* Step 2: Budget & Preferences */}
      {hasX && (
        <div style={{ marginBottom: "var(--stack-lg)" }}>
          <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>X — Budget & Goal</p>
          <div style={{ display: "flex", gap: "var(--stack-md)", flexWrap: "wrap" }}>
            <div className="form-line" style={{ flex: 1, minWidth: 180 }}>
              <label className="mono label-caps" htmlFor="x-budget">Monthly boost budget ($)</label>
              <input
                id="x-budget"
                type="number"
                min={0}
                value={xBudget}
                onChange={(e) => setXBudget(Number(e.target.value))}
              />
            </div>
            <div style={{ flex: 1, minWidth: 180 }}>
              <p className="mono label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Outreach goal</p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {GOALS.map((g) => (
                  <button
                    key={g.key}
                    type="button"
                    className="mono"
                    onClick={() => setXGoal(g.key)}
                    style={{
                      background: xGoal === g.key ? "var(--kraft)" : "transparent",
                      border: "1px solid var(--ink)",
                      padding: "0.4rem 0.75rem",
                      cursor: "pointer",
                      color: "var(--ink)",
                    }}
                  >
                    <span style={{ color: xGoal === g.key ? "var(--hanko)" : "var(--outline)", fontWeight: 700, marginRight: "0.4rem" }}>
                      {xGoal === g.key ? "✓" : "·"}
                    </span>
                    {g.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {hasIg && (
        <div style={{ marginBottom: "var(--stack-lg)" }}>
          <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Instagram — Creator Criteria</p>
          <div style={{ display: "flex", gap: "var(--stack-md)", flexWrap: "wrap", marginBottom: "var(--stack-md)" }}>
            <div className="form-line" style={{ flex: 1, minWidth: 140 }}>
              <label className="mono label-caps" htmlFor="ig-offer-min">Offer min ($)</label>
              <input id="ig-offer-min" type="number" min={0} value={igOfferMin} onChange={(e) => setIgOfferMin(Number(e.target.value))} />
            </div>
            <div className="form-line" style={{ flex: 1, minWidth: 140 }}>
              <label className="mono label-caps" htmlFor="ig-offer-max">Offer max ($)</label>
              <input id="ig-offer-max" type="number" min={0} value={igOfferMax} onChange={(e) => setIgOfferMax(Number(e.target.value))} />
            </div>
            <div className="form-line" style={{ flex: 1, minWidth: 140 }}>
              <label className="mono label-caps" htmlFor="ig-min-followers">Min followers</label>
              <input id="ig-min-followers" type="number" min={0} value={igMinFollowers} onChange={(e) => setIgMinFollowers(Number(e.target.value))} />
            </div>
          </div>
          <div className="form-line">
            <label className="mono label-caps" htmlFor="ig-keywords">Niche keywords (comma-separated)</label>
            <input id="ig-keywords" value={igKeywords} onChange={(e) => setIgKeywords(e.target.value)} placeholder="dev tools, productivity, SaaS" />
          </div>
        </div>
      )}

      {/* Step 3: Tone */}
      {platforms.length > 0 && (
        <div style={{ marginBottom: "var(--stack-lg)" }}>
          <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Tone & Voice</p>
          {existingTone?.length ? (
            <div style={{ marginBottom: "var(--stack-sm)" }}>
              <button
                type="button"
                className="mono"
                onClick={() => setUseDossierTone(!useDossierTone)}
                style={{
                  background: useDossierTone ? "var(--kraft)" : "transparent",
                  border: "1px solid var(--ink)",
                  padding: "0.4rem 0.75rem",
                  cursor: "pointer",
                }}
              >
                <span style={{ color: useDossierTone ? "var(--hanko)" : "var(--outline)", fontWeight: 700, marginRight: "0.4rem" }}>
                  {useDossierTone ? "✓" : "·"}
                </span>
                Use brand voice from dossier ({existingTone.join(", ")})
              </button>
            </div>
          ) : null}
          {!useDossierTone && (
            <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
              {TONES.map((t) => (
                <button
                  key={t}
                  type="button"
                  className="mono"
                  onClick={() => toggleTone(t)}
                  style={{
                    background: tone.includes(t) ? "var(--kraft)" : "transparent",
                    border: "1px solid var(--ink)",
                    padding: "0.4rem 0.75rem",
                    cursor: "pointer",
                  }}
                >
                  <span style={{ color: tone.includes(t) ? "var(--hanko)" : "var(--outline)", fontWeight: 700, marginRight: "0.4rem" }}>
                    {tone.includes(t) ? "✓" : "·"}
                  </span>
                  {t}
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      <button className="hanko-btn" onClick={submit} disabled={platforms.length === 0}>
        Launch Marketing
      </button>
    </div>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/components/MarketingSetup.tsx
git commit -m "feat(marketing): add guided setup wizard component"
```

---

## Task 5: Marketing setup API route + Supabase table

**Files:**
- Create: `web/app/api/marketing/setup/route.ts`

- [ ] **Step 1: Create the Supabase table**

Run this in the Supabase dashboard SQL editor (or via migration):

```sql
create table if not exists marketing_config (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references agent_sessions(id),
  platforms jsonb not null default '[]',
  x_boost_budget integer,
  x_outreach_goal text,
  ig_offer_min integer,
  ig_offer_max integer,
  ig_niche_keywords text[],
  ig_min_followers integer default 5000,
  tone text[],
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

- [ ] **Step 2: Create the API route**

```typescript
// web/app/api/marketing/setup/route.ts
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ config: null });

  const sessionId = new URL(request.url).searchParams.get("session_id");
  if (!sessionId) return Response.json({ config: null });

  const { data } = await sb
    .from("marketing_config")
    .select("*")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return Response.json({ config: data });
}

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ persisted: false });

  const body = await request.json();
  const { session_id, platforms, x_boost_budget, x_outreach_goal, ig_offer_min, ig_offer_max, ig_niche_keywords, ig_min_followers, tone } = body;

  if (!session_id || !platforms?.length) {
    return Response.json({ error: "session_id and platforms required" }, { status: 400 });
  }

  const { data, error } = await sb
    .from("marketing_config")
    .upsert(
      {
        session_id,
        platforms,
        x_boost_budget: x_boost_budget ?? null,
        x_outreach_goal: x_outreach_goal ?? null,
        ig_offer_min: ig_offer_min ?? null,
        ig_offer_max: ig_offer_max ?? null,
        ig_niche_keywords: ig_niche_keywords ?? null,
        ig_min_followers: ig_min_followers ?? 5000,
        tone: tone ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "session_id" },
    )
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ persisted: true, id: data.id });
}
```

- [ ] **Step 3: Commit**

```bash
git add web/app/api/marketing/setup/route.ts
git commit -m "feat(marketing): add marketing config API route + Supabase table"
```

---

## Task 6: Marketing CRM API route + Supabase table

**Files:**
- Create: `web/app/api/marketing/crm/route.ts`

- [ ] **Step 1: Create the Supabase table**

```sql
create table if not exists marketing_crm (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references agent_sessions(id),
  type text not null check (type in ('x_lead', 'creator')),
  platform text not null,
  handle text not null,
  name text,
  followers integer,
  engagement_rate real,
  niche_match_score real,
  relevance_reasoning text,
  offer_amount integer,
  status text not null default 'identified',
  calendar_event_id text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index idx_marketing_crm_session on marketing_crm(session_id);
create index idx_marketing_crm_type on marketing_crm(type);
```

- [ ] **Step 2: Create the API route**

```typescript
// web/app/api/marketing/crm/route.ts
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ entries: [] });

  const url = new URL(request.url);
  const sessionId = url.searchParams.get("session_id");
  const type = url.searchParams.get("type");
  const status = url.searchParams.get("status");

  let query = sb.from("marketing_crm").select("*").order("created_at", { ascending: false }).limit(200);
  if (sessionId) query = query.eq("session_id", sessionId);
  if (type) query = query.eq("type", type);
  if (status) query = query.eq("status", status);

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ entries: data ?? [] });
}

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ persisted: false });

  const body = await request.json();
  const { session_id, type, platform, handle, name, followers, engagement_rate, niche_match_score, relevance_reasoning, offer_amount, status } = body;

  if (!type || !platform || !handle) {
    return Response.json({ error: "type, platform, handle required" }, { status: 400 });
  }

  const { data: existing } = await sb
    .from("marketing_crm")
    .select("id")
    .eq("platform", platform)
    .eq("handle", handle)
    .maybeSingle();

  if (existing) {
    const { error } = await sb
      .from("marketing_crm")
      .update({
        name: name ?? undefined,
        followers: followers ?? undefined,
        engagement_rate: engagement_rate ?? undefined,
        niche_match_score: niche_match_score ?? undefined,
        relevance_reasoning: relevance_reasoning ?? undefined,
        offer_amount: offer_amount ?? undefined,
        status: status ?? undefined,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existing.id);
    if (error) return Response.json({ error: error.message }, { status: 500 });
    return Response.json({ persisted: true, id: existing.id, updated: true });
  }

  const { data, error } = await sb
    .from("marketing_crm")
    .insert({
      session_id: session_id ?? null,
      type,
      platform,
      handle,
      name: name ?? null,
      followers: followers ?? null,
      engagement_rate: engagement_rate ?? null,
      niche_match_score: niche_match_score ?? null,
      relevance_reasoning: relevance_reasoning ?? null,
      offer_amount: offer_amount ?? null,
      status: status ?? "identified",
    })
    .select("id")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ persisted: true, id: data.id });
}
```

- [ ] **Step 3: Commit**

```bash
git add web/app/api/marketing/crm/route.ts
git commit -m "feat(marketing): add marketing CRM API route + Supabase table"
```

---

## Task 7: PlatformRail + MarketingPanel + wiring

**Files:**
- Create: `web/components/PlatformRail.tsx`
- Create: `web/components/MarketingPanel.tsx`
- Modify: `web/components/Dashboard.tsx`

- [ ] **Step 1: Create PlatformRail**

```tsx
// web/components/PlatformRail.tsx
"use client";

import type { MarketingConfig, MarketingCrmEntry } from "@/lib/marketingTypes";
import StatusChip, { statusVariant } from "@/components/StatusChip";

interface PlatformRailProps {
  config: MarketingConfig;
  entries: MarketingCrmEntry[];
  activeFilter: "all" | "x" | "instagram";
  onFilter: (filter: "all" | "x" | "instagram") => void;
  onOpenSettings: () => void;
}

export default function PlatformRail({ config, entries, activeFilter, onFilter, onOpenSettings }: PlatformRailProps) {
  const xLeads = entries.filter((e) => e.type === "x_lead");
  const creators = entries.filter((e) => e.type === "creator");
  const xActive = xLeads.filter((e) => e.status === "in_conversation" || e.status === "contacted").length;
  const creatorsNegotiating = creators.filter((e) => e.status === "negotiating" || e.status === "contacted").length;

  return (
    <aside>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        <p className="label-caps">Platforms</p>
        <button
          type="button"
          className="mono"
          onClick={onOpenSettings}
          style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", fontSize: 11 }}
        >
          settings
        </button>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {config.platforms.includes("x") && (
          <button
            type="button"
            className="kraft-card"
            onClick={() => onFilter(activeFilter === "x" ? "all" : "x")}
            style={{
              padding: "1rem",
              cursor: "pointer",
              textAlign: "left",
              border: activeFilter === "x" ? "2px solid var(--hanko)" : "1px solid var(--ink)",
            }}
          >
            <strong style={{ fontFamily: "var(--font-headline)" }}>X (Twitter)</strong>
            <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "0.4rem", fontSize: 12 }}>
              {xLeads.length} leads · {xActive} active
            </p>
            <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
              Budget: ${config.x_boost_budget ?? 0}/mo
            </p>
          </button>
        )}
        {config.platforms.includes("instagram") && (
          <button
            type="button"
            className="kraft-card"
            onClick={() => onFilter(activeFilter === "instagram" ? "all" : "instagram")}
            style={{
              padding: "1rem",
              cursor: "pointer",
              textAlign: "left",
              border: activeFilter === "instagram" ? "2px solid var(--hanko)" : "1px solid var(--ink)",
            }}
          >
            <strong style={{ fontFamily: "var(--font-headline)" }}>Instagram</strong>
            <p className="mono" style={{ color: "var(--ink-soft)", marginTop: "0.4rem", fontSize: 12 }}>
              {creators.length} creators · {creatorsNegotiating} negotiating
            </p>
            <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
              Offer: ${config.ig_offer_min ?? 0}–${config.ig_offer_max ?? 0}
            </p>
          </button>
        )}
      </div>
    </aside>
  );
}
```

- [ ] **Step 2: Create MarketingPanel**

```tsx
// web/components/MarketingPanel.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import type { MarketingConfig, MarketingCrmEntry, Conversation } from "@/lib/marketingTypes";
import MarketingSetup from "@/components/MarketingSetup";
import PlatformRail from "@/components/PlatformRail";
import MarketingCRM from "@/components/MarketingCRM";
import ConversationsPanel from "@/components/ConversationsPanel";
import KillSwitch from "@/components/KillSwitch";

interface MarketingPanelProps {
  sessionId: string;
  sessionDbId: string | null;
  config: MarketingConfig | null;
  dossierTone?: string[];
  onSetup: (config: MarketingConfig) => void;
}

export default function MarketingPanel({ sessionId, sessionDbId, config, dossierTone, onSetup }: MarketingPanelProps) {
  const [entries, setEntries] = useState<MarketingCrmEntry[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [platformFilter, setPlatformFilter] = useState<"all" | "x" | "instagram">("all");
  const [showSettings, setShowSettings] = useState(false);
  const [paused, setPaused] = useState(false);

  const fetchCrm = useCallback(() => {
    if (!sessionDbId) return;
    fetch(`/api/marketing/crm?session_id=${sessionDbId}`)
      .then((r) => r.json())
      .then((j) => setEntries(j.entries ?? []))
      .catch(() => {});
  }, [sessionDbId]);

  const fetchConversations = useCallback(() => {
    if (!sessionDbId) return;
    fetch(`/api/conversations?session_id=${sessionDbId}`)
      .then((r) => r.json())
      .then((j) => setConversations(j.conversations ?? []))
      .catch(() => {});
  }, [sessionDbId]);

  useEffect(() => {
    fetchCrm();
    fetchConversations();
  }, [fetchCrm, fetchConversations]);

  if (!config || showSettings) {
    return (
      <MarketingSetup
        sessionId={sessionId}
        existingTone={dossierTone}
        onComplete={(c) => {
          onSetup(c);
          setShowSettings(false);
        }}
      />
    );
  }

  const filtered = platformFilter === "all"
    ? entries
    : entries.filter((e) => e.platform === platformFilter);

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        <p className="label-caps">Marketing Operations</p>
        <KillSwitch paused={paused} onToggle={() => setPaused(!paused)} />
      </div>
      <hr className="crease" />
      <div className="dashboard-grid">
        <PlatformRail
          config={config}
          entries={entries}
          activeFilter={platformFilter}
          onFilter={setPlatformFilter}
          onOpenSettings={() => setShowSettings(true)}
        />
        <MarketingCRM
          entries={filtered}
          config={config}
          sessionDbId={sessionDbId}
          onRefresh={fetchCrm}
        />
        <ConversationsPanel
          conversations={conversations}
          entries={entries}
          onRefresh={fetchConversations}
        />
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Update Dashboard.tsx — replace marketing placeholder**

In `Dashboard.tsx`, replace the marketing tab placeholder block:
```tsx
{tab === "marketing" && (
  <div style={{ marginTop: "var(--stack-md)" }}>
    <p className="mono" style={{ color: "var(--ink-soft)" }}>
      Marketing panel loading…
    </p>
  </div>
)}
```

With:
```tsx
{tab === "marketing" && (
  <MarketingPanel
    sessionId={sessionId}
    sessionDbId={null}
    config={marketingConfig}
    dossierTone={dossier?.tone}
    onSetup={onMarketingSetup}
  />
)}
```

Add the import at the top of Dashboard.tsx:
```typescript
import MarketingPanel from "@/components/MarketingPanel";
```

- [ ] **Step 4: Commit**

Note: MarketingCRM, ConversationsPanel, and KillSwitch don't exist yet — create empty stubs so the build passes, then implement them in the following tasks.

```bash
git add web/components/PlatformRail.tsx web/components/MarketingPanel.tsx web/components/Dashboard.tsx
git commit -m "feat(marketing): add MarketingPanel with PlatformRail and setup wiring"
```

---

## Task 8: KillSwitch component

**Files:**
- Create: `web/components/KillSwitch.tsx`

- [ ] **Step 1: Create KillSwitch**

```tsx
// web/components/KillSwitch.tsx
"use client";

interface KillSwitchProps {
  paused: boolean;
  onToggle: () => void;
}

export default function KillSwitch({ paused, onToggle }: KillSwitchProps) {
  return (
    <button
      type="button"
      className="mono"
      onClick={onToggle}
      style={{
        background: paused ? "var(--hanko)" : "transparent",
        color: paused ? "var(--paper)" : "var(--ink-soft)",
        border: `1px solid ${paused ? "var(--hanko)" : "var(--ink)"}`,
        padding: "0.3rem 0.7rem",
        cursor: "pointer",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {paused ? "▶ Resume all" : "⏸ Pause all"}
    </button>
  );
}
```

- [ ] **Step 2: Commit**

```bash
git add web/components/KillSwitch.tsx
git commit -m "feat(marketing): add KillSwitch component for pausing autonomous conversations"
```

---

## Task 9: LeadTable + CreatorTable components

**Files:**
- Create: `web/components/LeadTable.tsx`
- Create: `web/components/CreatorTable.tsx`

- [ ] **Step 1: Create LeadTable**

```tsx
// web/components/LeadTable.tsx
"use client";

import type { MarketingCrmEntry } from "@/lib/marketingTypes";
import StatusChip from "@/components/StatusChip";

interface LeadTableProps {
  leads: MarketingCrmEntry[];
  onApprove: (ids: string[]) => void;
}

export default function LeadTable({ leads, onApprove }: LeadTableProps) {
  const identified = leads.filter((l) => l.status === "identified");

  return (
    <div>
      {identified.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
          <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
            {identified.length} leads awaiting approval
          </p>
          <button
            className="hanko-btn"
            style={{ fontSize: 13, padding: "0.5rem 1rem" }}
            onClick={() => onApprove(identified.map((l) => l.id))}
          >
            Approve all ({identified.length})
          </button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {leads.length === 0 && (
          <p className="mono" style={{ color: "var(--ink-soft)" }}>
            No leads yet. Run discovery to find prospects.
          </p>
        )}
        {leads.map((lead) => (
          <div className="kraft-card" key={lead.id} style={{ padding: "0.75rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
              <div style={{ flex: 1, minWidth: 160 }}>
                <strong style={{ fontFamily: "var(--font-headline)", fontSize: 14 }}>
                  {lead.name ?? lead.handle}
                </strong>
                <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
                  @{lead.handle}
                </p>
              </div>
              <div className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                {lead.niche_match_score != null && `relevance: ${Math.round(lead.niche_match_score * 100)}%`}
              </div>
              <StatusChip label={lead.status} />
            </div>
            {lead.relevance_reasoning && (
              <p style={{ fontSize: 13, color: "var(--ink-soft)", marginTop: "0.4rem" }}>
                {lead.relevance_reasoning}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create CreatorTable**

```tsx
// web/components/CreatorTable.tsx
"use client";

import { useState } from "react";
import type { MarketingCrmEntry } from "@/lib/marketingTypes";
import StatusChip from "@/components/StatusChip";

interface CreatorTableProps {
  creators: MarketingCrmEntry[];
  onApproveOutreach: (ids: string[]) => void;
}

export default function CreatorTable({ creators, onApproveOutreach }: CreatorTableProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const identified = creators.filter((c) => c.status === "identified");

  return (
    <div>
      {identified.length > 0 && (
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
          <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
            {identified.length} creators ready for outreach
          </p>
          <button
            className="hanko-btn"
            style={{ fontSize: 13, padding: "0.5rem 1rem" }}
            onClick={() => onApproveOutreach(identified.map((c) => c.id))}
          >
            Approve outreach ({identified.length})
          </button>
        </div>
      )}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {creators.length === 0 && (
          <p className="mono" style={{ color: "var(--ink-soft)" }}>
            No creators yet. Run discovery to find matches.
          </p>
        )}
        {creators.map((creator) => (
          <div className="kraft-card" key={creator.id} style={{ padding: "0.75rem 1rem" }}>
            <button
              type="button"
              onClick={() => setExpandedId(expandedId === creator.id ? null : creator.id)}
              style={{ background: "none", border: "none", cursor: "pointer", width: "100%", textAlign: "left" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 160 }}>
                  <strong style={{ fontFamily: "var(--font-headline)", fontSize: 14 }}>
                    {creator.name ?? creator.handle}
                  </strong>
                  <p className="mono" style={{ color: "var(--ink-soft)", fontSize: 12 }}>
                    @{creator.handle}
                  </p>
                </div>
                <div className="mono" style={{ fontSize: 12, color: "var(--ink-soft)", display: "flex", gap: "1rem" }}>
                  {creator.followers != null && <span>{(creator.followers / 1000).toFixed(1)}k followers</span>}
                  {creator.engagement_rate != null && <span>{(creator.engagement_rate * 100).toFixed(1)}% eng</span>}
                </div>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  {creator.offer_amount != null && (
                    <span className="mono" style={{ fontSize: 12 }}>${creator.offer_amount}</span>
                  )}
                  <StatusChip label={creator.status} />
                </div>
                <span style={{ color: "var(--hanko)", fontSize: 12 }}>
                  {expandedId === creator.id ? "−" : "+"}
                </span>
              </div>
            </button>
            {expandedId === creator.id && (
              <div style={{ marginTop: "var(--stack-sm)", paddingTop: "var(--stack-sm)", borderTop: "1px solid var(--crease)" }}>
                {creator.relevance_reasoning && (
                  <p style={{ fontSize: 13, marginBottom: "0.4rem" }}>
                    <span className="label-caps" style={{ marginRight: "0.5rem" }}>Why</span>
                    {creator.relevance_reasoning}
                  </p>
                )}
                {creator.niche_match_score != null && (
                  <p className="mono" style={{ fontSize: 12, color: "var(--ink-soft)" }}>
                    Niche match: {Math.round(creator.niche_match_score * 100)}%
                  </p>
                )}
                {creator.calendar_event_id && (
                  <p className="mono" style={{ fontSize: 12, color: "var(--moss)" }}>
                    ✓ Calendar event scheduled
                  </p>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add web/components/LeadTable.tsx web/components/CreatorTable.tsx
git commit -m "feat(marketing): add LeadTable and CreatorTable CRM components"
```

---

## Task 10: BoostManager + MarketingCRM components

**Files:**
- Create: `web/components/BoostManager.tsx`
- Create: `web/components/MarketingCRM.tsx`

- [ ] **Step 1: Create BoostManager**

```tsx
// web/components/BoostManager.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import type { XPost, BoostCampaign } from "@/lib/marketingTypes";
import StatusChip from "@/components/StatusChip";

interface BoostManagerProps {
  sessionDbId: string | null;
}

export default function BoostManager({ sessionDbId }: BoostManagerProps) {
  const [posts, setPosts] = useState<XPost[]>([]);
  const [boosts, setBoosts] = useState<BoostCampaign[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchPosts = useCallback(() => {
    setLoading(true);
    fetch("/api/x/posts")
      .then((r) => r.json())
      .then((j) => setPosts(j.posts ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  async function boost(post: XPost) {
    const res = await fetch("/api/x/boost", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: post.id, post_text: post.text, session_id: sessionDbId }),
    });
    const json = await res.json();
    if (json.campaign) {
      setBoosts((prev) => [...prev, json.campaign]);
    }
  }

  const boostedIds = new Set(boosts.map((b) => b.post_id));

  return (
    <div style={{ marginBottom: "var(--stack-md)" }}>
      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Boost Posts</p>
      {loading && <p className="mono" style={{ color: "var(--ink-soft)" }}>Loading posts…</p>}
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {posts.filter((p) => !boostedIds.has(p.id)).slice(0, 5).map((post) => (
          <div className="kraft-card" key={post.id} style={{ padding: "0.75rem 1rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <p style={{ flex: 1, fontSize: 13, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {post.text.slice(0, 80)}{post.text.length > 80 ? "…" : ""}
              </p>
              <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", whiteSpace: "nowrap" }}>
                {post.public_metrics.like_count} ♥ · {post.public_metrics.retweet_count} ↻
              </span>
              <button
                className="mono"
                onClick={() => boost(post)}
                style={{
                  border: "1px solid var(--ink)",
                  background: "transparent",
                  padding: "0.3rem 0.7rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                }}
              >
                Boost
              </button>
            </div>
          </div>
        ))}
      </div>
      {boosts.length > 0 && (
        <div style={{ marginTop: "var(--stack-md)" }}>
          <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Active Boosts</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
            {boosts.map((b) => (
              <div className="kraft-card" key={b.id} style={{ padding: "0.75rem 1rem" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
                  <p style={{ flex: 1, fontSize: 13 }}>{b.post_text.slice(0, 60)}…</p>
                  <span className="mono" style={{ fontSize: 11, color: "var(--ink-soft)" }}>
                    ${b.spend ?? 0} / ${b.budget}
                  </span>
                  <StatusChip label={b.status} />
                </div>
                {(b.impressions != null || b.clicks != null) && (
                  <p className="mono" style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: "0.3rem" }}>
                    {b.impressions ?? 0} impressions · {b.clicks ?? 0} clicks
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: Create MarketingCRM**

```tsx
// web/components/MarketingCRM.tsx
"use client";

import { useState } from "react";
import type { MarketingConfig, MarketingCrmEntry } from "@/lib/marketingTypes";
import BoostManager from "@/components/BoostManager";
import LeadTable from "@/components/LeadTable";
import CreatorTable from "@/components/CreatorTable";

type CrmSubTab = "x_outreach" | "creators";

interface MarketingCRMProps {
  entries: MarketingCrmEntry[];
  config: MarketingConfig;
  sessionDbId: string | null;
  onRefresh: () => void;
}

export default function MarketingCRM({ entries, config, sessionDbId, onRefresh }: MarketingCRMProps) {
  const hasX = config.platforms.includes("x");
  const hasIg = config.platforms.includes("instagram");
  const defaultTab: CrmSubTab = hasX ? "x_outreach" : "creators";
  const [subTab, setSubTab] = useState<CrmSubTab>(defaultTab);

  const leads = entries.filter((e) => e.type === "x_lead");
  const creators = entries.filter((e) => e.type === "creator");

  async function approveLeads(ids: string[]) {
    for (const id of ids) {
      await fetch("/api/marketing/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "approved" }),
      });
    }
    onRefresh();
  }

  async function approveCreatorOutreach(ids: string[]) {
    for (const id of ids) {
      await fetch("/api/marketing/crm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "contacted" }),
      });
    }
    onRefresh();
  }

  async function triggerDiscovery() {
    await fetch("/api/marketing/discover", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ session_id: sessionDbId }),
    });
    setTimeout(onRefresh, 3000);
  }

  return (
    <div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "var(--stack-sm)" }}>
        {(hasX && hasIg) && (
          <div style={{ display: "flex", gap: "0" }}>
            <button
              type="button"
              className="campaign-tab"
              data-active={subTab === "x_outreach"}
              onClick={() => setSubTab("x_outreach")}
            >
              X Outreach
            </button>
            <button
              type="button"
              className="campaign-tab"
              data-active={subTab === "creators"}
              onClick={() => setSubTab("creators")}
            >
              Creators
            </button>
          </div>
        )}
        <button
          className="mono"
          onClick={triggerDiscovery}
          style={{
            border: "1px solid var(--ink)",
            background: "transparent",
            padding: "0.3rem 0.7rem",
            cursor: "pointer",
          }}
        >
          Run discovery
        </button>
      </div>
      <hr className="crease" />

      {subTab === "x_outreach" && hasX && (
        <>
          <BoostManager sessionDbId={sessionDbId} />
          <hr className="crease" />
          <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Cold Outreach</p>
          <LeadTable leads={leads} onApprove={approveLeads} />
        </>
      )}

      {subTab === "creators" && hasIg && (
        <CreatorTable creators={creators} onApproveOutreach={approveCreatorOutreach} />
      )}
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add web/components/BoostManager.tsx web/components/MarketingCRM.tsx
git commit -m "feat(marketing): add BoostManager and MarketingCRM components"
```

---

## Task 11: ConversationsPanel + ConversationThread + EscalationBanner

**Files:**
- Create: `web/components/ConversationsPanel.tsx`
- Create: `web/components/ConversationThread.tsx`
- Create: `web/components/EscalationBanner.tsx`

- [ ] **Step 1: Create EscalationBanner**

```tsx
// web/components/EscalationBanner.tsx
"use client";

interface EscalationBannerProps {
  reason: string;
  onApprove: () => void;
  onCounter: () => void;
  onDecline: () => void;
}

export default function EscalationBanner({ reason, onApprove, onCounter, onDecline }: EscalationBannerProps) {
  return (
    <div
      style={{
        background: "var(--hanko)",
        color: "var(--paper)",
        padding: "0.75rem 1rem",
        marginBottom: "var(--stack-sm)",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "1rem",
        flexWrap: "wrap",
      }}
    >
      <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 700 }}>
        ⚠ ESCALATION — {reason}
      </p>
      <div style={{ display: "flex", gap: "0.5rem" }}>
        <button
          type="button"
          className="mono"
          onClick={onApprove}
          style={{ background: "var(--paper)", color: "var(--ink)", border: "none", padding: "0.3rem 0.7rem", cursor: "pointer", fontWeight: 700 }}
        >
          Approve
        </button>
        <button
          type="button"
          className="mono"
          onClick={onCounter}
          style={{ background: "transparent", color: "var(--paper)", border: "1px solid var(--paper)", padding: "0.3rem 0.7rem", cursor: "pointer" }}
        >
          Counter
        </button>
        <button
          type="button"
          className="mono"
          onClick={onDecline}
          style={{ background: "transparent", color: "var(--paper)", border: "1px solid var(--paper)", padding: "0.3rem 0.7rem", cursor: "pointer" }}
        >
          Decline
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create ConversationThread**

```tsx
// web/components/ConversationThread.tsx
"use client";

import { useCallback, useEffect, useState } from "react";
import type { Conversation, ConversationMessage } from "@/lib/marketingTypes";
import EscalationBanner from "@/components/EscalationBanner";

interface ConversationThreadProps {
  conversation: Conversation;
  handle: string;
  onBack: () => void;
  onRefresh: () => void;
}

export default function ConversationThread({ conversation, handle, onBack, onRefresh }: ConversationThreadProps) {
  const [messages, setMessages] = useState<ConversationMessage[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);

  const fetchMessages = useCallback(() => {
    fetch(`/api/conversations/${conversation.id}`)
      .then((r) => r.json())
      .then((j) => setMessages(j.messages ?? []))
      .catch(() => {});
  }, [conversation.id]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  async function sendManual() {
    const text = input.trim();
    if (!text || sending) return;
    setInput("");
    setSending(true);
    try {
      await fetch(`/api/conversations/${conversation.id}/intervene`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", content: text }),
      });
      fetchMessages();
    } catch {
      // noop
    } finally {
      setSending(false);
    }
  }

  async function handleEscalation(action: "approve" | "counter" | "decline") {
    await fetch(`/api/conversations/${conversation.id}/intervene`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    onRefresh();
  }

  return (
    <div>
      <button
        type="button"
        className="mono"
        onClick={onBack}
        style={{ background: "none", border: "none", cursor: "pointer", color: "var(--ink-soft)", marginBottom: "var(--stack-sm)" }}
      >
        ← back to conversations
      </button>
      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>
        @{handle} · {conversation.status.replace(/_/g, " ")}
      </p>

      {conversation.status === "escalated" && conversation.escalation_reason && (
        <EscalationBanner
          reason={conversation.escalation_reason}
          onApprove={() => handleEscalation("approve")}
          onCounter={() => handleEscalation("counter")}
          onDecline={() => handleEscalation("decline")}
        />
      )}

      <div className="kraft-card" style={{ maxHeight: 400, overflowY: "auto", marginBottom: "var(--stack-sm)" }}>
        {messages.length === 0 && (
          <p className="mono" style={{ color: "var(--ink-soft)" }}>No messages yet.</p>
        )}
        {messages.map((m) => (
          <div key={m.id} style={{ marginBottom: "var(--stack-sm)" }}>
            <span className="label-caps" style={{ color: m.sender === "kami" ? "var(--moss)" : "var(--ink-soft)" }}>
              {m.sender === "kami" ? "You (Kami)" : handle}
            </span>
            <span className="mono" style={{ fontSize: 11, color: "var(--outline)", marginLeft: "0.5rem" }}>
              {new Date(m.sent_at).toLocaleTimeString()}
            </span>
            <p style={{ fontFamily: "var(--font-mono)", fontSize: 13, whiteSpace: "pre-wrap", marginTop: "0.2rem" }}>
              {m.content}
            </p>
            {m.status === "failed" && (
              <span className="mono" style={{ fontSize: 11, color: "var(--hanko)" }}>⚠ failed to send</span>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: "0.5rem" }}>
        <div className="form-line" style={{ flex: 1 }}>
          <label className="mono label-caps" htmlFor="manual-msg">Take over</label>
          <input
            id="manual-msg"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendManual()}
            placeholder="Type to take over this conversation…"
            disabled={sending}
          />
        </div>
        <button className="hanko-btn" onClick={sendManual} disabled={sending} style={{ alignSelf: "flex-end" }}>
          Send
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create ConversationsPanel**

```tsx
// web/components/ConversationsPanel.tsx
"use client";

import { useState } from "react";
import type { Conversation, MarketingCrmEntry } from "@/lib/marketingTypes";
import StatusChip from "@/components/StatusChip";
import ConversationThread from "@/components/ConversationThread";

type PlatformFilter = "all" | "x" | "instagram";

interface ConversationsPanelProps {
  conversations: Conversation[];
  entries: MarketingCrmEntry[];
  onRefresh: () => void;
}

export default function ConversationsPanel({ conversations, entries, onRefresh }: ConversationsPanelProps) {
  const [filter, setFilter] = useState<PlatformFilter>("all");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const filtered = filter === "all" ? conversations : conversations.filter((c) => c.platform === filter);
  const actionFirst = [...filtered].sort((a, b) => {
    if (a.status === "escalated" && b.status !== "escalated") return -1;
    if (b.status === "escalated" && a.status !== "escalated") return 1;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  const selected = selectedId ? conversations.find((c) => c.id === selectedId) : null;
  const selectedEntry = selected ? entries.find((e) => e.id === selected.crm_entry_id) : null;

  if (selected && selectedEntry) {
    return (
      <aside>
        <ConversationThread
          conversation={selected}
          handle={selectedEntry.handle}
          onBack={() => setSelectedId(null)}
          onRefresh={onRefresh}
        />
      </aside>
    );
  }

  return (
    <aside>
      <p className="label-caps" style={{ marginBottom: "var(--stack-sm)" }}>Conversations</p>
      <div style={{ display: "flex", gap: "0.4rem", marginBottom: "var(--stack-sm)" }}>
        {(["all", "x", "instagram"] as PlatformFilter[]).map((f) => (
          <button
            key={f}
            type="button"
            className="mono"
            onClick={() => setFilter(f)}
            style={{
              background: filter === f ? "var(--kraft)" : "transparent",
              border: "1px solid var(--ink)",
              padding: "0.2rem 0.5rem",
              cursor: "pointer",
              fontSize: 11,
            }}
          >
            {f === "all" ? "All" : f === "x" ? "X" : "IG"}
          </button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "var(--stack-sm)" }}>
        {actionFirst.length === 0 && (
          <p className="mono" style={{ color: "var(--ink-soft)" }}>No active conversations.</p>
        )}
        {actionFirst.map((conv) => {
          const entry = entries.find((e) => e.id === conv.crm_entry_id);
          return (
            <button
              key={conv.id}
              type="button"
              className="kraft-card"
              onClick={() => setSelectedId(conv.id)}
              style={{ padding: "0.75rem 1rem", cursor: "pointer", textAlign: "left" }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <strong style={{ fontFamily: "var(--font-headline)", fontSize: 14 }}>
                  @{entry?.handle ?? "unknown"}
                </strong>
                <StatusChip label={conv.status} />
              </div>
              {conv.escalation_reason && (
                <p className="mono" style={{ fontSize: 11, color: "var(--hanko)", marginTop: "0.3rem" }}>
                  ⚠ {conv.escalation_reason}
                </p>
              )}
              <p className="mono" style={{ fontSize: 11, color: "var(--outline)", marginTop: "0.2rem" }}>
                {conv.platform} · updated {new Date(conv.updated_at).toLocaleDateString()}
              </p>
            </button>
          );
        })}
      </div>
    </aside>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add web/components/EscalationBanner.tsx web/components/ConversationThread.tsx web/components/ConversationsPanel.tsx
git commit -m "feat(marketing): add ConversationsPanel with thread view and escalation handling"
```

---

## Task 12: Conversations API routes + Supabase tables

**Files:**
- Create: `web/app/api/conversations/route.ts`
- Create: `web/app/api/conversations/[id]/route.ts`

- [ ] **Step 1: Create Supabase tables**

```sql
create table if not exists conversations (
  id uuid primary key default gen_random_uuid(),
  crm_entry_id uuid references marketing_crm(id),
  platform text not null,
  goal text not null,
  persona_config jsonb,
  budget_min integer,
  budget_max integer,
  status text not null default 'idle',
  escalation_reason text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) on delete cascade,
  sender text not null check (sender in ('kami', 'lead')),
  content text not null,
  platform_message_id text,
  status text not null default 'sent' check (status in ('sent', 'failed')),
  sent_at timestamptz default now()
);

create index idx_conversations_crm on conversations(crm_entry_id);
create index idx_conversation_messages_conv on conversation_messages(conversation_id);
```

- [ ] **Step 2: Create conversations list route**

```typescript
// web/app/api/conversations/route.ts
import { supabaseServer } from "@/lib/supabase";

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ conversations: [] });

  const sessionId = new URL(request.url).searchParams.get("session_id");

  let query = sb
    .from("conversations")
    .select("*, marketing_crm!inner(session_id, handle, platform)")
    .order("updated_at", { ascending: false })
    .limit(100);

  if (sessionId) {
    query = query.eq("marketing_crm.session_id", sessionId);
  }

  const { data, error } = await query;
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ conversations: data ?? [] });
}
```

- [ ] **Step 3: Create conversation detail + intervene route**

```typescript
// web/app/api/conversations/[id]/route.ts
import { supabaseServer } from "@/lib/supabase";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const sb = supabaseServer();
  if (!sb) return Response.json({ messages: [] });

  const { data: messages } = await sb
    .from("conversation_messages")
    .select("*")
    .eq("conversation_id", id)
    .order("sent_at", { ascending: true });

  return Response.json({ messages: messages ?? [] });
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }): Promise<Response> {
  const { id } = await params;
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const { action, content } = await request.json();

  if (action === "send" && content) {
    await sb.from("conversation_messages").insert({
      conversation_id: id,
      sender: "kami",
      content,
      status: "sent",
    });
    await sb
      .from("conversations")
      .update({ status: "response_sent", updated_at: new Date().toISOString() })
      .eq("id", id);
    return Response.json({ sent: true });
  }

  if (action === "approve" || action === "counter" || action === "decline") {
    const newStatus = action === "decline" ? "concluded" : "awaiting_reply";
    await sb
      .from("conversations")
      .update({
        status: newStatus,
        escalation_reason: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id);
    return Response.json({ resolved: true, status: newStatus });
  }

  return Response.json({ error: "unknown action" }, { status: 400 });
}
```

- [ ] **Step 4: Commit**

```bash
git add web/app/api/conversations/route.ts web/app/api/conversations/\[id\]/route.ts
git commit -m "feat(marketing): add conversations API routes + Supabase tables"
```

---

## Task 13: X posts + boost API routes + Supabase table

**Files:**
- Create: `web/app/api/x/posts/route.ts`
- Create: `web/app/api/x/boost/route.ts`

- [ ] **Step 1: Create boost_campaigns table**

```sql
create table if not exists boost_campaigns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references agent_sessions(id),
  post_id text not null,
  post_text text not null,
  budget integer not null,
  status text not null default 'pending' check (status in ('pending', 'live', 'completed')),
  impressions integer default 0,
  clicks integer default 0,
  spend real default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);
```

- [ ] **Step 2: Create X posts route**

```typescript
// web/app/api/x/posts/route.ts
import { resolveXAccess } from "@/lib/xCreds";

export async function GET(): Promise<Response> {
  const access = await resolveXAccess();
  if (!access) return Response.json({ posts: [], error: "No X account connected" });

  try {
    const meRes = await fetch("https://api.x.com/2/users/me", {
      headers: { Authorization: `Bearer ${access.token}` },
    });
    const me = await meRes.json();
    const userId = me.data?.id;
    if (!userId) return Response.json({ posts: [], error: "Could not resolve user" });

    const query = new URLSearchParams({
      max_results: "10",
      "tweet.fields": "public_metrics,created_at",
      exclude: "retweets,replies",
    });
    const res = await fetch(`https://api.x.com/2/users/${userId}/tweets?${query}`, {
      headers: { Authorization: `Bearer ${access.token}` },
    });
    const json = await res.json();
    if (!res.ok) return Response.json({ posts: [], error: `X API ${res.status}` });

    return Response.json({ posts: json.data ?? [] });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "failed";
    return Response.json({ posts: [], error: msg });
  }
}
```

- [ ] **Step 3: Create boost route**

```typescript
// web/app/api/x/boost/route.ts
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const { post_id, post_text, session_id, budget } = await request.json();
  if (!post_id || !post_text) return Response.json({ error: "post_id and post_text required" }, { status: 400 });

  // ponytail: real X Ads API integration deferred — log the campaign intent for now
  // upgrade path: wire lib/xAds.ts with X_ADS_ACCESS_TOKEN + X_ADS_ACCOUNT_ID
  const { data, error } = await sb
    .from("boost_campaigns")
    .insert({
      session_id: session_id ?? null,
      post_id,
      post_text,
      budget: budget ?? 50,
      status: "pending",
    })
    .select("*")
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ campaign: data });
}

export async function GET(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ campaigns: [] });

  const sessionId = new URL(request.url).searchParams.get("session_id");
  let query = sb.from("boost_campaigns").select("*").order("created_at", { ascending: false });
  if (sessionId) query = query.eq("session_id", sessionId);

  const { data } = await query;
  return Response.json({ campaigns: data ?? [] });
}
```

- [ ] **Step 4: Commit**

```bash
git add web/app/api/x/posts/route.ts web/app/api/x/boost/route.ts
git commit -m "feat(marketing): add X posts fetch + boost campaign API routes"
```

---

## Task 14: Google Calendar lib + API route

**Files:**
- Create: `web/lib/googleCalendar.ts`
- Create: `web/app/api/calendar/event/route.ts`

- [ ] **Step 1: Create Google Calendar lib**

```typescript
// web/lib/googleCalendar.ts

const CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.GOOGLE_REFRESH_TOKEN;
const TOKEN_URL = "https://oauth2.googleapis.com/token";
const CALENDAR_API = "https://www.googleapis.com/calendar/v3";

export function calendarConfigured(): boolean {
  return Boolean(CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN);
}

async function getAccessToken(): Promise<string> {
  if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
    throw new Error("Google Calendar not configured");
  }
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      refresh_token: REFRESH_TOKEN,
      grant_type: "refresh_token",
    }),
  });
  const json = await res.json();
  if (!res.ok || !json.access_token) {
    throw new Error(`Google token refresh ${res.status}: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return json.access_token;
}

export interface CalendarEventParams {
  summary: string;
  description?: string;
  start: string; // ISO datetime
  end: string; // ISO datetime
  attendees?: string[]; // email addresses
}

export interface CalendarEventResult {
  event_id: string;
  html_link: string;
}

export async function createCalendarEvent(params: CalendarEventParams): Promise<CalendarEventResult> {
  const token = await getAccessToken();
  const res = await fetch(`${CALENDAR_API}/calendars/primary/events?sendUpdates=all`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      summary: params.summary,
      description: params.description,
      start: { dateTime: params.start, timeZone: "UTC" },
      end: { dateTime: params.end, timeZone: "UTC" },
      attendees: (params.attendees ?? []).map((email) => ({ email })),
    }),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(`Google Calendar ${res.status}: ${JSON.stringify(json).slice(0, 200)}`);
  }
  return { event_id: json.id, html_link: json.htmlLink };
}
```

- [ ] **Step 2: Create calendar event API route**

```typescript
// web/app/api/calendar/event/route.ts
import { calendarConfigured, createCalendarEvent } from "@/lib/googleCalendar";

export async function POST(request: Request): Promise<Response> {
  if (!calendarConfigured()) {
    return Response.json({ error: "Google Calendar not configured" }, { status: 503 });
  }

  const { summary, description, start, end, attendees } = await request.json();
  if (!summary || !start) {
    return Response.json({ error: "summary and start required" }, { status: 400 });
  }

  const endTime = end ?? new Date(new Date(start).getTime() + 30 * 60 * 1000).toISOString();

  try {
    const result = await createCalendarEvent({
      summary,
      description,
      start,
      end: endTime,
      attendees,
    });
    return Response.json({ created: true, ...result });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : "calendar event failed";
    return Response.json({ error: msg }, { status: 502 });
  }
}
```

- [ ] **Step 3: Commit**

```bash
git add web/lib/googleCalendar.ts web/app/api/calendar/event/route.ts
git commit -m "feat(marketing): add Google Calendar integration (create events with attendees)"
```

---

## Task 15: Instagram lib + discovery API route

**Files:**
- Create: `web/lib/instagram.ts`
- Create: `web/app/api/marketing/discover/route.ts`

- [ ] **Step 1: Create Instagram lib**

```typescript
// web/lib/instagram.ts

const ACCESS_TOKEN = process.env.INSTAGRAM_ACCESS_TOKEN;
const GRAPH_API = "https://graph.facebook.com/v21.0";

export function instagramConfigured(): boolean {
  return Boolean(ACCESS_TOKEN);
}

export interface IgCreatorProfile {
  handle: string;
  name: string;
  followers: number;
  bio: string;
  business_email?: string;
  engagement_rate: number;
}

export async function searchCreatorsByHashtag(
  hashtag: string,
  minFollowers: number,
): Promise<IgCreatorProfile[]> {
  if (!ACCESS_TOKEN) throw new Error("Instagram not configured");

  // Step 1: Get hashtag ID
  const hashRes = await fetch(
    `${GRAPH_API}/ig_hashtag_search?q=${encodeURIComponent(hashtag)}&user_id=me&access_token=${ACCESS_TOKEN}`,
  );
  const hashJson = await hashRes.json();
  const hashtagId = hashJson.data?.[0]?.id;
  if (!hashtagId) return [];

  // Step 2: Get recent media for hashtag
  const mediaRes = await fetch(
    `${GRAPH_API}/${hashtagId}/recent_media?fields=id,caption,permalink,timestamp&user_id=me&access_token=${ACCESS_TOKEN}&limit=50`,
  );
  const mediaJson = await mediaRes.json();
  const media = mediaJson.data ?? [];

  // ponytail: IG Graph API doesn't expose other users' profiles directly from hashtag media.
  // Real implementation: use Apify Instagram scraper or manual profile lookups.
  // For now, return the media metadata for the Hermes agent to process.
  return media.map((m: { id: string; caption?: string; permalink?: string }) => ({
    handle: m.permalink?.split("/")[3] ?? m.id,
    name: "",
    followers: 0,
    bio: m.caption?.slice(0, 200) ?? "",
    engagement_rate: 0,
  }));
}

export function extractBusinessEmail(bio: string): string | undefined {
  const match = bio.match(/[\w.+-]+@[\w-]+\.[\w.]+/);
  return match?.[0];
}
```

- [ ] **Step 2: Create discover route**

```typescript
// web/app/api/marketing/discover/route.ts
import { supabaseServer } from "@/lib/supabase";

export async function POST(request: Request): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const { session_id } = await request.json();

  // ponytail: discovery is delegated to Hermes marketing-researcher agent.
  // This route triggers the agent via the gateway and returns immediately.
  // The agent populates marketing_crm entries as it discovers leads/creators.
  // Upgrade path: call Hermes gateway POST /v1/chat/completions with
  // the marketing-researcher prompt + session config as context.

  const config = session_id
    ? await sb.from("marketing_config").select("*").eq("session_id", session_id).maybeSingle()
    : null;

  if (!config?.data) {
    return Response.json({ error: "no marketing config found" }, { status: 404 });
  }

  // For now, acknowledge the request. Real implementation sends to Hermes.
  return Response.json({
    triggered: true,
    platforms: config.data.platforms,
    message: "Discovery agent dispatched. Results will appear in the CRM.",
  });
}
```

- [ ] **Step 3: Commit**

```bash
git add web/lib/instagram.ts web/app/api/marketing/discover/route.ts
git commit -m "feat(marketing): add Instagram lib + discovery trigger API route"
```

---

## Task 16: Hermes agent prompts + skills

**Files:**
- Create: `agents/marketing-researcher.md`
- Create: `agents/conversation-agent.md`
- Create: `agents/boost-manager.md`
- Create: `skills/creator_outreach/SKILL.md`
- Create: `skills/x_cold_dm/SKILL.md`
- Create: `skills/persona_mimic/SKILL.md`

- [ ] **Step 1: Create marketing-researcher agent**

```markdown
# MARKETING-RESEARCHER — discover leads and creators

You discover and rank leads (X) and creators (Instagram) for the Marketing vertical. You receive a WorkOrder with the marketing config (platforms, niche keywords, ICP from dossier) and return a Result whose payload is a list of CRM entries.

## Mode A: X Lead Discovery

1. Parse inputs: ICP titles, industries, competitor handles from dossier.
2. Search X for users who:
   - Engage with competitor accounts (reply, retweet, quote)
   - Post about the problem space using ICP keywords
   - Match target follower range (not too small, not too large)
3. For each lead: extract handle, name, bio, follower count.
4. Score relevance 0-1 based on: keyword match, engagement with competitors, recency of activity.
5. Return ranked list as CRM entries with type "x_lead".

## Mode B: Instagram Creator Discovery

1. Parse inputs: niche keywords, min follower count, competitor handles.
2. Search by hashtag/niche + analyze competitor collaborations.
3. For each creator: extract handle, name, follower count, engagement rate, bio.
4. Extract business email from bio if present.
5. Score niche match 0-1 based on: content relevance, engagement rate, follower quality.
6. Return ranked list as CRM entries with type "creator".

## Rules
- Never fabricate profiles. If no tool is available, return status: "needs_input" with error code "NO_DISCOVERY_TOOL".
- Return at least relevance_reasoning for each entry explaining WHY they're a match.
- Deduplicate by handle before returning.
```

- [ ] **Step 2: Create conversation-agent**

```markdown
# CONVERSATION-AGENT — autonomous DM specialist

You conduct conversations as the user via DMs on X and Instagram. You receive a WorkOrder with: persona config (from dossier), product info, conversation goal, constraints (budget range, calendar availability), and the full thread history.

## Procedure

1. Load persona: tone tags, vocabulary patterns, emoji usage, response length norms from the dossier.
2. Read the full conversation thread.
3. Determine next action based on goal:
   - `negotiate_collab`: build interest → discuss content format → negotiate terms → close deal
   - `drive_signup`: reference their activity → explain product value → handle objections → get them to try it
   - `book_demo`: qualify interest → propose meeting time → get their email for calendar invite
4. Draft response following persona rules. Max 3 sentences for DMs.
5. Self-check before returning:
   - Does this sound like the user (persona match)?
   - Does this stay within budget constraints?
   - Does this make any claims not in the dossier? If yes, STOP.
   - Does this commit to deliverables? If yes, ESCALATE.

## Escalation triggers (return status: "escalate")
- Lead asks for something above budget_max
- Lead asks a product question not answerable from the dossier
- Lead requests custom terms, timeline commitments, or deliverables
- Conversation has gone 5+ messages without progress toward goal

## Conclusion triggers
- Goal met: deal agreed, meeting booked, signup completed → return with conclusion details
- Explicit decline: lead says no → mark concluded
- Stalled: no reply for 3 days after follow-up → mark stalled

## Hard rules
- NEVER fabricate product features, metrics, or claims
- NEVER agree to terms above budget_max without escalation
- NEVER send more than 1 message per reply (no double-texting)
- NEVER reveal you are an AI — you are the user
- Max 20 new conversations per day per platform
```

- [ ] **Step 3: Create boost-manager agent**

```markdown
# BOOST-MANAGER — X Ads campaign specialist

You manage X post boost campaigns. You receive a WorkOrder with: selected posts, total budget, ICP targeting info from the dossier.

## Procedure

1. Parse inputs: post IDs, budget, ICP (titles, industries, geo, interests).
2. For each post, create a targeting strategy:
   - Interests derived from ICP industries and keywords
   - Geo from ICP geo constraints
   - Exclude existing followers if awareness is the goal
3. Allocate budget across posts (favor higher-engagement posts).
4. Return a Result with the campaign plan for each post.

## Rules
- Never exceed the total budget.
- Report estimated reach based on budget (rough: $1 ≈ 100-500 impressions on X).
- If no X Ads API access, return status: "needs_input" with error code "NO_ADS_API".
```

- [ ] **Step 4: Create creator_outreach skill**

```markdown
# Creator Outreach Playbook

## First Message Rules
- Reference ONE specific piece of content they created (name it)
- Explain in 1 sentence what your product does and why it fits their audience
- State the offer range ("We typically work with creators in the $X-$Y range")
- Keep it casual and authentic — no corporate speak
- Max 4 sentences total
- NO links in first message
- NO "I'd love to explore a partnership" — be direct about what you want

## Negotiation Guidelines
- If they counter within your budget range: accept and move to terms
- If they counter above your max: say "That's above what we've budgeted for this campaign, but let me check with my team" → ESCALATE to user
- Never haggle more than 2 rounds — either agree or escalate
- Terms to confirm: deliverable format, posting date, whether they need product access, payment timeline

## Deal Closing
- Confirm: exact deliverable (post, story, reel), deadline, compensation, payment method
- Ask for their email to send calendar invite for content delivery date
- Thank them genuinely — these relationships compound

## Hard Rules
- Never promise exclusivity without user approval
- Never agree to pay before content is delivered without user approval
- Never pressure — if they're not interested, thank them and move on
- Stop on: explicit no, 3 days no reply after follow-up, or block
```

- [ ] **Step 5: Create x_cold_dm skill**

```markdown
# X Cold DM Outreach Playbook

## Opener Rules
- Reference their MOST RECENT relevant post or activity (within 7 days)
- 2-3 sentences maximum
- One clear value proposition tied to what they posted about
- NO links (triggers spam filters)
- NO "Hope this finds you well" or "I came across your profile"
- Be specific: "Saw your thread about [X] — we built [Y] that solves exactly that"

## Conversation Flow
1. **Hook** — reference their post + one-sentence value prop
2. **Qualify** — if they reply, ask one question to confirm fit
3. **Value** — share one concrete proof point (metric, case study reference)
4. **Close** — single CTA: "Want to try it?" or "Open to a 15-min call?"

## Hard Rules
- Max 1 follow-up if no reply (after 3 days). Then stop.
- Never send identical messages to multiple people
- Personalize every single DM — generic = instant block
- No selling in first message — just open the door
- If they say no or don't reply to follow-up: mark lost, never contact again
- Max 20 new DMs per day (platform rate limit safety)
```

- [ ] **Step 6: Create persona_mimic skill**

```markdown
# Persona Mimic — User Impersonation Rules

## Loading the Persona
1. Read tone tags from dossier (e.g. ["direct", "casual", "technical"])
2. Analyze brand_voice for vocabulary patterns
3. Note: the lead MUST believe they are talking to the user, not an AI

## Response Rules
- Match the user's typical message length (DMs are short: 1-3 sentences)
- Use their vocabulary level (technical if dossier says technical, simple if simple)
- Match emoji usage: if dossier tone is "professional" → no emojis; "casual" → occasional emojis OK
- Match formality: "Hey" vs "Hi" vs "Hello" based on tone tags
- Never use AI-typical phrases: "I'd be happy to", "Absolutely!", "Great question!", "I understand your concern"

## Drift Detection (self-check before every send)
- Does this sound like a real person texting?
- Would the user cringe reading this sent from their account?
- Is the response length appropriate for DM? (Not an essay)
- Any AI-giveaway phrases? Remove them.

## Things the persona NEVER does
- Write paragraphs in a DM
- Use bullet points or numbered lists in a DM
- Say "As [company name]'s founder" in every message
- Over-explain — real people are brief in DMs
- Use perfect grammar in casual contexts (contractions are fine)
```

- [ ] **Step 7: Commit**

```bash
git add agents/marketing-researcher.md agents/conversation-agent.md agents/boost-manager.md
mkdir -p skills/creator_outreach skills/x_cold_dm skills/persona_mimic
git add skills/creator_outreach/SKILL.md skills/x_cold_dm/SKILL.md skills/persona_mimic/SKILL.md
git commit -m "feat(marketing): add Hermes agent prompts and runtime skills for marketing vertical"
```

---

## Task 17: Conversation poll cron route

**Files:**
- Create: `web/app/api/conversations/poll/route.ts`

- [ ] **Step 1: Create the poll route**

```typescript
// web/app/api/conversations/poll/route.ts
import { supabaseServer } from "@/lib/supabase";

// Cron: poll all active conversations for new replies.
// In production, call this every 60s via Vercel Cron or external scheduler.
export async function POST(): Promise<Response> {
  const sb = supabaseServer();
  if (!sb) return Response.json({ error: "supabase not configured" }, { status: 503 });

  const { data: active } = await sb
    .from("conversations")
    .select("id, crm_entry_id, platform, goal, persona_config, budget_min, budget_max, status")
    .in("status", ["awaiting_reply", "first_msg_sent"]);

  if (!active?.length) return Response.json({ checked: 0, replies: 0 });

  let replies = 0;

  for (const conv of active) {
    // ponytail: platform-specific reply checking deferred.
    // Real implementation:
    // - X: use X API search for conversation_id replies
    // - IG: use Instagram Messaging API to check inbox
    // For now, this is the hook point. When platform APIs are wired,
    // each reply triggers the conversation-agent via Hermes gateway.

    // Check for stale conversations (no reply in 3 days)
    const { data: lastMsg } = await sb
      .from("conversation_messages")
      .select("sent_at, sender")
      .eq("conversation_id", conv.id)
      .order("sent_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (lastMsg?.sender === "kami") {
      const daysSince = (Date.now() - new Date(lastMsg.sent_at).getTime()) / (1000 * 60 * 60 * 24);
      if (daysSince > 3 && conv.status === "awaiting_reply") {
        await sb
          .from("conversations")
          .update({ status: "stalled", updated_at: new Date().toISOString() })
          .eq("id", conv.id);
      }
    }
  }

  return Response.json({ checked: active.length, replies });
}
```

- [ ] **Step 2: Commit**

```bash
git add web/app/api/conversations/poll/route.ts
git commit -m "feat(marketing): add conversation poll cron route with stale detection"
```

---

## Task 18: Wire MarketingPanel sessionDbId + verify full build

**Files:**
- Modify: `web/components/Dashboard.tsx`
- Modify: `web/app/page.tsx`

- [ ] **Step 1: Pass sessionDbId through Dashboard to MarketingPanel**

In `Dashboard.tsx`, add `sessionDbId` to DashboardProps interface and the component params, then pass it to MarketingPanel:

Add to DashboardProps:
```typescript
sessionDbId: string | null;
```

Update the MarketingPanel rendering:
```tsx
{tab === "marketing" && (
  <MarketingPanel
    sessionId={sessionId}
    sessionDbId={sessionDbId}
    config={marketingConfig}
    dossierTone={dossier?.tone}
    onSetup={onMarketingSetup}
  />
)}
```

- [ ] **Step 2: Pass sessionDbId from page.tsx**

In `page.tsx`, update the Dashboard JSX to include:
```tsx
sessionDbId={dbIdRef.current}
```

- [ ] **Step 3: Verify the full app builds**

Run: `cd /Users/varaddurge/Documents/kami/web && npx next build 2>&1 | tail -30`
Expected: build succeeds with no errors

- [ ] **Step 4: Commit**

```bash
git add web/components/Dashboard.tsx web/app/page.tsx
git commit -m "feat(marketing): wire sessionDbId through dashboard to marketing panel"
```

---

## Task 19: Update .env.example with new keys

**Files:**
- Modify: `web/.env.example`

- [ ] **Step 1: Add new env vars to .env.example**

Append to the existing `.env.example`:
```
# Marketing — Instagram Graph API
INSTAGRAM_ACCESS_TOKEN=
INSTAGRAM_APP_ID=
INSTAGRAM_APP_SECRET=

# Marketing — X Ads API
X_ADS_ACCESS_TOKEN=
X_ADS_ACCOUNT_ID=

# Marketing — Google Calendar
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_REFRESH_TOKEN=
```

- [ ] **Step 2: Commit**

```bash
git add web/.env.example
git commit -m "chore: add marketing env vars to .env.example"
```

---

## Task 20: Final build + push

- [ ] **Step 1: Full build check**

Run: `cd /Users/varaddurge/Documents/kami/web && npx next build 2>&1 | tail -30`
Expected: build succeeds

- [ ] **Step 2: Push to remote**

```bash
git push -u origin feature/marketing
```
