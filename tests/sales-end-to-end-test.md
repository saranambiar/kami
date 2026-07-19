# Sales End-to-End User Test

Walk through Kami’s Sales vertical the way a real user would: launch a campaign, configure outbound sales, approve a plan, discover targets, generate drafts, and (optionally) send email, handle a reply, and book a meeting.

**Test company (real website):** [cal.com](https://cal.com) — scheduling SaaS with strong public web presence, so Linkup discovery returns useful signals.

**Time:** ~30–45 minutes for the full path; ~15 minutes for setup → plan → discovery only.

---

## Before you start

### 1. Environment

From `web/`:

```bash
rm -rf .next
npm run dev
```

Open **http://localhost:3000** (PowerShell on Windows is more reliable than WSL for this repo; if you use WSL, use `npm run dev` which runs webpack, not Turbopack).

### 2. Required env vars (`web/.env.local`)

| Variable | Used for |
|----------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Sessions, Sales persistence |
| `SUPABASE_SERVICE_ROLE_KEY` | Server writes |
| `HERMES_API_KEY` | Overview dossier + CMO chat (**must be uncommented**) |
| `HERMES_GATEWAY_URL` | `https://api.trykami.app/v1/chat/completions` or `http://127.0.0.1:8642/v1/chat/completions` if local Hermes |
| `LINKUP_API_KEY` | Sales discovery + landing research |
| `AGENTMAIL_API_KEY` + `AGENTMAIL_INBOX` | Real email send (optional phase) |
| `GOOGLE_CLIENT_ID` / `SECRET` / `REFRESH_TOKEN` | Calendar invites (optional phase) |

### 3. Database

Migrations applied in Supabase:

- `003_marketing.sql`
- `004_sales.sql`

### 4. Start fresh (important)

The app **auto-resumes** your last campaign from `localStorage` (`kami_session`). To test from scratch:

1. Click **`+ new campaign`** on the dashboard, **or**
2. DevTools → Application → Local Storage → delete `kami_session`, then refresh.

You should land on the **KAMI.** landing page with an empty domain field—not an old domain like `trymirage.app`.

### 5. Sanity check (optional)

```bash
cd web && npm run eval:sales
```

Expect **15 passed**.

---

## Test persona

You are **Cal.com’s Head of Growth** running outbound through Kami.

| Role | Value |
|------|--------|
| Your product | Cal.com — open scheduling infrastructure for teams |
| Outbound goal | Book demos with VP Sales / Head of Revenue at B2B SaaS companies |
| Test recipient (for real send) | **Your own email** — never a stranger for first test |

---

## Phase 0 — Launch campaign (Overview)

### Steps

1. On landing, enter domain: **`cal.com`**
2. Select goals: **`Book meetings`**, **`Get signups`**
3. Select stage: **`Growth`**
4. Submit the form

### Expected behavior

| What you see | Why |
|--------------|-----|
| Dashboard header **`cal.com · campaigns`** | Session created in Supabase |
| Activity: **`linkup: live web scrape of cal.com…`** | Linkup pre-research ran |
| Activity stream fills with agent lines over 30–120s | Hermes manager via `/api/chat` |
| Right panel: **dossier** (company, ICP buckets, opportunities) | Parsed from Hermes response |
| Center: **Awaiting your approval** cards | Outreach/content plays |

### If something goes wrong

| Symptom | Fix |
|---------|-----|
| Jumps to old domain after a few seconds | Clear `kami_session`, click **+ new campaign** |
| `⚠ Gateway error 500` | Uncomment `HERMES_API_KEY` in `.env.local`, restart dev |
| Dossier never loads, only Linkup line | Same as above; check terminal for `POST /api/chat 500` |
| Blank dossier after long wait | Hermes returned non-JSON prose; check gateway logs / try again |

**Sales tab requires a session** — you must complete this phase first (or resume a session that has a Supabase `sessionDbId`).

---

## Phase 1 — Run outbound + confirm (NL setup)

### Steps

1. On **Overview**, click **Run outbound** (or open tab **Sales**)
2. You should see **Confirm who and what** with three prefilled blocks from the cal.com dossier
3. Edit if needed; pick **15** companies; optionally open **Edit details** or **Advanced**
4. Click **Looks good — show plan**

### Expected behavior

| What you see | Why |
|--------------|-----|
| Full-width NL textareas (not a narrow jargon form) | Founder UX |
| Intro: *“We filled this from your company research…”* | Dossier prefill |
| **Your outbound plan** card with plain-English motions | Plan scaffold |
| Stepper: Confirm → Plan → Find → Emails → Needs you | Guided path |
| No six equal ops tabs on first run | Progressive disclosure |

### If something goes wrong

| Symptom | Fix |
|---------|-----|
| “Waiting for session — launch a campaign first” | Complete Phase 0 |
| Blank NL fields | Dossier missing — wait for Overview dossier or re-launch |
| Plan says “Building your plan…” | Check `POST /api/sales/setup` and `POST /api/sales/plan` in Network tab |

---

## Phase 2 — Approve the sales plan

### Steps

1. Read **Your outbound plan**
2. (Optional) Revise note → **Regenerate with note**
3. Click **Approve plan**

### Expected behavior

| What you see | Why |
|--------------|-----|
| Status **Approved** | `sales_plans.status = approved` |
| Stepper advances to **Find** | Plan gate cleared |
| **Find companies** primary CTA (not auto-discovery) | Explicit find |

---

## Phase 3 — Find companies, add emails, continue

### Steps

1. Click **Find companies** (wait for Linkup discovery)
2. Check **Include** on 2–3 accounts
3. For each included account without email: enter **Add contact email** → **Save** (use **your own email** for test)
4. Click **Continue with selected**

### Expected behavior

| What you see | Why |
|--------------|-----|
| Company cards with Fit / Timing scores and source links | Target review |
| Inline email field when included | Never invent emails |
| Sequences created via UI (no console) | `POST /api/sales/sequences` |
| Stepper moves to **Emails** | Continue wired |

### Old flow (removed)

Do **not** use console `fetch` for sequences or contacts — the UI handles Continue.

---

## Phase 4 — Review and send emails (hybrid)

### Steps

1. On **Review emails**, for each draft: **review** → **approve** → **send** (first 1–3 one-by-one)
2. If **Approve first send** banner appears, click it once
3. After 1+ sends, use **Send remaining approved** for batch

### Expected behavior

| What you see | Why |
|--------------|-----|
| Draft cards with subject/body preview | Draft queue |
| Hybrid batch button after individual sends | Trust gate |
| Stepper moves to **Needs you** after send | `onSent` hook |

---

## Phase 5 — Needs you + More

### Steps

1. Open **Needs you** step — replies/escalations appear when present
2. After first send, open **More — Pipeline, Inbox, Meetings, Tasks**

---

## Legacy phases (reference)

<details>
<summary>Older E2E sections before founder UX (collapsed)</summary>

## Phase 1 (old) — Sales setup jargon form

1. Open ops tab **Targets**
2. Click **Run discovery**
3. Wait 10–60 seconds
4. Review account cards: tier, fit/intent/contact/priority %, signal **source** links
5. Uncheck **include** on any weak accounts; keep 2–3 strong ones checked
6. Click **Approve selected (N)**

### Expected behavior

| What you see | Why |
|--------------|-----|
| `Discovered N accounts` (N > 0) | Linkup research + scoring persisted |
| Each account: name, domain, tier, score breakdown | `sales_accounts` + `sales_lead_scores` |
| Signal lines with clickable **source** links | `sales_account_signals` with URL provenance |
| Stage **ready_for_approval** on cards | Pre-approval state |
| After **Approve selected**: included accounts move toward **sequencing** | PATCH pipeline stage |

### Realistic expectations

- Discovery finds **companies**, not always **people with emails**. Linkup rarely extracts verified contact emails—that is intentional (no fabricated addresses).
- Account count may be **less than 15** depending on Linkup results and ICP match.
- Some accounts show **“no verifiable signals”** — exclude those.

### If something goes wrong

| Symptom | Fix |
|---------|-----|
| `Linkup API not configured` | Set `LINKUP_API_KEY` |
| `no approved sales plan` | Approve plan first |
| `sales autonomous actions are paused` | Toggle kill switch off (top right) |
| `Discovered 0 accounts` | Try again; broaden ICP; confirm session domain is `cal.com` |

---

## Phase 4 — Create email sequences (API step)

There is **no “Create sequence” button in the UI yet**. After approving targets, create sequences via the browser console or curl.

### Steps

1. DevTools → **Console**
2. Get your session DB id from the dashboard (or Network tab on any `/api/sales/*` call as `session_id`)
3. Run:

```javascript
fetch("/api/sales/sequences", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    session_id: "PASTE_YOUR_SESSION_UUID_HERE",
    // optional: account_ids: ["uuid-1", "uuid-2"]
  }),
}).then(r => r.json()).then(console.log);
```

Use accounts in **`sequencing`** stage (after Approve selected). If you omit `account_ids`, the API uses accounts still in **`ready_for_approval`** — so approve targets first.

### Expected response

```json
{
  "persisted": true,
  "enrolled_count": 0,
  "skipped": [{ "account_id": "...", "reason": "no verified contact email" }]
}
```

**This is the most common blocker:** discovery does not create contact emails, so **`enrolled_count` is often 0**.

### Workaround — add a test contact (Supabase SQL Editor)

Pick one discovered account id from the Targets list (or query `sales_accounts`). Insert yourself as the contact:

```sql
insert into sales_contacts (
  session_id,
  account_id,
  name,
  email,
  email_verification,
  channel
)
values (
  'YOUR_SESSION_UUID',
  'YOUR_ACCOUNT_UUID',
  'Test Prospect',
  'you@yourdomain.com',  -- YOUR real inbox for send test
  'valid',
  'email'
);
```

Re-run the `fetch("/api/sales/sequences", …)` console command. Expect **`enrolled_count: 1`** (or more).

### Expected behavior after successful sequence creation

| What you see | Why |
|--------------|-----|
| **Drafts** tab lists step 1 (and 2, 3) drafts per enrollment | `sales_touchpoints` with subject/body |
| **Pipeline** tab shows accounts in **sequencing** / **sent** stages later | Kanban updates |
| Draft preview shows signal-based opener + opt-out footer | `buildEmailSequence()` |

---

## Phase 5 — Review, approve, and send email

### Steps

1. Open ops tab **Drafts**
2. For one **step 1** draft:
   - Click **review** → expect **Review: pass**
   - Click **approve** (enabled after pass)
   - Click **send** (enabled after approve)
3. Confirm recipient is **your test email**, not a random prospect

### Expected behavior

| Step | Expected |
|------|----------|
| **review** | Verdict pass; score shown; fails if subject missing, too long, no opt-out, etc. |
| **approve** | Status moves to approved |
| **send** | AgentMail delivers; draft shows sent; receipt in DB |
| **Pipeline** | Account stage → **sent** |
| **Inbox** | May stay quiet until a reply exists |

### If send fails

| Error | Fix |
|-------|-----|
| `first send requires explicit user approval` | Uncheck in Sales setup, or insert `sales_approvals` (below) |
| `draft not approved` / `reviewer verdict not approved` | Run review → approve first |
| `campaign autonomy is paused` | Kill switch off |
| `recipient is on do-not-contact list` | Remove email/domain from `do_not_contact` |
| `AgentMail not configured` | Set AgentMail env vars |
| `contact email required` | Add contact (Phase 4 SQL) |

**Optional SQL — first-send approval** (if you left the checkbox on):

```sql
insert into sales_approvals (session_id, sales_campaign_id, scope, status, approved_by)
select session_id, id, 'first_send', 'approved', 'manual-test'
from sales_campaigns
where session_id = 'YOUR_SESSION_UUID';
```

---

## Phase 6 — Simulate a reply (Inbox + Pipeline)

Real replies arrive via AgentMail monitoring in production. For local testing, use the ingest API.

### Steps

1. DevTools → Console:

```javascript
fetch("/api/sales/replies/ingest", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    session_id: "YOUR_SESSION_UUID",
    from_email: "you@yourdomain.com",
    content: "This sounds interesting — can we schedule a 20-minute call next week?",
    subject: "Re: quick question about scheduling",
  }),
}).then(r => r.json()).then(console.log);
```

2. Open ops tab **Inbox**
3. Open ops tab **Pipeline** — account should show **engaged** / **qualified** progression

### Expected behavior

| What you see | Why |
|--------------|-----|
| Inbox notification (reply / escalation) | `sales_notifications` |
| Classification **positive** (meeting-ish language) | Heuristic classifier |
| **Tasks** tab may show open items | Auto-created tasks |
| Conversation thread if you drill in | `sales_conversations` + messages |

Try an unsubscribe test:

```javascript
fetch("/api/sales/replies/ingest", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    session_id: "YOUR_SESSION_UUID",
    from_email: "you@yourdomain.com",
    content: "Please remove me from your list",
  }),
}).then(r => r.json()).then(console.log);
```

Expect **suppressed** account + escalation notification.

---

## Phase 7 — Meeting queue (optional, needs Google Calendar)

### Steps

1. Ensure `GOOGLE_*` env vars are set
2. Create a meeting (if none exists, use API or Supabase — UI create is limited; meetings often come from qualified replies)
3. Open ops tab **Meetings**
4. For a **proposed** meeting: enter attendee email + slot (ISO datetime, e.g. `2026-07-25T15:00:00.000Z`) → **Send invite**

### Expected behavior

| What you see | Why |
|--------------|-----|
| Status **invited** only after Google Calendar succeeds | Provider receipt required |
| `calendar_event_id` stored | Audit trail |
| Failure leaves status **proposed** | No fake “booked” state |

Skip this phase if Google credentials are not configured.

---

## Phase 8 — Kill switch and policy checks

### Steps

1. Toggle **kill switch** ON (top right of Sales panel)
2. Try **Run discovery** on Targets → should fail / be disabled
3. Try **send** on a draft → expect policy error
4. Toggle kill switch OFF → actions work again

### Expected behavior

Server returns **423** or **403** with paused message; UI disables discovery/send when paused.

---

## Success checklist

Use this as your sign-off:

- [ ] Fresh campaign from landing with **cal.com**
- [ ] Overview dossier loaded (Hermes + Linkup)
- [ ] Sales setup saved; draft plan visible
- [ ] Plan **approved**
- [ ] Discovery returned accounts with **source links**
- [ ] Targets **approved**
- [ ] Sequence created (with test contact if needed)
- [ ] Draft **review → approve → send** to your inbox
- [ ] Reply ingested; **Inbox** notification
- [ ] Kill switch blocks send when paused
- [ ] (Optional) Calendar invite sent
- [ ] `npm run eval:sales` — 15 passed

---

## Known gaps (not your mistake)

These are current product limits—not test failures:

| Gap | Workaround in this doc |
|-----|-------------------------|
| No UI button to create sequences | Phase 4 console `fetch` |
| Discovery rarely creates contact emails | Phase 4 Supabase contact insert |
| No UI for `first_send` approval record | Uncheck in setup or SQL in Phase 5 |
| Sales plan is server scaffold, not live Hermes strategist | Still valid for testing UI + gates |
| X DM channel not fully wired for send | Test email only first |
| Resume old session on reload | **+ new campaign** or clear storage |

---

## Quick reference — ops tabs

| Tab | Purpose |
|-----|---------|
| **Targets** | Run discovery, include/exclude accounts, approve cohort |
| **Pipeline** | Kanban by stage (researching → sent → engaged → …) |
| **Drafts** | Review / approve / send email touchpoints |
| **Inbox** | Notifications and escalations |
| **Meetings** | Proposed → invited → accepted lifecycle |
| **Tasks** | Agent/user tasks from replies and escalations |

---

## Related docs

- [Sales verification checklist](../docs/sales/verification-checklist.md)
- [Sales requirements](../docs/sales/requirements.md)
- [Sales README](../docs/sales/README.md)
