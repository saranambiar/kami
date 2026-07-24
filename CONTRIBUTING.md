# Contributing to Kami

Keep PRs small and easy to review.

## Product contract

Read [docs/product-loops.md](docs/product-loops.md) first. UX must stay simple: domain → confirm → Find customers / Create distribution → small approved batches.

Also skim [README.md](README.md) and [AGENTS.md](AGENTS.md) if you touch agents, skills, or product behavior.

## Local setup

See [SETUP.md](SETUP.md) and [docs/community-edition.md](docs/community-edition.md).

```powershell
cd web
npm install
copy .env.example .env.local
cd ..
npm run readiness
npm run sync:skills
npm run dev
```

## Branches

| Branch | Use |
|--------|-----|
| `dev` | Default base for PRs (Vercel Preview) |
| `prod` | Production — don't PR here directly |
| `feature/*` | Your work branch |

```bash
git checkout dev
git pull
git checkout -b feature/short-description
```

## What to work on

Good fits:

- **Skills** (`skills/`) — playbooks, clearer steps, better guardrails
- **Agents** (`agents/`) — role prompts, review/revision behavior
- **Web** (`web/`) — UI, API routes, bugs
- **Docs** — setup, credentials, community edition notes

## Scope discipline

- Prefer depth (real sends, real opportunities) over new channels.
- Marketing CRM / cold DMs stay Advanced / later — do not make them the default journey.
- Desktop packaging and hosted multi-tenant auth are post-MVP.
- Avoid mocked “fake send” surfaces and large unrelated refactors.

## Checks before PR

```powershell
npm run eval:sales
npm run build
```

- [ ] Branched from `dev`
- [ ] Change is scoped (one concern)
- [ ] Real-surface behavior still real
- [ ] PR description: **what**, **why**, **how to verify**

```markdown
## What
…

## Why
…

## How to verify
1. …
```

## Style

- Match existing patterns in the folder you're editing.
- Don't commit secrets (`.env`, keys, tokens).
- Don't add fluff docs unless they unblock setup or contribution.

## Agent-assisted changes

If you use an AI coding agent, give it the setup prompt in `docs/community-edition.md` and require confirmation before writing secrets, CDP config, or calling external providers.

## Questions

Open an issue, or ask in the PR. Deploy/gateway: [deploy/README.md](deploy/README.md).
