# 🚀 Setup Instructions

## Step 1: Fix Infinite Recursion Error

Run this in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of fix-profiles-rls.sql
```

This fixes the "infinite recursion detected in policy for relation profiles" error.

## Step 2: Add Popular & Seasonal Signs Features

Run this in your Supabase SQL Editor:

```sql
-- Copy and paste the entire content of add-featured-signs.sql
```

This adds:
- `is_popular` boolean field to signs table
- `is_seasonal` boolean field to signs table
- `display_order` integer field to signs table
- Marks 4 signs as popular
- Marks 4 signs as seasonal

## Step 3: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
npm run dev
```

## What's New

### Homepage Sections

Your homepage now has **3 types of sign groups**:

1. **🔥 Popular Signs** - Best-selling designs making the biggest impact
2. **🌟 Seasonal Collection** - Timely messages for current movements
3. **📂 Categories** - Browse by cause (Climate Action, Social Justice, etc.)

### Admin Panel Features

When creating or editing signs in `/admin/signs/new`, you can now:

- ✅ Mark sign as **Popular** (shows in Popular Signs section)
- ✅ Mark sign as **Seasonal** (shows in Seasonal Collection)
- ✅ Set **Display Order** (lower numbers = higher priority)
  - Order 0 = appears first
  - Order 1, 2, 3... = follows in sequence

### How Display Order Works

Signs are sorted by `display_order` in ascending order:

```
display_order: 0  ← Shows FIRST
display_order: 1  ← Shows SECOND
display_order: 2  ← Shows THIRD
...
```

Use this to feature your most important signs prominently!

## Example Usage

### Scenario: New trending movement sign

1. Go to `/admin/signs/new`
2. Create sign with all details
3. ✅ Check "🌟 Seasonal Sign"
4. Set Display Order: `0` (to show first)
5. Save

→ Sign now appears at the top of "Seasonal Collection" on homepage!

### Scenario: Consistently best-selling sign

1. Go to `/admin/signs/new` (or edit existing)
2. ✅ Check "🔥 Popular Sign"
3. Set Display Order: `1`
4. Save

→ Sign appears in "Popular Signs" section!

### Scenario: Make a sign featured in BOTH sections

1. ✅ Check both "Popular" and "Seasonal"
2. Set Display Order: `0`

→ Sign appears in both sections!

## Verification

After running the SQL scripts and restarting:

1. Visit `http://localhost:3000`
2. You should see:
   - **Popular Signs** section with 4 signs
   - **Seasonal Collection** section with 4 signs
   - **Categories** sections below

## Current Popular Signs (from SQL)

- FIGHT FOR YOUR RIGHTS
- BLACK LIVES MATTER
- CLIMATE JUSTICE NOW
- THERE IS NO PLANET B

## Current Seasonal Signs (from SQL)

- STAND UP SPEAK OUT
- NO JUSTICE, NO PEACE
- HEALTHCARE IS A HUMAN RIGHT
- VOTE

## Troubleshooting

### Still getting infinite recursion error?

Run this to verify the function was created:

```sql
SELECT routine_name
FROM information_schema.routines
WHERE routine_name = 'is_admin';
```

Should return: `is_admin`

### Popular/Seasonal sections not showing?

Check if columns were added:

```sql
SELECT column_name
FROM information_schema.columns
WHERE table_name = 'signs'
AND column_name IN ('is_popular', 'is_seasonal', 'display_order');
```

Should return 3 rows.

### Signs not appearing in sections?

Check which signs are marked:

```sql
SELECT title, is_popular, is_seasonal, display_order
FROM signs
WHERE is_popular = true OR is_seasonal = true;
```

## Next Steps

1. Mark your best signs as Popular
2. Mark timely/event-related signs as Seasonal
3. Use display_order to control what appears first
4. Update these flags as trends change!

---

**Your protest signs marketplace now has dynamic featured sections! 🎉**
