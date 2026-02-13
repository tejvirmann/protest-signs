-- ============================================
-- VERIFICATION QUERIES
-- ============================================
-- Run these in Supabase SQL Editor to verify seed data

-- 1. Count everything
SELECT 'Tags Created' as item, COUNT(*) as count FROM tags
UNION ALL
SELECT 'Signs Created', COUNT(*) FROM signs
UNION ALL
SELECT 'Sign-Tag Links', COUNT(*) FROM sign_tags;

-- Expected Results:
-- Tags Created: 8
-- Signs Created: 20
-- Sign-Tag Links: 22+


-- 2. List all tags
SELECT
  name,
  slug,
  show_on_homepage,
  homepage_order
FROM tags
ORDER BY homepage_order;


-- 3. List all signs with their first image
SELECT
  title,
  ROUND(price::numeric / 100, 2) as price_dollars,
  images[1] as first_image,
  quantity_available as stock,
  CASE
    WHEN archived_at IS NULL THEN 'Active'
    ELSE 'Archived'
  END as status
FROM signs
ORDER BY title;


-- 4. Count signs per category
SELECT
  t.name as category,
  t.show_on_homepage,
  COUNT(st.sign_id) as sign_count
FROM tags t
LEFT JOIN sign_tags st ON t.id = st.tag_id
GROUP BY t.name, t.show_on_homepage, t.homepage_order
ORDER BY t.homepage_order;


-- 5. Verify the two signs using your actual images
SELECT
  title,
  images[1] as image_path
FROM signs
WHERE images[1] LIKE '/signs/%'
ORDER BY title;

-- Expected: FIGHT FOR YOUR RIGHTS and STAND UP SPEAK OUT


-- 6. Check for any signs without images
SELECT
  title,
  array_length(images, 1) as image_count
FROM signs
WHERE array_length(images, 1) IS NULL OR array_length(images, 1) = 0;

-- Expected: Empty (all signs should have images)


-- 7. View signs by category (detailed)
SELECT
  t.name as category,
  s.title as sign_title,
  ROUND(s.price::numeric / 100, 2) as price,
  s.quantity_available as stock
FROM tags t
INNER JOIN sign_tags st ON t.id = st.tag_id
INNER JOIN signs s ON s.id = st.sign_id
ORDER BY t.name, s.title;


-- 8. Check homepage categories (should show on homepage)
SELECT
  t.name,
  t.homepage_order,
  COUNT(st.sign_id) as signs_in_category
FROM tags t
LEFT JOIN sign_tags st ON t.id = st.tag_id
WHERE t.show_on_homepage = true
GROUP BY t.name, t.homepage_order
ORDER BY t.homepage_order;
