# Kami

**Your AI go-to-market agency for early-stage startups.**

Tell Kami what you built. It helps you find customers and get your product in front of the right people.

## Community Edition (self-hosted / BYOK)

Clone → add your keys → run Hermes locally → open `localhost:3000`.

- [SETUP.md](SETUP.md) — local setup
- [docs/community-edition.md](docs/community-edition.md) — BYOK guide + agent setup prompt
- [docs/product-loops.md](docs/product-loops.md) — product + UX contract
- [docs/community-release-checklist.md](docs/community-release-checklist.md) — release proof

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

## Loops

1. Enter domain → confirm dossier (**That's us**)
2. Choose **Find customers** or **Create distribution**
3. Approve small batches of real actions
4. Ask Kami anytime (persistent guide)

Marketing CRM / cold DMs are preserved under **Advanced** (later feature), not the default journey.

## License

MIT — see [LICENSE](LICENSE).
