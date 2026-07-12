-- Kami Phase 1 schema
create table if not exists agent_sessions (
  id uuid primary key default gen_random_uuid(),
  hermes_session_id text unique not null,
  domain text not null,
  goals jsonb not null default '[]',
  stage text,
  status text not null default 'running', -- running | done | failed
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  role text not null, -- user | assistant | activity
  content text not null,
  created_at timestamptz not null default now()
);
create index if not exists messages_session_idx on messages(session_id, created_at);

create table if not exists brand_profiles (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  company text,
  brand_voice text,
  positioning text,
  tone jsonb,
  competitor_analysis jsonb,
  raw_dossier jsonb,
  created_at timestamptz not null default now()
);

create table if not exists icp_buckets (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  label text not null,
  where_they_live text,
  trigger_signal text,
  est_size text,
  angle text,
  analysis jsonb,
  created_at timestamptz not null default now()
);

create table if not exists opportunities (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  title text not null,
  playbook text,
  detail text,
  status text not null default 'proposed', -- proposed | approved | dismissed | executed
  receipt jsonb,
  created_at timestamptz not null default now()
);

create table if not exists connected_accounts (
  id uuid primary key default gen_random_uuid(),
  platform text not null, -- x | email | reddit | discord
  handle text,
  status text not null default 'pending', -- pending | connected
  oauth jsonb,
  created_at timestamptz not null default now()
);

create table if not exists activity_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  phase text,
  message text not null,
  created_at timestamptz not null default now()
);
create index if not exists activity_session_idx on activity_events(session_id, created_at);
