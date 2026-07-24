# Kami — minimal local setup

Self-hosted **Community Edition**. Two moving parts:

1. **Hermes gateway** — agent backend on `127.0.0.1:8642`
2. **`web/`** — Next.js UI + API

You bring: a **model key**, a **Supabase** project, and Node 20+.  
Optional: research / email / X keys (Kami degrades cleanly without them).

---

## 1. Prerequisites

- Node.js **20+** and npm
- Git
- [Hermes Agent](https://hermes-agent.nousresearch.com/docs/) installed
- Your own Supabase project
- A model API key for Hermes (OpenAI / OpenRouter / etc.)
- Windows: use **PowerShell** (not WSL) for `npm run dev`

---

## 2. Clone + install

```powershell
git clone https://github.com/saranambiar/kami.git
cd kami
cd web
npm install
```

---

## 3. Environment

### Hermes home

Copy [`.env.example`](.env.example) into Hermes home and fill at least your model key + `API_SERVER_KEY`:

- Windows: `%LOCALAPPDATA%\hermes\.env`
- macOS/Linux: `~/.hermes/.env`

Enable the API server (`API_SERVER_ENABLED=true`, port **8642**).

### Web app

```powershell
cd web
copy .env.example .env.local
```

**Required** in `web/.env.local`:

```dotenv
HERMES_GATEWAY_URL=http://127.0.0.1:8642/v1/chat/completions
HERMES_API_KEY=<same as API_SERVER_KEY>
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<service role key>
```

**Optional** (unlock more; all degrade if missing):

| Variable | Unlocks |
|----------|---------|
| `LINKUP_API_KEY` / `EXA_API_KEY` / `TAVILY_API_KEY` | Faster research |
| `HERMES_BROWSER_CDP_URL` | Browser research |
| `AGENTMAIL_API_KEY` + `AGENTMAIL_INBOX` | Real Sales sends |
| `X_CLIENT_ID` / `X_CLIENT_SECRET` | X OAuth + Post to X |

---

## 4. Database migrations

In the Supabase SQL editor (or CLI), apply **in order**:

1. `web/supabase/migrations/001_init.sql`
2. `002_crm.sql`
3. `003_marketing.sql`
4. `004_sales.sql`
5. `005_connected_accounts_session.sql`
6. `007_sales_segments.sql`
7. `008_domain_truth.sql`
8. `009_distribution_opportunities.sql` — **required for Marketing**
9. `010_agent_run_logs.sql` — **required for observability**

(Skip `006` if it is not in the tree.)

---

## 5. Start Hermes → sync → web

```powershell
# Terminal A — Hermes gateway (API server on :8642)
hermes gateway run

# Terminal B — from repo root
cd kami
npm run sync:skills
npm run readiness

cd web
npm run dev
```

Open **http://localhost:3000**.

---

## 6. You’re done when

`GET http://localhost:3000/api/capabilities` shows roughly:

- `"hermes": true`
- `"database": true`
- `"modelConfigured": true`

Then: enter a domain → confirm dossier → **Find customers** or **Create distribution**.

---

## More detail

- BYOK + agent setup prompts: [docs/community-edition.md](docs/community-edition.md)
- Product loops: [docs/product-loops.md](docs/product-loops.md)
- Browser CDP / research modes: [docs/community-edition.md](docs/community-edition.md)
- Hosted deploy (maintainers): [deploy/README.md](deploy/README.md)
- Contributing: [CONTRIBUTING.md](CONTRIBUTING.md)
- Release checklist: [docs/community-release-checklist.md](docs/community-release-checklist.md)
