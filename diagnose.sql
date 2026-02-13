-- ============================================
-- DIAGNOSTIC QUERIES
-- ============================================
-- Run these in Supabase SQL Editor to diagnose why signs aren't showing

-- 1. Check if tags exist and have show_on_homepage flag
SELECT
  'Tags with show_on_homepage' as check_name,
  COUNT(*) as count
FROM tags
WHERE show_on_homepage = true;

SELECT
  id,
  name,
  slug,
  show_on_homepage,
  homepage_order
FROM tags
ORDER BY homepage_order;

-- 2. Check if signs exist and are not archived
SELECT
  'Total signs' as check_name,
  COUNT(*) as count
FROM signs;

SELECT
  'Active signs (not archived)' as check_name,
  COUNT(*) as count
FROM signs
WHERE archived_at IS NULL;

SELECT
  'Signs with quantity > 0' as check_name,
  COUNT(*) as count
FROM signs
WHERE archived_at IS NULL AND quantity_available > 0;

-- 3. Check sign_tags junction table
SELECT
  'Total sign-tag links' as check_name,
  COUNT(*) as count
FROM sign_tags;

-- 4. Check if homepage tags have signs linked to them
SELECT
  t.name as category,
  t.show_on_homepage,
  COUNT(st.sign_id) as sign_count
FROM tags t
LEFT JOIN sign_tags st ON t.id = st.tag_id
WHERE t.show_on_homepage = true
GROUP BY t.name, t.show_on_homepage, t.homepage_order
ORDER BY t.homepage_order;

-- 5. Detailed view: which signs are in which categories
SELECT
  t.name as category,
  s.title as sign_title,
  s.price,
  s.quantity_available,
  s.archived_at,
  CASE
    WHEN s.archived_at IS NULL AND s.quantity_available > 0 THEN 'SHOULD SHOW'
    WHEN s.archived_at IS NOT NULL THEN 'ARCHIVED'
    WHEN s.quantity_available = 0 THEN 'OUT OF STOCK'
    ELSE 'HIDDEN'
  END as status
FROM tags t
INNER JOIN sign_tags st ON t.id = st.tag_id
INNER JOIN signs s ON s.id = st.sign_id
WHERE t.show_on_homepage = true
ORDER BY t.homepage_order, s.title;

-- 6. Check images array
SELECT
  title,
  images,
  array_length(images, 1) as image_count
FROM signs
LIMIT 5;

-- ============================================
-- EXPECTED RESULTS
-- ============================================
-- Tags with show_on_homepage: Should be 6 (Climate Action, Social Justice, Workers' Rights, Human Rights, Education, Healthcare)
-- Active signs with quantity > 0: Should be 20
-- Sign-tag links: Should be 20+
-- Each homepage category should have multiple signs linked
