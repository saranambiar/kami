-- End-to-end observability: every Hermes/pipeline output founders see.
-- Apply in Supabase SQL editor after 009.

create table if not exists agent_run_logs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references agent_sessions(id) on delete set null,
  hermes_session_id text,
  source text not null, -- hermes_once | hermes_stream | pipeline
  kind text not null,   -- dossier_research | ask_kami | sales_plan | discover | …
  agent text,
  status text not null default 'ok', -- ok | error | timeout | fallback | skipped
  model text,
  input_preview text,
  output_text text,
  output_json jsonb,
  error text,
  duration_ms integer,
  meta jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agent_run_logs_session_idx
  on agent_run_logs(session_id, created_at desc);

create index if not exists agent_run_logs_kind_idx
  on agent_run_logs(kind, created_at desc);

create index if not exists agent_run_logs_created_idx
  on agent_run_logs(created_at desc);

comment on table agent_run_logs is
  'Canonical audit trail for agent/pipeline outputs shown in the Kami UI';
