# 📥 How to Import SQL to Supabase - Step by Step

## 🎯 Quick Steps

1. Open Supabase SQL Editor
2. Open your SQL file
3. Copy all contents
4. Paste into Supabase
5. Click Run
6. Done! ✅

---

## 📋 Detailed Steps

### Step 1: Open Supabase Dashboard

1. Go to [supabase.com](https://supabase.com)
2. **Login** to your account
3. **Select your project**: `stratejiplus`
   - (Or create one if you haven't)

### Step 2: Open SQL Editor

1. In Supabase dashboard (left sidebar)
2. Click **"SQL Editor"** (icon looks like `</>` or database)
3. Click **"New query"** button (top right)

You'll see a blank SQL editor window.

### Step 3: Open Your SQL File

**On your computer**, open the SQL file:

**Option A: Clean Version (Recommended)**
```
/Users/yigitilseven/Desktop/sp/supabase/SUPABASE_IMPORT_CLEAN.sql
```

**Option B: Original Export**
```
/Users/yigitilseven/Desktop/sp/supabase/exports/supabase_import.sql
```

### Step 4: Copy All Contents

1. **Select ALL** text in the file:
   - **Mac**: `Cmd+A`
   - **Windows/Linux**: `Ctrl+A`

2. **Copy** the text:
   - **Mac**: `Cmd+C`
   - **Windows/Linux**: `Ctrl+C`

### Step 5: Paste into Supabase

1. **Click in the Supabase SQL Editor** (the blank text area)
2. **Paste** the SQL:
   - **Mac**: `Cmd+V`
   - **Windows/Linux**: `Ctrl+V`

You should see all your SQL code in the editor.

### Step 6: Run the SQL

1. **Click the "Run" button** (green button, bottom right)
   - Or press: `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows/Linux)

2. **Wait for execution**
   - You'll see a progress indicator
   - Usually takes 10-30 seconds

3. **Check for success**
   - You should see: **"Success. No rows returned"** or similar
   - Or a success message

**✅ Done!** Your database schema is imported.

---

## ✅ Verify Import

### Check Tables

1. In Supabase dashboard → **"Table Editor"** (left sidebar)
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

1. Go back to **SQL Editor**
2. Run this query:
   ```sql
   SELECT tablename, rowsecurity 
   FROM pg_tables 
   WHERE schemaname = 'public'
   ORDER BY tablename;
   ```
3. All tables should show `rowsecurity = true` ✅

---

## 🆘 Troubleshooting

### "relation already exists"
- **Meaning**: Tables already exist
- **Solution**: This is OK! Supabase will skip existing tables
- **Or**: Drop tables first if you want fresh start:
  ```sql
  DROP TABLE IF EXISTS companies CASCADE;
  -- (repeat for all tables)
  ```

### "syntax error"
- **Check**: Did you copy the entire file?
- **Check**: Are there any missing semicolons?
- **Solution**: Try copying again, make sure you got everything

### "permission denied"
- **Check**: Are you in SQL Editor (not read-only view)?
- **Check**: Are you logged into Supabase?
- **Solution**: Make sure you're the project owner

### "function already exists"
- **Meaning**: Functions already exist
- **Solution**: This is OK! `CREATE OR REPLACE` handles it

### Import Takes Too Long
- **Normal**: Large schemas can take 30-60 seconds
- **Wait**: Don't close the browser
- **Check**: Look for progress indicator

---

## 📸 Visual Guide

### Step 1: SQL Editor Location
```
Supabase Dashboard
├── Table Editor
├── SQL Editor ← Click here
├── Database
└── ...
```

### Step 2: New Query Button
```
[SQL Editor Window]
┌─────────────────────────────────┐
│  [New query] ← Click this       │
│                                  │
│  [Blank editor area]             │
│                                  │
│                    [Run] ← Click │
└─────────────────────────────────┘
```

### Step 3: After Paste
```
┌─────────────────────────────────┐
│  CREATE TABLE companies (...    │
│  CREATE TABLE units (...        │
│  ... (all your SQL) ...         │
│                                  │
│                    [Run] ← Click │
└─────────────────────────────────┘
```

---

## 🎯 Quick Checklist

- [ ] Opened Supabase dashboard
- [ ] Selected project
- [ ] Opened SQL Editor
- [ ] Clicked "New query"
- [ ] Opened SQL file on computer
- [ ] Copied all contents (Cmd+A, Cmd+C)
- [ ] Pasted into Supabase (Cmd+V)
- [ ] Clicked "Run"
- [ ] Saw success message
- [ ] Verified tables in Table Editor

---

## 📝 Alternative: Upload File (If Available)

Some Supabase versions allow file upload:

1. In SQL Editor
2. Look for **"Upload"** or **"Import"** button
3. Select your SQL file
4. Click **"Run"**

**Note**: This feature may not be available in all Supabase versions.

---

## 🎯 File to Use

**Recommended**: `supabase/SUPABASE_IMPORT_CLEAN.sql`
- ✅ Cleaned for Supabase
- ✅ No pg_dump commands
- ✅ Ready to paste

**Location**: `/Users/yigitilseven/Desktop/sp/supabase/SUPABASE_IMPORT_CLEAN.sql`

---

## ✅ After Import

Once imported successfully:

1. ✅ **Verify tables** exist
2. ✅ **Check RLS** is enabled
3. ✅ **Test a query**:
   ```sql
   SELECT * FROM companies LIMIT 1;
   ```
4. ✅ **Ready for Cloudflare Pages deployment!**

---

**Follow these steps and your SQL will be imported!** 🚀

