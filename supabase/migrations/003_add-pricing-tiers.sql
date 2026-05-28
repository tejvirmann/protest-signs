-- ============================================================
-- MIGRATION: Add pricing tiers + product_type to signs
-- Run in Supabase SQL Editor AFTER add-owner-column.sql
-- ============================================================

-- 1. Add product_type to signs
ALTER TABLE signs ADD COLUMN IF NOT EXISTS product_type TEXT DEFAULT 'paper';
UPDATE signs SET product_type = 'bag'   WHERE display_order BETWEEN 1 AND 7;
UPDATE signs SET product_type = 'paper' WHERE display_order > 7;

-- 2. Create pricing_tiers table
CREATE TABLE IF NOT EXISTS pricing_tiers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_type TEXT NOT NULL,          -- 'bag', 'paper', or 'paper_shipping'
  min_qty INTEGER NOT NULL DEFAULT 1,
  max_qty INTEGER,                     -- null = open-ended
  price INTEGER NOT NULL,              -- cents; bags: total bundle; paper: per-unit; shipping: flat fee
  overflow_unit_price INTEGER,         -- cents per bag above min_qty (last bag tier only)
  label TEXT NOT NULL,
  display_order INTEGER DEFAULT 0,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS
ALTER TABLE pricing_tiers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view pricing" ON pricing_tiers;
CREATE POLICY "Anyone can view pricing" ON pricing_tiers FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin can manage pricing" ON pricing_tiers;
CREATE POLICY "Admin can manage pricing" ON pricing_tiers
  FOR ALL USING (is_admin());

-- 4. Seed bag pricing (from Buck's emails)
-- Note: 5-6 bag pricing not specified by Buck — set same as 7 for now, admin can adjust
INSERT INTO pricing_tiers (product_type, min_qty, max_qty, price, overflow_unit_price, label, display_order) VALUES
  ('bag', 1, 1,    1499, NULL, '1 bag',                  1),
  ('bag', 2, 2,    1999, NULL, '2 bags',                  2),
  ('bag', 3, 3,    2499, NULL, '3 bags',                  3),
  ('bag', 4, 4,    2999, NULL, '4 bags',                  4),
  ('bag', 5, 6,    3499, NULL, '5–6 bags',                5),
  ('bag', 7, 7,    3499, NULL, '7 bags — one of each',    6),
  ('bag', 8, NULL, 3999,  500, '8+ bags',                 7)
ON CONFLICT DO NOTHING;

-- 5. Seed paper pricing
INSERT INTO pricing_tiers (product_type, min_qty, max_qty, price, overflow_unit_price, label, display_order) VALUES
  ('paper',          1, NULL, 499,  NULL, 'Per sign',                          1),
  ('paper_shipping', 1, NULL, 2000, NULL, 'Flat shipping (any paper order)',   1)
ON CONFLICT DO NOTHING;

-- Verify
SELECT product_type, min_qty, max_qty, price, label FROM pricing_tiers ORDER BY product_type, display_order;
SELECT id, title, product_type, display_order FROM signs ORDER BY display_order;
