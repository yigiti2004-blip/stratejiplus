# 🔧 Fix "Kayıt Oluşturulamadı" Error

## 🔍 Possible Issues

### Issue 1: Schema Not Imported to Supabase ⚠️
**Most likely issue!** Tables don't exist in Supabase.

**Check:**
1. Go to Supabase Dashboard → Table Editor
2. Do you see tables like `strategic_areas`, `users`, `companies`?
3. If NO tables → Schema not imported!

**Fix:**
1. Go to Supabase Dashboard → SQL Editor
2. Click "New query"
3. Copy/paste contents of `supabase/SUPABASE_IMPORT_CLEAN.sql`
4. Click "Run"
5. Wait for success

---

### Issue 2: No Companies in Database ⚠️
Foreign key constraint: `company_id` references `companies` table.

**Check:**
1. Supabase → Table Editor → `companies`
2. Is it empty?

**Fix:** Add test companies:
```sql
INSERT INTO companies (company_id, company_name, company_code, status)
VALUES 
  ('company-a', 'TechCorp A', 'TECH-A', 'aktif'),
  ('company-b', 'Manufacturing B', 'MFG-B', 'aktif');
```

---

### Issue 3: RLS Policies Blocking Inserts ⚠️
RLS might be blocking anonymous inserts.

**Quick Fix (for testing):** Temporarily disable RLS:
```sql
-- Disable RLS on all tables (for testing only)
ALTER TABLE strategic_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_objectives DISABLE ROW LEVEL SECURITY;
ALTER TABLE targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE indicators DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE risks DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
```

---

### Issue 4: Environment Variables Not Set ⚠️
Cloudflare Pages might not have the Supabase keys.

**Check:**
1. Cloudflare → Pages → stratejiplus → Settings → Environment Variables
2. Do you see `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`?

**Fix:** Add them if missing, then redeploy.

---

## 🚀 Quick Fix Steps

### Step 1: Check if Schema is Imported

1. Go to Supabase Dashboard
2. Click "Table Editor"
3. Look for tables: `companies`, `users`, `strategic_areas`

**If NO tables:**
1. Go to SQL Editor → New query
2. Paste this SQL and run:

```sql
-- Create companies table first
CREATE TABLE IF NOT EXISTS companies (
  company_id VARCHAR(50) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert test companies
INSERT INTO companies (company_id, company_name, company_code, status)
VALUES 
  ('company-a', 'TechCorp A', 'TECH-A', 'aktif'),
  ('company-b', 'Manufacturing B', 'MFG-B', 'aktif')
ON CONFLICT (company_id) DO NOTHING;

-- Create strategic_areas table
CREATE TABLE IF NOT EXISTS strategic_areas (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  organization_id VARCHAR(50),
  responsible_unit VARCHAR(255),
  description TEXT,
  company_id VARCHAR(50) REFERENCES companies(company_id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create other tables...
-- (Use the full supabase/SUPABASE_IMPORT_CLEAN.sql for complete schema)
```

### Step 2: Disable RLS (For Testing)

Run this in Supabase SQL Editor:

```sql
-- Disable RLS temporarily for testing
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE units DISABLE ROW LEVEL SECURITY;
ALTER TABLE users DISABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_areas DISABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_objectives DISABLE ROW LEVEL SECURITY;
ALTER TABLE targets DISABLE ROW LEVEL SECURITY;
ALTER TABLE indicators DISABLE ROW LEVEL SECURITY;
ALTER TABLE activities DISABLE ROW LEVEL SECURITY;
ALTER TABLE budget_chapters DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
ALTER TABLE risks DISABLE ROW LEVEL SECURITY;
```

### Step 3: Test Insert

Try creating a record on the website again.

---

## 🔍 Diagnostic: Check Browser Console

1. Open your website: `https://stratejiplus.com`
2. Press F12 → Console tab
3. Try to create a record
4. Look for error messages like:
   - "Error inserting into strategic_areas"
   - Connection errors
   - 404 errors (table doesn't exist)
   - 403 errors (RLS blocking)

---

## ✅ Complete Fix

### Full Schema Import:

1. Go to Supabase → SQL Editor
2. Click "New query"
3. Copy ENTIRE contents of file: `supabase/SUPABASE_IMPORT_CLEAN.sql`
4. Paste in SQL Editor
5. Click "Run"
6. Wait for success

This will create all tables with proper RLS policies.

---

## 📋 Checklist

- [ ] Tables exist in Supabase (Table Editor)
- [ ] Companies table has data
- [ ] Environment variables set in Cloudflare
- [ ] Site redeployed after adding env vars
- [ ] RLS disabled (for testing) or properly configured
- [ ] Browser console checked for errors

---

**Most likely issue: Schema not imported to Supabase. Import the full schema!**

