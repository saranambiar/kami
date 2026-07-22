-- Bind connected social accounts to Kami campaign sessions + browser claim ids.

alter table connected_accounts
  add column if not exists session_id uuid references agent_sessions(id) on delete set null;

alter table connected_accounts
  add column if not exists claim_id text;

create index if not exists connected_accounts_session_idx
  on connected_accounts(session_id, platform);

create index if not exists connected_accounts_claim_idx
  on connected_accounts(claim_id, platform);

-- At most one connected account per session+platform when session is set.
create unique index if not exists connected_accounts_session_platform_uidx
  on connected_accounts(session_id, platform)
  where session_id is not null and status = 'connected';
