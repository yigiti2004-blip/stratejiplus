-- ============================================
-- ADD MISSING COLUMNS TO annual_work_plan_items
-- Run this in Supabase SQL Editor
-- ============================================

-- Add source_type column if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'annual_work_plan_items' AND column_name = 'source_type') THEN
    ALTER TABLE annual_work_plan_items ADD COLUMN source_type VARCHAR(50) DEFAULT 'yıla-özgü';
  END IF;
END $$;

-- Add responsible_unit column if not exists
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'annual_work_plan_items' AND column_name = 'responsible_unit') THEN
    ALTER TABLE annual_work_plan_items ADD COLUMN responsible_unit VARCHAR(255);
  END IF;
END $$;

-- Add period column for recurring activities (kurumsal-süreklilik)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'annual_work_plan_items' AND column_name = 'period') THEN
    ALTER TABLE annual_work_plan_items ADD COLUMN period VARCHAR(50) DEFAULT 'her-yıl';
  END IF;
END $$;

-- Add work_name column for storing the display name
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'annual_work_plan_items' AND column_name = 'work_name') THEN
    ALTER TABLE annual_work_plan_items ADD COLUMN work_name VARCHAR(500);
  END IF;
END $$;

-- Create index for source_type to speed up filtering
CREATE INDEX IF NOT EXISTS idx_annual_work_plan_source_type ON annual_work_plan_items(source_type);

-- Create index for year to speed up year-based queries
CREATE INDEX IF NOT EXISTS idx_annual_work_plan_year ON annual_work_plan_items(year);

-- ============================================
-- DONE!
-- ============================================
SELECT 'Annual work plan items table updated successfully!' as result;
