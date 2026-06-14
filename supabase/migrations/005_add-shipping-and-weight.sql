-- ============================================================
-- MIGRATION: Add shipping address/phone to orders, and weight
-- to signs (so we can build a USPS-ready CSV export)
-- ============================================================

-- 1. Shipping details captured by Stripe Checkout
--    (session.shipping_details + session.customer_details.phone)
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_line1 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address_line2 TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_postal_code TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_country TEXT;

-- 2. Per-sign weight (ounces), used for USPS "Item Weight" / package weight
ALTER TABLE signs ADD COLUMN IF NOT EXISTS weight_oz INTEGER;
