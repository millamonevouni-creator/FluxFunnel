-- Add updated_at column to plans table to fix schema cache error
ALTER TABLE public.plans
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());
-- Optional: Create a trigger to automatically update this column
CREATE OR REPLACE FUNCTION public.handle_updated_at() RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now();
RETURN NEW;
END;
$$ LANGUAGE plpgsql;
DROP TRIGGER IF EXISTS set_plans_updated_at ON public.plans;
CREATE TRIGGER set_plans_updated_at BEFORE
UPDATE ON public.plans FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();