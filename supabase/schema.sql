-- ============================================
-- SUPABASE SCHEMA WITH RLS FOR MULTI-TENANT
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

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

-- ============================================
-- UNITS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS units (
  unit_id VARCHAR(50) PRIMARY KEY,
  unit_name VARCHAR(255) NOT NULL,
  unit_code VARCHAR(50) NOT NULL,
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'aktif',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(unit_code, company_id)
);

CREATE INDEX idx_units_company ON units(company_id);

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS users (
  user_id VARCHAR(50) PRIMARY KEY,
  full_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  role_id VARCHAR(50) NOT NULL,
  unit_id VARCHAR(50) REFERENCES units(unit_id) ON DELETE SET NULL,
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  status VARCHAR(20) DEFAULT 'aktif',
  must_change_password BOOLEAN DEFAULT false,
  last_login_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_email ON users(email);

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
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_strategic_areas_company ON strategic_areas(company_id);

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
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_strategic_objectives_company ON strategic_objectives(company_id);
CREATE INDEX idx_strategic_objectives_area ON strategic_objectives(strategic_area_id);

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
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_targets_company ON targets(company_id);
CREATE INDEX idx_targets_objective ON targets(objective_id);

-- ============================================
-- INDICATORS
-- ============================================
CREATE TABLE IF NOT EXISTS indicators (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  target_id VARCHAR(50) REFERENCES targets(id) ON DELETE CASCADE,
  unit_of_measure VARCHAR(100),
  target_value NUMERIC,
  actual_value NUMERIC,
  frequency VARCHAR(50),
  responsible_unit VARCHAR(255),
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_indicators_company ON indicators(company_id);
CREATE INDEX idx_indicators_target ON indicators(target_id);

-- ============================================
-- ACTIVITIES
-- ============================================
CREATE TABLE IF NOT EXISTS activities (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  indicator_id VARCHAR(50) REFERENCES indicators(id) ON DELETE CASCADE,
  responsible_unit VARCHAR(255),
  planned_budget NUMERIC DEFAULT 0,
  actual_budget NUMERIC DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'Planlandı',
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_activities_company ON activities(company_id);
CREATE INDEX idx_activities_indicator ON activities(indicator_id);

-- ============================================
-- BUDGET CHAPTERS
-- ============================================
CREATE TABLE IF NOT EXISTS budget_chapters (
  id VARCHAR(50) PRIMARY KEY,
  code VARCHAR(50) NOT NULL,
  name VARCHAR(255) NOT NULL,
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_budget_chapters_company ON budget_chapters(company_id);

-- ============================================
-- EXPENSES
-- ============================================
CREATE TABLE IF NOT EXISTS expenses (
  id VARCHAR(50) PRIMARY KEY,
  budget_chapter_id VARCHAR(50) REFERENCES budget_chapters(id) ON DELETE SET NULL,
  activity_id VARCHAR(50) REFERENCES activities(id) ON DELETE SET NULL,
  description TEXT,
  amount NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  expense_date DATE,
  status VARCHAR(50) DEFAULT 'Beklemede',
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_expenses_company ON expenses(company_id);
CREATE INDEX idx_expenses_chapter ON expenses(budget_chapter_id);
CREATE INDEX idx_expenses_activity ON expenses(activity_id);

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
  score INTEGER GENERATED ALWAYS AS (probability * impact) STORED,
  status VARCHAR(50) DEFAULT 'Aktif',
  responsible VARCHAR(255),
  related_record_type VARCHAR(100),
  related_record_id VARCHAR(50),
  company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_risks_company ON risks(company_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
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

-- ============================================
-- RLS POLICIES: Companies
-- ============================================
CREATE POLICY "Users can view all companies"
ON companies FOR SELECT
USING (true);

-- ============================================
-- RLS POLICIES: Units
-- ============================================
CREATE POLICY "Users see own company units"
ON units FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)::text
  )
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)::text
    AND role_id = 'admin'
  )
);

-- ============================================
-- RLS POLICIES: Users
-- ============================================
CREATE POLICY "Users see own company users"
ON users FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)::text
  )
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)::text
    AND role_id = 'admin'
  )
);

-- ============================================
-- RLS POLICIES: Strategic Areas
-- ============================================
CREATE POLICY "Users see own company strategic areas"
ON strategic_areas FOR SELECT
USING (
  company_id IN (
    SELECT company_id FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)::text
  )
  OR EXISTS (
    SELECT 1 FROM users 
    WHERE user_id = current_setting('app.current_user_id', true)::text
    AND role_id = 'admin'
  )
);

-- Similar policies for other tables...
-- (We'll create a helper function to simplify this)

-- ============================================
-- HELPER FUNCTION: Check if user is admin
-- ============================================
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

-- ============================================
-- HELPER FUNCTION: Get user company
-- ============================================
CREATE OR REPLACE FUNCTION get_user_company(user_id_param TEXT)
RETURNS VARCHAR(50) AS $$
BEGIN
  RETURN (SELECT company_id FROM users WHERE user_id = user_id_param);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- SIMPLIFIED RLS POLICIES (using functions)
-- ============================================

-- Drop old policies and create simplified ones
DROP POLICY IF EXISTS "Users see own company units" ON units;
DROP POLICY IF EXISTS "Users see own company users" ON users;
DROP POLICY IF EXISTS "Users see own company strategic areas" ON strategic_areas;

-- Units: Users see own company OR admin sees all
CREATE POLICY "company_filter_units"
ON units FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Users: Users see own company OR admin sees all
CREATE POLICY "company_filter_users"
ON users FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Strategic Areas: Users see own company OR admin sees all
CREATE POLICY "company_filter_strategic_areas"
ON strategic_areas FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Strategic Objectives
CREATE POLICY "company_filter_strategic_objectives"
ON strategic_objectives FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Targets
CREATE POLICY "company_filter_targets"
ON targets FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Indicators
CREATE POLICY "company_filter_indicators"
ON indicators FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Activities
CREATE POLICY "company_filter_activities"
ON activities FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Budget Chapters
CREATE POLICY "company_filter_budget_chapters"
ON budget_chapters FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Expenses
CREATE POLICY "company_filter_expenses"
ON expenses FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Risks
CREATE POLICY "company_filter_risks"
ON risks FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- INSERT POLICIES (Users can insert their own company data)
-- ============================================

CREATE POLICY "company_insert_units"
ON units FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_strategic_areas"
ON strategic_areas FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Add similar INSERT policies for other tables...

-- ============================================
-- UPDATE POLICIES
-- ============================================

CREATE POLICY "company_update_units"
ON units FOR UPDATE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Add similar UPDATE policies for other tables...

-- ============================================
-- DELETE POLICIES
-- ============================================

CREATE POLICY "company_delete_units"
ON units FOR DELETE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- Add similar DELETE policies for other tables...

