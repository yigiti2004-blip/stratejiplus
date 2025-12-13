# 📤 Export Schema to Supabase - Quick Guide

## 🚀 One Command Export

```bash
npm run export-schema
```

This will:
1. ✅ Export complete schema using `pg_dump`
2. ✅ Check and export RLS policies
3. ✅ Export functions and indexes
4. ✅ Create organized SQL files
5. ✅ Generate combined file for Supabase

## 📁 Output Files

All files saved to: `supabase/exports/`

- **`00_extensions.sql`** - Database extensions
- **`01_schema.sql`** - Complete schema
- **`02_rls_policies.sql`** - RLS policies
- **`03_functions.sql`** - Database functions
- **`04_indexes.sql`** - Indexes
- **`supabase_import.sql`** ⭐ - **Combined file (ready for Supabase)**
- **`rls_status.txt`** - RLS status report

## 🎯 Import to Supabase

1. **Open Supabase Dashboard** → **SQL Editor**
2. **Click "New query"**
3. **Open** `supabase/exports/supabase_import.sql`
4. **Copy and paste** into editor
5. **Click "Run"** ✅

## 🔍 Check RLS Status

After export, check `supabase/exports/rls_status.txt` to see:
- Which tables have RLS enabled
- Policy count per table
- Tables that need RLS

## ⚙️ Configuration

The script uses your database config from `database/config.js`:
- Host: `localhost` (or `DB_HOST` env var)
- Port: `5432` (or `DB_PORT` env var)
- User: Your system user (or `DB_USER` env var)
- Database: `stratejiplus` (or `DB_NAME` env var)

## 🆘 Troubleshooting

### "pg_dump: command not found"
```bash
# macOS (Homebrew)
brew install postgresql

# Or add PostgreSQL bin to PATH
export PATH="/usr/local/opt/postgresql@15/bin:$PATH"
```

### "password authentication failed"
- Check `database/config.js`
- Or set `DB_PASSWORD` environment variable

### "database does not exist"
- Verify database name in `database/config.js`
- Or set `DB_NAME` environment variable

## 📚 Next Steps

1. ✅ Export schema: `npm run export-schema`
2. ✅ Review `supabase/exports/rls_status.txt`
3. ✅ Import `supabase_import.sql` to Supabase
4. ✅ Verify tables and RLS in Supabase dashboard

---

**Ready to export?** Run `npm run export-schema` now! 🚀

