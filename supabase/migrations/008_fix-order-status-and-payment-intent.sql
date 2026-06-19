-- Two bugs in admin order management:
-- 1. orders.status had a CHECK constraint allowing only ('pending', 'completed', 'refunded'),
--    but the admin UI lets you set 'shipped'/'cancelled' — those updates were silently
--    rejected by Postgres. Replaces it with the actual set of statuses used, adding
--    'in_progress' as the status customers see right after ordering.
-- 2. There was no UPDATE policy on orders at all, so even a valid status value would be
--    blocked by RLS for admins.

ALTER TABLE orders DROP CONSTRAINT IF EXISTS orders_status_check;
ALTER TABLE orders ADD CONSTRAINT orders_status_check
  CHECK (status IN ('in_progress', 'completed', 'shipped', 'cancelled'));
ALTER TABLE orders ALTER COLUMN status SET DEFAULT 'in_progress';

CREATE POLICY "Admins can update orders"
  ON orders FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND is_admin = TRUE
    )
  );

-- Stripe Checkout Session IDs (cs_...) only link to the session page in the Stripe
-- dashboard, not the actual payment. Store the Payment Intent ID too so admin order
-- links can go straight to dashboard.stripe.com/{acct}/payments/{pi_...}.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;
