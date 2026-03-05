-- ============================================================
-- NestMoney — Initial Schema
-- Migration: 20260302000001
-- ============================================================
-- Execution order:
--   1. Helper functions (SECURITY DEFINER — bypass RLS for policy helpers)
--   2. Tables (in FK dependency order)
--   3. Indexes
--   4. Enable RLS
--   5. RLS policies (one block per table)
-- ============================================================


-- ============================================================
-- 1. HELPER FUNCTIONS
-- ============================================================
-- These are SECURITY DEFINER so they bypass RLS when queried by other
-- table policies. This prevents infinite recursion when policies on
-- tables like `cards` need to look up the caller's role from `users`.

CREATE OR REPLACE FUNCTION public.get_auth_user_family_id()
RETURNS UUID
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT family_id FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.get_auth_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.users WHERE id = auth.uid();
$$;

CREATE OR REPLACE FUNCTION public.is_parent()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid())
    IN ('primary_parent', 'secondary_parent'),
    false
  );
$$;

CREATE OR REPLACE FUNCTION public.is_primary_parent()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.users WHERE id = auth.uid()) = 'primary_parent',
    false
  );
$$;


-- ============================================================
-- 2. TABLES
-- ============================================================

-- The organizing entity for every family
CREATE TABLE public.families (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.families IS 'Top-level organizing entity. Every user belongs to exactly one family.';


-- Every person in the app belongs to a family with a role
CREATE TABLE public.users (
  id              UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  family_id       UUID REFERENCES public.families(id) ON DELETE SET NULL,
  role            TEXT NOT NULL CHECK (role IN (
                    'primary_parent',
                    'secondary_parent',
                    'child',
                    'contributor'
                  )),
  display_name    TEXT,
  language_code   TEXT DEFAULT 'en',
  avatar_url      TEXT,
  push_token      TEXT,    -- Expo push notification token
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.users IS 'App user profiles. One row per auth.user. References auth.users(id).';
COMMENT ON COLUMN public.users.push_token IS 'Expo push token. Stored on login, used by Edge Functions for notifications.';
COMMENT ON COLUMN public.users.language_code IS 'BCP 47 code: en, es, tl, vi, yue, zh, mn, hi, pa';


-- Virtual kid debit cards (issued via Unit.co)
CREATE TABLE public.cards (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id       UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  child_user_id   UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  unit_card_id    TEXT UNIQUE,          -- Unit.co card reference
  status          TEXT DEFAULT 'active' CHECK (status IN ('active', 'frozen', 'cancelled')),
  daily_limit     INTEGER,              -- in cents
  category_limits JSONB,               -- e.g. {"food": 2000, "entertainment": 1000}
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.cards IS 'Virtual Visa debit cards issued via Unit.co for child family members.';
COMMENT ON COLUMN public.cards.daily_limit IS 'Maximum daily spend in cents.';
COMMENT ON COLUMN public.cards.category_limits IS 'Per-category spend limits in cents. Keys are merchant category names.';


-- All transactions across all accounts (populated via Unit.co webhooks)
CREATE TABLE public.transactions (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id             UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  card_id               UUID REFERENCES public.cards(id) ON DELETE SET NULL,
  user_id               UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount                INTEGER NOT NULL,  -- in cents; negative = debit
  currency              TEXT DEFAULT 'USD',
  merchant_name         TEXT,
  category              TEXT,
  status                TEXT CHECK (status IN ('pending', 'cleared', 'declined', 'needs_approval')),
  unit_transaction_id   TEXT UNIQUE,       -- Unit.co transaction reference
  created_at            TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.transactions IS 'All transaction history. Populated exclusively via the receive-transaction Edge Function from Unit.co webhooks.';
COMMENT ON COLUMN public.transactions.amount IS 'Amount in cents. Negative = debit (money leaving). Positive = credit.';


-- Parent approval queue for over-limit or flagged transactions
CREATE TABLE public.approval_requests (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id  UUID NOT NULL REFERENCES public.transactions(id) ON DELETE CASCADE,
  requested_by    UUID REFERENCES public.users(id) ON DELETE SET NULL,
  approved_by     UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status          TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'denied')),
  created_at      TIMESTAMPTZ DEFAULT NOW(),
  resolved_at     TIMESTAMPTZ
);

COMMENT ON TABLE public.approval_requests IS 'Queue of transactions awaiting parent approval. Created by the webhook Edge Function for needs_approval transactions.';


-- Family savings goals
CREATE TABLE public.savings_goals (
  id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  family_id               UUID NOT NULL REFERENCES public.families(id) ON DELETE CASCADE,
  title                   TEXT NOT NULL,
  target_amount           INTEGER NOT NULL,   -- in cents
  current_amount          INTEGER DEFAULT 0,  -- in cents
  currency                TEXT DEFAULT 'USD',
  owner_user_id           UUID REFERENCES public.users(id) ON DELETE SET NULL,
  visible_to_contributors BOOLEAN DEFAULT TRUE,
  deadline                DATE,
  completed_at            TIMESTAMPTZ,
  created_at              TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.savings_goals IS 'Family savings goals. Contributors can only see goals where visible_to_contributors = true.';
COMMENT ON COLUMN public.savings_goals.target_amount IS 'Goal target in cents.';
COMMENT ON COLUMN public.savings_goals.current_amount IS 'Running total of all contributions in cents.';
COMMENT ON COLUMN public.savings_goals.visible_to_contributors IS 'When true, contributors (grandparents / family abroad) can see and contribute to this goal.';


-- Individual contributions to savings goals
CREATE TABLE public.goal_contributions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id         UUID NOT NULL REFERENCES public.savings_goals(id) ON DELETE CASCADE,
  contributed_by  UUID REFERENCES public.users(id) ON DELETE SET NULL,
  amount          INTEGER NOT NULL,  -- in cents, always positive
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.goal_contributions IS 'Immutable record of each contribution to a savings goal. All family members including contributors may insert.';


-- Cached AI-generated education videos (keyed by event + language)
CREATE TABLE public.education_videos (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  trigger_event    TEXT NOT NULL,    -- e.g. 'first_paycheck', 'card_declined'
  language_code    TEXT NOT NULL,
  video_url        TEXT NOT NULL,
  heygen_video_id  TEXT,
  duration_seconds INTEGER,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(trigger_event, language_code)
);

COMMENT ON TABLE public.education_videos IS 'HeyGen-generated education videos. Cached permanently by (trigger_event, language_code). Populated by trigger-video Edge Function.';


-- Track which users have watched which videos
CREATE TABLE public.video_views (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  video_id    UUID NOT NULL REFERENCES public.education_videos(id) ON DELETE CASCADE,
  watched_at  TIMESTAMPTZ DEFAULT NOW(),
  completed   BOOLEAN DEFAULT FALSE,
  UNIQUE(user_id, video_id)
);

COMMENT ON TABLE public.video_views IS 'Tracks video watch history per user. UNIQUE(user_id, video_id) — use INSERT ... ON CONFLICT DO UPDATE to mark completed.';


-- ============================================================
-- 3. INDEXES
-- ============================================================
-- family_id indexes — the most common filter across all queries
CREATE INDEX idx_users_family_id             ON public.users(family_id);
CREATE INDEX idx_cards_family_id             ON public.cards(family_id);
CREATE INDEX idx_transactions_family_id      ON public.transactions(family_id);
CREATE INDEX idx_savings_goals_family_id     ON public.savings_goals(family_id);

-- user_id indexes — used for per-user lookups in child/contributor scoped queries
CREATE INDEX idx_cards_child_user_id         ON public.cards(child_user_id);
CREATE INDEX idx_transactions_user_id        ON public.transactions(user_id);
CREATE INDEX idx_transactions_card_id        ON public.transactions(card_id);
CREATE INDEX idx_approval_requests_requested ON public.approval_requests(requested_by);
CREATE INDEX idx_savings_goals_owner         ON public.savings_goals(owner_user_id);
CREATE INDEX idx_goal_contributions_goal_id  ON public.goal_contributions(goal_id);
CREATE INDEX idx_goal_contributions_user_id  ON public.goal_contributions(contributed_by);
CREATE INDEX idx_video_views_user_id         ON public.video_views(user_id);

-- created_at indexes — used for chronological feeds and ordering
CREATE INDEX idx_transactions_created_at     ON public.transactions(created_at DESC);
CREATE INDEX idx_approval_requests_created   ON public.approval_requests(created_at DESC);
CREATE INDEX idx_goal_contributions_created  ON public.goal_contributions(created_at DESC);
CREATE INDEX idx_video_views_watched_at      ON public.video_views(watched_at DESC);

-- Partial index — pending approvals are the hot path in the approval queue
CREATE INDEX idx_approval_requests_pending
  ON public.approval_requests(transaction_id)
  WHERE status = 'pending';

-- Partial index — active cards only
CREATE INDEX idx_cards_active
  ON public.cards(family_id, child_user_id)
  WHERE status = 'active';

-- Composite index — education video lookup is always (event, language)
CREATE INDEX idx_education_videos_event_lang
  ON public.education_videos(trigger_event, language_code);


-- ============================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.families           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approval_requests  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.savings_goals      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education_videos   ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.video_views        ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 5. RLS POLICIES
-- ============================================================
-- Convention:
--   "authenticated" role = logged-in Expo app users
--   "service_role" bypasses ALL RLS (used by Edge Functions for writes)
--
-- Every table that only receives writes from Edge Functions
-- (transactions, education_videos) has NO INSERT/UPDATE/DELETE policy
-- for the authenticated role — those operations require service_role.
-- ============================================================


-- ------------------------------------------------------------
-- families
-- ------------------------------------------------------------
-- SELECT: User can see their own family record.
CREATE POLICY "families_select_own"
  ON public.families FOR SELECT
  USING (id = get_auth_user_family_id());

-- INSERT: Any authenticated user can create a family (first step of onboarding).
-- The client creates the family, then updates their users row with family_id.
CREATE POLICY "families_insert_authenticated"
  ON public.families FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

-- UPDATE: Only the primary parent of that family can rename it.
CREATE POLICY "families_update_primary_parent"
  ON public.families FOR UPDATE
  USING (
    id = get_auth_user_family_id()
    AND get_auth_user_role() = 'primary_parent'
  );

-- DELETE: Blocked for all authenticated users — use soft delete or service_role.
-- (No DELETE policy = deny by default under RLS)


-- ------------------------------------------------------------
-- users
-- ------------------------------------------------------------
-- SELECT: Users can see their own profile, plus all members of their family.
-- A user with no family_id (mid-onboarding) can still see themselves.
CREATE POLICY "users_select_own_and_family"
  ON public.users FOR SELECT
  USING (
    id = auth.uid()
    OR (
      family_id IS NOT NULL
      AND family_id = get_auth_user_family_id()
    )
  );

-- INSERT: A user may only insert a profile row for themselves.
-- Triggered by the onboarding flow immediately after auth.signUp().
CREATE POLICY "users_insert_own_profile"
  ON public.users FOR INSERT
  WITH CHECK (id = auth.uid());

-- UPDATE: Users may update their own profile.
-- Primary parents may also update any member of their family
-- (e.g. to change a child's display name or language).
CREATE POLICY "users_update_own_or_parent"
  ON public.users FOR UPDATE
  USING (
    id = auth.uid()
    OR (
      family_id = get_auth_user_family_id()
      AND get_auth_user_role() = 'primary_parent'
    )
  );

-- DELETE: Primary parent can remove contributors or children from the family.
-- Users can also delete their own profile (account deletion).
CREATE POLICY "users_delete_own_or_primary_parent"
  ON public.users FOR DELETE
  USING (
    id = auth.uid()
    OR (
      family_id = get_auth_user_family_id()
      AND get_auth_user_role() = 'primary_parent'
    )
  );


-- ------------------------------------------------------------
-- cards
-- ------------------------------------------------------------
-- SELECT:
--   parents       → all cards in their family
--   child         → only the card where child_user_id = their uid
--   contributor   → no cards
CREATE POLICY "cards_select"
  ON public.cards FOR SELECT
  USING (
    family_id = get_auth_user_family_id()
    AND (
      is_parent()
      OR child_user_id = auth.uid()
    )
  );

-- INSERT: Parents only.
CREATE POLICY "cards_insert_parents_only"
  ON public.cards FOR INSERT
  WITH CHECK (
    family_id = get_auth_user_family_id()
    AND is_parent()
  );

-- UPDATE: Parents only (freeze/unfreeze, update limits).
CREATE POLICY "cards_update_parents_only"
  ON public.cards FOR UPDATE
  USING (
    family_id = get_auth_user_family_id()
    AND is_parent()
  );

-- DELETE: Primary parent only.
CREATE POLICY "cards_delete_primary_parent"
  ON public.cards FOR DELETE
  USING (
    family_id = get_auth_user_family_id()
    AND is_primary_parent()
  );


-- ------------------------------------------------------------
-- transactions
-- ------------------------------------------------------------
-- SELECT:
--   parents     → all family transactions
--   child       → only transactions where user_id = their uid
--   contributor → nothing
--
-- This matches ARCHITECTURE.md Section 6 verbatim.
CREATE POLICY "transactions_select"
  ON public.transactions FOR SELECT
  USING (
    family_id = get_auth_user_family_id()
    AND (
      is_parent()
      OR user_id = auth.uid()
    )
  );

-- INSERT / UPDATE / DELETE: Service role only (via receive-transaction Edge Function).
-- No authenticated-role policies = deny by default.


-- ------------------------------------------------------------
-- approval_requests
-- ------------------------------------------------------------
-- SELECT:
--   parents     → all approval requests in their family (via transaction join)
--   child       → only requests they initiated
--   contributor → nothing
CREATE POLICY "approval_requests_select"
  ON public.approval_requests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
        AND t.family_id = get_auth_user_family_id()
    )
    AND (
      is_parent()
      OR requested_by = auth.uid()
    )
  );

-- UPDATE: Parents only (approve or deny a pending request).
CREATE POLICY "approval_requests_update_parents"
  ON public.approval_requests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.transactions t
      WHERE t.id = transaction_id
        AND t.family_id = get_auth_user_family_id()
    )
    AND is_parent()
  );

-- INSERT / DELETE: Service role only.


-- ------------------------------------------------------------
-- savings_goals
-- ------------------------------------------------------------
-- SELECT:
--   primary_parent, secondary_parent → all family goals
--   child                            → goals they own, plus any goal
--                                      with visible_to_contributors = true
--                                      (children benefit from same shared view)
--   contributor                      → only goals where visible_to_contributors = true
--
-- This matches ARCHITECTURE.md Section 6 verbatim.
CREATE POLICY "savings_goals_select"
  ON public.savings_goals FOR SELECT
  USING (
    family_id = get_auth_user_family_id()
    AND (
      get_auth_user_role() != 'contributor'
      OR visible_to_contributors = TRUE
    )
  );

-- INSERT: Parents only.
CREATE POLICY "savings_goals_insert_parents"
  ON public.savings_goals FOR INSERT
  WITH CHECK (
    family_id = get_auth_user_family_id()
    AND is_parent()
  );

-- UPDATE: Parents only (change target, deadline, visibility).
CREATE POLICY "savings_goals_update_parents"
  ON public.savings_goals FOR UPDATE
  USING (
    family_id = get_auth_user_family_id()
    AND is_parent()
  );

-- DELETE: Primary parent only.
CREATE POLICY "savings_goals_delete_primary_parent"
  ON public.savings_goals FOR DELETE
  USING (
    family_id = get_auth_user_family_id()
    AND is_primary_parent()
  );


-- ------------------------------------------------------------
-- goal_contributions
-- ------------------------------------------------------------
-- SELECT: If you can see the goal, you can see its contributions.
--   parent      → all contributions to all family goals
--   child       → contributions to goals they can see
--   contributor → contributions to visible goals only
CREATE POLICY "goal_contributions_select"
  ON public.goal_contributions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.savings_goals sg
      WHERE sg.id = goal_id
        AND sg.family_id = get_auth_user_family_id()
        AND (
          get_auth_user_role() != 'contributor'
          OR sg.visible_to_contributors = TRUE
        )
    )
  );

-- INSERT: Any family member — including contributors — may contribute.
-- The contributor flow is the key grandparent use case.
CREATE POLICY "goal_contributions_insert_family"
  ON public.goal_contributions FOR INSERT
  WITH CHECK (
    contributed_by = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.savings_goals sg
      WHERE sg.id = goal_id
        AND sg.family_id = get_auth_user_family_id()
        AND (
          get_auth_user_role() != 'contributor'
          OR sg.visible_to_contributors = TRUE
        )
    )
  );

-- UPDATE / DELETE: Contributions are immutable for authenticated users.
-- Service role can clean up if needed.


-- ------------------------------------------------------------
-- education_videos
-- ------------------------------------------------------------
-- SELECT: Any authenticated user. Videos are educational, not sensitive.
CREATE POLICY "education_videos_select_all_authenticated"
  ON public.education_videos FOR SELECT
  USING (auth.uid() IS NOT NULL);

-- INSERT / UPDATE / DELETE: Service role only (trigger-video Edge Function).


-- ------------------------------------------------------------
-- video_views
-- ------------------------------------------------------------
-- SELECT: Users see their own view history; parents see their family's.
CREATE POLICY "video_views_select"
  ON public.video_views FOR SELECT
  USING (
    user_id = auth.uid()
    OR (
      is_parent()
      AND EXISTS (
        SELECT 1 FROM public.users u
        WHERE u.id = user_id
          AND u.family_id = get_auth_user_family_id()
      )
    )
  );

-- INSERT: Users may only record their own views.
CREATE POLICY "video_views_insert_own"
  ON public.video_views FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE: Users may only update their own views (e.g. mark completed = true).
CREATE POLICY "video_views_update_own"
  ON public.video_views FOR UPDATE
  USING (user_id = auth.uid());

-- DELETE: No one (view history is permanent).
