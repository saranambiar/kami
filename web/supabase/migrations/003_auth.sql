-- Kami Phase 2.1 — associate campaigns with the signed-in Google user.
alter table agent_sessions
  add column if not exists user_id uuid references auth.users(id) on delete cascade;

create index if not exists agent_sessions_user_idx
  on agent_sessions(user_id, created_at desc);
