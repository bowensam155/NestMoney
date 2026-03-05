-- ============================================================
-- NestMoney — Development Seed Data
-- ============================================================
-- Creates one test family with three members to immediately
-- exercise the role/permission system after `supabase db push`.
--
-- Test accounts:
--   primary_parent  → parent@nestmoney.test   / testpassword123
--   child           → child@nestmoney.test    / testpassword123
--   contributor     → lola@nestmoney.test     / testpassword123
--
-- Use these credentials in Expo Go or Supabase Studio.
-- Verify RLS by logging in as each role and querying the tables.
-- ============================================================

-- Fixed UUIDs so the seed is idempotent and cross-referenceable
-- in tests and scripts.
DO $$
DECLARE
  v_family_id     UUID := 'aaaaaaaa-0000-0000-0000-000000000001';
  v_parent_id     UUID := 'bbbbbbbb-0000-0000-0000-000000000001';
  v_child_id      UUID := 'cccccccc-0000-0000-0000-000000000001';
  v_contrib_id    UUID := 'dddddddd-0000-0000-0000-000000000001';
  v_card_id       UUID := 'eeeeeeee-0000-0000-0000-000000000001';
  v_goal_id       UUID := 'ffffffff-0000-0000-0000-000000000001';
  v_txn1_id       UUID := '11111111-aaaa-0000-0000-000000000001';
  v_txn2_id       UUID := '11111111-aaaa-0000-0000-000000000002';
  v_approval_id   UUID := '22222222-bbbb-0000-0000-000000000001';
BEGIN

  -- ----------------------------------------------------------
  -- AUTH USERS
  -- ----------------------------------------------------------
  -- Insert test users into Supabase's auth schema.
  -- This is only valid in the local dev environment.
  -- Passwords are bcrypt-hashed — all set to "testpassword123".

  INSERT INTO auth.users (
    id, instance_id, aud, role,
    email, encrypted_password,
    email_confirmed_at, raw_app_meta_data, raw_user_meta_data,
    is_super_admin, created_at, updated_at,
    confirmation_token, recovery_token,
    email_change_token_new, email_change
  ) VALUES
    (
      v_parent_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'parent@nestmoney.test',
      crypt('testpassword123', gen_salt('bf')),
      NOW(), '{"provider":"email","providers":["email"]}', '{}',
      false, NOW(), NOW(), '', '', '', ''
    ),
    (
      v_child_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'child@nestmoney.test',
      crypt('testpassword123', gen_salt('bf')),
      NOW(), '{"provider":"email","providers":["email"]}', '{}',
      false, NOW(), NOW(), '', '', '', ''
    ),
    (
      v_contrib_id,
      '00000000-0000-0000-0000-000000000000',
      'authenticated', 'authenticated',
      'lola@nestmoney.test',
      crypt('testpassword123', gen_salt('bf')),
      NOW(), '{"provider":"email","providers":["email"]}', '{}',
      false, NOW(), NOW(), '', '', '', ''
    )
  ON CONFLICT (id) DO NOTHING;

  -- ----------------------------------------------------------
  -- FAMILY
  -- ----------------------------------------------------------
  INSERT INTO public.families (id, name)
  VALUES (v_family_id, 'The Reyes Family')
  ON CONFLICT (id) DO NOTHING;

  -- ----------------------------------------------------------
  -- USERS (app profiles)
  -- ----------------------------------------------------------
  INSERT INTO public.users (id, family_id, role, display_name, language_code)
  VALUES
    (v_parent_id,  v_family_id, 'primary_parent', 'Maria Reyes',   'en'),
    (v_child_id,   v_family_id, 'child',           'Sofia Reyes',   'en'),
    (v_contrib_id, v_family_id, 'contributor',     'Lola Carmen',   'tl')
  ON CONFLICT (id) DO NOTHING;

  -- ----------------------------------------------------------
  -- CARD (Sofia's virtual card)
  -- ----------------------------------------------------------
  INSERT INTO public.cards (id, family_id, child_user_id, unit_card_id, status, daily_limit, category_limits)
  VALUES (
    v_card_id,
    v_family_id,
    v_child_id,
    'sandbox_card_001',
    'active',
    2000,   -- $20.00 daily limit
    '{"food": 1500, "entertainment": 500}'::JSONB
  )
  ON CONFLICT (id) DO NOTHING;

  -- ----------------------------------------------------------
  -- TRANSACTIONS
  -- ----------------------------------------------------------
  -- A normal cleared transaction (Sofia buys lunch)
  INSERT INTO public.transactions (id, family_id, card_id, user_id, amount, currency, merchant_name, category, status, unit_transaction_id)
  VALUES (
    v_txn1_id,
    v_family_id,
    v_card_id,
    v_child_id,
    -1250,          -- -$12.50
    'USD',
    'McDonald''s',
    'food',
    'cleared',
    'unit_txn_001'
  )
  ON CONFLICT (id) DO NOTHING;

  -- A transaction that needs parent approval (over-limit)
  INSERT INTO public.transactions (id, family_id, card_id, user_id, amount, currency, merchant_name, category, status, unit_transaction_id)
  VALUES (
    v_txn2_id,
    v_family_id,
    v_card_id,
    v_child_id,
    -4500,          -- -$45.00 (over daily limit)
    'USD',
    'Nike',
    'shopping',
    'needs_approval',
    'unit_txn_002'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ----------------------------------------------------------
  -- APPROVAL REQUEST (for the over-limit Nike transaction)
  -- ----------------------------------------------------------
  INSERT INTO public.approval_requests (id, transaction_id, requested_by, status)
  VALUES (
    v_approval_id,
    v_txn2_id,
    v_child_id,
    'pending'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ----------------------------------------------------------
  -- SAVINGS GOAL (Sofia's college fund — visible to Lola)
  -- ----------------------------------------------------------
  INSERT INTO public.savings_goals (id, family_id, title, target_amount, current_amount, currency, owner_user_id, visible_to_contributors, deadline)
  VALUES (
    v_goal_id,
    v_family_id,
    'Sofia''s College Fund',
    500000,   -- $5,000.00 target
    15000,    -- $150.00 current
    'USD',
    v_child_id,
    TRUE,     -- Lola Carmen can see and contribute to this goal
    '2028-08-01'
  )
  ON CONFLICT (id) DO NOTHING;

  -- ----------------------------------------------------------
  -- GOAL CONTRIBUTION (Lola's first contribution)
  -- ----------------------------------------------------------
  INSERT INTO public.goal_contributions (goal_id, contributed_by, amount)
  VALUES (v_goal_id, v_contrib_id, 5000)  -- $50.00
  ON CONFLICT DO NOTHING;

  -- Sync current_amount on the goal (in production this is handled by a trigger or Edge Function)
  UPDATE public.savings_goals
  SET current_amount = (
    SELECT COALESCE(SUM(amount), 0) FROM public.goal_contributions WHERE goal_id = v_goal_id
  )
  WHERE id = v_goal_id;

  RAISE NOTICE 'Seed complete. Test family created: %', v_family_id;
  RAISE NOTICE '  parent@nestmoney.test    → primary_parent (Maria Reyes)';
  RAISE NOTICE '  child@nestmoney.test     → child           (Sofia Reyes)';
  RAISE NOTICE '  lola@nestmoney.test      → contributor     (Lola Carmen)';
  RAISE NOTICE 'All passwords: testpassword123';

END $$;
