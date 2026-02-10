-- =====================================================
-- ROLLBACK Script: Remove Verification Columns
-- =====================================================
-- ⚠️ WARNING: Only use this if you need to undo the migration
-- This will remove all verification-related columns and their data

-- Backup reminder
DO $$
BEGIN
  RAISE NOTICE '⚠️  WARNING: This will remove verification columns and all data in them';
  RAISE NOTICE '⚠️  Make sure you have a backup if needed';
  RAISE NOTICE '⚠️  Press RUN to continue or cancel to abort';
END $$;

-- Remove indexes first
DROP INDEX IF EXISTS public.idx_uploads_verification_status;
DROP INDEX IF EXISTS public.idx_uploads_verified_by;
DROP INDEX IF EXISTS public.idx_uploads_assigned_reporter;

-- Remove columns (this will delete all data in these columns)
ALTER TABLE public.uploads
DROP COLUMN IF EXISTS verification_media_url,
DROP COLUMN IF EXISTS verification_description,
DROP COLUMN IF EXISTS verification_status,
DROP COLUMN IF EXISTS verified_by,
DROP COLUMN IF EXISTS verified_at,
DROP COLUMN IF EXISTS assigned_reporter_id,
DROP COLUMN IF EXISTS accepted_at;

-- Verify removal
DO $$
DECLARE
  remaining_cols INT;
BEGIN
  SELECT COUNT(*) INTO remaining_cols
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
  
  IF remaining_cols = 0 THEN
    RAISE NOTICE '✅ Rollback successful: All verification columns removed';
  ELSE
    RAISE EXCEPTION '❌ Rollback incomplete: % columns still exist', remaining_cols;
  END IF;
END $$;
