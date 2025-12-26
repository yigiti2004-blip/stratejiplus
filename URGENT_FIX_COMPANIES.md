# 🚨 URGENT: Fix Missing Companies in Supabase

## ❌ Error You're Seeing:
```
"Key is not present in table \"companies\""
"violates foreign key constraint \"strategic_areas_company_id_fkey\""
```

**This means:** `company-a` doesn't exist in your Supabase `companies` table!

---

## ✅ FIX: Run This SQL Right Now

### Step 1: Open Supabase SQL Editor

1. Go to: [supabase.com/dashboard](https://supabase.com/dashboard)
2. **Click on your project** (stratejiplus)
3. **Click:** "SQL Editor" (left sidebar)
4. **Click:** "New query" button

### Step 2: Copy This ENTIRE SQL

```sql
-- Step 1: Create companies table
CREATE TABLE IF NOT EXISTS companies (
  company_id VARCHAR(50) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Insert the companies
INSERT INTO companies (company_id, company_name, company_code, status)
VALUES 
  ('company-a', 'TechCorp A', 'TECH-A', 'aktif'),
  ('company-b', 'Manufacturing B', 'MFG-B', 'aktif'),
  ('default-company', 'Default Company', 'DEFAULT', 'aktif')
ON CONFLICT (company_id) DO NOTHING;

-- Step 3: Verify companies were created
SELECT company_id, company_name, company_code FROM companies;
```

### Step 3: Run It

1. **Paste** the SQL above into the editor
2. **Click:** "Run" button (or press Cmd+Enter)
3. **Wait** for success message
4. **Check** the results - should show 3 companies

---

## 🔍 Verify It Worked

After running, you should see in the results:

| company_id | company_name | company_code |
|------------|--------------|--------------|
| company-a | TechCorp A | TECH-A |
| company-b | Manufacturing B | MFG-B |
| default-company | Default Company | DEFAULT |

---

## ✅ After Running SQL

1. **Go back to your website**
2. **Try creating SP item again**
3. **Should work now!** ✅

---

## 🆘 If SQL Fails

**Error: "relation companies does not exist"**
- The table doesn't exist yet
- The SQL above will create it
- Run it again

**Error: "permission denied"**
- Make sure you're in the SQL Editor
- Not in Table Editor
- Try running again

**No error but no results**
- Check if you're in the right project
- Make sure you clicked "Run"

---

## 📋 Quick Checklist

- [ ] Opened Supabase SQL Editor
- [ ] Created new query
- [ ] Pasted the SQL above
- [ ] Clicked "Run"
- [ ] Saw success message
- [ ] Verified companies exist (3 rows)
- [ ] Tested website - creating SP item works ✅

---

**This is the ONLY thing blocking your inserts. Run the SQL and it will work!** 🚀

