ALTER TABLE plans
ADD COLUMN IF NOT EXISTS stripe_product_id text;
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS stripe_price_id_monthly text;
ALTER TABLE plans
ADD COLUMN IF NOT EXISTS stripe_price_id_yearly text;