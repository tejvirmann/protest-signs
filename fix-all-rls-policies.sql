-- ============================================
-- COMPREHENSIVE RLS FIX - ALL TABLES
-- ============================================
-- This fixes ALL policies to prevent circular dependencies

-- STEP 1: Create security definer function first
-- ============================================

CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE id = auth.uid()
    AND is_admin = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION is_admin() TO anon;


-- STEP 2: Fix PROFILES table policies (no recursion)
-- ============================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON profiles;

-- Simple policies that don't cause recursion
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- STEP 3: Fix TAGS table policies
-- ============================================

DROP POLICY IF EXISTS "Anyone can view tags" ON tags;
DROP POLICY IF EXISTS "Admin can manage tags" ON tags;

CREATE POLICY "Anyone can view tags" ON tags
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage tags" ON tags
  FOR ALL USING (is_admin());


-- STEP 4: Fix SIGNS table policies
-- ============================================

DROP POLICY IF EXISTS "Anyone can view active signs" ON signs;
DROP POLICY IF EXISTS "Admin can view all signs" ON signs;
DROP POLICY IF EXISTS "Admin can manage signs" ON signs;

CREATE POLICY "Anyone can view active signs" ON signs
  FOR SELECT USING (archived_at IS NULL);

CREATE POLICY "Admin can view all signs" ON signs
  FOR SELECT USING (is_admin());

CREATE POLICY "Admin can manage signs" ON signs
  FOR ALL USING (is_admin());


-- STEP 5: Fix SIGN_TAGS table policies
-- ============================================

DROP POLICY IF EXISTS "Anyone can view sign tags" ON sign_tags;
DROP POLICY IF EXISTS "Admin can manage sign tags" ON sign_tags;

CREATE POLICY "Anyone can view sign tags" ON sign_tags
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage sign tags" ON sign_tags
  FOR ALL USING (is_admin());


-- STEP 6: Fix CART_ITEMS table policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own cart" ON cart_items;
DROP POLICY IF EXISTS "Users can manage own cart" ON cart_items;
DROP POLICY IF EXISTS "Admin can view all carts" ON cart_items;

CREATE POLICY "Users can view own cart" ON cart_items
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own cart" ON cart_items
  FOR ALL USING (auth.uid() = user_id);


-- STEP 7: Fix ORDERS table policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own orders" ON orders;
DROP POLICY IF EXISTS "Admin can view all orders" ON orders;
DROP POLICY IF EXISTS "Users can insert own orders" ON orders;

CREATE POLICY "Users can view own orders" ON orders
  FOR SELECT USING (auth.uid() = user_id OR is_admin());

CREATE POLICY "Users can insert own orders" ON orders
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admin can manage all orders" ON orders
  FOR ALL USING (is_admin());


-- STEP 8: Fix ORDER_ITEMS table policies
-- ============================================

DROP POLICY IF EXISTS "Users can view own order items" ON order_items;
DROP POLICY IF EXISTS "Admin can view all order items" ON order_items;

CREATE POLICY "Users can view own order items" ON order_items
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM orders
      WHERE orders.id = order_items.order_id
      AND orders.user_id = auth.uid()
    ) OR is_admin()
  );

CREATE POLICY "Admin can manage all order items" ON order_items
  FOR ALL USING (is_admin());


-- STEP 9: Fix CONTACT_SUBMISSIONS table policies
-- ============================================

DROP POLICY IF EXISTS "Anyone can submit contact form" ON contact_submissions;
DROP POLICY IF EXISTS "Admin can view contact submissions" ON contact_submissions;

CREATE POLICY "Anyone can submit contact form" ON contact_submissions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Admin can view contact submissions" ON contact_submissions
  FOR SELECT USING (is_admin());


-- ============================================
-- VERIFICATION
-- ============================================

-- Check that is_admin function exists
SELECT 'is_admin function exists:' as check_name,
       CASE WHEN EXISTS (
         SELECT 1 FROM pg_proc WHERE proname = 'is_admin'
       ) THEN 'YES ✓' ELSE 'NO ✗' END as status;

-- Count policies per table
SELECT
  tablename,
  COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;

-- Show all policies that still reference 'profiles' directly in WHERE clause
-- (These might cause issues)
SELECT
  tablename,
  policyname,
  'WARNING: Still references profiles table' as issue
FROM pg_policies
WHERE (qual LIKE '%FROM profiles%' OR with_check LIKE '%FROM profiles%')
  AND tablename != 'order_items'  -- order_items is OK, it checks orders, not profiles
  AND policyname NOT LIKE '%is_admin%';
