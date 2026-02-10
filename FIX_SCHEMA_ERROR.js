#!/usr/bin/env node

/**
 * Quick Fix Guide: Supabase Schema Cache Error
 * ============================================
 * 
 * Error: "Could not find the 'verification_description' column of 'uploads' in the schema cache"
 * 
 * QUICK FIX (3 steps):
 */

console.log(`
╔════════════════════════════════════════════════════════════════════╗
║  🔧 SUPABASE SCHEMA FIX - Reporter Verification Columns           ║
╚════════════════════════════════════════════════════════════════════╝

📋 PROBLEM:
   Frontend can't find 'verification_description' column in uploads table

🔍 ROOT CAUSE:
   The verification columns haven't been added to Supabase yet

✅ SOLUTION (3 QUICK STEPS):
   
   STEP 1: Open Supabase Dashboard
   ────────────────────────────────
   1. Go to: https://supabase.com/dashboard
   2. Select your CorruptX project
   3. Click "SQL Editor" in left sidebar
   
   STEP 2: Run the Migration
   ──────────────────────────
   1. Click "New Query"
   2. Copy ENTIRE contents from file:
      📄 sql/add_verification_columns.sql
   3. Paste into SQL Editor
   4. Click RUN (or Ctrl+Enter)
   5. Wait for "Success. No rows returned"
   
   STEP 3: Verify & Test
   ──────────────────────
   1. Run verification script:
      📄 sql/verify_schema.sql
   2. Should see: "✅ SUCCESS: All verification columns exist"
   3. Restart your dev server:
      $ npm run dev
   4. Test reporter verification submission
   
═══════════════════════════════════════════════════════════════════════

📁 FILES YOU NEED:
   
   ✅ sql/add_verification_columns.sql
      → Main migration (ADD columns)
   
   ✅ sql/verify_schema.sql  
      → Verification script (CHECK if it worked)
   
   ⚠️  sql/rollback_verification_columns.sql
      → Emergency rollback (REMOVE columns if needed)

═══════════════════════════════════════════════════════════════════════

🎯 WHAT GETS ADDED:

   7 NEW COLUMNS to 'uploads' table:
   
   1. verification_media_url    (TEXT)       - URL to uploaded photo/video
   2. verification_description  (TEXT)       - Reporter's notes
   3. verification_status       (TEXT)       - Status: pending/submitted/approved
   4. verified_by              (UUID)       - Reporter ID who verified
   5. verified_at              (TIMESTAMP)  - When verified
   6. assigned_reporter_id     (UUID)       - Assigned reporter
   7. accepted_at              (TIMESTAMP)  - When assignment accepted

   + 3 indexes for query performance
   + Foreign key constraints to reporters table

═══════════════════════════════════════════════════════════════════════

🚨 TROUBLESHOOTING:

   Error: "relation public.reporters does not exist"
   → Run first: sql/create_reporters_and_assignments.sql
   
   Error: "column already exists"
   → Safe to ignore (migration uses IF NOT EXISTS)
   
   Still getting schema cache error after migration?
   → Wait 2-3 minutes for cache refresh
   → Clear browser cache
   → Restart dev server
   → Try incognito/private browsing
   
   Frontend still fails?
   → Check Supabase Logs (Dashboard > Logs)
   → Verify API keys in src/supabaseClient.ts
   → Run sql/verify_schema.sql to confirm columns exist

═══════════════════════════════════════════════════════════════════════

✅ SUCCESS CHECKLIST:

   □ Opened Supabase SQL Editor
   □ Ran sql/add_verification_columns.sql
   □ Saw "Success" message
   □ Ran sql/verify_schema.sql
   □ Saw "✅ SUCCESS: All verification columns exist"
   □ Restarted dev server (npm run dev)
   □ Tested reporter verification submission
   □ No errors, data saved successfully

═══════════════════════════════════════════════════════════════════════

📚 NEXT STEPS AFTER FIX:

   1. Test the full reporter workflow:
      - Login as reporter
      - Accept an assignment
      - Upload verification media
      - Submit verification
      - Check data in Supabase Table Editor
   
   2. Verify in Supabase Table Editor:
      - Go to uploads table
      - Check for new columns
      - Look for test submission data

═══════════════════════════════════════════════════════════════════════

💡 TIPS:

   • This migration is NON-BREAKING (only adds columns)
   • Safe to run multiple times (uses IF NOT EXISTS)
   • Existing uploads still work (new columns nullable)
   • No RLS policy changes needed
   
   • If you need to undo:
     Run sql/rollback_verification_columns.sql
     (⚠️ WARNING: Will delete all verification data!)

═══════════════════════════════════════════════════════════════════════

Need more help? Check:
📖 SUPABASE_MIGRATION_INSTRUCTIONS.md (detailed guide)
🔍 sql/verify_schema.sql (diagnostic queries)

═══════════════════════════════════════════════════════════════════════
`);

process.exit(0);
