# 📥 Import SQL to Supabase - Quick Guide

## ✅ SQL File Ready!

You have **2 SQL files** to choose from:

### Option 1: Clean Version (Recommended) ⭐
**File**: `supabase/SUPABASE_IMPORT_CLEAN.sql`
- ✅ Cleaned for Supabase
- ✅ No pg_dump commands
- ✅ Ready to paste
- ✅ Includes all RLS policies

### Option 2: Original Export
**File**: `supabase/exports/supabase_import.sql`
- ✅ From your pgAdmin4 database
- ⚠️ May have some pg_dump commands (Supabase will ignore them)

---

## 🚀 How to Import

### Step 1: Open Supabase SQL Editor

1. Go to [supabase.com](https://supabase.com)
2. Select your project: `stratejiplus`
3. Click **"SQL Editor"** (left sidebar)
4. Click **"New query"** button

### Step 2: Open SQL File

**On your computer**, open:
```
/Users/yigitilseven/Desktop/sp/supabase/SUPABASE_IMPORT_CLEAN.sql
```

### Step 3: Copy and Paste

1. **Select ALL** (Cmd+A / Ctrl+A)
2. **Copy** (Cmd+C / Ctrl+C)
3. **In Supabase SQL Editor**, paste (Cmd+V / Ctrl+V)

### Step 4: Run

1. Click **"Run"** button (or press `Cmd+Enter` / `Ctrl+Enter`)
2. Wait for success message ✅

**That's it!** Your database schema is imported.

---

## ✅ Verify Import

### Check Tables

1. In Supabase → **Table Editor**
2. You should see tables:
   - `companies`
   - `units`
   - `users`
   - `strategic_areas`
   - `strategic_objectives`
   - `targets`
   - `indicators`
   - `activities`
   - `budget_chapters`
   - `expenses`
   - `risks`
   - `annual_work_plan_items`
   - `revisions`
   - `risk_projects`
   - `risk_action_plans`
   - `risk_monitoring_logs`

### Check RLS

Run this query in SQL Editor:
```sql
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;
```

All tables should show `rowsecurity = true` ✅

---

## 🆘 Troubleshooting

### "relation already exists"
- Tables already exist
- This is OK - Supabase will skip them
- Or drop tables first if you want fresh start

### "function already exists"
- Functions already exist
- This is OK - `CREATE OR REPLACE` handles it

### "permission denied"
- Make sure you're in SQL Editor (not read-only view)
- Check you're logged into Supabase

### "syntax error"
- Make sure you copied the entire file
- Check for any missing semicolons

---

## 📋 What's Included

✅ **All Tables** (15 tables)
✅ **All Indexes** (for performance)
✅ **All Foreign Keys** (relationships)
✅ **RLS Policies** (multi-tenant security)
✅ **Helper Functions** (is_admin, get_user_company)

---

## 🎯 Next Steps

After importing:

1. ✅ Verify tables exist
2. ✅ Check RLS is enabled
3. ✅ Test queries
4. ✅ Ready for Cloudflare Pages deployment!

---

**Use `SUPABASE_IMPORT_CLEAN.sql` - it's ready to go!** 🚀

