# 🚨 URGENT: Fix Mehmet Kaya's Company Assignment

## ❌ Problem
When logging in as Mehmet Kaya (`mehmet@companyb.com`), you're seeing company-a data everywhere.

## ✅ IMMEDIATE FIX - Run This SQL in Supabase

### Step 1: Open Supabase SQL Editor
1. Go to: [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click on your project
3. Click: "SQL Editor" (left sidebar)
4. Click: "New query"

### Step 2: Run This SQL to Check Mehmet's User Record

```sql
-- Check Mehmet's current user record
SELECT 
  user_id,
  full_name,
  email,
  company_id,
  role_id,
  status
FROM users
WHERE email = 'mehmet@companyb.com';
```

**Expected result:**
- `company_id` should be `company-b`
- If it shows `company-a` or `NULL`, that's the problem!

### Step 3: Fix Mehmet's Company Assignment

If `company_id` is wrong, run this:

```sql
-- Fix Mehmet's company_id
UPDATE users 
SET company_id = 'company-b',
    updated_at = NOW()
WHERE email = 'mehmet@companyb.com';

-- Verify it was updated
SELECT 
  user_id,
  full_name,
  email,
  company_id,
  role_id
FROM users
WHERE email = 'mehmet@companyb.com';
```

### Step 4: Verify All Company-B Users

```sql
-- Check all company-b users
SELECT 
  user_id,
  full_name,
  email,
  company_id,
  role_id
FROM users
WHERE company_id = 'company-b'
ORDER BY email;
```

**Should show:**
- `mehmet@companyb.com` - company-b
- `fatma@companyb.com` - company-b

### Step 5: Verify All Company-A Users

```sql
-- Check all company-a users  
SELECT 
  user_id,
  full_name,
  email,
  company_id,
  role_id
FROM users
WHERE company_id = 'company-a'
ORDER BY email;
```

**Should show:**
- `ahmet@companya.com` - company-a
- `ayse@companya.com` - company-a

---

## 🔍 After Running SQL

1. **Logout** from the website completely
2. **Clear browser cache/localStorage** (optional but recommended)
3. **Login as Mehmet** again: `mehmet@companyb.com` / `admin123`
4. **Check browser console** - should see:
   - `✅ COMPANY ID VERIFIED: company-b`
   - `🔍 getCompanyData: table=strategic_areas, companyId=company-b`
5. **Verify data** - should ONLY see company-b data

---

## ✅ If Still Not Working

Check browser console for:
- `❌ CRITICAL: companyId is missing from session user!`
- Any errors about company_id

If you see errors, the user record in Supabase needs to be fixed as shown above.

