# Kami

<p align="center">
  <img src="assets/kami-logo.png" alt="Kami" width="120" />
</p>

<p align="center">
  <a href="https://trykami.app"><img src="https://img.shields.io/badge/live-trykami.app-black" alt="Live" /></a>
  <a href="https://github.com/saranambiar/kami"><img src="https://img.shields.io/badge/github-saranambiar%2Fkami-181717?logo=github" alt="GitHub" /></a>
  <a href="CONTRIBUTING.md"><img src="https://img.shields.io/badge/contributions-welcome-brightgreen" alt="Contributions welcome" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/license-MIT-blue" alt="MIT" /></a>
</p>

**Your AI go-to-market agency for early-stage startups.**

Tell Kami what you built. It helps you find customers and get your product in front of the right people.

**[trykami.app](https://trykami.app)** · **[Contribute](CONTRIBUTING.md)**

---

## Community Edition (self-hosted / BYOK)

Clone → add your keys → run Hermes locally → open `localhost:3000`.

```powershell
cd web
npm install
copy .env.example .env.local
# apply web/supabase/migrations/* to your Supabase project
cd ..
npm run sync:skills
npm run readiness
npm run dev
```

- [SETUP.md](SETUP.md) — local setup
- [docs/community-edition.md](docs/community-edition.md) — BYOK guide + agent setup prompt
- [docs/product-loops.md](docs/product-loops.md) — product + UX contract
- [docs/community-release-checklist.md](docs/community-release-checklist.md) — release proof
- [deploy/README.md](deploy/README.md) — hosted Vercel + EC2

---

## How it works

```
Browser → Next.js (web/) → Hermes API Server
                              → manager (orchestrator)
                              → specialists (sales, marketing, …)
                              → real send / post / research
```

| Piece | Role |
|-------|------|
| `web/` | UI + API routes |
| `agents/` | Manager + specialist role prompts |
| `skills/` | Playbooks |
| Hermes gateway | Agent backend |

**Loops**

1. Enter domain → confirm dossier (**That's us**)
2. Choose **Find customers** or **Create distribution**
3. Approve small batches of real actions
4. Ask Kami anytime (persistent guide)

Marketing CRM / cold DMs stay under **Advanced** (later) — not the default journey.

---

## Docs

| Doc | What |
|-----|------|
| [SETUP.md](SETUP.md) | Local setup, env, Hermes |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute |
| [AGENTS.md](AGENTS.md) | Product rules + architecture |
| [docs/](docs/) | Deep dives |

## License

MIT — see [LICENSE](LICENSE).
