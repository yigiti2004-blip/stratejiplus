# ⚡ Quick Guide: pgAdmin4 → Supabase

## 🎯 3-Step Process

### Step 1: Export from pgAdmin4 (2 min)

1. **Right-click** your database → **"Backup..."**
2. **Settings**:
   - Format: `Plain`
   - Section: ✅ **Only schema** (or both if you want data)
3. Click **"Backup"**
4. Save as `schema_from_pgadmin.sql`

### Step 2: Clean SQL (Optional but Recommended)

```bash
# Clean the SQL file
npm run clean-sql schema_from_pgadmin.sql schema_cleaned.sql

# Or manually remove:
# - \connect commands
# - \c database commands
# - SET search_path commands
# - \echo commands
```

### Step 3: Import to Supabase (1 min)

1. **Go to Supabase Dashboard** → **SQL Editor**
2. **Click "New query"**
3. **Paste** your cleaned SQL
4. **Click "Run"** (or `Cmd+Enter`)
5. **Done!** ✅

---

## 🔧 If You Get Errors

### "relation already exists"
→ Add `IF NOT EXISTS` to CREATE statements

### "extension does not exist"
→ Add at the top:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### "column company_id does not exist"
→ Add company_id columns (see full guide)

---

## 📋 After Import

1. ✅ **Add RLS policies** (use `supabase/schema.sql` as reference)
2. ✅ **Verify tables** in Supabase dashboard
3. ✅ **Test queries**

---

## 📚 Full Guide

See `PGADMIN_TO_SUPABASE.md` for detailed instructions!

