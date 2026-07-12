-- Kami Phase 2 CRM schema
create table if not exists contacts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references agent_sessions(id) on delete set null,
  bucket_id uuid references icp_buckets(id) on delete set null,
  name text,
  handle text,             -- email address or @handle
  platform text not null,  -- email | x | reddit | discord
  company text,
  title text,
  source text,             -- where research found them
  created_at timestamptz not null default now()
);
create index if not exists contacts_handle_idx on contacts(platform, handle);

create table if not exists outreach_log (
  id uuid primary key default gen_random_uuid(),
  contact_id uuid references contacts(id) on delete set null,
  session_id uuid references agent_sessions(id) on delete set null,
  opportunity_id uuid references opportunities(id) on delete set null,
  surface text not null,   -- email | x | reddit | discord
  draft text,
  receipt jsonb,           -- provider_message_id / post url / DRYRUN-NOT-SENT
  status text not null default 'drafted', -- drafted | approved | sent | replied | bounced
  sent_at timestamptz,
  created_at timestamptz not null default now()
);
create index if not exists outreach_status_idx on outreach_log(status, created_at);

create table if not exists followups (
  id uuid primary key default gen_random_uuid(),
  outreach_id uuid references outreach_log(id) on delete cascade,
  due_at timestamptz not null,
  note text,
  done boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists do_not_contact (
  id uuid primary key default gen_random_uuid(),
  handle text not null unique, -- email or @handle or domain
  reason text,
  created_at timestamptz not null default now()
);
