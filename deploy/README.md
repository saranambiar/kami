# Deploy Kami (optional hosted maintainers path)

> **Community Edition default:** run Kami locally with your own Hermes + Supabase.
> See [SETUP.md](../SETUP.md) and [docs/community-edition.md](../docs/community-edition.md).
> This document is only for maintainers who choose to host a public instance.

Lean split (example: trykami.app):
- **Vercel** = Next.js UI (`web/`)
- **AWS EC2** = Hermes gateway

Git pipeline:
- Push `dev` → Vercel Preview
- Merge into `prod` → Vercel Production
- On EC2 when agents/skills change: `cd /opt/kami && git pull && sudo systemctl restart hermes-gateway`

## 1) You: launch EC2 (5 min)

1. AWS Console → EC2 → Launch instance
2. Ubuntu 22.04, **t3.small**, key pair you can SSH with
3. Security group inbound: **22** (your IP), **80**, **443**
4. Allocate **Elastic IP** → Associate to the instance
5. Copy the Elastic IP

## 2) You: Hostinger DNS

For domain `trykami.app`:

| Type | Name | Value |
|------|------|-------|
| A | `api` | *(Elastic IP from step 1)* |
| A / CNAME | `@` and `www` | *(from Vercel after you add the domain)* |

## 3) You: SSH + bootstrap Hermes

```bash
ssh -i YOUR_KEY.pem ubuntu@ELASTIC_IP
# upload or curl the script from the repo after clone:
git clone -b prod git@github.com:saranambiar/kami.git /tmp/kami-bootstrap
sudo bash /tmp/kami-bootstrap/deploy/ec2-bootstrap.sh
```

Then as `ubuntu`, set Hermes keys (OpenAI + API_SERVER_KEY) per the script output, then:

```bash
sudo systemctl start hermes-gateway
sudo systemctl status hermes-gateway
curl -I https://api.trykami.app/health || true
```

## 4) You: Vercel

1. Import `saranambiar/kami`
2. **Root Directory:** `web`
3. **Production Branch:** `prod`
4. Env (Production + Preview):

```
HERMES_GATEWAY_URL=https://api.trykami.app/v1/chat/completions
HERMES_API_KEY=<same as API_SERVER_KEY on EC2>
```

5. Deploy → Domains → add `trykami.app` + `www.trykami.app` → paste Hostinger records Vercel shows

Optional later: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`

## Success

- https://trykami.app loads
- Chat / domain submit gets a Hermes response (not 500 / 502)
- Push to `dev` updates Preview; merge to `prod` updates Production
