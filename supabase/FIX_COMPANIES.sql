-- ============================================
-- FIX: Add Missing Companies
-- Run this in Supabase SQL Editor
-- ============================================

-- Create companies table if it doesn't exist
CREATE TABLE IF NOT EXISTS companies (
  company_id VARCHAR(50) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert companies (will not fail if they already exist)
INSERT INTO companies (company_id, company_name, company_code, status)
VALUES 
  ('company-a', 'TechCorp A', 'TECH-A', 'aktif'),
  ('company-b', 'Manufacturing B', 'MFG-B', 'aktif'),
  ('default-company', 'Default Company', 'DEFAULT', 'aktif')
ON CONFLICT (company_id) DO NOTHING;

-- Verify companies exist
SELECT company_id, company_name, company_code, status FROM companies;

