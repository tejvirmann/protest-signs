-- ============================================
-- CLEANUP: Keep Only Real Signs
-- ============================================
-- This removes all Unsplash placeholder signs
-- and keeps only your two actual signs

-- 1. Delete all signs EXCEPT your two real ones
DELETE FROM signs
WHERE title NOT IN ('FIGHT FOR YOUR RIGHTS', 'STAND UP SPEAK OUT');

-- 2. Mark your two real signs as popular AND seasonal
UPDATE signs
SET
  is_popular = true,
  is_seasonal = true,
  display_order = 1
WHERE title IN ('FIGHT FOR YOUR RIGHTS', 'STAND UP SPEAK OUT');

-- 3. Verification
SELECT
  title,
  price,
  quantity_available,
  is_popular,
  is_seasonal,
  images[1] as first_image
FROM signs
ORDER BY title;

-- Expected: Only 2 signs should remain
SELECT 'Total signs remaining:' as info, COUNT(*) as count FROM signs;
