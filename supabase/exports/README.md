# 📁 Supabase Export Files

This directory contains exported SQL files from your PostgreSQL database, ready for import into Supabase.

## 📋 Files

### `00_extensions.sql`
Database extensions (e.g., `uuid-ossp`)

### `01_schema.sql`
Complete database schema:
- Tables
- Columns
- Data types
- Constraints
- Foreign keys

### `02_rls_policies.sql`
Row Level Security (RLS) policies:
- ENABLE ROW LEVEL SECURITY statements
- CREATE POLICY statements
- Policy definitions

### `03_functions.sql`
Database functions:
- Helper functions
- RLS helper functions (e.g., `is_admin`, `get_user_company`)

### `04_indexes.sql`
Database indexes for performance optimization

### `supabase_import.sql` ⭐
**Combined file ready for Supabase import**
- All components in correct order
- Cleaned and formatted
- Ready to paste into Supabase SQL Editor

### `rls_status.txt`
Report showing RLS status for all tables:
- Which tables have RLS enabled
- Policy count per table

## 🚀 How to Use

### Import to Supabase:

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Click "New query"**
3. **Open** `supabase_import.sql`
4. **Copy and paste** into editor
5. **Click "Run"**

### Or import files individually:

1. Import in this order:
   - `00_extensions.sql`
   - `01_schema.sql`
   - `03_functions.sql`
   - `02_rls_policies.sql`
   - `04_indexes.sql`

## 🔄 Regenerate Files

To regenerate these files from your database:

```bash
npm run export-schema
```

This will:
- Export schema using `pg_dump`
- Check RLS policies
- Export functions and indexes
- Create combined file
- Save all files in this directory

## 📊 RLS Status

Check `rls_status.txt` to see:
- Which tables have RLS enabled
- How many policies each table has
- Tables that need RLS enabled

## ⚠️ Notes

- Files are generated from your local PostgreSQL database
- Make sure to review before importing to Supabase
- The combined file (`supabase_import.sql`) is cleaned and ready
- Individual files are provided for reference/debugging

