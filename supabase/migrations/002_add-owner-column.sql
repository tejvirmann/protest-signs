-- ============================================================
-- MIGRATION: Add is_owner + fix infinite recursion in RLS
-- Run once in Supabase SQL Editor
-- ============================================================

-- 1. Add is_owner column
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS is_owner BOOLEAN DEFAULT false;

-- Set tejvirmann11@gmail.com as the initial owner
UPDATE profiles SET is_owner = true WHERE email = 'tejvirmann11@gmail.com';

-- ============================================================
-- 2. Fix infinite recursion in RLS policies
--
-- The root cause: policies on `signs` check `profiles` for
-- is_admin, but some profile policies also reference `profiles`,
-- creating an infinite loop. The fix is a SECURITY DEFINER
-- function that bypasses RLS when checking admin status.
-- ============================================================

-- Helper functions (SECURITY DEFINER bypasses RLS so no recursion)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_admin FROM profiles WHERE id = auth.uid()),
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

CREATE OR REPLACE FUNCTION is_owner()
RETURNS BOOLEAN AS $$
  SELECT COALESCE(
    (SELECT is_owner FROM profiles WHERE id = auth.uid()),
    false
  )
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- 3. Drop all existing profile policies and recreate cleanly
-- ============================================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Owner can manage roles" ON profiles;

-- Users see only their own profile
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Users update only their own profile
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- Owners can update any profile (for role management)
-- Note: /admin/users API uses service_role key (bypasses RLS)
-- This policy is a safety net for any direct queries
CREATE POLICY "Owner can manage roles" ON profiles
  FOR UPDATE USING (is_owner());

-- ============================================================
-- 4. Fix signs policies to use the helper function
-- ============================================================

DROP POLICY IF EXISTS "Admin can view all signs" ON signs;
DROP POLICY IF EXISTS "Admin can manage signs" ON signs;

CREATE POLICY "Admin can view all signs" ON signs
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can manage signs" ON signs
  FOR ALL USING (is_admin());

-- ============================================================
-- 5. Fix tags policies
-- ============================================================

DROP POLICY IF EXISTS "Admin can manage tags" ON tags;
CREATE POLICY "Admin can manage tags" ON tags
  FOR ALL USING (is_admin());

-- ============================================================
-- 6. Fix sign_tags policies
-- ============================================================

DROP POLICY IF EXISTS "Admin can manage sign tags" ON sign_tags;
CREATE POLICY "Admin can manage sign tags" ON sign_tags
  FOR ALL USING (is_admin());

-- ============================================================
-- 7. Fix orders policies
-- ============================================================

DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
CREATE POLICY "Admin can view all orders" ON orders
  FOR SELECT USING (is_admin());

DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;
CREATE POLICY "Admin can view all order items" ON order_items
  FOR SELECT USING (is_admin());

-- ============================================================
-- 8. Verify
-- ============================================================

SELECT id, email, is_admin, is_owner FROM profiles ORDER BY created_at;
