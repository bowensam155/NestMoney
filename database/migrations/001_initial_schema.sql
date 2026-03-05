-- ============================================================
-- NestMoney — Initial Database Schema
-- Provider: AWS RDS Postgres, db.t3.micro (free tier)
-- Engine: PostgreSQL 15
-- Run: psql -h $DB_HOST -U $DB_USER -d $DB_NAME -f 001_initial_schema.sql
-- ============================================================

-- Enable UUID generation (required for DEFAULT gen_random_uuid())
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- ============================================================
-- families
-- ============================================================
CREATE TABLE families (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT        NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- users
-- id matches the Cognito sub — set at account creation, never changes
-- ============================================================
CREATE TABLE users (
  id            UUID        PRIMARY KEY,  -- Cognito sub
  family_id     UUID        REFERENCES families(id),
  role          TEXT        NOT NULL CHECK (role IN (
                              'primary_parent',
                              'secondary_parent',
                              'child',
                              'contributor'
                            )),
  display_name  TEXT,
  language_code TEXT        DEFAULT 'en',
  avatar_url    TEXT,
  push_token    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- cards
-- daily_limit and category_limits stored in cents
-- ============================================================
CREATE TABLE cards (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id      UUID        REFERENCES families(id),
  child_user_id  UUID        REFERENCES users(id),
  unit_card_id   TEXT        UNIQUE,
  status         TEXT        DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'cancelled')),
  daily_limit    INTEGER,    -- cents; NULL = no limit
  category_limits JSONB,     -- { "food": 2000, "entertainment": 1000 } — cents per category
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- transactions
-- amount is always in cents; positive = credit, negative = debit
-- ============================================================
CREATE TABLE transactions (
  id                   UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id            UUID        REFERENCES families(id),
  card_id              UUID        REFERENCES cards(id),
  user_id              UUID        REFERENCES users(id),
  amount               INTEGER     NOT NULL,  -- cents
  currency             TEXT        DEFAULT 'USD',
  merchant_name        TEXT,
  category             TEXT,
  status               TEXT        CHECK (status IN (
                                     'pending',
                                     'cleared',
                                     'declined',
                                     'needs_approval'
                                   )),
  unit_transaction_id  TEXT        UNIQUE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- approval_requests
-- Created when a child transaction exceeds the daily limit
-- ============================================================
CREATE TABLE approval_requests (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID        REFERENCES transactions(id),
  requested_by   UUID        REFERENCES users(id),
  approved_by    UUID        REFERENCES users(id),
  status         TEXT        DEFAULT 'pending' CHECK (status IN (
                               'pending',
                               'approved',
                               'denied'
                             )),
  created_at     TIMESTAMPTZ DEFAULT NOW(),
  resolved_at    TIMESTAMPTZ
);

-- ============================================================
-- savings_goals
-- target_amount and current_amount always in cents
-- ============================================================
CREATE TABLE savings_goals (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id             UUID        REFERENCES families(id),
  title                 TEXT        NOT NULL,
  target_amount         INTEGER     NOT NULL,  -- cents
  current_amount        INTEGER     DEFAULT 0, -- cents
  currency              TEXT        DEFAULT 'USD',
  owner_user_id         UUID        REFERENCES users(id),
  visible_to_contributors BOOLEAN   DEFAULT TRUE,
  deadline              DATE,
  completed_at          TIMESTAMPTZ,
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- goal_contributions
-- amount always positive, in cents
-- ============================================================
CREATE TABLE goal_contributions (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id        UUID        REFERENCES savings_goals(id),
  contributed_by UUID        REFERENCES users(id),
  amount         INTEGER     NOT NULL,  -- cents, always positive
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- education_videos
-- One video per (trigger_event, language_code) pair — cached indefinitely
-- ============================================================
CREATE TABLE education_videos (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_event     TEXT        NOT NULL,
  language_code     TEXT        NOT NULL,
  s3_key            TEXT        NOT NULL,
  cloudfront_url    TEXT        NOT NULL,
  heygen_video_id   TEXT,
  duration_seconds  INTEGER,
  created_at        TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (trigger_event, language_code)
);

-- ============================================================
-- video_views
-- Tracks which users have watched which videos
-- ============================================================
CREATE TABLE video_views (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        REFERENCES users(id),
  video_id   UUID        REFERENCES education_videos(id),
  watched_at TIMESTAMPTZ DEFAULT NOW(),
  completed  BOOLEAN     DEFAULT FALSE
);

-- ============================================================
-- Indexes
-- ============================================================

-- Users
CREATE INDEX idx_users_family_id ON users(family_id);

-- Cards
CREATE INDEX idx_cards_family_id      ON cards(family_id);
CREATE INDEX idx_cards_child_user_id  ON cards(child_user_id);

-- Transactions (hot path — sorted by date, filtered by family and card)
CREATE INDEX idx_transactions_family_id  ON transactions(family_id);
CREATE INDEX idx_transactions_card_id    ON transactions(card_id);
CREATE INDEX idx_transactions_created_at ON transactions(created_at DESC);

-- Savings goals
CREATE INDEX idx_savings_goals_family_id ON savings_goals(family_id);
CREATE INDEX idx_savings_goals_owner     ON savings_goals(owner_user_id);

-- Goal contributions
CREATE INDEX idx_goal_contributions_goal_id ON goal_contributions(goal_id);

-- Approval requests
CREATE INDEX idx_approval_requests_transaction ON approval_requests(transaction_id);
CREATE INDEX idx_approval_requests_status      ON approval_requests(status) WHERE status = 'pending';

-- Video views
CREATE INDEX idx_video_views_user_id ON video_views(user_id);
