---
name: create-readonly-db-role
description: 'Provision a hardened SELECT-only Postgres role so AI agents can safely read a production database. Works on Supabase and any Postgres. Use when the user wants agents to query prod data, says "read-only role", "safe prod DB access for agents", or is tired of running SQL by hand for agents. Differentiator: this skill CREATES the role and wiring; day-to-day querying belongs in a project-local skill.'
---

# Create a Read-Only DB Role for Agents

Battle-tested pattern (DeepAPI ADR 0093). A SELECT-only role kills catastrophic writes at the permission level. Residual risks (data leaks, heavy queries) are handled by a denylist and timeouts. Agents stop being blind on prod; the human stops being the SQL bottleneck.

## The pattern — 3 layers

1. **Hard wall — grants.** The role gets SELECT and nothing else. Writes are impossible, not just discouraged.
2. **Denylist, not allowlist.** Grant SELECT on ALL current + future tables in `public` (via default privileges), then revoke the crown jewels (API keys, webhook payloads, secrets). Never grant the `auth` schema. Future tables are auto-readable by design; new sensitive tables need a manual revoke.
3. **Soft guardrails.** `default_transaction_read_only = on` plus `statement_timeout = '10s'`.

**RLS trap:** if prod tables have Row Level Security and no policy mentions the new role, every SELECT returns 0 rows. Fix with `alter role ... bypassrls` — safe, because bypass only skips row filtering; the SELECT-only grants and denylist still apply.

## Workflow

1. **State-check.** `select rolname from pg_roles where rolname = 'agents_readonly';` — if it exists, you are updating, not creating.
2. **Pick the denylist with the human.** Ask which tables hold secrets or PII that agents must never see (API keys, webhook events, auth/user tables).
3. **Write the SQL to a repo file first** (e.g. `docs/database/create-agents-readonly-role.sql`) with comments: what / why / how to apply / how to verify / how to revert. Never hand SQL only in chat.
4. **The human applies it** — agents never run DDL on prod. Supabase: paste the whole file into the SQL editor, then DELETE the query from editor history (it contains the password). Store the password in a password manager.
5. **Wire the connection string** as a local env var in `~/.zshrc` (never committed), e.g. `MYPROJ_READONLY_DB_URL`. Supabase session pooler: username is `agents_readonly.<project-ref>`, port 5432. `psql` comes from Homebrew `libpq` if missing.
6. **Verify** with the loop below.
7. **Write a project-local usage skill** so future agents know the key tables, query patterns, and hard rules (read-only forever, never paste PII into commits/docs).

## SQL template

```sql
-- 1. role + soft guardrails
create role agents_readonly with login password 'REPLACE_ME';
alter role agents_readonly set default_transaction_read_only = on;
alter role agents_readonly set statement_timeout = '10s';

-- 2. the real wall: SELECT-only grants, denylist model
grant usage on schema public to agents_readonly;
grant select on all tables in schema public to agents_readonly;
alter default privileges for role postgres in schema public
  grant select on tables to agents_readonly;   -- future tables auto-readable

-- 3. denylist: crown jewels stay invisible (adjust per project)
revoke select on table public.api_keys from agents_readonly;
revoke select on table public.email_webhook_events from agents_readonly;

-- 4. only if RLS is enabled and no policy covers this role
alter role agents_readonly bypassrls;
```

Revert: `drop owned by agents_readonly; drop role agents_readonly;`

## Verification loop (all must pass before declaring done)

```bash
URL="$MYPROJ_READONLY_DB_URL"
psql "$URL" -X -c "select current_user;"                      # -> agents_readonly
psql "$URL" -X -c "show statement_timeout;"                   # -> 10s
psql "$URL" -X -c "select count(*) from public.<big_table>;"  # -> real number, NOT 0
psql "$URL" -X -c "delete from public.<any_table> where false;"
# -> ERROR: read-only transaction (soft guardrail)
psql "$URL" -X -c "begin; set transaction read write; delete from public.<any_table> where false; rollback;"
# -> ERROR: permission denied (the hard wall)
psql "$URL" -X -c "select * from public.<denylisted> limit 1;"    # -> ERROR: permission denied
psql "$URL" -X -c "select * from auth.users limit 1;"             # -> ERROR: permission denied
```

Writes must be blocked **twice over**: once by the read-only guardrail, and again by `permission denied` with the guardrail off. If any check fails, fix the grants and re-run ALL checks.

## Failure modes

- **Every table returns 0 rows** → RLS is enabled and the role has no policy → add `bypassrls` (step 4 of template).
- **A write succeeded during verification** → grants are wrong. Stop, revoke everything, re-run the template.
- **Supabase auth failed** → pooler username must be `agents_readonly.<project-ref>`, not bare `agents_readonly`.
- **`statement timeout` on legit queries** → query too heavy; add filters/limits. Do not raise the timeout as a first resort.

## Maintenance

- New sensitive table → add a `revoke select` next to the denylist block.
- Rotate password: `alter role agents_readonly with password '...'` then update the env var in `~/.zshrc`.
- Never let agents write through this role. Prod writes stay human-only.
