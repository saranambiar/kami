# Marketing vertical

- **Canonical checkout for agents:** branch `dev` (tip matches `feature/sales`). Contains full marketing + sales.
- `feature/marketing` tip `2a6ca73` is an **ancestor** of `dev` — marketing file trees are **identical** on `dev` and `feature/marketing` (verified 2026-07-23). No separate teammate marketing commits beyond what is already in `dev`.
- 2026-07-23 product decision: position Kami as an AI go-to-market agency for early-stage startups. Marketing's MVP is a founder-approved distribution loop: choose one goal → platform agents return evidence-backed opportunities and ready-to-use drafts → founder posts manually or approves supported publishing → Kami records outcomes and recommends the next action. Prioritize X, then Reddit and LinkedIn draft/research; keep Hacker News and Product Hunt launch-oriented and Discord strictly opt-in.
- 2026-07-23 implementation: `DistributionSetup` + `OpportunityQueue` are the default Marketing tab; X/IG CRM + cold DMs remain under **Advanced** (code preserved, not deleted). Migration `009_distribution_opportunities.sql`.
- 2026-07-23: Missing `distribution_*` tables map to founder-readable “Apply migration 009…” (setup + opportunities routes). PLG/D2C Sales Find routes to Create distribution instead of inventing consumer emails.
- Credentials (free vs paid, step-by-step): [docs/marketing-credentials.md](../docs/marketing-credentials.md)
- Overview: [docs/MARKETING-VERTICAL.md](../docs/MARKETING-VERTICAL.md)
- Session binding: `kami_claim` cookie → `connected_accounts.claim_id` → claimed onto `agent_sessions` on `POST /api/sessions` (migration `005_connected_accounts_session.sql`)
- Token helpers require `sessionId` or `claimId` — never latest-global
- Landing: `ConnectSocials` (X + Instagram OAuth)
- Discovery: X user-token search (`xLeadDiscover.ts`) + Apify IG (`apifyIgDiscover.ts`); Hermes ranks only
- Cold DMs: `POST /api/marketing/dm` uses session user X/IG tokens; Marketing CRM approve triggers send
- Boost: queued until `X_ADS_*`
- Public default is `main` (renamed from `prod`); PR into `dev`, promote to `main`. Do not revive hosted trykami.app as the product surface.
