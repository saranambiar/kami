# Kami — Local Setup (coworker reference)

Kami is a Hermes-backed GTM agency. Two moving parts:

- **`web/`** — Next.js UI + API routes (the app judges/users see).
- **Hermes gateway** — the real agent backend, exposing an OpenAI-compatible
  `/v1/chat/completions`. The web app talks to it via `/api/chat`.

You can run the **web app against the already-deployed gateway** without running
Hermes locally. Run Hermes locally only if you're changing agents/skills.

> Full architecture and rules live in [AGENTS.md](AGENTS.md). Deploy/prod notes
> live in [deploy/README.md](deploy/README.md).

---

## 1. Prerequisites

- **Node.js 20+** and npm
- **Git** with SSH access to `git@github.com:saranambiar/kami.git`
- A **Supabase** project (for the sales/marketing data) — or ask Sara for the shared one
- Keys as needed (see env table below). For UI-only work you mainly need the
  Hermes gateway URL + key.
- On Windows use **PowerShell** (not WSL) to run `npm run dev` — WSL has caused
  dev-server issues on this project.

---

## 2. Clone + install

```powershell
git clone git@github.com:saranambiar/kami.git
cd kami
git checkout feature/sales   # active branch; dev/prod are the deploy branches
cd web
npm install
```

---

## 3. Environment variables

The **web app** reads env from `web/.env.local` (create it — it's gitignored).
The separate root [`.env.example`](.env.example) is the template for the
**Hermes gateway** home (`%LOCALAPPDATA%\hermes\.env`), not the web app.

Create `web/.env.local`:

```dotenv
# --- Hermes gateway (required for chat / manager / CMO) ---
# Point at the deployed gateway, or your local one (see section 5).
HERMES_GATEWAY_URL=https://api.trykami.app/v1/chat/completions
HERMES_API_KEY=<ask Sara — same as API_SERVER_KEY on the gateway>

# --- Supabase (required for Sales/Marketing data + persistence) ---
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>

# --- Sales discovery (required for the Find-companies step) ---
LINKUP_API_KEY=<linkup key>

# --- Real email surface (required to actually send outreach) ---
AGENTMAIL_API_KEY=<agentmail key>
AGENTMAIL_INBOX=kami-outreach@agentmail.to

# --- Optional integrations ---
# LANGFUSE_PUBLIC_KEY=            # tracing
# LANGFUSE_SECRET_KEY=
# GOOGLE_CLIENT_ID=               # calendar (meeting coordinator)
# GOOGLE_CLIENT_SECRET=
# GOOGLE_REFRESH_TOKEN=
# X_CLIENT_ID=                    # X / content posting
# X_CLIENT_SECRET=
# X_REDIRECT_URI=http://localhost:3000/api/auth/x/callback
# INSTAGRAM_ACCESS_TOKEN=
```

Minimum to boot the UI and use the CMO/manager chat: `HERMES_GATEWAY_URL` +
`HERMES_API_KEY`. Add Supabase + Linkup + AgentMail to exercise the full Sales flow.

---

## 4. Database (Supabase migrations)

Apply the SQL migrations in order in the Supabase SQL editor (or via the CLI):

1. [`web/supabase/migrations/001_init.sql`](web/supabase/migrations/001_init.sql)
2. [`web/supabase/migrations/002_crm.sql`](web/supabase/migrations/002_crm.sql)
3. [`web/supabase/migrations/003_marketing.sql`](web/supabase/migrations/003_marketing.sql)
4. [`web/supabase/migrations/004_sales.sql`](web/supabase/migrations/004_sales.sql)
5. [`web/supabase/migrations/005_connected_accounts_session.sql`](web/supabase/migrations/005_connected_accounts_session.sql) — session-bound X/IG accounts (marketing)
6. [`web/supabase/migrations/007_sales_segments.sql`](web/supabase/migrations/007_sales_segments.sql) — segments confirm gate + per-account `segment_key`
7. [`web/supabase/migrations/008_domain_truth.sql`](web/supabase/migrations/008_domain_truth.sql) — canonical domain identity, research snapshot, brand_profiles unique, `sales_discovery_runs`

`003`–`008` are required for Sales/Marketing + ICP confirmation + domain-truth pipeline.

---

## 5. Run the web app

```powershell
cd web
npm run dev
```

Open http://localhost:3000. Submit a domain → the app calls the Hermes gateway
via `/api/chat` and streams the response.

If chat 502s / times out: the gateway is unreachable or `HERMES_API_KEY` is wrong.
The gateway can be slow (multi-minute) — the `/api/chat` route allows up to 300s.

---

## 6. (Optional) Run the Hermes gateway locally

Only needed if you're editing agents (`agents/`) or skills (`skills/`).

1. Install Hermes (see [AGENTS.md](AGENTS.md) §3 and the official docs:
   https://hermes-agent.nousresearch.com/docs/).
2. Copy [`.env.example`](.env.example) into the Hermes home
   (`%LOCALAPPDATA%\hermes\.env`) and fill `OPENAI_API_KEY` + `API_SERVER_KEY`.
3. Enable the API server (`API_SERVER_ENABLED=true`, port `8642`) and start the gateway.
4. Point `web/.env.local` at it:
   `HERMES_GATEWAY_URL=http://127.0.0.1:8642/v1/chat/completions` and
   `HERMES_API_KEY=<your API_SERVER_KEY>`.

Skills live in `skills/` (copied/synced into `~/.hermes/skills/`); each GTM
playbook is a `SKILL.md`. Agents live in `agents/`.

---

## 7. CMO chat (company context)

On Overview, **Talk to your CMO** injects a company context pack (from the
dossier, or from Supabase `brand_profiles.raw_dossier` if the React dossier is
missing) on **every** turn. Hermes session timeouts no longer wipe company
knowledge. See [`memory/cmo-context.md`](memory/cmo-context.md).

## 8. Sales flow (what to click)

**Domain validation first:** Landing calls `/api/domain/validate` before any session or Hermes work. Bad/parked domains stay on Landing with a clear error.

Domain → Overview (dossier from **exact-domain** research) → Sales tab. Progressive steps:

**Confirm who/what → Confirm ICP segments → Plan → Find companies → Emails → Needs you.**

- **ICP segments** must be confirmed before Plan/Find (failsafe). B2B segments need editable candidate company domains; PLG segments need personas (no email blast).
- Changing offer / ICP / geo in setup **clears confirmed segments** — reconfirm before Find.
- **Plan** uses Hermes sales strategist when available (`web/lib/salesStrategy.ts`); offline scaffold is labeled. Approve before **Find**.
- **Find** verifies candidate domains, Linkup signal search, public/role emails; scores Fit×Intent (no dated signal → nurture/hold). Runs are traced in `sales_discovery_runs`.
- Send is **blocked until a real contact email exists** (never invent emails).
- Resume: Landing offers **Continue {domain} / Start new** — new campaign does not inherit prior Sales state.

Known rough edges are tracked in [docs/sales/founder-ux-rca.md](docs/sales/founder-ux-rca.md).
See [`memory/domain-truth.md`](memory/domain-truth.md) for the domain-truth pipeline.
---

## 9. Evals / checks

```powershell
cd web
npm run eval:sales     # sales heuristics (discovery filters, scoring)
npm run build          # type-check + production build
```

---

## 10. Branches & deploy (quick reference)

- Work branch: **`feature/sales`**. Deploy branches: `dev` (Vercel Preview),
  `prod` (Vercel Production).
- Web app deploys on **Vercel** (root dir `web/`). Gateway runs on **EC2** at
  `api.trykami.app`. Full steps: [deploy/README.md](deploy/README.md).
