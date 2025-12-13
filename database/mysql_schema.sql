-- ============================================
-- StratejiPlus MySQL/MariaDB Schema
-- Compatible with phpMyAdmin
-- ============================================

-- ============================================
-- CORE IDENTITY & ORGANIZATION
-- ============================================

CREATE TABLE IF NOT EXISTS units (
    unit_id VARCHAR(50) PRIMARY KEY,
    unit_name VARCHAR(255) NOT NULL,
    unit_code VARCHAR(50) NOT NULL,
    parent_unit_id VARCHAR(50) NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_unit_code (unit_code),
    KEY idx_units_parent (parent_unit_id),
    KEY idx_units_status (status),
    CONSTRAINT fk_units_parent FOREIGN KEY (parent_unit_id) REFERENCES units(unit_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE IF NOT EXISTS users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role_id VARCHAR(50) NOT NULL DEFAULT 'user',
    unit_id VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif',
    must_change_password TINYINT(1) NOT NULL DEFAULT 0,
    last_login_date TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_email (email),
    KEY idx_users_unit (unit_id),
    KEY idx_users_role (role_id),
    KEY idx_users_status (status),
    CONSTRAINT fk_users_unit FOREIGN KEY (unit_id) REFERENCES units(unit_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- STRATEGIC PLANNING HIERARCHY
-- ============================================

CREATE TABLE IF NOT EXISTS strategic_areas (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    organization_id VARCHAR(50) NOT NULL,
    responsible_unit VARCHAR(255) NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code),
    KEY idx_strategic_areas_org (organization_id),
    CONSTRAINT fk_strategic_areas_org FOREIGN KEY (organization_id) REFERENCES units(unit_id) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS strategic_objectives (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    strategic_area_id VARCHAR(50) NOT NULL,
    responsible_unit VARCHAR(255) NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code),
    KEY idx_objectives_area (strategic_area_id),
    CONSTRAINT fk_objectives_area FOREIGN KEY (strategic_area_id) REFERENCES strategic_areas(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS targets (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    objective_id VARCHAR(50) NOT NULL,
    start_year INT NOT NULL,
    end_year INT NOT NULL,
    responsible_unit VARCHAR(255) NULL,
    planned_start_date DATE NULL,
    planned_end_date DATE NULL,
    completion_percentage DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code),
    KEY idx_targets_objective (objective_id),
    KEY idx_targets_years (start_year, end_year),
    CONSTRAINT fk_targets_objective FOREIGN KEY (objective_id) REFERENCES strategic_objectives(id) ON DELETE CASCADE,
    CONSTRAINT chk_targets_years CHECK (end_year >= start_year)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS indicators (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    target_value DECIMAL(15,2) NULL,
    actual_value DECIMAL(15,2) DEFAULT 0,
    unit VARCHAR(50) NULL,
    measurement_type VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code),
    KEY idx_indicators_target (target_id),
    CONSTRAINT fk_indicators_target FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS activities (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    target_id VARCHAR(50) NOT NULL,
    planned_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    budget_chapter_id VARCHAR(50) NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Planlandı',
    responsible_unit VARCHAR(255) NULL,
    planned_start_date DATE NULL,
    planned_end_date DATE NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code),
    KEY idx_activities_target (target_id),
    KEY idx_activities_budget_chapter (budget_chapter_id),
    KEY idx_activities_status (status),
    CONSTRAINT fk_activities_target FOREIGN KEY (target_id) REFERENCES targets(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BUDGET MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS budget_chapters (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    annual_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY unique_code (code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add foreign key after budget_chapters is created
ALTER TABLE activities ADD CONSTRAINT fk_activities_budget_chapter 
    FOREIGN KEY (budget_chapter_id) REFERENCES budget_chapters(id) ON DELETE SET NULL;

CREATE TABLE IF NOT EXISTS expenses (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL,
    expense_date DATE NOT NULL,
    description TEXT NOT NULL,
    amount DECIMAL(15,2) NOT NULL,
    vat_rate DECIMAL(5,2) NOT NULL DEFAULT 0,
    total_amount DECIMAL(15,2) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Beklemede',
    budget_chapter_id VARCHAR(50) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_expenses_activity (activity_id),
    KEY idx_expenses_date (expense_date),
    KEY idx_expenses_status (status),
    KEY idx_expenses_budget_chapter (budget_chapter_id),
    CONSTRAINT fk_expenses_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE,
    CONSTRAINT fk_expenses_budget_chapter FOREIGN KEY (budget_chapter_id) REFERENCES budget_chapters(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- RISK MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS risks (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    probability INT NOT NULL,
    impact INT NOT NULL,
    score INT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aktif',
    linked_entity_type VARCHAR(50) NULL,
    linked_entity_id VARCHAR(50) NULL,
    responsible VARCHAR(255) NULL,
    target_date DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_risks_status (status),
    KEY idx_risks_linked_entity (linked_entity_type, linked_entity_id),
    KEY idx_risks_score (score),
    CONSTRAINT chk_risks_probability CHECK (probability >= 1 AND probability <= 5),
    CONSTRAINT chk_risks_impact CHECK (impact >= 1 AND impact <= 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS risk_action_plans (
    id VARCHAR(50) PRIMARY KEY,
    risk_id VARCHAR(50) NOT NULL,
    action_description TEXT NOT NULL,
    responsible_person VARCHAR(255) NULL,
    target_date DATE NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Planlandı',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_action_plans_risk (risk_id),
    KEY idx_action_plans_status (status),
    CONSTRAINT fk_action_plans_risk FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS risk_monitoring_logs (
    id VARCHAR(50) PRIMARY KEY,
    risk_id VARCHAR(50) NOT NULL,
    log_date DATE NOT NULL,
    notes TEXT NULL,
    updated_probability INT NULL,
    updated_impact INT NULL,
    recorded_by VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    KEY idx_monitoring_logs_risk (risk_id),
    KEY idx_monitoring_logs_date (log_date),
    CONSTRAINT fk_monitoring_logs_risk FOREIGN KEY (risk_id) REFERENCES risks(id) ON DELETE CASCADE,
    CONSTRAINT chk_logs_probability CHECK (updated_probability IS NULL OR (updated_probability >= 1 AND updated_probability <= 5)),
    CONSTRAINT chk_logs_impact CHECK (updated_impact IS NULL OR (updated_impact >= 1 AND updated_impact <= 5))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS risk_projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- REVISION MANAGEMENT
-- ============================================

CREATE TABLE IF NOT EXISTS revisions (
    revision_id VARCHAR(50) PRIMARY KEY,
    item_level VARCHAR(50) NOT NULL,
    item_id VARCHAR(50) NOT NULL,
    revision_type JSON NULL,
    revision_reason JSON NULL,
    before_state JSON NOT NULL,
    after_state JSON NOT NULL,
    proposed_by VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'draft',
    approved_by VARCHAR(255) NULL,
    approved_at TIMESTAMP NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_revisions_item (item_level, item_id),
    KEY idx_revisions_status (status),
    KEY idx_revisions_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- MONITORING & TRACKING
-- ============================================

CREATE TABLE IF NOT EXISTS activity_monitoring_records (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL,
    record_date DATE NOT NULL,
    indicator_values JSON NULL,
    budget_status TEXT NULL,
    recorded_by VARCHAR(255) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_monitoring_activity (activity_id),
    KEY idx_monitoring_date (record_date),
    CONSTRAINT fk_monitoring_activity FOREIGN KEY (activity_id) REFERENCES activities(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- ANNUAL WORK PLANNING
-- ============================================

CREATE TABLE IF NOT EXISTS annual_work_plan_items (
    id VARCHAR(50) PRIMARY KEY,
    work_name VARCHAR(500) NOT NULL,
    year INT NOT NULL,
    start_date DATE NULL,
    end_date DATE NULL,
    responsible_unit VARCHAR(255) NULL,
    source_type VARCHAR(50) NOT NULL,
    source_id VARCHAR(50) NULL,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    KEY idx_work_plan_year (year),
    KEY idx_work_plan_source (source_type, source_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

