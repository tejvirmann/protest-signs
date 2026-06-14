-- ============================================================
-- MIGRATION: Add missing customer_email column to orders
-- ============================================================
-- The webhook (app/api/stripe/webhook/route.ts) has always tried to insert
-- customer_email when creating an order, but this column was never added to
-- the table. Because the webhook doesn't check the insert error, every order
-- insert has been failing silently — no orders, order_items, or inventory
-- updates were ever written. This adds the missing column.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS customer_email TEXT;
