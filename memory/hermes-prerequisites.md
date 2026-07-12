# Hermes prerequisites — local status

Last updated: 2026-07-12 (Sara’s machine)

## Done (local harness — ready to plan product)
- Hermes Agent installed; CLI on PATH
- **OpenAI BYOK** (`OPENAI_API_KEY`) — not Nous Portal paid tier
- Model: **`gpt-5.4`**, provider: **`openai-api`**
- `agent.reasoning_effort: none` (avoids “Encrypted content…” errors on non-reasoning paths)
- API Server enabled; smoke-tested `POST /v1/chat/completions` on `127.0.0.1:8642`
- Delegation unlocked: `max_spawn_depth: 2`, `max_concurrent_children: 3`, `orchestrator_enabled: true`

## Teammate setup
Follow **`kami/references/hermes-setup-guide.md`** — same OpenAI + local harness path. Agent section can auto-run non-secret steps.

## Deferred (not required before product planning)
- VPS + domain + TLS
- Vercel UI → Hermes wiring
- Email / X real surfaces
- Research tool keys (Exa/Tavily/Firecrawl)
- Buildathon partner perk claims

## Windows path note
Hermes home: `%LOCALAPPDATA%\hermes\`  
(equivalent of `~/.hermes` on macOS/Linux)
