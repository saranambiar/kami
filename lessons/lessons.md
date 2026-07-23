# Lessons

Append short, reusable rules after corrections or mistakes.

- On Windows native installs, Hermes home is `%LOCALAPPDATA%\hermes` (not `~/.hermes`).
- `config.yaml` can point at OpenRouter while `OPENROUTER_API_KEY` is still empty — doctor may look healthy until connectivity checks fail.
- API Server is env-only (`API_SERVER_*`); it is not configured in `config.yaml` yet.
- Default `delegation.max_spawn_depth: 1` makes `role="orchestrator"` a no-op — raise to 2+ for nested manager→specialist trees.
- `delegate_task` is synchronous/blocking; use `async_delegation` (`delegate_task_async`) for parallel outreach+content without freezing the parent turn.
- macOS has no `timeout` coreutil — don't prefix long-running hermes runs with it (use background tasks instead).
- Hermes skills live at `~/.hermes/skills/<group>/<skill>/SKILL.md` with a `DESCRIPTION.md` at group level — sync repo `skills/` into a `gtm` group.
- Both sync `delegate_task` and `async_delegation` (`tools/async_delegation.py`) exist on this install; `delegation` toolset is enabled by default on CLI.
- Local Hermes api_server key lives in `config.yaml` under `API_SERVER_KEY` (env-style keys inside yaml), not `.env`.
- Confirmed on this install: `delegate_task` dispatch is async/background from a one-shot `hermes chat -q` — the turn ends before the subagent Result returns. The manager must run as a persistent/resumed session (`--resume <id>`) to receive completion events; plan the API-server flow around a long-lived session id.
- Async (`background=true`) delegation completion events live in the parent process's in-memory queue — a one-shot `hermes chat -q` process exits before delivery and the Result is lost. For scripted/one-shot runs use `delegate_task(background=false)` (synchronous); reserve background delegation for persistent gateway-hosted sessions.
- CORRECTION: on this install `delegate_task` is background-ONLY — `background=false` is ignored ("deprecated" per live tool result). Subagent Results only re-enter the session if the hosting process stays alive → run manager sessions inside the persistent gateway (api_server with `X-Hermes-Session-Id`), never as one-shot `hermes chat -q`.
- CMO chat only had the user question + Hermes session memory — after gateway timeout/resume the CMO claimed it had no dossier. Always inject a company context pack every turn (`web/lib/cmoContext.ts`); fall back to Supabase `raw_dossier` when React state is empty.
- Sales discovery that keyword-scrapes the web will treat listicles/shorteners as companies. Require confirmed ICP segments with named candidate companies, then verify domains + scrape real public/role emails; never invent addresses.
- Next.js on WSL accessing `/mnt/c/...` often breaks Turbopack instrumentation (`MODULE_UNPARSABLE` / instrumentation.ts not found). Prefer `next dev --webpack`, clear `.next`, or run from native Windows PowerShell. Do not import app code from `instrumentation.ts` — keep the OTEL processor in a separate lib module.
- Unanchored Linkup (`${domain} company product…`) can latch onto same-name companies (e.g. arguslabs.in → Argus biomedical). Always validate exact domain first, research with first-party + `site:canonical`, and reject dossiers that invent verticals absent from the site extract.
- Product-category defaults in Sales (Calendly/bookings/US/50-500) poison every downstream step when the dossier is thin. Prefer blank editable seeds + block confirm until candidates exist; never invent a vertical.
- Changing Sales setup offer/ICP without clearing `segments_confirmed_at` lets Find run on a stale ICP — always invalidate segments on material setup change.
- Confirm ICP (`SegmentConfirm`) must match SalesSetup visual language: `sales-panel` / `form-line` / `sales-textarea` / crease separators — not nested bordered boxes with cramped mono inputs. Validation that requires fields (e.g. PLG personas) must expose editable controls for those fields.
- Community Edition default is self-hosted BYOK + local Hermes — do not hard-require `api.trykami.app` or Linkup. Prefer capability registry + graceful degradation (browser / provider / manual).
- Marketing CRM/cold DMs are a later Advanced feature: preserve the code, remove from the default founder journey; primary Marketing loop is distribution opportunities.
- PLG/D2C segments with no candidate companies correctly skip company Find — UI must not grey-out Hermes email as the only path; route to Marketing distribution and never invent consumer emails.
- Sales Advanced should only expose controls that change Find/send gates in MVP; hide deal range and sender identity until they wire into discovery/AgentMail from-address.
- For end-to-end observability, log at Hermes chokepoints (`hermesChatOnce` + `/api/chat`) with `kamiSessionId` + `kind` — do not rely on scattered route-only inserts or Hermes local state.db alone.
- Public domains can change product posture quickly (for example, Arc versus Dia); a gold-standard fixture must pin source URLs and a research date, and treat product ambiguity as an explicit hard gate rather than a generic classification failure.
