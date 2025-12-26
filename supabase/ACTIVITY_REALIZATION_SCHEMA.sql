-- ============================================
-- ACTIVITY REALIZATION RECORDS TABLE
-- Immutable records for activity completion tracking
-- ============================================
CREATE TABLE IF NOT EXISTS activity_realization_records (
  id VARCHAR(50) PRIMARY KEY,
  activity_id VARCHAR(50) NOT NULL REFERENCES activities(id) ON DELETE CASCADE,
  record_date DATE NOT NULL,
  completion_percentage NUMERIC(5,2) NOT NULL CHECK (completion_percentage >= 0 AND completion_percentage <= 100),
  work_performed TEXT NOT NULL,
  expense_flag VARCHAR(20) NOT NULL DEFAULT 'No' CHECK (expense_flag IN ('Yes', 'No', 'No Budget Required')),
  detailed_description TEXT,
  evidence_url TEXT,
  evidence_file_name VARCHAR(255),
  outcome_note TEXT,
  created_by VARCHAR(50) NOT NULL REFERENCES users(user_id) ON DELETE RESTRICT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  company_id VARCHAR(50) REFERENCES companies(company_id) ON DELETE CASCADE
  -- Note: Records are immutable - updates and deletes are prevented at application level
);

CREATE INDEX IF NOT EXISTS idx_realization_records_activity ON activity_realization_records(activity_id);
CREATE INDEX IF NOT EXISTS idx_realization_records_company ON activity_realization_records(company_id);
CREATE INDEX IF NOT EXISTS idx_realization_records_date ON activity_realization_records(record_date);
CREATE INDEX IF NOT EXISTS idx_realization_records_created_by ON activity_realization_records(created_by);

-- Enable RLS
ALTER TABLE activity_realization_records ENABLE ROW LEVEL SECURITY;

-- RLS Policies: All authenticated users can read, only authorized users can insert
DROP POLICY IF EXISTS "allow_read_realization_records" ON activity_realization_records;
CREATE POLICY "allow_read_realization_records" ON activity_realization_records 
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "allow_insert_realization_records" ON activity_realization_records;
CREATE POLICY "allow_insert_realization_records" ON activity_realization_records 
  FOR INSERT WITH CHECK (true); -- Authorization checked at application level

-- Grant permissions
GRANT ALL ON activity_realization_records TO anon;
GRANT ALL ON activity_realization_records TO authenticated;

-- ============================================
-- HELPER FUNCTION: Calculate Activity Realization Rate
-- ============================================
CREATE OR REPLACE FUNCTION calculate_activity_realization(activity_id_param VARCHAR(50))
RETURNS NUMERIC AS $$
DECLARE
  avg_completion NUMERIC;
BEGIN
  SELECT COALESCE(AVG(completion_percentage), 0)
  INTO avg_completion
  FROM activity_realization_records
  WHERE activity_id = activity_id_param;
  
  RETURN COALESCE(avg_completion, 0);
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- HELPER FUNCTION: Check if user can add realization record
-- ============================================
CREATE OR REPLACE FUNCTION can_user_add_realization(
  user_id_param VARCHAR(50),
  activity_id_param VARCHAR(50)
)
RETURNS BOOLEAN AS $$
DECLARE
  user_role VARCHAR(50);
  user_unit_id VARCHAR(50);
  activity_responsible_unit VARCHAR(255);
  is_responsible BOOLEAN;
BEGIN
  -- Get user role and unit
  SELECT role_id, unit_id INTO user_role, user_unit_id
  FROM users
  WHERE user_id = user_id_param;
  
  -- Check if admin
  IF user_role = 'admin' THEN
    RETURN true;
  END IF;
  
  -- Get activity responsible unit
  SELECT responsible_unit INTO activity_responsible_unit
  FROM activities
  WHERE id = activity_id_param;
  
  -- Check if user's unit matches activity responsible unit
  IF user_unit_id IS NOT NULL AND activity_responsible_unit IS NOT NULL THEN
    -- Get unit name from units table
    SELECT EXISTS(
      SELECT 1 FROM units u
      WHERE u.unit_id = user_unit_id
      AND u.unit_name = activity_responsible_unit
    ) INTO is_responsible;
    
    IF is_responsible THEN
      RETURN true;
    END IF;
  END IF;
  
  -- TODO: Check if user is listed as Activity Responsible (requires responsible_persons field)
  -- For now, return false if not admin and unit doesn't match
  RETURN false;
END;
$$ LANGUAGE plpgsql;

