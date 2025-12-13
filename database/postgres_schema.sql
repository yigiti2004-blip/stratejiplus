-- ============================================
-- StratejiPlus PostgreSQL Schema
-- Compatible with pgAdmin
-- ============================================

-- ============================================
-- CORE IDENTITY & ORGANIZATION
-- ============================================

CREATE TABLE IF NOT EXISTS units (
    unit_id VARCHAR(50) PRIMARY KEY,
    unit_name VARCHAR(255) NOT NULL,
    unit_code VARCHAR(50) NOT NULL UNIQUE,
    parent_unit_id VARCHAR(50) REFERENCES units(unit_id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'pasif')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_units_parent ON units(parent_unit_id);
CREATE INDEX idx_units_status ON units(status);

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role_id VARCHAR(50) NOT NULL DEFAULT 'user' CHECK (role_id IN ('admin', 'unit-manager', 'user', 'view-only')),
    unit_id VARCHAR(50) NOT NULL REFERENCES units(unit_id) ON DELETE RESTRICT,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'pasif')),
    must_change_password BOOLEAN NOT NULL DEFAULT FALSE,
    last_login_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_unit ON users(unit_id);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_status ON users(status);

-- ============================================
-- STRATEGIC PLANNING HIERARCHY
-- ============================================

CREATE TABLE IF NOT EXISTS strategic_areas (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(500) NOT NULL,
    organization_id VARCHAR(50) NOT NULL REFERENCES units(unit_id) ON DELETE RESTRICT,
    responsible_unit VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_strategic_areas_org ON strategic_areas(organization_id);
CREATE INDEX idx_strategic_areas_code ON strategic_areas(code);

CREATE TABLE IF NOT EXISTS strategic_objectives (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(500) NOT NULL,
    strategic_area_id VARCHAR(50) NOT NULL REFERENCES strategic_areas(id) ON DELETE CASCADE,
    responsible_unit VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_objectives_area ON strategic_objectives(strategic_area_id);
CREATE INDEX idx_objectives_code ON strategic_objectives(code);

CREATE TABLE IF NOT EXISTS targets (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(500) NOT NULL,
    objective_id VARCHAR(50) NOT NULL REFERENCES strategic_objectives(id) ON DELETE CASCADE,
    start_year INTEGER NOT NULL,
    end_year INTEGER NOT NULL,
    responsible_unit VARCHAR(255),
    planned_start_date DATE,
    planned_end_date DATE,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CHECK (end_year >= start_year)
);

CREATE INDEX idx_targets_objective ON targets(objective_id);
CREATE INDEX idx_targets_code ON targets(code);
CREATE INDEX idx_targets_years ON targets(start_year, end_year);

CREATE TABLE IF NOT EXISTS indicators (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(500) NOT NULL,
    target_id VARCHAR(50) NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    target_value DECIMAL(15,2),
    actual_value DECIMAL(15,2) DEFAULT 0,
    unit VARCHAR(50),
    measurement_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_indicators_target ON indicators(target_id);
CREATE INDEX idx_indicators_code ON indicators(code);

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(500) NOT NULL,
    target_id VARCHAR(50) NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    planned_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    budget_chapter_id VARCHAR(50) REFERENCES budget_chapters(id) ON DELETE SET NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Planlandı',
    responsible_unit VARCHAR(255),
    planned_start_date DATE,
    planned_end_date DATE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_activities_target ON activities(target_id);
CREATE INDEX idx_activities_code ON activities(code);
CREATE INDEX idx_activities_budget_chapter ON activities(budget_chapter_id);
CREATE INDEX idx_activities_status ON activities(status);

-- ============================================
-- BUDGET MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS budget_chapters (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    annual_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budget_chapters_code ON budget_chapters(code);

CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Beklemede' CHECK (status IN ('Beklemede', 'Onaylandı', 'Reddedildi')),
    budget_chapter_id VARCHAR(50) REFERENCES budget_chapters(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_expenses_activity ON expenses(activity_id);
CREATE INDEX idx_expenses_date ON expenses(expense_date);
CREATE INDEX idx_expenses_status ON expenses(status);
CREATE INDEX idx_expenses_budget_chapter ON expenses(budget_chapter_id);

-- ============================================
-- RISK MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS risks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    probability INTEGER NOT NULL CHECK (probability >= 1 AND probability <= 5),
    impact INTEGER NOT NULL CHECK (impact >= 1 AND impact <= 5),
    score INTEGER NOT NULL GENERATED ALWAYS AS (probability * impact) STORED,
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif' CHECK (status IN ('Aktif', 'Pasif', 'Kapatıldı')),
    linked_entity_type VARCHAR(50) CHECK (linked_entity_type IN ('Stratejik Alan', 'Amaç', 'Hedef', 'Gösterge', 'Faaliyet')),
    linked_entity_id VARCHAR(50),
    responsible VARCHAR(255),
    target_date DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_risks_status ON risks(status);
CREATE INDEX idx_risks_linked_entity ON risks(linked_entity_type, linked_entity_id);
CREATE INDEX idx_risks_score ON risks(score);

CREATE TABLE IF NOT EXISTS risk_action_plans (
    id VARCHAR(50) PRIMARY KEY,
    risk_id VARCHAR(50) NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    action_description TEXT NOT NULL,
    responsible_person VARCHAR(255),
    target_date DATE,
    status VARCHAR(50) NOT NULL DEFAULT 'Planlandı',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_action_plans_risk ON risk_action_plans(risk_id);
CREATE INDEX idx_action_plans_status ON risk_action_plans(status);

CREATE TABLE IF NOT EXISTS risk_monitoring_logs (
    id VARCHAR(50) PRIMARY KEY,
    risk_id VARCHAR(50) NOT NULL REFERENCES risks(id) ON DELETE CASCADE,
    log_date DATE NOT NULL,
    notes TEXT,
    updated_probability INTEGER CHECK (updated_probability >= 1 AND updated_probability <= 5),
    updated_impact INTEGER CHECK (updated_impact >= 1 AND updated_impact <= 5),
    recorded_by VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monitoring_logs_risk ON risk_monitoring_logs(risk_id);
CREATE INDEX idx_monitoring_logs_date ON risk_monitoring_logs(log_date);

CREATE TABLE IF NOT EXISTS risk_projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REVISION MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS revisions (
    revision_id VARCHAR(50) PRIMARY KEY,
    item_level VARCHAR(50) NOT NULL CHECK (item_level IN ('Alan', 'Amaç', 'Hedef', 'Gösterge', 'Faaliyet', 'Bütçe & Fasıl')),
    item_id VARCHAR(50) NOT NULL,
    revision_type JSONB,
    revision_reason JSONB,
    before_state JSONB NOT NULL,
    after_state JSONB NOT NULL,
    proposed_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'applied')),
    approved_by VARCHAR(255),
    approved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_revisions_item ON revisions(item_level, item_id);
CREATE INDEX idx_revisions_status ON revisions(status);
CREATE INDEX idx_revisions_created ON revisions(created_at DESC);

-- ============================================
-- MONITORING & TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS activity_monitoring_records (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    indicator_values JSONB,
    budget_status TEXT,
    recorded_by VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_monitoring_activity ON activity_monitoring_records(activity_id);
CREATE INDEX idx_monitoring_date ON activity_monitoring_records(record_date DESC);

-- ============================================
-- ANNUAL WORK PLANNING
-- ============================================

CREATE TABLE IF NOT EXISTS annual_work_plan_items (
    id VARCHAR(50) PRIMARY KEY,
    work_name VARCHAR(500) NOT NULL,
    year INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    responsible_unit VARCHAR(255),
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('stratejik-plan', 'yıla-özgü')),
    source_id VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_work_plan_year ON annual_work_plan_items(year);
CREATE INDEX idx_work_plan_source ON annual_work_plan_items(source_type, source_id);

-- ============================================
-- TRIGGERS FOR UPDATED_AT
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables with updated_at
CREATE TRIGGER update_units_updated_at BEFORE UPDATE ON units FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategic_areas_updated_at BEFORE UPDATE ON strategic_areas FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_strategic_objectives_updated_at BEFORE UPDATE ON strategic_objectives FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_targets_updated_at BEFORE UPDATE ON targets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_indicators_updated_at BEFORE UPDATE ON indicators FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activities_updated_at BEFORE UPDATE ON activities FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_budget_chapters_updated_at BEFORE UPDATE ON budget_chapters FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risks_updated_at BEFORE UPDATE ON risks FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_risk_action_plans_updated_at BEFORE UPDATE ON risk_action_plans FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_revisions_updated_at BEFORE UPDATE ON revisions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_activity_monitoring_records_updated_at BEFORE UPDATE ON activity_monitoring_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_annual_work_plan_items_updated_at BEFORE UPDATE ON annual_work_plan_items FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

