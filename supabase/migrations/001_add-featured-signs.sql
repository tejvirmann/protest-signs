-- ============================================
-- ADD POPULAR & SEASONAL SIGNS FEATURES
-- ============================================

-- Add new columns to signs table
ALTER TABLE signs
ADD COLUMN IF NOT EXISTS is_popular BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS is_seasonal BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_signs_popular ON signs(is_popular, display_order) WHERE is_popular = true AND archived_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_signs_seasonal ON signs(is_seasonal, display_order) WHERE is_seasonal = true AND archived_at IS NULL;

-- Mark some existing signs as popular (top selling / most impactful)
UPDATE signs
SET is_popular = true, display_order = 1
WHERE title IN (
  'FIGHT FOR YOUR RIGHTS',
  'BLACK LIVES MATTER',
  'CLIMATE JUSTICE NOW',
  'THERE IS NO PLANET B'
);

-- Mark some signs as seasonal (relevant to current events/seasons)
UPDATE signs
SET is_seasonal = true, display_order = 1
WHERE title IN (
  'STAND UP SPEAK OUT',
  'NO JUSTICE, NO PEACE',
  'HEALTHCARE IS A HUMAN RIGHT',
  'VOTE'
);

-- Verification query
SELECT
  'Popular Signs' as group_type,
  COUNT(*) as count
FROM signs
WHERE is_popular = true AND archived_at IS NULL
UNION ALL
SELECT
  'Seasonal Signs',
  COUNT(*)
FROM signs
WHERE is_seasonal = true AND archived_at IS NULL;
