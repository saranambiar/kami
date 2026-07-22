-- Domain-truth pipeline: identity, research provenance, discovery runs

alter table agent_sessions
  add column if not exists canonical_domain text,
  add column if not exists domain_validated_at timestamptz,
  add column if not exists domain_check jsonb,
  add column if not exists research_snapshot jsonb,
  add column if not exists goals_list jsonb;

-- One brand profile per session (dedupe oldest duplicates first if any)
delete from brand_profiles bp
where bp.id not in (
  select distinct on (session_id) id
  from brand_profiles
  order by session_id, created_at desc
);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'brand_profiles_session_unique'
  ) then
    alter table brand_profiles
      add constraint brand_profiles_session_unique unique (session_id);
  end if;
exception
  when duplicate_object then null;
  when others then null;
end $$;

create table if not exists sales_discovery_runs (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references agent_sessions(id) on delete cascade,
  sales_campaign_id uuid references sales_campaigns(id) on delete set null,
  segment_snapshot jsonb,
  warnings text[],
  accounts_discovered integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists sales_discovery_runs_session_idx
  on sales_discovery_runs(session_id, created_at desc);

alter table sales_account_signals
  add column if not exists discovery_run_id uuid references sales_discovery_runs(id) on delete set null;

alter table sales_lead_scores
  add column if not exists discovery_run_id uuid references sales_discovery_runs(id) on delete set null;

comment on column agent_sessions.canonical_domain is 'Validated registrable host (no www)';
comment on column agent_sessions.domain_check is 'DomainIdentity JSON or invalid reason';
comment on column agent_sessions.research_snapshot is 'Provenance-tagged Linkup/first-party research';
