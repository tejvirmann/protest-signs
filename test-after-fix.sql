-- ============================================
-- TEST QUERIES AFTER APPLYING FIX
-- ============================================
-- Run these to verify everything works

-- 1. Test: Fetch signs (this was failing before)
SELECT
  id,
  title,
  price,
  quantity_available,
  archived_at,
  array_length(images, 1) as image_count
FROM signs
WHERE archived_at IS NULL
LIMIT 5;
-- Expected: Should return 5 signs without error


-- 2. Test: Fetch tags
SELECT
  id,
  name,
  slug,
  show_on_homepage
FROM tags
ORDER BY homepage_order
LIMIT 5;
-- Expected: Should return tags without error


-- 3. Test: Fetch signs with their tags (JOIN query)
SELECT
  s.title as sign_title,
  t.name as tag_name,
  s.price
FROM signs s
INNER JOIN sign_tags st ON s.id = st.sign_id
INNER JOIN tags t ON t.id = st.tag_id
WHERE s.archived_at IS NULL
LIMIT 10;
-- Expected: Should return sign-tag combinations without error


-- 4. Test: Check popular/seasonal signs (for homepage)
SELECT
  title,
  COALESCE(is_popular, false) as is_popular,
  COALESCE(is_seasonal, false) as is_seasonal,
  COALESCE(display_order, 0) as display_order
FROM signs
WHERE (is_popular = true OR is_seasonal = true)
  AND archived_at IS NULL;
-- Expected: Should return 4-8 signs marked as popular or seasonal


-- 5. Test: Full homepage query simulation
WITH homepage_tags AS (
  SELECT * FROM tags
  WHERE show_on_homepage = true
  ORDER BY homepage_order
  LIMIT 3
)
SELECT
  t.name as category,
  COUNT(s.id) as sign_count
FROM homepage_tags t
LEFT JOIN sign_tags st ON t.id = st.tag_id
LEFT JOIN signs s ON s.id = st.sign_id AND s.archived_at IS NULL
GROUP BY t.name
ORDER BY t.name;
-- Expected: Should show categories with their sign counts


-- ============================================
-- SUCCESS CRITERIA
-- ============================================
-- ✓ All 5 queries above should run WITHOUT the error:
--   "infinite recursion detected in policy for relation profiles"
-- ✓ Each query should return data (not empty)
-- ✓ No 500 errors in your app after restarting dev server
