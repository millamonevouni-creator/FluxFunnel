-- Add interval column to subscriptions table
ALTER TABLE public.subscriptions
ADD COLUMN interval TEXT;
-- Verify
SELECT column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'subscriptions'
    AND column_name = 'interval';