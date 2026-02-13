# 🔧 Fix Infinite Recursion Error - Step by Step

## The Problem

The "infinite recursion detected in policy for relation profiles" error occurs because:
- Multiple tables have RLS policies that check `profiles.is_admin`
- The `profiles` table itself has RLS enabled
- This creates a circular dependency when policies reference each other

## The Solution

Use a **SECURITY DEFINER function** that bypasses RLS when checking admin status, breaking the circular dependency.

---

## Step 1: Run Diagnostics (Optional but Recommended)

In Supabase SQL Editor, copy and run: **`diagnose-rls-issue.sql`**

This shows:
- Current policies on all tables
- Which policies might be causing recursion
- If new columns (is_popular, is_seasonal) exist

---

## Step 2: Apply Comprehensive Fix (REQUIRED)

In Supabase SQL Editor, copy and run: **`fix-all-rls-policies.sql`**

This will:
1. ✅ Create `is_admin()` security definer function
2. ✅ Update ALL policies on ALL tables to use the function
3. ✅ Remove any circular dependencies
4. ✅ Show verification results at the end

**Expected output at the end:**
```
is_admin function exists: YES ✓
```

---

## Step 3: Add Popular/Seasonal Features

In Supabase SQL Editor, copy and run: **`add-featured-signs.sql`**

This adds:
- `is_popular` boolean column
- `is_seasonal` boolean column
- `display_order` integer column
- Marks 8 signs as popular/seasonal

---

## Step 4: Test Everything Works

In Supabase SQL Editor, copy and run: **`test-after-fix.sql`**

All 5 test queries should run **WITHOUT ERROR**.

Expected: ✓ No "infinite recursion" error

---

## Step 5: Restart Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

---

## Step 6: Verify in Browser

Visit `http://localhost:3000`

You should see:
- ✅ No 500 errors
- ✅ Signs displaying with images
- ✅ Categories showing with signs
- ✅ Popular Signs section (if you ran add-featured-signs.sql)
- ✅ Seasonal Collection section (if you ran add-featured-signs.sql)

---

## Files to Run (In Order)

1. **`diagnose-rls-issue.sql`** (optional - for diagnostics)
2. **`fix-all-rls-policies.sql`** (REQUIRED - fixes recursion)
3. **`add-featured-signs.sql`** (REQUIRED - adds new features)
4. **`test-after-fix.sql`** (optional - verifies fix works)

---

## If Still Getting Errors

If you still get "infinite recursion" after running fix-all-rls-policies.sql:

1. **Check if function was created:**
   ```sql
   SELECT routine_name FROM information_schema.routines WHERE routine_name = 'is_admin';
   ```
   Should return: `is_admin`

2. **Manually disable RLS temporarily to test:**
   ```sql
   ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
   ALTER TABLE signs DISABLE ROW LEVEL SECURITY;
   ```
   Test your app. If it works, the issue is definitely in RLS policies.

3. **Re-enable and apply fix again:**
   ```sql
   ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
   ALTER TABLE signs ENABLE ROW LEVEL SECURITY;
   ```
   Then run `fix-all-rls-policies.sql` again.

---

## Success Checklist

- [ ] Ran `fix-all-rls-policies.sql` in Supabase
- [ ] Ran `add-featured-signs.sql` in Supabase
- [ ] Restarted dev server
- [ ] Homepage loads without 500 error
- [ ] Signs displaying with images
- [ ] Can browse to /browse page
- [ ] Can click on individual signs

---

## What Changed

**Before:** Policies directly queried `profiles` table
```sql
-- OLD (causes recursion)
CREATE POLICY "Admin can manage tags" ON tags
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles  -- ❌ Direct query
      WHERE profiles.id = auth.uid()
      AND profiles.is_admin = true
    )
  );
```

**After:** Policies use `is_admin()` function
```sql
-- NEW (no recursion)
CREATE POLICY "Admin can manage tags" ON tags
  FOR ALL USING (is_admin());  -- ✅ Uses security definer function
```

The function bypasses RLS using `SECURITY DEFINER`, breaking the circular dependency.

---

**Once you complete these steps, your site should work perfectly!** 🎉
