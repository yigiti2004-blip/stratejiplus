-- ============================================
-- SUPABASE IMPORT FILE - CLEAN VERSION
-- Ready to paste into Supabase SQL Editor
-- ============================================
-- Generated: 2025-12-13
-- Database: stratejiplus
-- ============================================

-- Enable UUID extension (if needed)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- FUNCTIONS
-- ============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TABLES
-- ============================================

-- Companies table
CREATE TABLE IF NOT EXISTS public.companies (
    company_id VARCHAR(50) PRIMARY KEY,
    company_name VARCHAR(255) NOT NULL,
    company_code VARCHAR(50) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Units table
CREATE TABLE IF NOT EXISTS public.units (
    unit_id VARCHAR(50) PRIMARY KEY,
    unit_name VARCHAR(255) NOT NULL,
    unit_code VARCHAR(50) NOT NULL,
    company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
    status VARCHAR(20) DEFAULT 'aktif',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(unit_code, company_id)
);

CREATE INDEX IF NOT EXISTS idx_units_company ON units(company_id);

-- Users table
CREATE TABLE IF NOT EXISTS public.users (
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

CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Strategic Areas
CREATE TABLE IF NOT EXISTS public.strategic_areas (
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

CREATE INDEX IF NOT EXISTS idx_strategic_areas_company ON strategic_areas(company_id);

-- Strategic Objectives
CREATE TABLE IF NOT EXISTS public.strategic_objectives (
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

CREATE INDEX IF NOT EXISTS idx_strategic_objectives_company ON strategic_objectives(company_id);
CREATE INDEX IF NOT EXISTS idx_strategic_objectives_area ON strategic_objectives(strategic_area_id);

-- Targets
CREATE TABLE IF NOT EXISTS public.targets (
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

CREATE INDEX IF NOT EXISTS idx_targets_company ON targets(company_id);
CREATE INDEX IF NOT EXISTS idx_targets_objective ON targets(objective_id);

-- Indicators
CREATE TABLE IF NOT EXISTS public.indicators (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    target_id VARCHAR(50) REFERENCES targets(id) ON DELETE CASCADE,
    target_value NUMERIC(15,2),
    actual_value NUMERIC(15,2) DEFAULT 0,
    unit VARCHAR(50),
    measurement_type VARCHAR(50),
    company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_indicators_company ON indicators(company_id);
CREATE INDEX IF NOT EXISTS idx_indicators_target ON indicators(target_id);

-- Activities
CREATE TABLE IF NOT EXISTS public.activities (
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

CREATE INDEX IF NOT EXISTS idx_activities_company ON activities(company_id);
CREATE INDEX IF NOT EXISTS idx_activities_indicator ON activities(indicator_id);

-- Budget Chapters
CREATE TABLE IF NOT EXISTS public.budget_chapters (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    annual_budget NUMERIC(15,2) DEFAULT 0,
    company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_budget_chapters_company ON budget_chapters(company_id);

-- Expenses
CREATE TABLE IF NOT EXISTS public.expenses (
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

CREATE INDEX IF NOT EXISTS idx_expenses_company ON expenses(company_id);
CREATE INDEX IF NOT EXISTS idx_expenses_chapter ON expenses(budget_chapter_id);
CREATE INDEX IF NOT EXISTS idx_expenses_activity ON expenses(activity_id);

-- Risks
CREATE TABLE IF NOT EXISTS public.risks (
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

CREATE INDEX IF NOT EXISTS idx_risks_company ON risks(company_id);

-- Annual Work Plan Items
CREATE TABLE IF NOT EXISTS public.annual_work_plan_items (
    id VARCHAR(50) PRIMARY KEY,
    work_name VARCHAR(500) NOT NULL,
    year INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    responsible_unit VARCHAR(255),
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('stratejik-plan', 'yıla-özgü')),
    source_id VARCHAR(50),
    description TEXT,
    company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_annual_work_plan_company ON annual_work_plan_items(company_id);

-- Revisions
CREATE TABLE IF NOT EXISTS public.revisions (
    id VARCHAR(50) PRIMARY KEY,
    revision_type VARCHAR(50) NOT NULL,
    reason VARCHAR(255),
    description TEXT,
    status VARCHAR(50) DEFAULT 'Beklemede',
    company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_revisions_company ON revisions(company_id);

-- Risk Projects
CREATE TABLE IF NOT EXISTS public.risk_projects (
    id VARCHAR(50) PRIMARY KEY,
    risk_id VARCHAR(50) REFERENCES risks(id) ON DELETE CASCADE,
    project_name VARCHAR(255) NOT NULL,
    description TEXT,
    company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_projects_company ON risk_projects(company_id);

-- Risk Action Plans
CREATE TABLE IF NOT EXISTS public.risk_action_plans (
    id VARCHAR(50) PRIMARY KEY,
    risk_id VARCHAR(50) REFERENCES risks(id) ON DELETE CASCADE,
    action_description TEXT NOT NULL,
    responsible VARCHAR(255),
    due_date DATE,
    status VARCHAR(50) DEFAULT 'Planlandı',
    company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_action_plans_company ON risk_action_plans(company_id);

-- Risk Monitoring Logs
CREATE TABLE IF NOT EXISTS public.risk_monitoring_logs (
    id VARCHAR(50) PRIMARY KEY,
    risk_id VARCHAR(50) REFERENCES risks(id) ON DELETE CASCADE,
    monitoring_date DATE NOT NULL,
    notes TEXT,
    company_id VARCHAR(50) NOT NULL REFERENCES companies(company_id) ON DELETE RESTRICT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_risk_monitoring_logs_company ON risk_monitoring_logs(company_id);

-- ============================================
-- ROW LEVEL SECURITY (RLS)
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
ALTER TABLE annual_work_plan_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE revisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_action_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_monitoring_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================

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

-- ============================================
-- RLS POLICIES: Companies
-- ============================================
CREATE POLICY "Users can view all companies"
ON companies FOR SELECT
USING (true);

-- ============================================
-- RLS POLICIES: Units
-- ============================================
CREATE POLICY "company_filter_units"
ON units FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_units"
ON units FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_update_units"
ON units FOR UPDATE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_delete_units"
ON units FOR DELETE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Users
-- ============================================
CREATE POLICY "company_filter_users"
ON users FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_users"
ON users FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_update_users"
ON users FOR UPDATE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Strategic Areas
-- ============================================
CREATE POLICY "company_filter_strategic_areas"
ON strategic_areas FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_strategic_areas"
ON strategic_areas FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_update_strategic_areas"
ON strategic_areas FOR UPDATE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_delete_strategic_areas"
ON strategic_areas FOR DELETE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Strategic Objectives
-- ============================================
CREATE POLICY "company_filter_strategic_objectives"
ON strategic_objectives FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_strategic_objectives"
ON strategic_objectives FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_update_strategic_objectives"
ON strategic_objectives FOR UPDATE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Targets
-- ============================================
CREATE POLICY "company_filter_targets"
ON targets FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_targets"
ON targets FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_update_targets"
ON targets FOR UPDATE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Indicators
-- ============================================
CREATE POLICY "company_filter_indicators"
ON indicators FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_indicators"
ON indicators FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_update_indicators"
ON indicators FOR UPDATE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Activities
-- ============================================
CREATE POLICY "company_filter_activities"
ON activities FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_activities"
ON activities FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_update_activities"
ON activities FOR UPDATE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Budget Chapters
-- ============================================
CREATE POLICY "company_filter_budget_chapters"
ON budget_chapters FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_budget_chapters"
ON budget_chapters FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Expenses
-- ============================================
CREATE POLICY "company_filter_expenses"
ON expenses FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_expenses"
ON expenses FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Risks
-- ============================================
CREATE POLICY "company_filter_risks"
ON risks FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_risks"
ON risks FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_update_risks"
ON risks FOR UPDATE
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Annual Work Plan Items
-- ============================================
CREATE POLICY "company_filter_annual_work_plan_items"
ON annual_work_plan_items FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_annual_work_plan_items"
ON annual_work_plan_items FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Revisions
-- ============================================
CREATE POLICY "company_filter_revisions"
ON revisions FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_revisions"
ON revisions FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Risk Projects
-- ============================================
CREATE POLICY "company_filter_risk_projects"
ON risk_projects FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_risk_projects"
ON risk_projects FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Risk Action Plans
-- ============================================
CREATE POLICY "company_filter_risk_action_plans"
ON risk_action_plans FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_risk_action_plans"
ON risk_action_plans FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- RLS POLICIES: Risk Monitoring Logs
-- ============================================
CREATE POLICY "company_filter_risk_monitoring_logs"
ON risk_monitoring_logs FOR SELECT
USING (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

CREATE POLICY "company_insert_risk_monitoring_logs"
ON risk_monitoring_logs FOR INSERT
WITH CHECK (
  company_id = get_user_company(current_setting('app.current_user_id', true)::text)
  OR is_admin(current_setting('app.current_user_id', true)::text)
);

-- ============================================
-- VERIFICATION QUERIES (Optional)
-- ============================================
-- After import, run these to verify:
-- 
-- Check tables:
-- SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;
-- 
-- Check RLS status:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- 
-- Check policies:
-- SELECT tablename, policyname FROM pg_policies WHERE schemaname = 'public';

