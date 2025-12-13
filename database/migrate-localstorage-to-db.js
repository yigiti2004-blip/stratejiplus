// Migration script to move data from localStorage to PostgreSQL database
// Run with: node database/migrate-localstorage-to-db.js

import pg from 'pg';
import { dbConfig } from './config.js';
import bcrypt from 'bcryptjs';

const { Pool } = pg;
const pool = new Pool(dbConfig);

async function migrateData() {
  console.log('🔄 Starting migration from localStorage to MySQL...\n');

  try {
    // Note: This script assumes you'll manually export localStorage data
    // or run it in browser context. For now, it shows the structure.
    
    console.log('📝 To migrate data:');
    console.log('1. Open browser console on your app');
    console.log('2. Export localStorage data:');
    console.log('   JSON.stringify({');
    console.log('     users: localStorage.getItem("users"),');
    console.log('     units: localStorage.getItem("units"),');
    console.log('     strategicAreas: localStorage.getItem("strategicAreas"),');
    console.log('     ...');
    console.log('   })');
    console.log('3. Save to data-export.json');
    console.log('4. Run: node database/migrate-localstorage-to-db.js data-export.json\n');

    // Create default admin user
    const adminPassword = 'admin123';
    const passwordHash = await bcrypt.hash(adminPassword, 10);
    
    const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', ['admin@stratejiplus.com']);
    
    if (existing.rows.length === 0) {
      // Create default unit if doesn't exist
      const unitExists = await pool.query('SELECT unit_id FROM units WHERE unit_id = $1', ['unit-001']);
      if (unitExists.rows.length === 0) {
        await pool.query(
          'INSERT INTO units (unit_id, unit_name, unit_code, status) VALUES ($1, $2, $3, $4)',
          ['unit-001', 'Genel Müdürlük', 'GM', 'aktif']
        );
        console.log('✅ Created default unit: unit-001');
      }

      await pool.query(
        'INSERT INTO users (user_id, full_name, email, password_hash, role_id, unit_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)',
        ['admin-001', 'Sistem Yöneticisi', 'admin@stratejiplus.com', passwordHash, 'admin', 'unit-001', 'aktif']
      );
      console.log('✅ Created default admin user: admin@stratejiplus.com / admin123');
    } else {
      console.log('ℹ️  Admin user already exists');
    }

    console.log('\n✅ Migration setup complete!');
    console.log('📧 Default admin: admin@stratejiplus.com');
    console.log('🔑 Password: admin123\n');

  } catch (error) {
    console.error('❌ Migration error:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

migrateData();

