-- Add missing columns to risk_projects table
-- These fields are used in the UI but weren't in the original schema

ALTER TABLE risk_projects 
ADD COLUMN IF NOT EXISTS manager VARCHAR(255),
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS status VARCHAR(50) DEFAULT 'Aktif';

-- Update existing records to have default status if null
UPDATE risk_projects SET status = 'Aktif' WHERE status IS NULL;

