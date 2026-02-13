-- ============================================
-- EMERGENCY FIX: Profiles Table Only
-- ============================================
-- This is the nuclear option - simplest possible policies

-- STEP 1: Temporarily disable RLS on profiles
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- STEP 2: Drop ALL existing policies on profiles
DO $$
DECLARE
    r RECORD;
BEGIN
    FOR r IN (SELECT policyname FROM pg_policies WHERE tablename = 'profiles')
    LOOP
        EXECUTE 'DROP POLICY IF EXISTS "' || r.policyname || '" ON profiles';
    END LOOP;
END $$;

-- STEP 3: Create the simplest possible policies (NO recursion)
CREATE POLICY "enable_read_own_profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "enable_update_own_profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "enable_insert_own_profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- STEP 4: Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- VERIFICATION
SELECT
  'Profiles policies after fix:' as info,
  policyname,
  cmd
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- Test query (same as navbar does)
SELECT
  id,
  email,
  is_admin,
  'This query should work now!' as status
FROM profiles
WHERE id = auth.uid();
