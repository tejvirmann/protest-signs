-- ============================================
-- COMPREHENSIVE RLS DIAGNOSTICS
-- ============================================

-- 1. Check if is_admin() function exists
SELECT
  routine_name,
  routine_type,
  security_type
FROM information_schema.routines
WHERE routine_name = 'is_admin';
-- Expected: 1 row with security_type = 'DEFINER'

-- 2. List ALL policies on profiles table
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'profiles';

-- 3. List ALL policies that reference 'profiles' table
SELECT
  tablename,
  policyname,
  cmd,
  qual
FROM pg_policies
WHERE qual LIKE '%profiles%'
   OR with_check LIKE '%profiles%'
ORDER BY tablename, policyname;

-- 4. Check if tables have RLS enabled
SELECT
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN ('profiles', 'signs', 'tags', 'sign_tags', 'cart_items', 'orders', 'order_items')
ORDER BY tablename;

-- 5. Check signs table structure (including new columns)
SELECT
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'signs'
ORDER BY ordinal_position;

-- 6. Count records in key tables
SELECT 'profiles' as table_name, COUNT(*) as count FROM profiles
UNION ALL
SELECT 'tags', COUNT(*) FROM tags
UNION ALL
SELECT 'signs', COUNT(*) FROM signs
UNION ALL
SELECT 'sign_tags', COUNT(*) FROM sign_tags;

-- 7. Test query that's failing (signs with popular/seasonal columns)
SELECT
  id,
  title,
  price,
  quantity_available,
  archived_at,
  COALESCE(is_popular, false) as is_popular,
  COALESCE(is_seasonal, false) as is_seasonal,
  COALESCE(display_order, 0) as display_order
FROM signs
WHERE archived_at IS NULL
LIMIT 3;
