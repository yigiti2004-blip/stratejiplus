import pg from 'pg';
import { dbConfig } from './config.js';

const { Pool } = pg;

async function testConnection() {
  const pool = new Pool(dbConfig);
  
  try {
    console.log('Testing PostgreSQL database connection...');
    console.log('Config:', { ...dbConfig, password: '***' });
    
    // Test query
    const result = await pool.query('SELECT current_database() as current_db, NOW() as server_time, version() as pg_version');
    console.log('✅ Successfully connected to PostgreSQL database!');
    console.log('Current database:', result.rows[0].current_db);
    console.log('Server time:', result.rows[0].server_time);
    console.log('PostgreSQL version:', result.rows[0].pg_version.split(',')[0]);
    
    // Check tables
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      ORDER BY table_name
    `);
    console.log(`\n📊 Found ${tablesResult.rows.length} tables:`);
    tablesResult.rows.forEach(row => {
      console.log(`  - ${row.table_name}`);
    });
    
    await pool.end();
    console.log('\n✅ Connection test completed successfully!');
    
  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error.message);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL server is running');
    console.error('2. Database credentials in config.js are correct');
    console.error('3. Database "stratejiplus" exists');
    console.error('4. PostgreSQL is listening on port 5432 (or your configured port)');
    await pool.end();
    process.exit(1);
  }
}

testConnection();

