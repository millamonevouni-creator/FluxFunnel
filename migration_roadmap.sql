-- Migration to add Date Estimation columns to Feedbacks table
-- Add start_date column
ALTER TABLE public.feedbacks
ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
-- Add estimated_completion_date column
ALTER TABLE public.feedbacks
ADD COLUMN IF NOT EXISTS estimated_completion_date TIMESTAMP WITH TIME ZONE;
-- Ensure COMPLETED status exists in the enum (if using enum)
-- DO A CHECK FIRST: 
-- SELECT enum_range(NULL::feedback_status);
-- If 'COMPLETED' is missing:
-- ALTER TYPE feedback_status ADD VALUE 'COMPLETED';