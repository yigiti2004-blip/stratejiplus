-- Add Company/Tenant Support to Database
-- Run this in pgAdmin Query Tool on stratejiplus database

-- Add company_id to units table
ALTER TABLE units ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_units_company ON units(company_id);

-- Add company_id to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company_id);

-- Add company_id to strategic_areas
ALTER TABLE strategic_areas ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_strategic_areas_company ON strategic_areas(company_id);

-- Add company_id to strategic_objectives
ALTER TABLE strategic_objectives ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_objectives_company ON strategic_objectives(company_id);

-- Add company_id to targets
ALTER TABLE targets ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_targets_company ON targets(company_id);

-- Add company_id to indicators
ALTER TABLE indicators ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_indicators_company ON indicators(company_id);

-- Add company_id to activities
ALTER TABLE activities ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_activities_company ON activities(company_id);

-- Add company_id to risks
ALTER TABLE risks ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_risks_company ON risks(company_id);

-- Add company_id to expenses
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_expenses_company ON expenses(company_id);

-- Add company_id to budget_chapters
ALTER TABLE budget_chapters ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_budget_chapters_company ON budget_chapters(company_id);

-- Add company_id to revisions
ALTER TABLE revisions ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_revisions_company ON revisions(company_id);

-- Add company_id to annual_work_plan_items
ALTER TABLE annual_work_plan_items ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_annual_work_plan_company ON annual_work_plan_items(company_id);

-- Add company_id to risk_action_plans
ALTER TABLE risk_action_plans ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_risk_action_plans_company ON risk_action_plans(company_id);

-- Add company_id to risk_monitoring_logs
ALTER TABLE risk_monitoring_logs ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_risk_monitoring_logs_company ON risk_monitoring_logs(company_id);

-- Add company_id to risk_projects
ALTER TABLE risk_projects ADD COLUMN IF NOT EXISTS company_id VARCHAR(50) NOT NULL DEFAULT 'company-a';
CREATE INDEX IF NOT EXISTS idx_risk_projects_company ON risk_projects(company_id);

