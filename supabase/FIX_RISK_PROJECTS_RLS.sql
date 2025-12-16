-- Fix RLS policies for risk_projects table
-- This allows inserts/updates/deletes for all users (matching the allow_all pattern used in COMPLETE_SCHEMA.sql)

-- Enable RLS if not already enabled
ALTER TABLE risk_projects ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "allow_all_risk_projects" ON risk_projects;
DROP POLICY IF EXISTS "company_filter_risk_projects" ON risk_projects;
DROP POLICY IF EXISTS "company_insert_risk_projects" ON risk_projects;
DROP POLICY IF EXISTS "company_update_risk_projects" ON risk_projects;
DROP POLICY IF EXISTS "company_delete_risk_projects" ON risk_projects;

-- Create allow_all policy (matching the pattern used for other tables)
CREATE POLICY "allow_all_risk_projects" ON risk_projects FOR ALL USING (true) WITH CHECK (true);

-- Grant permissions
GRANT ALL ON risk_projects TO anon;
GRANT ALL ON risk_projects TO authenticated;

