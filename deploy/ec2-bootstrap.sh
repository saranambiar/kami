#!/usr/bin/env bash
# Run ONCE on a fresh Ubuntu 22.04 EC2 as root (or with sudo).
# Usage: sudo bash ec2-bootstrap.sh
set -euo pipefail

DOMAIN_API="${DOMAIN_API:-api.trykami.app}"
REPO_URL="${REPO_URL:-git@github.com:saranambiar/kami.git}"
APP_DIR="${APP_DIR:-/opt/kami}"
HERMES_USER="${HERMES_USER:-ubuntu}"

echo "==> Installing base packages"
apt-get update -y
apt-get install -y curl ca-certificates git debian-keyring debian-archive-keyring apt-transport-https

echo "==> Installing Caddy"
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | tee /etc/apt/sources.list.d/caddy-stable.list
apt-get update -y
apt-get install -y caddy

echo "==> Installing Hermes (official installer)"
curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash
# Ensure hermes is on PATH for this shell
export PATH="$HOME/.local/bin:/usr/local/bin:$PATH"
hash -r || true
if ! command -v hermes >/dev/null 2>&1; then
  # Common install locations
  export PATH="/home/${HERMES_USER}/.local/bin:$PATH"
fi
hermes --version || { echo "Hermes not on PATH — finish install as ${HERMES_USER} then re-run hermes setup"; }

echo "==> Cloning / updating repo at ${APP_DIR}"
mkdir -p "$(dirname "$APP_DIR")"
if [ -d "$APP_DIR/.git" ]; then
  git -C "$APP_DIR" fetch origin
  git -C "$APP_DIR" checkout prod
  git -C "$APP_DIR" pull --ff-only origin prod
else
  git clone -b prod "$REPO_URL" "$APP_DIR"
fi
chown -R "${HERMES_USER}:${HERMES_USER}" "$APP_DIR" || true

echo "==> Writing Caddyfile for ${DOMAIN_API}"
cat >/etc/caddy/Caddyfile <<EOF
${DOMAIN_API} {
  reverse_proxy 127.0.0.1:8642
}
EOF
systemctl enable caddy
systemctl restart caddy

echo "==> Writing systemd unit for Hermes gateway"
cat >/etc/systemd/system/hermes-gateway.service <<EOF
[Unit]
Description=Hermes Agent Gateway (Kami)
After=network.target

[Service]
Type=simple
User=${HERMES_USER}
WorkingDirectory=${APP_DIR}
Environment=HOME=/home/${HERMES_USER}
ExecStart=/home/${HERMES_USER}/.local/bin/hermes gateway
Restart=always
RestartSec=5

[Install]
WantedBy=multi-user.target
EOF

systemctl daemon-reload
systemctl enable hermes-gateway

echo ""
echo "DONE base install. Still required as user ${HERMES_USER}:"
echo "  1) hermes config set OPENAI_API_KEY <key>"
echo "  2) hermes config set model.default gpt-5.4"
echo "  3) hermes config set model.provider openai-api"
echo "  4) hermes config set agent.reasoning_effort none"
echo "  5) hermes config set delegation.max_spawn_depth 2"
echo "  6) hermes config set delegation.max_concurrent_children 3"
echo "  7) hermes config set delegation.orchestrator_enabled true"
echo "  8) hermes config set API_SERVER_ENABLED true"
echo "  9) hermes config set API_SERVER_HOST 127.0.0.1"
echo " 10) hermes config set API_SERVER_PORT 8642"
echo " 11) hermes config set API_SERVER_KEY <long-random-secret>"
echo " 12) Point Hermes skills at ${APP_DIR}/skills (skills.external_dirs)"
echo " 13) sudo systemctl start hermes-gateway"
echo " 14) Point Hostinger A record api -> this Elastic IP"
echo " 15) Set Vercel HERMES_GATEWAY_URL=https://${DOMAIN_API}/v1/chat/completions"
echo "      and HERMES_API_KEY=<same API_SERVER_KEY>"
