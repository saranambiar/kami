-- Distribution opportunity queue (Marketing MVP primary loop).
-- CRM / cold DM tables in 003_marketing.sql remain for Advanced / later feature.

CREATE TABLE IF NOT EXISTS distribution_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
  goal TEXT NOT NULL CHECK (goal IN ('launch', 'early_users', 'credibility', 'waitlist')),
  angle TEXT,
  surfaces JSONB DEFAULT '[]'::jsonb,
  autonomous_paused BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (session_id)
);

CREATE TABLE IF NOT EXISTS distribution_opportunities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES agent_sessions(id) ON DELETE CASCADE,
  campaign_id UUID REFERENCES distribution_campaigns(id) ON DELETE SET NULL,
  platform TEXT NOT NULL CHECK (
    platform IN ('x', 'reddit', 'hackernews', 'linkedin', 'producthunt', 'discord')
  ),
  source_url TEXT NOT NULL,
  evidence TEXT,
  why_now TEXT NOT NULL,
  suggested_action TEXT NOT NULL,
  draft TEXT NOT NULL,
  risks TEXT,
  approval_status TEXT NOT NULL DEFAULT 'needs_review'
    CHECK (approval_status IN ('needs_review', 'approved', 'skipped')),
  action_status TEXT NOT NULL DEFAULT 'draft'
    CHECK (action_status IN ('draft', 'ready', 'posted_manual', 'published', 'failed')),
  outcome TEXT NOT NULL DEFAULT 'none'
    CHECK (outcome IN ('none', 'posted', 'got_reply', 'got_interest', 'got_signup', 'not_relevant', 'skipped')),
  published_url TEXT,
  agent_skill TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS distribution_opportunities_session_idx
  ON distribution_opportunities (session_id, created_at DESC);

CREATE INDEX IF NOT EXISTS distribution_opportunities_status_idx
  ON distribution_opportunities (session_id, approval_status, action_status);
