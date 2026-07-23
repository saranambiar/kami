# Security model — Kami Community Edition

## Trust boundaries

| Component | Trust |
|-----------|--------|
| Local Next.js app | Owns persistence, approvals, side-effect policy |
| Local Hermes gateway | Reasoning + delegation; least-privilege tools |
| User Supabase project | Campaign/dossier/opportunity data |
| Dedicated browser profile | Optional research; user-consented cookies/sessions |
| Provider keys | User-owned; stay in `.env` / Hermes home |

## Hard rules

1. **Never invent contact emails.** Send is blocked without a real address.
2. **Founder approval** is required for real email send and X publish.
3. **Hermes must not receive** raw provider keys, Supabase service-role keys, or browser cookie dumps in prompts.
4. **Browser CDP** uses a dedicated profile; everyday profiles require explicit consent.
5. **No secrets in git.** Use `web/.env.example` and root `.env.example` only.
6. Community Edition is **single-user local**. Do not expose `SUPABASE_SERVICE_ROLE_KEY` to browsers or the public internet.

## Reporting

Open a private security advisory or email the maintainers if you find a vulnerability. Do not file public issues that include secrets or exploit PoCs against third-party accounts.
