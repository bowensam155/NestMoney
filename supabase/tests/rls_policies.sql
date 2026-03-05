-- ============================================================
-- NestMoney — RLS Policy Tests
-- ============================================================
-- Run these in Supabase Studio → SQL Editor after running the
-- seed file, or run them as part of a pgTAP test suite.
--
-- These tests verify that the seed data is correctly gated
-- by the RLS policies for each role.
--
-- Usage:
--   supabase db test  (runs all .sql files in supabase/tests/)
--
-- Seed UUIDs (from supabase/seed.sql):
--   Family:      aaaaaaaa-0000-0000-0000-000000000001
--   Parent:      bbbbbbbb-0000-0000-0000-000000000001
--   Child:       cccccccc-0000-0000-0000-000000000001
--   Contributor: dddddddd-0000-0000-0000-000000000001
-- ============================================================

-- ============================================================
-- HELPER: Impersonate a user for RLS testing
-- ============================================================
-- In Supabase Studio you can run these blocks one at a time.
-- Between tests, reconnect or run: RESET ROLE;

-- ============================================================
-- TEST BLOCK 1: PRIMARY PARENT (Maria Reyes)
-- Expected: sees everything
-- ============================================================

-- Set the session to the parent user
SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"bbbbbbbb-0000-0000-0000-000000000001","role":"authenticated"}';

-- Should return 1 family
SELECT 'families count (parent, expect 1)' AS test, COUNT(*)::text AS result FROM public.families;

-- Should return 3 users (self + child + contributor)
SELECT 'users count (parent, expect 3)' AS test, COUNT(*)::text AS result FROM public.users;

-- Should return 1 card
SELECT 'cards count (parent, expect 1)' AS test, COUNT(*)::text AS result FROM public.cards;

-- Should return 2 transactions (cleared + needs_approval)
SELECT 'transactions count (parent, expect 2)' AS test, COUNT(*)::text AS result FROM public.transactions;

-- Should return 1 pending approval
SELECT 'approval_requests count (parent, expect 1)' AS test, COUNT(*)::text AS result FROM public.approval_requests;

-- Should return 1 goal
SELECT 'savings_goals count (parent, expect 1)' AS test, COUNT(*)::text AS result FROM public.savings_goals;

-- Should return 1 contribution
SELECT 'goal_contributions count (parent, expect 1)' AS test, COUNT(*)::text AS result FROM public.goal_contributions;

RESET ROLE;


-- ============================================================
-- TEST BLOCK 2: CHILD (Sofia Reyes)
-- Expected:
--   - sees family (1), own user row only in users, own card, own transactions
--   - cannot see all family members' full data
--   - sees their own approval requests
--   - sees own goals and goals visible to all
--   - cannot see contributor's existence would be incidental
-- ============================================================

SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"cccccccc-0000-0000-0000-000000000001","role":"authenticated"}';

-- Should return 1 family
SELECT 'families count (child, expect 1)' AS test, COUNT(*)::text AS result FROM public.families;

-- Child sees family members (own profile + others in same family)
-- Based on our policy: id = auth.uid() OR family_id = get_auth_user_family_id()
-- So child sees all 3 members (they share a family)
SELECT 'users count (child, expect 3 — same family)' AS test, COUNT(*)::text AS result FROM public.users;

-- Child sees only their own card
SELECT 'cards count (child, expect 1 — own card)' AS test, COUNT(*)::text AS result FROM public.cards;

-- Child sees only their own transactions (2)
SELECT 'transactions count (child, expect 2 — own transactions)' AS test, COUNT(*)::text AS result FROM public.transactions;

-- Child sees their own approval requests (1)
SELECT 'approval_requests count (child, expect 1)' AS test, COUNT(*)::text AS result FROM public.approval_requests;

-- Child sees goal (visible_to_contributors = true, which also means visible to child)
SELECT 'savings_goals count (child, expect 1)' AS test, COUNT(*)::text AS result FROM public.savings_goals;

-- Child sees contributions to visible goals
SELECT 'goal_contributions count (child, expect 1)' AS test, COUNT(*)::text AS result FROM public.goal_contributions;

RESET ROLE;


-- ============================================================
-- TEST BLOCK 3: CONTRIBUTOR (Lola Carmen)
-- Expected:
--   - sees their family (1)
--   - sees family members
--   - sees NO cards
--   - sees NO transactions
--   - sees NO approval_requests
--   - sees only visible_to_contributors=true goals (1)
--   - can insert a goal contribution
-- ============================================================

SET LOCAL role TO authenticated;
SET LOCAL request.jwt.claims TO '{"sub":"dddddddd-0000-0000-0000-000000000001","role":"authenticated"}';

-- Should return 1 family
SELECT 'families count (contributor, expect 1)' AS test, COUNT(*)::text AS result FROM public.families;

-- Can see family members
SELECT 'users count (contributor, expect 3)' AS test, COUNT(*)::text AS result FROM public.users;

-- CRITICAL: Contributor must see 0 cards
SELECT 'cards count (contributor, MUST BE 0)' AS test, COUNT(*)::text AS result FROM public.cards;

-- CRITICAL: Contributor must see 0 transactions
SELECT 'transactions count (contributor, MUST BE 0)' AS test, COUNT(*)::text AS result FROM public.transactions;

-- CRITICAL: Contributor must see 0 approval_requests
SELECT 'approval_requests count (contributor, MUST BE 0)' AS test, COUNT(*)::text AS result FROM public.approval_requests;

-- Contributor sees the goal (visible_to_contributors = true)
SELECT 'savings_goals count (contributor, expect 1)' AS test, COUNT(*)::text AS result FROM public.savings_goals;

-- Contributor sees the contribution they made
SELECT 'goal_contributions count (contributor, expect 1)' AS test, COUNT(*)::text AS result FROM public.goal_contributions;

-- CRITICAL: Contributor should NOT be able to insert a card
-- Uncomment to test — should fail with permission denied:
-- INSERT INTO public.cards (family_id, child_user_id, status)
-- VALUES ('aaaaaaaa-0000-0000-0000-000000000001', 'cccccccc-0000-0000-0000-000000000001', 'active');

-- Contributor CAN contribute to a visible goal
-- Uncomment to test:
-- INSERT INTO public.goal_contributions (goal_id, contributed_by, amount)
-- VALUES (
--   'ffffffff-0000-0000-0000-000000000001',
--   'dddddddd-0000-0000-0000-000000000001',
--   2500
-- );

RESET ROLE;


-- ============================================================
-- VALIDATION SUMMARY
-- ============================================================
-- Run this outside any role context (as postgres) to verify
-- seed data integrity.
-- ============================================================

SELECT
  'families'           AS table_name, COUNT(*)::text AS row_count FROM public.families
UNION ALL SELECT
  'users',             COUNT(*)::text FROM public.users
UNION ALL SELECT
  'cards',             COUNT(*)::text FROM public.cards
UNION ALL SELECT
  'transactions',      COUNT(*)::text FROM public.transactions
UNION ALL SELECT
  'approval_requests', COUNT(*)::text FROM public.approval_requests
UNION ALL SELECT
  'savings_goals',     COUNT(*)::text FROM public.savings_goals
UNION ALL SELECT
  'goal_contributions', COUNT(*)::text FROM public.goal_contributions
ORDER BY 1;
