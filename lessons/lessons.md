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
