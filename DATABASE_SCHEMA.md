# PostgreSQL Database Schema Design
## StratejiPlus - Strategic Performance Management System

---

## 1. Entities Identified

Based on codebase analysis, the following entities were identified:

- **Users** - System users with roles and unit assignments
- **Units** - Organizational units/departments (hierarchical)
- **Roles** - User roles with permissions (currently static, stored as JSON)
- **Strategic Areas** - Top-level strategic planning areas
- **Strategic Objectives** - Objectives within strategic areas
- **Targets** - Specific targets under objectives
- **Indicators** - Performance indicators linked to targets
- **Activities** - Operational activities linked to targets
- **Budget Chapters** - Budget classification chapters
- **Expenses** - Actual expenses linked to activities
- **Risks** - Risk management records
- **Risk Action Plans** - Action plans for risk mitigation (embedded in risks currently)
- **Risk Monitoring Logs** - Monitoring entries for risks (embedded in risks currently)
- **Risk Projects** - Risk-related projects
- **Revisions** - Change requests/revisions to strategic plan items
- **Activity Monitoring Records** - Progress tracking records for activities
- **Annual Work Plan Items** - Year-specific work items (can be from SP or standalone)

---

## 2. Initial PostgreSQL Schema (v1)

```sql
-- ============================================
-- CORE IDENTITY & ORGANIZATION
-- ============================================

CREATE TABLE units (
    unit_id VARCHAR(50) PRIMARY KEY,
    unit_name VARCHAR(255) NOT NULL,
    unit_code VARCHAR(50) NOT NULL,
    parent_unit_id VARCHAR(50) REFERENCES units(unit_id) ON DELETE SET NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'aktif' CHECK (status IN ('aktif', 'pasif')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(unit_code)
);

CREATE INDEX idx_units_parent ON units(parent_unit_id);
CREATE INDEX idx_units_status ON units(status);

-- ============================================
-- USERS & AUTHENTICATION
-- ============================================

CREATE TABLE users (
    user_id VARCHAR(50) PRIMARY KEY,
    full_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL, -- Will store bcrypt hash
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

CREATE TABLE strategic_areas (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    organization_id VARCHAR(50) NOT NULL REFERENCES units(unit_id) ON DELETE RESTRICT,
    responsible_unit VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code)
);

CREATE INDEX idx_strategic_areas_org ON strategic_areas(organization_id);
CREATE INDEX idx_strategic_areas_code ON strategic_areas(code);

CREATE TABLE strategic_objectives (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    strategic_area_id VARCHAR(50) NOT NULL REFERENCES strategic_areas(id) ON DELETE CASCADE,
    responsible_unit VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code)
);

CREATE INDEX idx_objectives_area ON strategic_objectives(strategic_area_id);
CREATE INDEX idx_objectives_code ON strategic_objectives(code);

CREATE TABLE targets (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
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
    UNIQUE(code),
    CHECK (end_year >= start_year)
);

CREATE INDEX idx_targets_objective ON targets(objective_id);
CREATE INDEX idx_targets_code ON targets(code);
CREATE INDEX idx_targets_years ON targets(start_year, end_year);

CREATE TABLE indicators (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(500) NOT NULL,
    target_id VARCHAR(50) NOT NULL REFERENCES targets(id) ON DELETE CASCADE,
    target_value DECIMAL(15,2),
    actual_value DECIMAL(15,2) DEFAULT 0,
    unit VARCHAR(50),
    measurement_type VARCHAR(50),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code)
);

CREATE INDEX idx_indicators_target ON indicators(target_id);
CREATE INDEX idx_indicators_code ON indicators(code);

CREATE TABLE activities (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
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
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(code)
);

CREATE INDEX idx_activities_target ON activities(target_id);
CREATE INDEX idx_activities_code ON activities(code);
CREATE INDEX idx_activities_budget_chapter ON activities(budget_chapter_id);
CREATE INDEX idx_activities_status ON activities(status);

-- ============================================
-- BUDGET MANAGEMENT
-- ============================================

CREATE TABLE budget_chapters (
    id VARCHAR(50) PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    annual_budget DECIMAL(15,2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_budget_chapters_code ON budget_chapters(code);

CREATE TABLE expenses (
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

CREATE TABLE risks (
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

CREATE TABLE risk_action_plans (
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

CREATE TABLE risk_monitoring_logs (
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

CREATE TABLE risk_projects (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================
-- REVISION MANAGEMENT
-- ============================================

CREATE TABLE revisions (
    revision_id VARCHAR(50) PRIMARY KEY,
    item_level VARCHAR(50) NOT NULL CHECK (item_level IN ('Alan', 'Amaç', 'Hedef', 'Gösterge', 'Faaliyet', 'Bütçe & Fasıl')),
    item_id VARCHAR(50) NOT NULL,
    revision_type JSONB, -- {value: 'cancellation'|'modification', label: '...'}
    revision_reason JSONB, -- {value: '...', label: '...'}
    before_state JSONB NOT NULL, -- Snapshot of item before change
    after_state JSONB NOT NULL, -- Proposed new state
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

CREATE TABLE activity_monitoring_records (
    id VARCHAR(50) PRIMARY KEY,
    activity_id VARCHAR(50) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
    record_date DATE NOT NULL,
    indicator_values JSONB, -- {indicator_id: value, ...}
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

CREATE TABLE annual_work_plan_items (
    id VARCHAR(50) PRIMARY KEY,
    work_name VARCHAR(500) NOT NULL,
    year INTEGER NOT NULL,
    start_date DATE,
    end_date DATE,
    responsible_unit VARCHAR(255),
    source_type VARCHAR(50) NOT NULL CHECK (source_type IN ('stratejik-plan', 'yıla-özgü')),
    source_id VARCHAR(50), -- References activity.id if source_type='stratejik-plan', NULL if 'yıla-özgü'
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
```

---

## 3. Upgrade Path to Large Scale

### 3.1 Multi-Tenancy Support

**Add `company_id` to all tenant-scoped tables:**

```sql
-- Add company/tenant table
CREATE TABLE companies (
    company_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_name VARCHAR(255) NOT NULL,
    company_code VARCHAR(50) NOT NULL UNIQUE,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Add company_id to all tenant-scoped tables
ALTER TABLE units ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE users ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE strategic_areas ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE strategic_objectives ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE targets ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE indicators ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE activities ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE budget_chapters ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE expenses ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE risks ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE risk_action_plans ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE risk_monitoring_logs ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE risk_projects ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE revisions ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE activity_monitoring_records ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;
ALTER TABLE annual_work_plan_items ADD COLUMN company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE;

-- Create composite indexes with company_id
CREATE INDEX idx_units_company ON units(company_id, unit_id);
CREATE INDEX idx_users_company ON users(company_id, user_id);
CREATE INDEX idx_strategic_areas_company ON strategic_areas(company_id, id);
-- ... (similar for all tables)
```

### 3.2 Row-Level Security (RLS)

**Enable RLS and create policies:**

```sql
-- Enable RLS on all tenant tables
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
-- ... (all tenant tables)

-- Example policy for users table
CREATE POLICY users_company_isolation ON users
    FOR ALL
    USING (company_id = current_setting('app.current_company_id')::UUID);

-- Set company context in application (via connection parameter or session variable)
-- SET app.current_company_id = '...';
```

### 3.3 Performance Indexing for Scale

**Additional indexes for large datasets:**

```sql
-- Composite indexes for common query patterns
CREATE INDEX idx_activities_company_status ON activities(company_id, status);
CREATE INDEX idx_expenses_company_date ON expenses(company_id, expense_date DESC);
CREATE INDEX idx_risks_company_status_score ON risks(company_id, status, score DESC);
CREATE INDEX idx_monitoring_company_activity_date ON activity_monitoring_records(company_id, activity_id, record_date DESC);

-- Partial indexes for active records
CREATE INDEX idx_active_activities ON activities(company_id, id) WHERE status != 'İptal Edildi';
CREATE INDEX idx_active_risks ON risks(company_id, id) WHERE status = 'Aktif';

-- Full-text search indexes (if needed)
CREATE INDEX idx_strategic_areas_name_fts ON strategic_areas USING gin(to_tsvector('turkish', name));
CREATE INDEX idx_activities_name_fts ON activities USING gin(to_tsvector('turkish', name));
```

### 3.4 Table Partitioning

**Partition large tables by date/company:**

```sql
-- Partition expenses by year and company
CREATE TABLE expenses_2024 PARTITION OF expenses
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');

CREATE TABLE expenses_2025 PARTITION OF expenses
    FOR VALUES FROM ('2025-01-01') TO ('2026-01-01');

-- Partition activity_monitoring_records by year
CREATE TABLE monitoring_2024 PARTITION OF activity_monitoring_records
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

### 3.5 Encryption Readiness

**Mark sensitive columns for future encryption:**

```sql
-- Add encryption metadata (actual encryption implemented in application layer)
COMMENT ON COLUMN users.password_hash IS 'ENCRYPTED: bcrypt hash';
COMMENT ON COLUMN users.email IS 'ENCRYPTED: PII field';
COMMENT ON COLUMN expenses.description IS 'ENCRYPTED: May contain sensitive financial data';
```

### 3.6 Audit Logging

**Add audit trail table:**

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(company_id) ON DELETE CASCADE,
    user_id VARCHAR(50) REFERENCES users(user_id) ON DELETE SET NULL,
    table_name VARCHAR(100) NOT NULL,
    record_id VARCHAR(50) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('INSERT', 'UPDATE', 'DELETE')),
    old_values JSONB,
    new_values JSONB,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_company ON audit_logs(company_id, created_at DESC);
CREATE INDEX idx_audit_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_table_record ON audit_logs(table_name, record_id);
```

### 3.7 Soft Deletes

**Add soft delete support:**

```sql
-- Add deleted_at to all tables
ALTER TABLE units ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN deleted_at TIMESTAMP WITH TIME ZONE;
-- ... (all tables)

-- Create partial indexes excluding deleted records
CREATE INDEX idx_active_units ON units(company_id, unit_id) WHERE deleted_at IS NULL;
```

---

## 4. Assumptions Made

1. **Single Company Initially**: Schema assumes single-tenant initially, with clear upgrade path via `company_id` addition.

2. **Role System**: Roles are currently hardcoded in application (`admin`, `unit-manager`, `user`, `view-only`). Assumed they remain static for v1. Future: separate `roles` table with `role_permissions` junction table.

3. **Password Storage**: Assumed migration to bcrypt hashing. Current code stores plain text (development only).

4. **JSONB Usage**: Used JSONB for flexible fields (`before_state`, `after_state`, `indicator_values`) where structure may vary. Can be normalized later if patterns emerge.

5. **Code Uniqueness**: Assumed codes (SA1, A1.1, H1.1.1, etc.) are unique globally. If per-company uniqueness needed, add `company_id` to unique constraints.

6. **Revision Status Flow**: Assumed simple status flow: `draft → pending → approved/rejected → applied`. No complex workflow engine assumed.

7. **Risk Action Plans & Logs**: Currently embedded in risks as JSON arrays. Normalized to separate tables for better querying and scalability.

8. **Activity Monitoring**: `indicator_values` stored as JSONB mapping indicator IDs to values. Assumed flexible structure per activity.

9. **Annual Work Plans**: Assumed mix of strategic plan activities and standalone year-specific items. `source_type` distinguishes them.

10. **Unit Hierarchy**: Assumed simple parent-child relationship. No complex org chart features (matrix structures, multiple parents) assumed.

11. **No Time-Travel**: No versioning/history tables assumed. Revisions table tracks changes, but doesn't maintain full history of all fields.

12. **Turkish Language**: Field names and constraints use Turkish terms found in codebase (`aktif`, `pasif`, etc.). Application layer handles localization.

---

## Summary

This schema provides:
- ✅ **Minimal viable structure** matching current codebase behavior
- ✅ **Clear foreign key relationships** maintaining data integrity
- ✅ **Basic indexing** for common queries
- ✅ **Multi-tenancy ready** via `company_id` addition path
- ✅ **RLS ready** structure for row-level security
- ✅ **Partitioning ready** for time-series data
- ✅ **Audit ready** structure for compliance
- ✅ **Normalized** where appropriate, flexible (JSONB) where needed

The schema can scale from single-tenant to multi-tenant SaaS with minimal disruption by adding `company_id` columns and indexes.

