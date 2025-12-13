# 📥 Import Instructions for Supabase

## ✅ Export Complete!

Your schema has been exported and is ready for Supabase.

## 📋 Files Created

1. **`supabase_import.sql`** ⭐ - **Main file to import** (includes RLS policies)
2. `00_extensions.sql` - Extensions only
3. `01_schema.sql` - Schema only
4. `02_rls_policies.sql` - Empty (RLS was disabled in source)
5. `03_functions.sql` - Functions
6. `04_indexes.sql` - Indexes
7. **`05_add_rls_policies.sql`** - RLS policies (added to main file)
8. `rls_status.txt` - RLS status report

## 🚀 Import to Supabase (2 Steps)

### Step 1: Import Schema

1. **Open Supabase Dashboard**
   - Go to [supabase.com](https://supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"**

3. **Import Schema**
   - Open `supabase/exports/supabase_import.sql`
   - Copy **ALL** contents
   - Paste into SQL Editor
   - Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)

4. **Wait for Success**
   - Should see "Success" message
   - Check for any errors (fix if needed)

### Step 2: Verify RLS

After import, verify RLS is enabled:

```sql
-- Check RLS status
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- Should show rowsecurity = true for all tables
```

## ⚠️ Important Notes

### RLS Was Disabled in Source Database

Your current pgAdmin4 database has **RLS DISABLED** on all tables.

The export includes:
- ✅ Schema (tables, columns, constraints)
- ✅ Functions
- ✅ Indexes
- ✅ **RLS policies (added automatically)**

After import, RLS will be **ENABLED** with multi-tenant policies.

### Company ID Columns

Make sure your tables have `company_id` columns. If not, add them:

```sql
-- Example: Add company_id if missing
ALTER TABLE units ADD COLUMN IF NOT EXISTS company_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id VARCHAR(50);
-- ... (add to all tables)
```

### Test RLS After Import

```sql
-- Set user context (for testing)
SET LOCAL app.current_user_id = 'user-A-admin';

-- Try to query (should only see company A data)
SELECT * FROM units;

-- Test as admin (should see all)
SET LOCAL app.current_user_id = 'admin-user';
SELECT * FROM units;
```

## 🔍 Troubleshooting

### Error: "relation already exists"
→ Tables already exist. Drop them first or use `IF NOT EXISTS` (already in file).

### Error: "column company_id does not exist"
→ Add company_id columns before importing RLS policies.

### Error: "function does not exist"
→ Make sure `05_add_rls_policies.sql` is included (it's in `supabase_import.sql`).

### RLS Not Working
→ Check:
1. RLS is enabled: `SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';`
2. Policies exist: `SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';`
3. User context is set: `SHOW app.current_user_id;`

## 📊 What's Included

✅ **Complete Schema**
- All tables
- All columns
- All constraints
- Foreign keys

✅ **RLS Policies**
- Multi-tenant filtering
- Admin access
- Helper functions

✅ **Functions**
- `is_admin()` - Check if user is admin
- `get_user_company()` - Get user's company

✅ **Indexes**
- Performance indexes
- Company ID indexes

## 🎯 Next Steps

After successful import:

1. ✅ Verify tables in Supabase dashboard
2. ✅ Test RLS policies
3. ✅ Migrate data (if needed): `npm run migrate-supabase`
4. ✅ Update frontend to use Supabase
5. ✅ Deploy to Vercel/Cloudflare/Fly.io

---

**Ready to import?** Open `supabase_import.sql` and paste into Supabase SQL Editor! 🚀

