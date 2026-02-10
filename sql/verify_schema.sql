-- =====================================================
-- Verification Script: Check Schema Status
-- =====================================================
-- Run this in Supabase SQL Editor to verify the migration worked

-- 1. Check if uploads table exists
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'uploads') THEN
    RAISE NOTICE '✅ uploads table exists';
  ELSE
    RAISE EXCEPTION '❌ uploads table NOT found';
  END IF;
END $$;

-- 2. List all columns in uploads table
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default,
  CASE 
    WHEN column_name IN (
      'verification_media_url',
      'verification_description', 
      'verification_status',
      'verified_by',
      'verified_at',
      'assigned_reporter_id',
      'accepted_at'
    ) THEN '🆕 NEW'
    ELSE '📝 EXISTING'
  END as status
FROM information_schema.columns
WHERE table_schema = 'public' 
  AND table_name = 'uploads'
ORDER BY 
  CASE 
    WHEN column_name IN (
      'verification_media_url',
      'verification_description', 
      'verification_status',
      'verified_by',
      'verified_at',
      'assigned_reporter_id',
      'accepted_at'
    ) THEN 1
    ELSE 2
  END,
  column_name;

-- 3. Count verification columns (should be 7)
SELECT 
  COUNT(*) as verification_columns_count,
  CASE 
    WHEN COUNT(*) = 7 THEN '✅ All 7 verification columns present'
    ELSE '⚠️ Missing verification columns: expected 7, found ' || COUNT(*)
  END as status
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

-- 4. Check foreign key constraints
SELECT
  tc.constraint_name,
  tc.table_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name = 'uploads'
  AND kcu.column_name IN ('verified_by', 'assigned_reporter_id');

-- 5. Check indexes
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename = 'uploads'
  AND indexname LIKE 'idx_uploads_%verification%'
  OR indexname LIKE 'idx_uploads_%reporter%';

-- 6. Sample test insert (rollback at end)
DO $$
BEGIN
  -- Try to insert a test record with verification columns
  INSERT INTO public.uploads (
    id,
    file_path,
    verification_description,
    verification_status,
    created_at
  ) VALUES (
    gen_random_uuid(),
    'test/path',
    'This is a test verification description',
    'submitted',
    now()
  );
  
  -- If we get here, the columns exist and work
  RAISE NOTICE '✅ Test insert successful - verification columns are working';
  
  -- Rollback so we don't leave test data
  ROLLBACK;
END $$;

-- 7. Final summary
DO $$
DECLARE
  col_count INT;
BEGIN
  SELECT COUNT(*) INTO col_count
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
  
  IF col_count = 7 THEN
    RAISE NOTICE '========================================';
    RAISE NOTICE '✅ SUCCESS: All verification columns exist';
    RAISE NOTICE '✅ Schema migration completed successfully';
    RAISE NOTICE '✅ Frontend should now work without errors';
    RAISE NOTICE '========================================';
  ELSE
    RAISE EXCEPTION '❌ FAILED: Only % of 7 verification columns found. Re-run the migration.', col_count;
  END IF;
END $$;
