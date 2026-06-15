-- Adds updated_at to orders. Without this column, any UPDATE to orders
-- (e.g. changing status to 'shipped'/'cancelled') fails with:
--   record "new" has no field "updated_at"  (42703)
-- because an existing trigger calls update_updated_at_column() on UPDATE.
ALTER TABLE orders ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT NOW();
