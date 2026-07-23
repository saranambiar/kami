# Contributing to Kami

## Product contract

Read [docs/product-loops.md](docs/product-loops.md) first. UX must stay simple: domain → confirm → Find customers / Create distribution → small approved batches.

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

## Checks before PR

```powershell
npm run eval:sales
npm run build
```

## Scope discipline

- Prefer depth (real sends, real opportunities) over new channels.
- Marketing CRM / cold DMs stay Advanced / later — do not make them the default journey.
- Desktop packaging and hosted multi-tenant auth are post-MVP.

## Agent-assisted changes

If you use an AI coding agent, give it the setup prompt in `docs/community-edition.md` and require confirmation before writing secrets, CDP config, or calling external providers.
