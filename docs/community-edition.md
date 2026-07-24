# Kami Community Edition

Self-hosted, BYOK, single-user. You clone the repo, bring your own keys and Supabase project, run Hermes locally, and open Kami at `http://localhost:3000`.

Kami does **not** host your agents, pay for your model tokens, or store your secrets.

Minimal steps: **[SETUP.md](../SETUP.md)**.

## What you get

- Domain → dossier → confirm → **Find customers** or **Create distribution**
- Sales: segment → plan → find → reviewed email → Needs you
- Marketing: goal → opportunity queue (X publish when connected; other platforms manual/research)
- Kami Guide: grounded, concise assistant on every screen
- Flexible research: browser (optional CDP) · optional Linkup/Exa/Tavily · manual URLs

## Quickstart

```powershell
git clone https://github.com/saranambiar/kami.git
cd kami
cd web
npm install
copy .env.example .env.local   # REQUIRED: Hermes + Supabase
# Apply SQL in web/supabase/migrations/ 001–010 (skip 006 if absent)
cd ..
npm run sync:skills
# Start Hermes gateway on :8642
npm run readiness
cd web
npm run dev
```

Open http://localhost:3000 → enter your domain.

---

## Agent-assisted setup prompts

### A. From scratch (clone + run)

Copy into Cursor / Claude / Codex — replace the GitHub URL:

```text
Set up Kami Community Edition from scratch on this machine.

1) Clone https://github.com/saranambiar/kami.git and open that folder as the workspace.
2) Inspect README.md, SETUP.md, web/.env.example, and root .env.example.
3) Install Hermes Agent if missing. Enable the API server on 127.0.0.1:8642 with my model provider key. Ask me for the key; never print or commit it.
4) Help me create or connect a Supabase project. Apply migrations 001–005, 007–010 in order (skip 006 if absent). Confirm before running SQL.
5) Create web/.env.local and Hermes home .env from the examples with only the values I provide. Never expose secrets in chat or git.
6) From repo root: npm install in web/, npm run sync:skills, npm run readiness.
7) Start Hermes gateway and npm run dev in web/. Verify GET /api/capabilities shows hermes + database.
8) Tell me what is unlocked now vs optional (Linkup, AgentMail, X, browser CDP), and the first click path: domain → dossier → Find customers or Create distribution.

Do not invent emails, auto-send, or publish. Ask before writing config, applying migrations, accessing browser CDP, or calling external providers.
```

### B. Already cloned (this repo)

```text
Help me set up Kami Community Edition locally in this repository.

First inspect SETUP.md, web/.env.example, and root .env.example.
Do not expose, print, or commit any secret.

I want:
- Hermes running locally on 127.0.0.1:8642 with my model key
- My own Supabase project with migrations 001–010 applied
- web/.env.local filled with Hermes + Supabase only
- Sales email and X left disconnected unless I explicitly provide credentials
- Optional research provider / browser CDP only if I ask

Check each dependency, explain blockers, create only safe local config files,
run npm run sync:skills and npm run readiness, then help start Hermes + npm run dev.
At the end, tell me what Kami can do now and what optional connections unlock.

Ask for explicit confirmation before writing config, applying migrations,
accessing browser CDP, or calling any external provider.
```

---

## Research modes

| Mode | Needs | Unlocks |
|------|-------|---------|
| Manual / first-party | Domain you enter | Works with zero research APIs |
| Research provider | Linkup / Exa / Tavily key | Faster structured discovery |
| Browser | Dedicated Chrome CDP + Hermes | Public-page research you approve |

## Capability gates

- No AgentMail → drafts only (Send hidden)
- No X connection → copy/manual post; **Post to X** appears when OAuth is connected
- No Hermes/model → agent runs blocked with a clear fix
- Marketing CRM / cold DMs → **Advanced** later feature (preserved, not default nav)

## Privacy

- Provider keys stay in your `.env.local` / Hermes home
- Browser cookies stay in your dedicated profile; never put them in prompts
- Supabase data lives in **your** project

See [SECURITY.md](../SECURITY.md) and [community-release-checklist.md](community-release-checklist.md).
