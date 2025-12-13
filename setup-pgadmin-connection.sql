-- pgAdmin Connection Setup Script
-- This file contains the connection details for pgAdmin

-- Connection Information:
-- Server Name: Local PostgreSQL
-- Host: localhost
-- Port: 5432
-- Maintenance Database: postgres
-- Username: yigitilseven
-- Password: (leave EMPTY)
-- Database: stratejiplus

-- Quick SQL Queries to Run in pgAdmin Query Tool:

-- 1. View all tables
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- 2. View all users
SELECT user_id, full_name, email, role_id, unit_id, status 
FROM users;

-- 3. View all units
SELECT unit_id, unit_name, unit_code, status 
FROM units;

-- 4. View table structure
\d users

-- 5. Count records in each table
SELECT 
  'users' as table_name, COUNT(*) as count FROM users
UNION ALL
SELECT 'units', COUNT(*) FROM units
UNION ALL
SELECT 'strategic_areas', COUNT(*) FROM strategic_areas
UNION ALL
SELECT 'strategic_objectives', COUNT(*) FROM strategic_objectives
UNION ALL
SELECT 'targets', COUNT(*) FROM targets
UNION ALL
SELECT 'indicators', COUNT(*) FROM indicators;

