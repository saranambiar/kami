# Deploy Kami (optional — maintainers only)

> **Community Edition default:** run Kami locally with your own Hermes + Supabase.
> See [SETUP.md](../SETUP.md) and [docs/community-edition.md](../docs/community-edition.md).
>
> **Do not** auto-deploy this repo to trykami.app / Vercel as the public product surface.
> The former Vercel → trykami.app link should stay disconnected.

If you host a private instance later:

- **UI:** any Node host for Next.js (`web/`), root directory `web`
- **Agents:** Hermes gateway on a VPS (see `deploy/ec2-bootstrap.sh`)
- **Git branches:** build from `main` (releases) or `dev` (soak); do not revive a `prod` branch name

Example env for a self-hosted UI pointing at your gateway:

```
HERMES_GATEWAY_URL=https://YOUR_GATEWAY/v1/chat/completions
HERMES_API_KEY=<same as API_SERVER_KEY on the gateway>
```

Optional: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`
