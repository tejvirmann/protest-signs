-- ============================================
-- VERIFY FIX WAS APPLIED
-- ============================================

-- 1. Check if is_admin() function exists
SELECT
  'is_admin() function' as check_name,
  CASE
    WHEN EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'is_admin')
    THEN '✓ EXISTS'
    ELSE '✗ MISSING - Run fix-all-rls-policies.sql'
  END as status;

-- 2. Check current policies on profiles table
SELECT
  policyname,
  cmd,
  LEFT(qual::text, 100) as policy_definition
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- 3. Check if profiles policies still have recursion
SELECT
  tablename,
  policyname,
  'WARNING: May cause recursion' as issue
FROM pg_policies
WHERE tablename != 'profiles'
  AND (qual LIKE '%FROM profiles%' OR with_check LIKE '%FROM profiles%')
  AND qual NOT LIKE '%is_admin()%'
  AND with_check NOT LIKE '%is_admin()%';

-- 4. Test the actual query that's failing in navbar
-- This simulates what the navbar does
SELECT
  id,
  email,
  is_admin
FROM profiles
WHERE id = auth.uid();
-- If this runs without error, the fix worked!
