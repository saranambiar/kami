-- Sales segments confirmation + per-account segment key (pipeline overhaul)

alter table sales_campaigns
  add column if not exists segments jsonb,
  add column if not exists segments_confirmed_at timestamptz;

alter table sales_accounts
  add column if not exists segment_key text;

comment on column sales_campaigns.segments is 'Confirmed outbound segments JSON (SalesSegment[])';
comment on column sales_campaigns.segments_confirmed_at is 'When founder confirmed ICP segments; discovery blocked until set';
comment on column sales_accounts.segment_key is 'Which confirmed segment this account was discovered under';
