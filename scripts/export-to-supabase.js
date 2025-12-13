// Export PostgreSQL Schema to Supabase-ready SQL files
// Uses pg_dump to export schema, RLS policies, and data

import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbConfig } from '../database/config.js';

const execAsync = promisify(exec);
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create export directory
const exportDir = path.join(__dirname, '../supabase/exports');
if (!fs.existsSync(exportDir)) {
  fs.mkdirSync(exportDir, { recursive: true });
  console.log(`📁 Created directory: ${exportDir}`);
}

// Get database connection details
const dbHost = process.env.DB_HOST || dbConfig.host || 'localhost';
const dbPort = process.env.DB_PORT || dbConfig.port || 5432;
const dbUser = process.env.DB_USER || dbConfig.user || 'postgres';
const dbPassword = process.env.DB_PASSWORD || dbConfig.password || '';
const dbName = process.env.DB_NAME || dbConfig.database || 'stratejiplus';

// Set PGPASSWORD environment variable for pg_dump
process.env.PGPASSWORD = dbPassword;

async function runCommand(command, description) {
  console.log(`\n🔄 ${description}...`);
  try {
    const { stdout, stderr } = await execAsync(command);
    if (stderr && !stderr.includes('WARNING')) {
      console.warn(`⚠️  ${stderr}`);
    }
    return stdout;
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    throw error;
  }
}

async function exportSchema() {
  console.log('🚀 Starting PostgreSQL Export to Supabase-ready SQL files\n');
  console.log(`📊 Database: ${dbName}@${dbHost}:${dbPort}`);
  console.log(`👤 User: ${dbUser}`);
  console.log(`📁 Export directory: ${exportDir}\n`);

  try {
    // 1. Export complete schema (tables, indexes, constraints)
    console.log('📋 Step 1: Exporting schema...');
    const schemaFile = path.join(exportDir, '01_schema.sql');
    const schemaCmd = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --schema-only --no-owner --no-acl -f "${schemaFile}"`;
    await runCommand(schemaCmd, 'Exporting schema');
    console.log(`✅ Schema exported to: ${schemaFile}`);

    // 2. Export RLS policies
    console.log('\n🔒 Step 2: Exporting RLS policies...');
    const rlsFile = path.join(exportDir, '02_rls_policies.sql');
    const rlsCmd = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --schema-only --no-owner --no-acl | grep -E "(POLICY|ENABLE ROW LEVEL SECURITY|CREATE POLICY)" > "${rlsFile}" || echo "-- No RLS policies found or using alternative method" > "${rlsFile}"`;
    await runCommand(rlsCmd, 'Exporting RLS policies');
    
    // Better method: Query pg_policies directly
    const rlsQuery = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -t -c "
      SELECT 
        'ALTER TABLE ' || schemaname || '.' || tablename || ' ENABLE ROW LEVEL SECURITY;' as enable_rls
      FROM pg_tables 
      WHERE schemaname = 'public' 
      AND rowsecurity = true
      UNION ALL
      SELECT 
        'CREATE POLICY \"' || policyname || '\" ON ' || schemaname || '.' || tablename || 
        ' FOR ' || cmd || 
        CASE WHEN qual IS NOT NULL THEN ' USING (' || qual || ')' ELSE '' END ||
        CASE WHEN with_check IS NOT NULL THEN ' WITH CHECK (' || with_check || ')' ELSE '' END || ';' as policy
      FROM pg_policies 
      WHERE schemaname = 'public'
      ORDER BY 1;
    " >> "${rlsFile}"`;
    
    try {
      await runCommand(rlsQuery, 'Querying RLS policies from database');
      console.log(`✅ RLS policies exported to: ${rlsFile}`);
    } catch (error) {
      console.warn(`⚠️  Could not query RLS policies directly, using pg_dump method`);
    }

    // 3. Export functions (including RLS helper functions)
    console.log('\n⚙️  Step 3: Exporting functions...');
    const functionsFile = path.join(exportDir, '03_functions.sql');
    const functionsCmd = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --schema-only --no-owner --no-acl | grep -A 50 "CREATE FUNCTION\|CREATE OR REPLACE FUNCTION" > "${functionsFile}" || echo "-- No functions found" > "${functionsFile}"`;
    await runCommand(functionsCmd, 'Exporting functions');
    
    // Better method: Query pg_proc
    const functionsQuery = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -t -c "
      SELECT pg_get_functiondef(oid) || ';' 
      FROM pg_proc 
      WHERE pronamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
      AND proname NOT LIKE 'pg_%';
    " >> "${functionsFile}"`;
    
    try {
      await runCommand(functionsQuery, 'Querying functions from database');
      console.log(`✅ Functions exported to: ${functionsFile}`);
    } catch (error) {
      console.warn(`⚠️  Could not query functions directly, using pg_dump method`);
    }

    // 4. Export indexes
    console.log('\n📊 Step 4: Exporting indexes...');
    const indexesFile = path.join(exportDir, '04_indexes.sql');
    const indexesCmd = `pg_dump -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} --schema-only --no-owner --no-acl | grep -E "CREATE.*INDEX" > "${indexesFile}" || echo "-- No indexes found" > "${indexesFile}"`;
    await runCommand(indexesCmd, 'Exporting indexes');
    console.log(`✅ Indexes exported to: ${indexesFile}`);

    // 5. Export extensions
    console.log('\n🔌 Step 5: Exporting extensions...');
    const extensionsFile = path.join(exportDir, '00_extensions.sql');
    const extensionsQuery = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -t -c "
      SELECT 'CREATE EXTENSION IF NOT EXISTS \"' || extname || '\";' 
      FROM pg_extension 
      WHERE extname != 'plpgsql';
    " > "${extensionsFile}"`;
    await runCommand(extensionsQuery, 'Exporting extensions');
    console.log(`✅ Extensions exported to: ${extensionsFile}`);

    // 6. Create combined file for Supabase
    console.log('\n📦 Step 6: Creating combined Supabase-ready file...');
    const combinedFile = path.join(exportDir, 'supabase_import.sql');
    let combinedSQL = '-- ============================================\n';
    combinedSQL += '-- SUPABASE IMPORT FILE\n';
    combinedSQL += '-- Generated from PostgreSQL database\n';
    combinedSQL += `-- Database: ${dbName}\n`;
    combinedSQL += `-- Date: ${new Date().toISOString()}\n`;
    combinedSQL += '-- ============================================\n\n';

    // Add extensions first
    if (fs.existsSync(extensionsFile)) {
      const extContent = fs.readFileSync(extensionsFile, 'utf8').trim();
      if (extContent && !extContent.includes('-- No extensions')) {
        combinedSQL += '-- EXTENSIONS\n';
        combinedSQL += '-- ============================================\n';
        combinedSQL += extContent + '\n\n';
      }
    }

    // Add schema
    if (fs.existsSync(schemaFile)) {
      let schemaContent = fs.readFileSync(schemaFile, 'utf8');
      // Remove pgAdmin-specific commands
      schemaContent = schemaContent
        .replace(/^\\connect.*$/gm, '')
        .replace(/^\\c\s+.*$/gm, '')
        .replace(/^SET\s+search_path.*$/gmi, '')
        .replace(/^\\echo.*$/gm, '')
        .replace(/^SET\s+.*TO\s+.*$/gmi, '');
      
      // Add IF NOT EXISTS to CREATE TABLE
      schemaContent = schemaContent.replace(
        /CREATE\s+TABLE\s+(\w+)/gi,
        'CREATE TABLE IF NOT EXISTS $1'
      );
      
      combinedSQL += '-- SCHEMA (TABLES, CONSTRAINTS)\n';
      combinedSQL += '-- ============================================\n';
      combinedSQL += schemaContent + '\n\n';
    }

    // Add functions
    if (fs.existsSync(functionsFile)) {
      const funcContent = fs.readFileSync(functionsFile, 'utf8').trim();
      if (funcContent && !funcContent.includes('-- No functions')) {
        combinedSQL += '-- FUNCTIONS\n';
        combinedSQL += '-- ============================================\n';
        combinedSQL += funcContent + '\n\n';
      }
    }

    // Add RLS policies
    if (fs.existsSync(rlsFile)) {
      const rlsContent = fs.readFileSync(rlsFile, 'utf8').trim();
      if (rlsContent && !rlsContent.includes('-- No RLS')) {
        combinedSQL += '-- ROW LEVEL SECURITY (RLS) POLICIES\n';
        combinedSQL += '-- ============================================\n';
        combinedSQL += rlsContent + '\n\n';
      }
    }

    // Add indexes
    if (fs.existsSync(indexesFile)) {
      const idxContent = fs.readFileSync(indexesFile, 'utf8').trim();
      if (idxContent && !idxContent.includes('-- No indexes')) {
        combinedSQL += '-- INDEXES\n';
        combinedSQL += '-- ============================================\n';
        combinedSQL += idxContent + '\n\n';
      }
    }

    fs.writeFileSync(combinedFile, combinedSQL, 'utf8');
    console.log(`✅ Combined file created: ${combinedFile}`);

    // 7. Check RLS status
    console.log('\n🔍 Step 7: Checking RLS status...');
    const rlsCheckQuery = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -d ${dbName} -t -c "
      SELECT 
        tablename,
        CASE WHEN rowsecurity THEN '✅ ENABLED' ELSE '❌ DISABLED' END as rls_status,
        (SELECT COUNT(*) FROM pg_policies WHERE schemaname = 'public' AND tablename = t.tablename) as policy_count
      FROM pg_tables t
      WHERE schemaname = 'public'
      ORDER BY tablename;
    "`;
    
    try {
      const rlsStatus = await runCommand(rlsCheckQuery, 'Checking RLS status');
      const rlsStatusFile = path.join(exportDir, 'rls_status.txt');
      fs.writeFileSync(rlsStatusFile, rlsStatus, 'utf8');
      console.log(`✅ RLS status saved to: ${rlsStatusFile}`);
      console.log('\n📊 RLS Status Summary:');
      console.log(rlsStatus);
    } catch (error) {
      console.warn(`⚠️  Could not check RLS status: ${error.message}`);
    }

    // Summary
    console.log('\n✅ Export Complete!\n');
    console.log('📁 Files created in:', exportDir);
    console.log('  • 00_extensions.sql - Database extensions');
    console.log('  • 01_schema.sql - Complete schema');
    console.log('  • 02_rls_policies.sql - RLS policies');
    console.log('  • 03_functions.sql - Database functions');
    console.log('  • 04_indexes.sql - Indexes');
    console.log('  • supabase_import.sql - Combined file (ready for Supabase)');
    console.log('  • rls_status.txt - RLS status report');
    console.log('\n🎯 Next step: Import supabase_import.sql to Supabase SQL Editor');

  } catch (error) {
    console.error('\n❌ Export failed:', error.message);
    console.error('\n💡 Troubleshooting:');
    console.error('  1. Check database connection in database/config.js');
    console.error('  2. Ensure PostgreSQL is running');
    console.error('  3. Verify user has read permissions');
    console.error('  4. Check pg_dump is installed: which pg_dump');
    process.exit(1);
  } finally {
    // Clear password from environment
    delete process.env.PGPASSWORD;
  }
}

// Run export
exportSchema();

