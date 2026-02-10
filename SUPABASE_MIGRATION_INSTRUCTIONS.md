# 🔧 Supabase Schema Update Instructions

## Problem
Frontend verification submission fails with error:
```
"Could not find the 'verification_description' column of 'uploads' in the schema cache"
```

## Root Cause
The verification columns haven't been added to the `uploads` table in your Supabase database yet.

---

## ✅ Solution: Run the Migration

### Step 1: Access Supabase SQL Editor
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your CorruptX project
3. Click on **SQL Editor** in the left sidebar
4. Click **New Query**

### Step 2: Run the Migration
Copy and paste the entire contents of this file into the SQL Editor:
```
sql/add_verification_columns.sql
```

Or copy this SQL directly:

```sql
-- =====================================================
-- Migration: Add Reporter Verification Columns
-- =====================================================

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
```

### Step 3: Execute the Query
Click the **RUN** button (or press Ctrl+Enter)

### Step 4: Verify Success
You should see:
- ✅ "Success. No rows returned"
- ✅ "SUCCESS: verification_description column exists" in the output

### Step 5: Refresh Schema Cache (IMPORTANT!)
After running the migration, you need to refresh Supabase's schema cache:

**Option A: Via Dashboard**
1. Go to **Table Editor** in Supabase
2. Click on the `uploads` table
3. You should now see the new columns:
   - verification_media_url
   - verification_description
   - verification_status
   - verified_by
   - verified_at
   - assigned_reporter_id
   - accepted_at

**Option B: Via API (Automatic)**
The schema cache usually refreshes automatically within a few minutes.
If you still get errors, wait 2-3 minutes and try again.

**Option C: Force Refresh**
If still having issues:
1. Go to **Project Settings** > **API**
2. Copy your **Project URL** and **anon public** key
3. Verify they match what's in `src/supabaseClient.ts`

---

## 📋 Column Details

| Column Name | Type | Nullable | Default | Description |
|------------|------|----------|---------|-------------|
| `verification_media_url` | TEXT | YES | NULL | URL to uploaded verification media |
| `verification_description` | TEXT | YES | NULL | Reporter's verification notes |
| `verification_status` | TEXT | YES | 'pending' | Status: pending/submitted/approved/rejected |
| `verified_by` | UUID | YES | NULL | References reporters(id) |
| `verified_at` | TIMESTAMPTZ | YES | NULL | When verification was submitted |
| `assigned_reporter_id` | UUID | YES | NULL | References reporters(id) |
| `accepted_at` | TIMESTAMPTZ | YES | NULL | When assignment was accepted |

---

## 🧪 Testing After Migration

### Test 1: Check Columns Exist
Run this query in SQL Editor:
```sql
SELECT column_name, data_type, is_nullable, column_default
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
  )
ORDER BY column_name;
```

Expected: 7 rows returned

### Test 2: Try the Frontend
1. Restart your dev server if running
2. Log in as a reporter
3. Accept an assignment
4. Upload verification media
5. Submit the form

Expected: No errors, successful redirect to dashboard

---

## 🚨 Troubleshooting

### Error: "relation public.reporters does not exist"
The `reporters` table must exist first. Run this first:
```
sql/create_reporters_and_assignments.sql
```

### Error: Column already exists
Safe to ignore - the migration uses `IF NOT EXISTS` so it won't fail.

### Error: Schema cache still showing old schema
1. Wait 2-3 minutes
2. Clear browser cache
3. Restart your dev server: `npm run dev`
4. Try in incognito/private browsing mode

### Frontend still fails after migration
Check the exact error message:
- If "column not found" → Wait for schema cache refresh
- If "permission denied" → Check RLS policies
- If "foreign key violation" → Ensure reporter record exists

---

## ✅ Success Checklist

- [ ] Migration SQL executed successfully
- [ ] 7 new columns visible in Table Editor
- [ ] No error messages in SQL output
- [ ] Dev server restarted
- [ ] Reporter can submit verification without errors
- [ ] Data appears in `uploads` table with verification columns populated

---

## 📝 Notes

- **Non-Breaking**: This migration only ADDS columns, never removes or modifies existing ones
- **Backwards Compatible**: Existing uploads continue to work (new columns are nullable)
- **Safe to Re-Run**: Uses `IF NOT EXISTS` so running multiple times won't cause errors
- **RLS Policies**: Existing Row Level Security policies remain intact

---

## Need Help?

If you encounter issues:
1. Check the Supabase Logs (Dashboard > Logs)
2. Verify your Supabase client configuration in `src/supabaseClient.ts`
3. Ensure the `reporters` table exists (from `create_reporters_and_assignments.sql`)
