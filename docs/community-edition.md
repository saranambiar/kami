# Kami Community Edition

Self-hosted, BYOK, single-user. You clone the repo, bring your own keys and Supabase project, run Hermes locally, and open Kami at `http://localhost:3000`.

Kami does **not** host your agents, pay for your model tokens, or store your secrets.

## What you get

- Domain → dossier → confirm → **Find customers** or **Create distribution**
- Sales: segment → plan → find → reviewed email → Needs you
- Marketing: goal → opportunity queue (X-first; other platforms manual/research)
- Kami Guide: grounded assistant on every screen
- Flexible research: browser (default free) · optional Linkup/Exa/Tavily · manual URLs

## Quickstart (developers)

```powershell
git clone <this-repo>
cd kami
cd web
npm install
copy .env.example .env.local   # fill REQUIRED keys
# Apply SQL in web/supabase/migrations/ to your Supabase project (001–005, 007–009)
cd ..
npm run sync:skills            # if package scripts wired at root; else see scripts/
# Start Hermes gateway on :8642 (see root .env.example → Hermes home)
cd web
npm run readiness
npm run dev
```

Open http://localhost:3000 → enter your domain.

## Agent-assisted setup prompt

Copy into Cursor / Claude / Codex after cloning:

```text
Help me set up Kami Community Edition locally.

First inspect this repository and its web/.env.example and root .env.example.
Do not expose, print, or commit any secret.

I want:
- Hermes running locally on 127.0.0.1:8642
- Browser-based research as the default, using a dedicated Chrome profile
- Optional research-provider support only if I later add a key
- My own Supabase project configured for one user
- Sales emails and X left disconnected unless I explicitly provide credentials

Check each dependency, explain blockers, create only safe local config files,
then run the readiness check. At the end, tell me what Kami can do now and
what optional connections would unlock.

Ask for explicit confirmation before writing config, accessing browser CDP,
applying migrations, or calling any external provider.
```

## Research modes

| Mode | Needs | Unlocks |
|------|-------|---------|
| Browser | Dedicated Chrome CDP + Hermes | Public-page research, logged-in sessions you approve |
| Research provider | Linkup / Exa / Tavily key | Faster structured discovery |
| Manual | Domains / thread URLs you paste | Works with zero research APIs |

## Capability gates

- No AgentMail → drafts only (Send hidden)
- No X connection → opportunity drafts only (Publish hidden)
- No Hermes/model → agent runs blocked with a clear fix
- Marketing CRM / cold DMs → **Advanced** later feature (preserved, not deleted)

## Privacy

- Provider keys stay in your `.env.local` / Hermes home
- Browser cookies stay in your dedicated profile; never put them in prompts
- Supabase data lives in **your** project

See [SECURITY.md](../SECURITY.md) and [community-release-checklist.md](community-release-checklist.md).
