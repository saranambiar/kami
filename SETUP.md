# Kami — Local Community Edition setup

Kami is a **self-hosted, BYOK** GTM agency. Two moving parts:

- **`web/`** — Next.js UI + API routes
- **Hermes gateway** — local agent backend (`/v1/chat/completions` on `:8642`)

You bring: a model key, a free Supabase project, and (optionally) research/email/X keys.
Kami does not require `api.trykami.app` or any hosted Kami account.

Canonical product loops: [docs/product-loops.md](docs/product-loops.md).  
Community guide: [docs/community-edition.md](docs/community-edition.md).  
Optional hosted deploy (maintainers only): [deploy/README.md](deploy/README.md).

---

## 1. Prerequisites

- **Node.js 20+** and npm
- **Git**
- Your own **Supabase** project
- A model key for Hermes (OpenAI / OpenRouter / etc.)
- On Windows use **PowerShell** (not WSL) for `npm run dev`

---

## 2. Clone + install

```powershell
git clone <your-fork-or-repo-url>
cd kami
cd web
npm install
```

---

## 3. Environment variables

### Hermes home (gateway)

Copy [`.env.example`](.env.example) into Hermes home:

- Windows: `%LOCALAPPDATA%\hermes\.env`
- macOS/Linux: `~/.hermes/.env`

Fill at least `OPENAI_API_KEY` (or your provider) and `API_SERVER_KEY`.

### Web app

```powershell
cd web
copy .env.example .env.local
```

Required in `web/.env.local`:

```dotenv
HERMES_GATEWAY_URL=http://127.0.0.1:8642/v1/chat/completions
HERMES_API_KEY=<same as API_SERVER_KEY>
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your service role key>
```

Optional (unlocks more):

| Variable | Unlocks |
|----------|---------|
| `LINKUP_API_KEY` / `EXA_API_KEY` / `TAVILY_API_KEY` | Faster research |
| `HERMES_BROWSER_CDP_URL` | Browser research (dedicated Chrome profile) |
| `AGENTMAIL_API_KEY` + `AGENTMAIL_INBOX` | Real Sales sends |
| `X_CLIENT_ID` / `X_CLIENT_SECRET` | X OAuth + publish path |

---

## 4. Database migrations

Apply in order in the Supabase SQL editor (or CLI):

1. `web/supabase/migrations/001_init.sql`
2. `002_crm.sql`
3. `003_marketing.sql`
4. `004_sales.sql`
5. `005_connected_accounts_session.sql`
6. `007_sales_segments.sql`
7. `008_domain_truth.sql`
8. `009_distribution_opportunities.sql` — **required for Marketing** (`distribution_campaigns` + `distribution_opportunities`). Without it, Early users / Recommend campaign fails with a schema-cache error.
9. `010_agent_run_logs.sql` — **required for observability** (every Hermes/pipeline output → Supabase). View in `/ledger` or `GET /api/observability/runs`.

If Marketing setup returns “Distribution tables missing…”, re-run migration `009` in the Supabase SQL editor, then retry.
If Ledger shows “Apply migration 010…”, run `010_agent_run_logs.sql`.

---

## 5. Hermes gateway + skills

1. Install Hermes: https://hermes-agent.nousresearch.com/docs/
2. Enable API server (`API_SERVER_ENABLED=true`, port `8642`) and start the gateway
3. Sync skills:

```powershell
# from repo root
npm run sync:skills
# or: powershell -File scripts/sync-hermes-skills.ps1
```

4. Readiness check (no secrets printed):

```powershell
npm run readiness
```

### Browser research (default free mode)

1. Launch Chrome with a **dedicated** profile and remote debugging, e.g. port `9222`
2. In Hermes: `/browser connect` (or set `browser.cdp_url` / `HERMES_BROWSER_CDP_URL`)
3. Do **not** attach your everyday browser profile without consent

---

## 6. Run the web app

```powershell
cd web
npm run dev
```

Open http://localhost:3000 → enter domain → confirm dossier → Find customers or Create distribution.

---

## 7. Product flows

**Sales:** Confirm who/what → ICP → Plan → Find → Emails → Needs you. Never invent emails.

**Marketing:** Goal → opportunity queue → approve/copy/manual-post → record outcome. CRM/cold DMs live under Advanced (later feature).

**Kami Guide:** Ask anything; company + campaign context is injected every turn.

---

## 8. Evals / checks

```powershell
cd web
npm run eval:sales
npm run build
```

Release checklist: [docs/community-release-checklist.md](docs/community-release-checklist.md).
