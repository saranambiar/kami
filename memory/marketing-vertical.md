# Marketing vertical

- Branch: `feature/marketing`
- Credentials (free vs paid, step-by-step): [docs/marketing-credentials.md](../docs/marketing-credentials.md)
- Session binding: `kami_claim` cookie → `connected_accounts.claim_id` → claimed onto `agent_sessions` on `POST /api/sessions` (migration `005_connected_accounts_session.sql`)
- Token helpers require `sessionId` or `claimId` — never latest-global
- Cold DMs: `POST /api/marketing/dm` uses session user X/IG tokens; Marketing CRM approve triggers send
- Discovery: X search via user token; IG creators via Apify (Kami key, search only)
- Boost: queued until `X_ADS_*`
