# Community Edition — release checklist

Prove each advertised capability with a **real action**, not a 200 response alone.

## Product narrative

- [ ] Landing says: **Your AI go-to-market agency for early-stage startups**
- [ ] Two-liner matches [product-loops.md](product-loops.md)
- [ ] No “dry run executed” labels on real sends
- [ ] Overview asks: confirm dossier → Find customers / Create distribution

## Local setup (clean machine)

- [ ] Clone repo on a fresh machine/account
- [ ] Copy `web/.env.example` → `web/.env.local` with **user-owned** keys only
- [ ] Apply migrations `001`–`005`, `007`, `008`, `009` on a **user-owned** Supabase project
- [ ] Hermes gateway on `127.0.0.1:8642` with user model key
- [ ] `npm run readiness` (or `node scripts/readiness.mjs`) reports unlocked capabilities without printing secrets
- [ ] `npm run sync:skills` syncs repo skills into local Hermes home

## Shared loop

- [ ] Domain validates before research
- [ ] Dossier confirms with **That’s us**
- [ ] Job choice: Find customers / Create distribution
- [ ] Kami Guide available on Overview, Sales, and Marketing

## Sales (real outcome)

- [ ] Confirm segment → Hermes plan (or clearly labeled offline fallback)
- [ ] Find companies is explicit; opt-in include; no invented emails
- [ ] Review 1–3 drafts → real AgentMail send → receipt persisted
- [ ] Reply / Needs you surfaces the next decision
- [ ] Kill switch pauses Sales sends

## Marketing (distribution)

- [ ] Goal picker: launch / early users / credibility / waitlist
- [ ] Today’s opportunities queue with link, why, draft, risks
- [ ] X opportunity can be marked posted manually
- [ ] CRM / cold DM path is under **Advanced** only (not default journey)
- [ ] Platform agents without access stay honest (manual URL input)

## Research modes

- [ ] Browser research works without Linkup when CDP is connected
- [ ] Optional research provider unlocks faster discovery
- [ ] Missing Hermes/model blocks runs with a clear fix

## Open-source hygiene

- [ ] LICENSE present
- [ ] No secrets in git history of release commit
- [ ] CI green (typecheck/build/evals)
- [ ] SECURITY.md and CONTRIBUTING.md published
