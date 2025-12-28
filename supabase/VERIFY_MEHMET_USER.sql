-- ============================================
-- VERIFY MEHMET KAYA'S USER RECORD
-- Run this in Supabase SQL Editor
-- ============================================

-- Check Mehmet Kaya's user record
SELECT 
  user_id,
  full_name,
  email,
  company_id,
  role_id,
  status
FROM users
WHERE email LIKE '%mehmet%' OR full_name LIKE '%Mehmet%';

-- Check all users and their company assignments
SELECT 
  user_id,
  full_name,
  email,
  company_id,
  role_id,
  status
FROM users
ORDER BY company_id, email;

-- Check if there are any users with NULL company_id
SELECT 
  user_id,
  full_name,
  email,
  company_id,
  role_id
FROM users
WHERE company_id IS NULL;

-- ============================================
-- FIX: If Mehmet's company_id is wrong, run this:
-- ============================================
-- UPDATE users 
-- SET company_id = 'company-b'
-- WHERE email = 'mehmet@companyb.com';

-- ============================================
-- Verify companies exist
-- ============================================
SELECT company_id, company_name, company_code 
FROM companies 
ORDER BY company_id;

