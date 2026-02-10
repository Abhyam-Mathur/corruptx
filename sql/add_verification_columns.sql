-- =====================================================
-- Migration: Add Reporter Verification Columns
-- =====================================================
-- This migration adds columns to the uploads table to support
-- reporter verification workflow without breaking existing functionality.

-- Add verification columns to uploads table
ALTER TABLE public.uploads
ADD COLUMN IF NOT EXISTS verification_media_url TEXT,
ADD COLUMN IF NOT EXISTS verification_description TEXT,
ADD COLUMN IF NOT EXISTS verification_status TEXT DEFAULT 'pending',
ADD COLUMN IF NOT EXISTS verified_by UUID REFERENCES public.reporters(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS verified_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS assigned_reporter_id UUID REFERENCES public.reporters(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS accepted_at TIMESTAMPTZ;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploads_verification_status ON public.uploads(verification_status) WHERE verification_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_uploads_verified_by ON public.uploads(verified_by) WHERE verified_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_uploads_assigned_reporter ON public.uploads(assigned_reporter_id) WHERE assigned_reporter_id IS NOT NULL;

-- Add comments for documentation
COMMENT ON COLUMN public.uploads.verification_media_url IS 'URL to verification photo/video uploaded by reporter';
COMMENT ON COLUMN public.uploads.verification_description IS 'Reporter verification description and findings';
COMMENT ON COLUMN public.uploads.verification_status IS 'Status: pending, submitted, approved, rejected';
COMMENT ON COLUMN public.uploads.verified_by IS 'Reporter ID who verified this report';
COMMENT ON COLUMN public.uploads.verified_at IS 'Timestamp when verification was submitted';
COMMENT ON COLUMN public.uploads.assigned_reporter_id IS 'Reporter ID assigned to this report';
COMMENT ON COLUMN public.uploads.accepted_at IS 'Timestamp when reporter accepted the assignment';

-- Verify the columns were added (optional check)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'uploads' 
    AND column_name = 'verification_description'
  ) THEN
    RAISE NOTICE 'SUCCESS: verification_description column exists';
  ELSE
    RAISE EXCEPTION 'FAILED: verification_description column not found';
  END IF;
END $$;
