-- =====================================================
-- COMPLETE MIGRATION: Create uploads table + Add verification columns
-- =====================================================
-- Run this ONCE in Supabase SQL Editor to set up everything
-- This creates the uploads table AND adds all verification columns

-- Step 1: Create uploads table (with location columns already included)
CREATE TABLE IF NOT EXISTS public.uploads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  file_path text NOT NULL,
  description text,
  location text,
  corruption_type text,
  campaign_id uuid,
  campaign_type text,
  share_x boolean DEFAULT false,
  share_instagram boolean DEFAULT false,
  share_facebook boolean DEFAULT false,
  is_anonymous boolean DEFAULT true,
  reporter_name text,
  reporter_contact text,
  created_at timestamptz DEFAULT now(),
  
  -- Location columns for heatmap
  latitude double precision,
  longitude double precision,
  
  -- Verification columns
  verification_media_url text,
  verification_description text,
  verification_status text DEFAULT 'pending',
  verified_by uuid,
  verified_at timestamptz,
  assigned_reporter_id uuid,
  accepted_at timestamptz
);

-- Step 2: Create reporters table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.reporters (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer NOT NULL CHECK (age >= 18),
  gender text,
  latitude double precision NOT NULL,
  longitude double precision NOT NULL,
  radius_km double precision NOT NULL DEFAULT 5,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Step 3: Add foreign key constraints (now that both tables exist)
ALTER TABLE public.uploads
DROP CONSTRAINT IF EXISTS uploads_verified_by_fkey,
DROP CONSTRAINT IF EXISTS uploads_assigned_reporter_id_fkey;

ALTER TABLE public.uploads
ADD CONSTRAINT uploads_verified_by_fkey 
  FOREIGN KEY (verified_by) REFERENCES public.reporters(id) ON DELETE SET NULL,
ADD CONSTRAINT uploads_assigned_reporter_id_fkey 
  FOREIGN KEY (assigned_reporter_id) REFERENCES public.reporters(id) ON DELETE SET NULL;

-- Step 4: Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_uploads_location ON public.uploads(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_uploads_verification_status ON public.uploads(verification_status) WHERE verification_status IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_uploads_verified_by ON public.uploads(verified_by) WHERE verified_by IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_uploads_assigned_reporter ON public.uploads(assigned_reporter_id) WHERE assigned_reporter_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_uploads_user_id ON public.uploads(user_id);
CREATE INDEX IF NOT EXISTS idx_uploads_created_at ON public.uploads(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_reporters_location ON public.reporters USING gist (ll_to_earth(latitude, longitude));
CREATE INDEX IF NOT EXISTS idx_reporters_active ON public.reporters (is_active);
CREATE INDEX IF NOT EXISTS idx_reporters_user_id ON public.reporters(user_id);

-- Step 5: Create reporter_assignments table
CREATE TABLE IF NOT EXISTS public.reporter_assignments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id uuid NOT NULL REFERENCES public.uploads(id) ON DELETE CASCADE,
  reporter_id uuid NOT NULL REFERENCES public.reporters(id) ON DELETE CASCADE,
  status text NOT NULL DEFAULT 'notified',
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(report_id, reporter_id)
);

CREATE INDEX IF NOT EXISTS idx_reporter_assignments_reporter ON public.reporter_assignments(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reporter_assignments_report ON public.reporter_assignments(report_id);
CREATE INDEX IF NOT EXISTS idx_reporter_assignments_status ON public.reporter_assignments(status);

-- Step 6: Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS pgcrypto;
CREATE EXTENSION IF NOT EXISTS cube;
CREATE EXTENSION IF NOT EXISTS earthdistance;

-- Step 7: Create Haversine distance function
CREATE OR REPLACE FUNCTION public.haversine_distance_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
) RETURNS double precision LANGUAGE sql IMMUTABLE AS $$
  SELECT 2 * 6371 * asin(
    sqrt(
      power(sin(radians(lat2 - lat1) / 2), 2) +
      cos(radians(lat1)) * cos(radians(lat2)) * power(sin(radians(lon2 - lon1) / 2), 2)
    )
  );
$$;

-- Step 8: Create trigger to auto-assign reports to nearby reporters
CREATE OR REPLACE FUNCTION public.create_reporter_assignments_for_report()
RETURNS trigger LANGUAGE plpgsql AS $$
BEGIN
  IF NEW.latitude IS NULL OR NEW.longitude IS NULL THEN
    RETURN NEW;
  END IF;

  INSERT INTO public.reporter_assignments (id, report_id, reporter_id, status, created_at)
  SELECT gen_random_uuid(), NEW.id, r.id, 'notified', now()
  FROM public.reporters r
  WHERE r.is_active
    AND haversine_distance_km(NEW.latitude, NEW.longitude, r.latitude, r.longitude) <= coalesce(r.radius_km, 5)
    AND NOT EXISTS (
      SELECT 1 FROM public.reporter_assignments ra
      WHERE ra.report_id = NEW.id AND ra.reporter_id = r.id
    );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_create_reporter_assignments ON public.uploads;
CREATE TRIGGER trg_create_reporter_assignments
AFTER INSERT ON public.uploads
FOR EACH ROW
EXECUTE FUNCTION public.create_reporter_assignments_for_report();

-- Step 9: Add helpful comments
COMMENT ON TABLE public.uploads IS 'Corruption reports uploaded by users';
COMMENT ON COLUMN public.uploads.verification_media_url IS 'URL to verification photo/video uploaded by reporter';
COMMENT ON COLUMN public.uploads.verification_description IS 'Reporter verification description and findings';
COMMENT ON COLUMN public.uploads.verification_status IS 'Status: pending, submitted, approved, rejected';
COMMENT ON COLUMN public.uploads.verified_by IS 'Reporter ID who verified this report';
COMMENT ON COLUMN public.uploads.verified_at IS 'Timestamp when verification was submitted';
COMMENT ON COLUMN public.uploads.assigned_reporter_id IS 'Reporter ID assigned to this report';
COMMENT ON COLUMN public.uploads.accepted_at IS 'Timestamp when reporter accepted the assignment';

-- Step 10: Verify everything was created successfully
DO $$
DECLARE
  uploads_exists boolean;
  reporters_exists boolean;
  assignments_exists boolean;
  verification_col_count int;
BEGIN
  -- Check tables
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'uploads') INTO uploads_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reporters') INTO reporters_exists;
  SELECT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'reporter_assignments') INTO assignments_exists;
  
  -- Check verification columns
  SELECT COUNT(*) INTO verification_col_count
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'uploads'
    AND column_name IN (
      'verification_media_url',
      'verification_description', 
      'verification_status',
      'verified_by',
      'verified_at',
      'assigned_reporter_id',
      'accepted_at'
    );
  
  -- Report results
  IF uploads_exists AND reporters_exists AND assignments_exists AND verification_col_count = 7 THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SUCCESS: All tables created';
    RAISE NOTICE '✅ uploads table: EXISTS';
    RAISE NOTICE '✅ reporters table: EXISTS';
    RAISE NOTICE '✅ reporter_assignments table: EXISTS';
    RAISE NOTICE '✅ All 7 verification columns: EXISTS';
    RAISE NOTICE '✅ Indexes created';
    RAISE NOTICE '✅ Triggers created';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Next steps:';
    RAISE NOTICE '1. Restart your dev server: npm run dev';
    RAISE NOTICE '2. Test reporter verification submission';
    RAISE NOTICE '========================================';
  ELSE
    RAISE EXCEPTION 'Migration incomplete - uploads:%, reporters:%, assignments:%, verification_cols:%', 
      uploads_exists, reporters_exists, assignments_exists, verification_col_count;
  END IF;
END $$;
