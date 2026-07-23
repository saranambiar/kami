# Marketing vertical

- **Canonical checkout for agents:** branch `dev` (tip matches `feature/sales`). Contains full marketing + sales.
- `feature/marketing` tip `2a6ca73` is an **ancestor** of `dev` — marketing file trees are **identical** on `dev` and `feature/marketing` (verified 2026-07-23). No separate teammate marketing commits beyond what is already in `dev`.
- Credentials (free vs paid): [docs/marketing-credentials.md](../docs/marketing-credentials.md)
- Overview: [docs/MARKETING-VERTICAL.md](../docs/MARKETING-VERTICAL.md)
- Session binding: `kami_claim` → `connected_accounts.claim_id` → claimed on `POST /api/sessions` (migration `005_connected_accounts_session.sql`)
- Landing: `ConnectSocials` (X + Instagram OAuth)
- Discovery: X user-token search (`xLeadDiscover.ts`) + Apify IG (`apifyIgDiscover.ts`); Hermes ranks only
- Cold DMs: `POST /api/marketing/dm` as session user; CRM approve triggers send
- Boost: queued until `X_ADS_*`
- `origin/prod` is **behind** `dev` and does **not** include marketing vertical code — do not use prod for marketing work
