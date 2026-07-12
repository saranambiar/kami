# Hermes setup guide — GTM agency (teammate + agent)

Use this so **everyone on the team has the same local Hermes harness** before product work.  
VPS / domain / Vercel hosting are **out of scope here** — do those later.

**Target stack for this project**
- Hermes Agent as the **base harness** (manager + specialist subagents)
- **OpenAI API key** (BYOK) — not Nous Portal paid credits
- Model: **`gpt-5.4`** via `provider: openai-api`
- Local API Server on `127.0.0.1:8642` for the future web UI to call
- Delegation unlocked so an orchestrator manager can spawn nested specialists

---

## 0. How this works (read once)

```
Future UI (Vercel later)
    → POST /v1/chat/completions
    → Hermes gateway (API_SERVER_KEY)
        → Manager session (orchestrator)
            → delegate_task / async_delegation → specialist subagents
            → real tools (email / X) later
```

| Secret | Purpose |
|---|---|
| `OPENAI_API_KEY` | Pays for the **model** (brain) |
| `API_SERVER_KEY` | Password so only **our app** can call Hermes’s HTTP API |

Judges / users never talk to OpenAI directly. They talk to our product → product talks to **Hermes** → Hermes is the agency.

On Windows, Hermes home is:

`%LOCALAPPDATA%\hermes\`  
→ usually `C:\Users\<You>\AppData\Local\hermes\`

(On macOS/Linux: `~/.hermes/`)

Secrets go in `.env`. Behavior goes in `config.yaml`. Never commit real keys.

---

## 1. Instructions for the coding agent (auto-setup)

If you are an agent setting this up for the human, do as much as possible **without** asking them to hunt for files. Only ask the human for secrets they must paste (OpenAI key + a made-up `API_SERVER_KEY`).

### Agent checklist (run in order)

1. Confirm Hermes is installed: `hermes --version` and `hermes doctor`.
2. If Hermes is missing, install from official docs / GitHub (`NousResearch/hermes-agent`) for their OS, then re-check.
3. Set model + provider (non-secret):
   ```powershell
   hermes config set model.default gpt-5.4
   hermes config set model.provider openai-api
   hermes config set agent.reasoning_effort none
   ```
4. Unlock manager → specialist nesting:
   ```powershell
   hermes config set delegation.max_spawn_depth 2
   hermes config set delegation.max_concurrent_children 3
   hermes config set delegation.orchestrator_enabled true
   ```
5. Ask human to paste **OpenAI key** (do not invent one). Set via:
   ```powershell
   $key = Read-Host "Paste OpenAI API key"
   hermes config set OPENAI_API_KEY $key
   ```
6. Ask human to invent a long random **API_SERVER_KEY** (not the OpenAI key). Set:
   ```powershell
   $apiKey = Read-Host "Make up API_SERVER_KEY"
   hermes config set API_SERVER_ENABLED true
   hermes config set API_SERVER_HOST 127.0.0.1
   hermes config set API_SERVER_PORT 8642
   hermes config set API_SERVER_KEY $apiKey
   ```
7. Verify CLI chat works: have human run `hermes` and send “hi”.
8. Start gateway in a dedicated terminal: `hermes gateway`.
9. Smoke-test API (PowerShell — use `curl.exe` or `Invoke-RestMethod`, not aliased `curl`):
   ```powershell
   $apiKey = Read-Host "Same API_SERVER_KEY"
   Invoke-RestMethod http://127.0.0.1:8642/v1/chat/completions `
     -Method POST `
     -Headers @{ Authorization = "Bearer $apiKey" } `
     -ContentType "application/json" `
     -Body '{"model":"gpt-5.4","messages":[{"role":"user","content":"say hi"}]}'
   ```
10. Success = `finish_reason=stop` (or a normal assistant message), **not** `hermes.failed=True`.
11. Update `kami/memory/hermes-prerequisites.md` with this machine’s status.
12. **Do not** provision VPS/domain/email/X in this pass unless the human explicitly asks.

### Known gotchas (Windows)

- PowerShell `curl` is `Invoke-WebRequest` — use `curl.exe` or `Invoke-RestMethod`.
- If you see `Encrypted content is not supported with this model` on non-reasoning models, set `agent.reasoning_effort` to `none`.
- Prefer `hermes config set ...` over hand-editing files when possible.
- Never print full API keys into chat logs or commit them.

---

## 2. Human setup (same result, step-by-step)

### A. Install Hermes (if needed)

Follow: https://hermes-agent.nousresearch.com/docs/  
GitHub: https://github.com/NousResearch/hermes-agent  

Then:

```powershell
hermes --version
hermes doctor
```

Optional: `hermes update -y`

### B. OpenAI key (not Portal subscription)

1. Create a key at https://platform.openai.com/api-keys  
2. In PowerShell:

```powershell
$key = Read-Host "Paste OpenAI API key"
hermes config set OPENAI_API_KEY $key
hermes config set model.default gpt-5.4
hermes config set model.provider openai-api
hermes config set agent.reasoning_effort none
```

3. Prove it:

```powershell
hermes
```

Chat once. If it replies, the brain works.  
You can ignore Nous Portal paid tiers (Plus/Super/Ultra) for this project path.

### C. Unlock orchestrator / subagents

```powershell
hermes config set delegation.max_spawn_depth 2
hermes config set delegation.max_concurrent_children 3
hermes config set delegation.orchestrator_enabled true
```

Without `max_spawn_depth: 2`, a manager with `role="orchestrator"` cannot properly nest specialists.

### D. Local Hermes API Server (harness HTTP door)

```powershell
$apiKey = Read-Host "Make up a long random API_SERVER_KEY"
hermes config set API_SERVER_ENABLED true
hermes config set API_SERVER_HOST 127.0.0.1
hermes config set API_SERVER_PORT 8642
hermes config set API_SERVER_KEY $apiKey
```

Remember that secret — the future Vercel/backend will use the same pattern against the VPS later.

Start Hermes as a server:

```powershell
hermes gateway
```

Leave that window open. Expect listening on `http://127.0.0.1:8642`.

### E. Smoke test (second PowerShell window)

```powershell
$apiKey = Read-Host "Same API_SERVER_KEY again"
Invoke-RestMethod http://127.0.0.1:8642/v1/chat/completions `
  -Method POST `
  -Headers @{ Authorization = "Bearer $apiKey" } `
  -ContentType "application/json" `
  -Body '{"model":"gpt-5.4","messages":[{"role":"user","content":"say hi"}]}'
```

**Pass:** normal completion, `finish_reason` like `stop`.  
**Fail examples:** connection refused (gateway not running), 401 (wrong `API_SERVER_KEY`), `hermes.failed=True` (model/config issue).

---

## 3. “Done” checklist (match Sara’s local setup)

- [ ] `hermes --version` works  
- [ ] `OPENAI_API_KEY` set; `hermes` chat works  
- [ ] `model.default` = `gpt-5.4`, `model.provider` = `openai-api`  
- [ ] `agent.reasoning_effort` = `none` (unless using a reasoning model on purpose)  
- [ ] `delegation.max_spawn_depth` ≥ `2`, `orchestrator_enabled` = true  
- [ ] `API_SERVER_*` enabled; `hermes gateway` running  
- [ ] `Invoke-RestMethod` smoke test to `:8642/v1/chat/completions` succeeds  

When all boxes are checked, this machine matches the **local harness** the team is building on.

---

## 4. Explicitly later (do not block planning)

| Item | Why later |
|---|---|
| VPS + domain + TLS (Caddy) | Judges need always-on URL; do after product shape is clear / hour-0 of build |
| Vercel frontend | Thin UI only — calls Hermes API; Hermes itself does **not** run on Vercel |
| Email (AgentMail / Gmail / Resend) | Real-output scoring; pick one path when building outreach |
| X API | Content specialist; plain-text posts only |
| Exa / Tavily / Firecrawl | Research tools if not using Portal Tool Gateway |
| Buildathon partner perks | Claim when convenient (OpenAI org ID, LinkUp `HERMES`, etc.) |

**Architecture reminder for later hosting**

```
judge browser → Vercel UI → your domain/VPS → hermes gateway (API server)
```

Vercel = UI. Hermes = always-on process on a VPS.

---

## 5. Project context pointers

- Product / scoring / architecture: `kami/AGENTS.md`  
- Broader research notes: `kami/references/research-context.md`  
- Env template (no secrets): `kami/.env.example`  
- Living status: `kami/memory/hermes-prerequisites.md`

---

## 6. Quick copy-paste block (full local setup)

```powershell
# After Hermes is installed and you have an OpenAI key ready:

$key = Read-Host "Paste OpenAI API key"
hermes config set OPENAI_API_KEY $key
hermes config set model.default gpt-5.4
hermes config set model.provider openai-api
hermes config set agent.reasoning_effort none

hermes config set delegation.max_spawn_depth 2
hermes config set delegation.max_concurrent_children 3
hermes config set delegation.orchestrator_enabled true

$apiKey = Read-Host "Make up API_SERVER_KEY"
hermes config set API_SERVER_ENABLED true
hermes config set API_SERVER_HOST 127.0.0.1
hermes config set API_SERVER_PORT 8642
hermes config set API_SERVER_KEY $apiKey

hermes   # verify chat, then exit
hermes gateway
```

Smoke test in another window with the same `$apiKey` / `Invoke-RestMethod` block from section 2E.
