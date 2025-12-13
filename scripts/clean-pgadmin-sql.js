// Clean pgAdmin4 SQL Export for Supabase
// Removes pgAdmin-specific commands and prepares SQL for Supabase

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function cleanPgAdminSQL(inputFile, outputFile) {
  console.log(`📖 Reading: ${inputFile}`);
  
  let sql = fs.readFileSync(inputFile, 'utf8');
  
  console.log('🧹 Cleaning SQL...');
  
  // Remove pgAdmin-specific commands
  const patterns = [
    // Connection commands
    /^\\connect.*$/gm,
    /^\\c\s+.*$/gm,
    /^SET\s+search_path.*$/gmi,
    
    // Echo commands
    /^\\echo.*$/gm,
    
    // Comments that might cause issues
    /^--.*pgAdmin.*$/gmi,
    
    // SET commands that might not work in Supabase
    /^SET\s+.*TO\s+.*$/gmi,
    
    // Vacuum commands (not needed in Supabase)
    /^VACUUM.*$/gmi,
    /^ANALYZE.*$/gmi,
  ];
  
  patterns.forEach((pattern, index) => {
    const before = sql.length;
    sql = sql.replace(pattern, '');
    const removed = before - sql.length;
    if (removed > 0) {
      console.log(`  ✅ Removed ${pattern.toString()}: ${removed} bytes`);
    }
  });
  
  // Add IF NOT EXISTS to CREATE statements (if not present)
  sql = sql.replace(
    /CREATE\s+TABLE\s+(\w+)/gi,
    'CREATE TABLE IF NOT EXISTS $1'
  );
  
  sql = sql.replace(
    /CREATE\s+INDEX\s+(\w+)/gi,
    'CREATE INDEX IF NOT EXISTS $1'
  );
  
  sql = sql.replace(
    /CREATE\s+EXTENSION\s+(\w+)/gi,
    'CREATE EXTENSION IF NOT EXISTS $1'
  );
  
  // Ensure UUID extension is included
  if (!sql.includes('uuid-ossp') && !sql.includes('CREATE EXTENSION')) {
    sql = 'CREATE EXTENSION IF NOT EXISTS "uuid-ossp";\n\n' + sql;
  }
  
  // Clean up multiple blank lines
  sql = sql.replace(/\n{3,}/g, '\n\n');
  
  // Trim
  sql = sql.trim();
  
  console.log(`💾 Writing: ${outputFile}`);
  fs.writeFileSync(outputFile, sql, 'utf8');
  
  console.log('✅ SQL cleaned and ready for Supabase!');
  console.log(`\n📊 Stats:`);
  console.log(`  Input:  ${fs.readFileSync(inputFile, 'utf8').length} bytes`);
  console.log(`  Output: ${sql.length} bytes`);
}

// Usage
const inputFile = process.argv[2] || path.join(__dirname, '../schema_from_pgadmin.sql');
const outputFile = process.argv[3] || path.join(__dirname, '../schema_cleaned.sql');

if (!fs.existsSync(inputFile)) {
  console.error(`❌ Input file not found: ${inputFile}`);
  console.log('\nUsage:');
  console.log('  node scripts/clean-pgadmin-sql.js [input.sql] [output.sql]');
  process.exit(1);
}

cleanPgAdminSQL(inputFile, outputFile);

