-- Marketing vertical schema (namespaced to avoid Sales clash)

create table if not exists marketing_config (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references agent_sessions(id) on delete cascade,
  platforms text[] not null default '{}',
  x_boost_budget numeric,
  x_outreach_goal text,
  ig_offer_min numeric,
  ig_offer_max numeric,
  ig_niche_keywords text[],
  ig_min_followers integer default 5000,
  tone text[],
  autonomous_paused boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists marketing_config_session_idx on marketing_config(session_id);

create table if not exists marketing_crm (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references agent_sessions(id) on delete cascade,
  type text not null, -- x_lead | creator
  platform text not null, -- x | instagram
  handle text not null,
  name text,
  followers integer,
  engagement_rate numeric,
  niche_match_score numeric,
  relevance_reasoning text,
  offer_amount numeric,
  status text not null default 'identified',
  calendar_event_id text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (session_id, platform, handle)
);
create index if not exists marketing_crm_session_idx on marketing_crm(session_id, created_at desc);
create index if not exists marketing_crm_type_status_idx on marketing_crm(type, status);

create table if not exists marketing_conversations (
  id uuid primary key default gen_random_uuid(),
  crm_entry_id uuid not null references marketing_crm(id) on delete cascade,
  platform text not null, -- x | instagram
  goal text not null, -- negotiate_collab | drive_signup | book_demo
  persona_config jsonb,
  budget_min numeric,
  budget_max numeric,
  status text not null default 'idle',
  escalation_reason text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists marketing_conversations_crm_idx on marketing_conversations(crm_entry_id);
create index if not exists marketing_conversations_status_idx on marketing_conversations(status, updated_at desc);

create table if not exists marketing_conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references marketing_conversations(id) on delete cascade,
  sender text not null, -- kami | lead
  content text not null,
  platform_message_id text,
  status text not null default 'sent', -- sent | failed
  sent_at timestamptz not null default now()
);
create index if not exists marketing_conversation_messages_conv_idx on marketing_conversation_messages(conversation_id, sent_at);

create table if not exists boost_campaigns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid references agent_sessions(id) on delete cascade,
  post_id text not null,
  post_text text not null,
  budget numeric not null default 50,
  status text not null default 'pending', -- pending | live | completed
  impressions integer,
  clicks integer,
  spend numeric,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists boost_campaigns_session_idx on boost_campaigns(session_id, created_at desc);
