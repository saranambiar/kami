-- Sales vertical schema (session-scoped tenancy)

create table if not exists sales_campaigns (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null unique references agent_sessions(id) on delete cascade,
  client_id text,
  offer text not null,
  icp jsonb not null default '{}',
  geo text,
  exclusions text[],
  deal_range jsonb,
  approved_claims text[],
  target_quantity integer default 50,
  sender_identity jsonb,
  daily_send_cap integer not null default 35,
  allowed_channels text[] not null default '{email}',
  autonomous_paused boolean not null default false,
  auto_followups boolean not null default true,
  require_first_send_approval boolean not null default true,
  pipeline_stage text not null default 'researching',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sales_campaigns_session_idx on sales_campaigns(session_id);

create table if not exists sales_plans (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  sales_campaign_id uuid references sales_campaigns(id) on delete cascade,
  version integer not null default 1,
  motions jsonb not null default '[]',
  tiers jsonb not null default '[]',
  channel_rationale text,
  risks text[],
  prerequisites text[],
  estimated_activity jsonb,
  approval_scope text[],
  status text not null default 'draft',
  revise_note text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (sales_campaign_id, version)
);
create index if not exists sales_plans_session_idx on sales_plans(session_id, created_at desc);
create index if not exists sales_plans_campaign_status_idx on sales_plans(sales_campaign_id, status);

create table if not exists sales_accounts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  sales_campaign_id uuid references sales_campaigns(id) on delete cascade,
  client_id text,
  name text not null,
  domain text,
  industry text,
  size text,
  geo text,
  pipeline_stage text not null default 'researching',
  tier smallint,
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists sales_accounts_session_domain_idx
  on sales_accounts(session_id, lower(coalesce(domain, name)));
create index if not exists sales_accounts_session_stage_idx on sales_accounts(session_id, pipeline_stage);

create table if not exists sales_account_signals (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  account_id uuid not null references sales_accounts(id) on delete cascade,
  provider text not null,
  signal_type text not null,
  detail text not null,
  source_url text,
  observed_at timestamptz,
  captured_at timestamptz not null default now(),
  confidence numeric,
  evidence_text text,
  created_at timestamptz not null default now()
);
create index if not exists sales_account_signals_account_idx on sales_account_signals(account_id, captured_at desc);

create table if not exists sales_contacts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  sales_campaign_id uuid references sales_campaigns(id) on delete set null,
  account_id uuid references sales_accounts(id) on delete set null,
  name text,
  title text,
  email text,
  handle text,
  channel text,
  email_verification text,
  do_not_contact boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create unique index if not exists sales_contacts_session_email_idx
  on sales_contacts(session_id, lower(email)) where email is not null;
create unique index if not exists sales_contacts_session_handle_channel_idx
  on sales_contacts(session_id, lower(handle), channel) where handle is not null and channel is not null;
create index if not exists sales_contacts_account_idx on sales_contacts(account_id);

create table if not exists sales_buying_group_members (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  account_id uuid not null references sales_accounts(id) on delete cascade,
  contact_id uuid not null references sales_contacts(id) on delete cascade,
  role text not null,
  evidence_refs text[],
  confidence numeric,
  created_at timestamptz not null default now(),
  unique (account_id, contact_id, role)
);
create index if not exists sales_buying_group_account_idx on sales_buying_group_members(account_id);

create table if not exists sales_lead_scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  account_id uuid references sales_accounts(id) on delete cascade,
  contact_id uuid references sales_contacts(id) on delete cascade,
  model_version text not null default 'v1',
  factors jsonb not null default '{}',
  explanation text not null,
  evidence_refs text[],
  recommended_tier smallint,
  recommended_channel text,
  created_at timestamptz not null default now()
);
create index if not exists sales_lead_scores_account_idx on sales_lead_scores(account_id, created_at desc);
create index if not exists sales_lead_scores_contact_idx on sales_lead_scores(contact_id, created_at desc);

create table if not exists sales_sequences (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  sales_campaign_id uuid references sales_campaigns(id) on delete cascade,
  name text not null,
  channel text not null,
  steps jsonb not null default '[]',
  stop_on_reply boolean not null default true,
  stop_on_bounce boolean not null default true,
  stop_on_unsubscribe boolean not null default true,
  status text not null default 'draft',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sales_sequences_session_idx on sales_sequences(session_id, status);

create table if not exists sales_sequence_enrollments (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  sequence_id uuid not null references sales_sequences(id) on delete cascade,
  contact_id uuid not null references sales_contacts(id) on delete cascade,
  account_id uuid references sales_accounts(id) on delete set null,
  status text not null default 'draft',
  current_step integer not null default 0,
  enrolled_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sales_sequence_enrollments_session_idx on sales_sequence_enrollments(session_id, status);

create table if not exists sales_touchpoints (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  enrollment_id uuid not null references sales_sequence_enrollments(id) on delete cascade,
  channel text not null,
  step integer not null,
  status text not null default 'drafted',
  draft_id text,
  draft_subject text,
  draft_body text,
  draft_cta text,
  draft_metadata jsonb,
  reviewer_verdict jsonb,
  approved_at timestamptz,
  provider_receipt_id uuid,
  sent_at timestamptz,
  immutable boolean not null default true,
  created_at timestamptz not null default now()
);
create index if not exists sales_touchpoints_enrollment_idx on sales_touchpoints(enrollment_id, step);

create table if not exists sales_conversations (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  account_id uuid references sales_accounts(id) on delete set null,
  contact_id uuid references sales_contacts(id) on delete set null,
  channel text not null,
  status text not null default 'open',
  last_message_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sales_conversations_session_idx on sales_conversations(session_id, updated_at desc);

create table if not exists sales_conversation_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references sales_conversations(id) on delete cascade,
  direction text not null,
  content text not null,
  provider_message_id text,
  classification_id uuid,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists sales_conversation_messages_conv_idx
  on sales_conversation_messages(conversation_id, sent_at);

create table if not exists sales_reply_classifications (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  message_id uuid not null references sales_conversation_messages(id) on delete cascade,
  label text not null,
  confidence numeric,
  escalation_required boolean not null default false,
  draft_response text,
  created_at timestamptz not null default now()
);
create index if not exists sales_reply_classifications_message_idx on sales_reply_classifications(message_id);

create table if not exists sales_meetings (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  account_id uuid references sales_accounts(id) on delete set null,
  contact_id uuid references sales_contacts(id) on delete set null,
  conversation_id uuid references sales_conversations(id) on delete set null,
  title text,
  status text not null default 'proposed',
  proposed_at timestamptz,
  scheduled_at timestamptz,
  calendar_event_id text,
  provider_receipt jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sales_meetings_session_status_idx on sales_meetings(session_id, status);

create table if not exists sales_tasks (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  account_id uuid references sales_accounts(id) on delete set null,
  contact_id uuid references sales_contacts(id) on delete set null,
  conversation_id uuid references sales_conversations(id) on delete set null,
  title text not null,
  description text,
  status text not null default 'open',
  priority text not null default 'medium',
  due_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists sales_tasks_session_status_idx on sales_tasks(session_id, status, due_at);

create table if not exists sales_notifications (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  kind text not null,
  title text not null,
  body text,
  entity_type text,
  entity_id uuid,
  read boolean not null default false,
  created_at timestamptz not null default now()
);
create index if not exists sales_notifications_session_idx on sales_notifications(session_id, read, created_at desc);

create table if not exists sales_approvals (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  sales_campaign_id uuid references sales_campaigns(id) on delete cascade,
  scope text not null,
  entity_type text not null,
  entity_id uuid not null,
  status text not null default 'pending',
  requested_by text,
  decided_by text,
  decided_at timestamptz,
  notes text,
  created_at timestamptz not null default now()
);
create index if not exists sales_approvals_campaign_scope_idx on sales_approvals(sales_campaign_id, scope, status);

create table if not exists sales_suppression_entries (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  channel text,
  identifier text not null,
  reason text not null,
  source text not null,
  scope text,
  actor text,
  created_at timestamptz not null default now()
);
create unique index if not exists sales_suppression_session_identifier_idx
  on sales_suppression_entries(session_id, lower(identifier), coalesce(channel, ''));

create table if not exists sales_execution_receipts (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  sales_campaign_id uuid references sales_campaigns(id) on delete set null,
  touchpoint_id uuid references sales_touchpoints(id) on delete set null,
  channel text not null,
  provider text not null,
  provider_message_id text,
  recipient text not null,
  status text not null default 'sent',
  raw jsonb,
  sent_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);
create index if not exists sales_execution_receipts_campaign_sent_idx
  on sales_execution_receipts(sales_campaign_id, sent_at desc);
create index if not exists sales_execution_receipts_session_idx on sales_execution_receipts(session_id, sent_at desc);

create table if not exists sales_audit_events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  actor text not null,
  action text not null,
  entity_type text not null,
  entity_id uuid,
  payload jsonb,
  created_at timestamptz not null default now()
);
create index if not exists sales_audit_events_session_idx on sales_audit_events(session_id, created_at desc);
