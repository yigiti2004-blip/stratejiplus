# 📤 Migrate Schema from pgAdmin4 to Supabase

## Step 1: Export Schema from pgAdmin4

### Option A: Export All Tables (Recommended)

1. **Open pgAdmin4**
2. **Right-click** on your database (`stratejiplus`)
3. Select **"Backup..."**
4. Configure backup:
   - **Filename**: `stratejiplus_schema.sql`
   - **Format**: `Plain`
   - **Encoding**: `UTF8`
   - **Section**: 
     - ✅ **Only schema** (uncheck data if you only want schema)
     - ✅ **Only data** (if you want data too)
     - Or both if you want everything
5. Click **"Backup"**
6. Save the `.sql` file

### Option B: Export Individual Tables

1. **Right-click** on a table
2. Select **"Scripts"** → **"CREATE Script"**
3. Copy the SQL
4. Repeat for each table

### Option C: Use pg_dump Command Line

```bash
# Export schema only
pg_dump -h localhost -U your_username -d stratejiplus --schema-only > schema.sql

# Export schema + data
pg_dump -h localhost -U your_username -d stratejiplus > full_backup.sql

# Export specific tables
pg_dump -h localhost -U your_username -d stratejiplus -t units -t users > tables.sql
```

---

## Step 2: Prepare Schema for Supabase

### Check Your Schema

Before importing, make sure your schema includes:

1. ✅ **Company ID columns** on all tables
2. ✅ **RLS policies** (or we'll add them)
3. ✅ **Proper indexes**
4. ✅ **Foreign key constraints**

### Common Adjustments Needed

Your schema might need these changes for Supabase:

1. **UUID Extension**:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

2. **Company ID Columns** (if missing):
```sql
-- Add company_id to existing tables
ALTER TABLE units ADD COLUMN IF NOT EXISTS company_id VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id VARCHAR(50);
-- ... (add to all tables)
```

3. **RLS Policies** (we'll add these in Supabase)

---

## Step 3: Import to Supabase

### Method 1: Using Supabase SQL Editor (Easiest)

1. **Go to Supabase Dashboard**
   - Open [supabase.com](https://supabase.com)
   - Select your project

2. **Open SQL Editor**
   - Click **"SQL Editor"** in left sidebar
   - Click **"New query"**

3. **Prepare Your SQL**
   - Open your exported `.sql` file
   - Copy the contents
   - **Remove any pgAdmin-specific commands** like:
     - `\connect`
     - `\c database_name`
     - `SET search_path = ...`
     - `\echo` commands

4. **Paste and Run**
   - Paste your SQL into the editor
   - Click **"Run"** (or press `Cmd+Enter` / `Ctrl+Enter`)
   - Wait for success message

5. **Check for Errors**
   - If errors occur, fix them one by one
   - Common issues:
     - Missing extensions (add `CREATE EXTENSION IF NOT EXISTS...`)
     - Duplicate objects (use `IF NOT EXISTS`)
     - Permission issues (usually not a problem in Supabase)

### Method 2: Using Supabase CLI

```bash
# Install Supabase CLI
npm install -g supabase

# Login
supabase login

# Link to your project
supabase link --project-ref your-project-ref

# Create a migration
supabase migration new import_pgadmin_schema

# Copy your SQL to: supabase/migrations/XXXXX_import_pgadmin_schema.sql

# Apply migration
supabase db push
```

### Method 3: Using psql Command Line

```bash
# Get connection string from Supabase
# Settings → Database → Connection string → URI

# Import schema
psql "postgresql://postgres:[PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres" < schema.sql
```

---

## Step 4: Add RLS Policies (If Missing)

If your schema doesn't have RLS policies, add them:

### Enable RLS on All Tables

```sql
-- Enable RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_areas ENABLE ROW LEVEL SECURITY;
-- ... (all tables)
```

### Add Helper Functions

```sql
-- Helper: Check if user is admin
CREATE OR REPLACE FUNCTION is_admin(user_id_param TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = user_id_param 
    AND role_id = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Helper: Get user company
CREATE OR REPLACE FUNCTION get_user_company(user_id_param TEXT)
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN (SELECT company_id FROM users WHERE user_id = user_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### Add RLS Policies

```sql
-- Example: Units table
CREATE POLICY "company_filter_units"
ON units FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Repeat for all tables
```

**Or use the complete RLS setup from `supabase/schema.sql`**

---

## Step 5: Verify Import

### Check Tables

```sql
-- List all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check table structure
\d units
\d users
```

### Check RLS

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- List policies
SELECT schemaname, tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public';
```

### Test Data Access

```sql
-- Set user context (for testing)
SET LOCAL app.current_user_id = 'user-A-admin';

-- Try to query (should only see company A data)
SELECT * FROM units;

-- Test as admin (should see all)
SET LOCAL app.current_user_id = 'admin-user';
SELECT * FROM units;
```

---

## Step 6: Migrate Data (If Needed)

If you exported data from pgAdmin4:

### Option A: Import via SQL

1. Export data from pgAdmin4:
   - Right-click database → **Backup**
   - Select **"Only data"**
   - Save as `data.sql`

2. Import to Supabase:
   - Open SQL Editor
   - Paste data SQL
   - Run

### Option B: Use Migration Script

Use the migration script we created:

```bash
# Set environment variables
export SUPABASE_URL=https://your-project.supabase.co
export SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Run migration
node supabase/migrate-to-supabase.js
```

---

## 🔧 Troubleshooting

### Error: "relation already exists"

**Solution**: Add `IF NOT EXISTS` to CREATE statements:
```sql
CREATE TABLE IF NOT EXISTS units (...);
```

### Error: "extension does not exist"

**Solution**: Create extension first:
```sql
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
```

### Error: "permission denied"

**Solution**: Supabase handles permissions automatically. If you see this, check:
- You're using the correct connection (not a read-only connection)
- You're in the SQL Editor (not a read-only view)

### Error: "column company_id does not exist"

**Solution**: Add company_id columns:
```sql
ALTER TABLE units ADD COLUMN IF NOT EXISTS company_id VARCHAR(50);
-- Update existing rows
UPDATE units SET company_id = 'default-company' WHERE company_id IS NULL;
```

### Schema Too Large

**Solution**: Split into multiple migrations:
1. Create tables first
2. Add indexes
3. Add constraints
4. Add RLS policies

---

## 📋 Quick Checklist

- [ ] Exported schema from pgAdmin4
- [ ] Removed pgAdmin-specific commands
- [ ] Added `IF NOT EXISTS` to CREATE statements
- [ ] Added company_id columns (if missing)
- [ ] Imported to Supabase SQL Editor
- [ ] Added RLS policies
- [ ] Verified tables exist
- [ ] Tested data access
- [ ] Migrated data (if needed)

---

## 🎯 Recommended Approach

1. **Export schema** from pgAdmin4 (schema only, no data)
2. **Clean up SQL** (remove pgAdmin commands)
3. **Import to Supabase** via SQL Editor
4. **Add RLS policies** (use `supabase/schema.sql` as reference)
5. **Migrate data** using `supabase/migrate-to-supabase.js`

---

## 📚 Next Steps

After importing:
1. ✅ Verify schema in Supabase dashboard
2. ✅ Test RLS policies
3. ✅ Update frontend to use Supabase
4. ✅ Deploy to Vercel/Cloudflare/Fly.io

---

**Need help?** Check `supabase/schema.sql` for the complete schema with RLS!

