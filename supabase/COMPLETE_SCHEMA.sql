-- ============================================
-- COMPLETE SUPABASE SCHEMA WITH RLS
-- Run this in Supabase SQL Editor
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- HELPER FUNCTIONS (MUST BE FIRST)
-- ============================================

-- Function to set user context for RLS
CREATE OR REPLACE FUNCTION set_user_context(user_id TEXT)
RETURNS void AS $$
BEGIN
  PERFORM set_config('app.current_user_id', user_id, true);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to all roles
GRANT EXECUTE ON FUNCTION set_user_context(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION set_user_context(TEXT) TO authenticated;
GRANT EXECUTE ON FUNCTION set_user_context(TEXT) TO service_role;

-- Function to get current user's company
CREATE OR REPLACE FUNCTION get_user_company()
RETURNS TEXT AS $$
DECLARE
  user_company TEXT;
BEGIN
  SELECT company_id INTO user_company
  FROM users
  WHERE user_id = current_setting('app.current_user_id', true);
  RETURN user_company;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to check if current user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT role_id INTO user_role
  FROM users
  WHERE user_id = current_setting('app.current_user_id', true);
  RETURN user_role = 'admin';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- COMPANIES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS companies (
  company_id VARCHAR(50) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  company_code VARCHAR(50) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default companies
INSERT INTO companies (company_id, company_name, company_code, status)
VALUES 
  ('company-a', 'TechCorp A', 'TECH-A', 'aktif'),
  ('company-b', 'Manufacturing B', 'MFG-B', 'aktif'),
  ('default-company', 'Default Company', 'DEFAULT', 'aktif')
ON CONFLICT (company_id) DO NOTHING;

-- ============================================
-- UNITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS units (
  unit_id VARCHAR(50) PRIMARY KEY,
  unit_name VARCHAR(255) NOT NULL,
  unit_code VARCHAR(50) NOT NULL,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_units_company ON units(company_id);

-- Insert default units
INSERT INTO units (unit_id, unit_name, unit_code, company_id, status)
VALUES 
  ('comp-a-org-1', 'TechCorp IT Birimi', 'TECH-IT', 'company-a', 'aktif'),
  ('comp-a-org-2', 'TechCorp Finans', 'TECH-FIN', 'company-a', 'aktif'),
  ('comp-b-org-1', 'Manufacturing Üretim', 'MFG-PROD', 'company-b', 'aktif'),
  ('comp-b-org-2', 'Manufacturing Kalite', 'MFG-QA', 'company-b', 'aktif')
ON CONFLICT (unit_id) DO NOTHING;

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT,
  role_id VARCHAR(50) NOT NULL,
  unit_id VARCHAR(50) REFERENCES units(unit_id) ON DELETE SET NULL,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  status VARCHAR(20) DEFAULT 'aktif',
  must_change_password BOOLEAN DEFAULT false,
  last_login_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add password column if it doesn't exist (for compatibility)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'password') THEN
    ALTER TABLE users ADD COLUMN password TEXT;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Insert default users (using password_hash column which exists)
INSERT INTO users (user_id, full_name, email, password_hash, role_id, unit_id, company_id, status)
VALUES 
  ('comp-a-admin', 'Ahmet Yılmaz', 'ahmet@companya.com', 'admin123', 'admin', 'comp-a-org-1', 'company-a', 'aktif'),
  ('comp-a-user', 'Ayşe Demir', 'ayse@companya.com', 'user123', 'manager', 'comp-a-org-1', 'company-a', 'aktif'),
  ('comp-b-admin', 'Mehmet Kaya', 'mehmet@companyb.com', 'admin123', 'admin', 'comp-b-org-1', 'company-b', 'aktif'),
  ('comp-b-user', 'Fatma Şahin', 'fatma@companyb.com', 'user123', 'manager', 'comp-b-org-1', 'company-b', 'aktif'),
  ('admin-001', 'Sistem Yöneticisi', 'admin@stratejiplus.com', 'admin123', 'admin', NULL, 'default-company', 'aktif')
ON CONFLICT (user_id) DO NOTHING;

-- ============================================
-- STRATEGIC AREAS
-- ============================================
CREATE TABLE IF NOT EXISTS strategic_areas (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  organization_id VARCHAR(50) REFERENCES units(unit_id) ON DELETE SET NULL,
  responsible_unit VARCHAR(255),
  description TEXT,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategic_areas_company ON strategic_areas(company_id);

-- ============================================
-- STRATEGIC OBJECTIVES
-- ============================================
CREATE TABLE IF NOT EXISTS strategic_objectives (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  strategic_area_id VARCHAR(50) REFERENCES strategic_areas(id) ON DELETE CASCADE,
  responsible_unit VARCHAR(255),
  description TEXT,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_strategic_objectives_company ON strategic_objectives(company_id);
CREATE INDEX IF NOT EXISTS idx_strategic_objectives_area ON strategic_objectives(strategic_area_id);

-- ============================================
-- TARGETS
-- ============================================
CREATE TABLE IF NOT EXISTS targets (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  objective_id VARCHAR(50) REFERENCES strategic_objectives(id) ON DELETE CASCADE,
  responsible_unit VARCHAR(255),
  target_value NUMERIC,
  actual_value NUMERIC,
  completion_percentage NUMERIC DEFAULT 0,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_targets_company ON targets(company_id);
CREATE INDEX IF NOT EXISTS idx_targets_objective ON targets(objective_id);

-- ============================================
-- INDICATORS
-- ============================================
CREATE TABLE IF NOT EXISTS indicators (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(500) NOT NULL,
  target_id VARCHAR(50) REFERENCES targets(id) ON DELETE CASCADE,
  target_value NUMERIC(15,2),
  actual_value NUMERIC(15,2) DEFAULT 0,
  unit VARCHAR(50),
  measurement_type VARCHAR(50),
  frequency VARCHAR(50),
  responsible_unit VARCHAR(255),
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indicators_company ON indicators(company_id);
CREATE INDEX IF NOT EXISTS idx_indicators_target ON indicators(target_id);

-- ============================================
-- ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  indicator_id VARCHAR(50) REFERENCES indicators(id) ON DELETE CASCADE,
  target_id VARCHAR(50) REFERENCES targets(id) ON DELETE CASCADE,
  responsible_unit VARCHAR(255),
  planned_budget NUMERIC DEFAULT 0,
  actual_budget NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'Planlandı',
  completion NUMERIC DEFAULT 0,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_activities_company ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_indicator ON activities(indicator_id);

-- ============================================
-- BUDGET CHAPTERS
-- ============================================
CREATE TABLE IF NOT EXISTS budget_chapters (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_chapters_company ON budget_chapters(company_id);

-- ============================================
-- EXPENSES
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(50) PRIMARY KEY,
  budget_chapter_id VARCHAR(50) REFERENCES budget_chapters(id) ON DELETE SET NULL,
  activity_id VARCHAR(50) REFERENCES activities(id) ON DELETE SET NULL,
  description TEXT,
  amount NUMERIC,
  total_amount NUMERIC,
  expense_date DATE,
  status VARCHAR(50) DEFAULT 'Beklemede',
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_expenses_company ON expenses(company_id);

-- ============================================
-- RISKS
-- ============================================
CREATE TABLE IF NOT EXISTS risks (
  id VARCHAR(50) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  risk_type VARCHAR(100),
  description TEXT,
  probability INTEGER CHECK (probability >= 1 AND probability <= 5),
  impact INTEGER CHECK (impact >= 1 AND impact <= 5),
  score INTEGER,
  status VARCHAR(50) DEFAULT 'Aktif',
  responsible VARCHAR(255),
  related_record_type VARCHAR(100),
  related_record_id VARCHAR(50),
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risks_company ON risks(company_id);

-- ============================================
-- REVISIONS
-- ============================================
CREATE TABLE IF NOT EXISTS revisions (
  id VARCHAR(50) PRIMARY KEY,
  revision_type VARCHAR(100),
  entity_type VARCHAR(100),
  entity_id VARCHAR(50),
  changes JSONB,
  reason TEXT,
  approved_by VARCHAR(255),
  approval_date TIMESTAMPTZ,
  status VARCHAR(50) DEFAULT 'Beklemede',
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisions_company ON revisions(company_id);

-- ============================================
-- ANNUAL WORK PLAN ITEMS
-- ============================================
CREATE TABLE IF NOT EXISTS annual_work_plan_items (
  id VARCHAR(50) PRIMARY KEY,
  year INTEGER NOT NULL,
  activity_id VARCHAR(50) REFERENCES activities(id) ON DELETE CASCADE,
  planned_start DATE,
  planned_end DATE,
  actual_start DATE,
  actual_end DATE,
  status VARCHAR(50) DEFAULT 'Planlandı',
  notes TEXT,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annual_work_plan_company ON annual_work_plan_items(company_id);

-- ============================================
-- MONITORING HISTORY
-- ============================================
CREATE TABLE IF NOT EXISTS monitoring_history (
  id VARCHAR(50) PRIMARY KEY,
  indicator_id VARCHAR(50) REFERENCES indicators(id) ON DELETE CASCADE,
  recorded_value NUMERIC,
  recorded_date DATE,
  notes TEXT,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_monitoring_history_company ON monitoring_history(company_id);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================

ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE strategic_objectives ENABLE ROW LEVEL SECURITY;
ALTER TABLE targets ENABLE ROW LEVEL SECURITY;
ALTER TABLE indicators ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_chapters ENABLE ROW LEVEL SECURITY;
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE risks ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE annual_work_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE monitoring_history ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- Allow anon role to read/write for now (simplest setup)
-- ============================================

-- COMPANIES: Everyone can read, admins can write
DROP POLICY IF EXISTS "allow_all_companies" ON companies;
CREATE POLICY "allow_all_companies" ON companies FOR ALL USING (true) WITH CHECK (true);

-- UNITS: Everyone can read, company members can write
DROP POLICY IF EXISTS "allow_all_units" ON units;
CREATE POLICY "allow_all_units" ON units FOR ALL USING (true) WITH CHECK (true);

-- USERS: Everyone can read, company members can write
DROP POLICY IF EXISTS "allow_all_users" ON users;
CREATE POLICY "allow_all_users" ON users FOR ALL USING (true) WITH CHECK (true);

-- STRATEGIC_AREAS
DROP POLICY IF EXISTS "allow_all_strategic_areas" ON strategic_areas;
CREATE POLICY "allow_all_strategic_areas" ON strategic_areas FOR ALL USING (true) WITH CHECK (true);

-- STRATEGIC_OBJECTIVES
DROP POLICY IF EXISTS "allow_all_strategic_objectives" ON strategic_objectives;
CREATE POLICY "allow_all_strategic_objectives" ON strategic_objectives FOR ALL USING (true) WITH CHECK (true);

-- TARGETS
DROP POLICY IF EXISTS "allow_all_targets" ON targets;
CREATE POLICY "allow_all_targets" ON targets FOR ALL USING (true) WITH CHECK (true);

-- INDICATORS
DROP POLICY IF EXISTS "allow_all_indicators" ON indicators;
CREATE POLICY "allow_all_indicators" ON indicators FOR ALL USING (true) WITH CHECK (true);

-- ACTIVITIES
DROP POLICY IF EXISTS "allow_all_activities" ON activities;
CREATE POLICY "allow_all_activities" ON activities FOR ALL USING (true) WITH CHECK (true);

-- BUDGET_CHAPTERS
DROP POLICY IF EXISTS "allow_all_budget_chapters" ON budget_chapters;
CREATE POLICY "allow_all_budget_chapters" ON budget_chapters FOR ALL USING (true) WITH CHECK (true);

-- EXPENSES
DROP POLICY IF EXISTS "allow_all_expenses" ON expenses;
CREATE POLICY "allow_all_expenses" ON expenses FOR ALL USING (true) WITH CHECK (true);

-- RISKS
DROP POLICY IF EXISTS "allow_all_risks" ON risks;
CREATE POLICY "allow_all_risks" ON risks FOR ALL USING (true) WITH CHECK (true);

-- REVISIONS
DROP POLICY IF EXISTS "allow_all_revisions" ON revisions;
CREATE POLICY "allow_all_revisions" ON revisions FOR ALL USING (true) WITH CHECK (true);

-- ANNUAL_WORK_PLAN_ITEMS
DROP POLICY IF EXISTS "allow_all_annual_work_plan_items" ON annual_work_plan_items;
CREATE POLICY "allow_all_annual_work_plan_items" ON annual_work_plan_items FOR ALL USING (true) WITH CHECK (true);

-- MONITORING_HISTORY
DROP POLICY IF EXISTS "allow_all_monitoring_history" ON monitoring_history;
CREATE POLICY "allow_all_monitoring_history" ON monitoring_history FOR ALL USING (true) WITH CHECK (true);

-- ============================================
-- GRANT PERMISSIONS
-- ============================================

GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- ============================================
-- DONE!
-- ============================================

