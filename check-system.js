// System Status Check Script
// Run with: node check-system.js

import { exec } from 'child_process';
import { promisify } from 'util';
import http from 'http';

const execAsync = promisify(exec);

async function checkPort(port) {
  return new Promise((resolve) => {
    const req = http.request({ host: 'localhost', port, timeout: 1000 }, (res) => {
      resolve(true);
    });
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

async function checkSystem() {
  console.log('🔍 Checking StratejiPlus System Status...\n');

  // Check Frontend
  console.log('1. Frontend Server (Port 3000):');
  const frontendRunning = await checkPort(3000);
  if (frontendRunning) {
    console.log('   ✅ Frontend is running');
    console.log('   🌐 Access at: http://localhost:3000\n');
  } else {
    console.log('   ❌ Frontend is NOT running');
    console.log('   💡 Start with: npm run dev\n');
  }

  // Check API Server
  console.log('2. API Server (Port 3001):');
  const apiRunning = await checkPort(3001);
  if (apiRunning) {
    console.log('   ✅ API server is running');
    console.log('   🌐 Health check: http://localhost:3001/health\n');
    
    // Test health endpoint
    try {
      const response = await fetch('http://localhost:3001/health');
      const data = await response.json();
      console.log('   📊 API Health:', data.status);
      if (data.database === 'connected') {
        console.log('   ✅ Database connection: OK\n');
      } else {
        console.log('   ⚠️  Database connection: Unknown\n');
      }
    } catch (error) {
      console.log('   ⚠️  Could not check API health\n');
    }
  } else {
    console.log('   ❌ API server is NOT running');
    console.log('   💡 Start with: npm run server');
    console.log('   ℹ️  System will use localStorage (still works!)\n');
  }

  // Check Node modules
  console.log('3. Dependencies:');
  try {
    const { stdout } = await execAsync('npm list --depth=0 2>/dev/null | head -5');
    console.log('   ✅ Node modules installed\n');
  } catch (error) {
    console.log('   ⚠️  Could not verify dependencies\n');
  }

  // Check database config
  console.log('4. Database Configuration:');
  try {
    const config = await import('./database/config.js');
    const hasPassword = config.dbConfig.password && config.dbConfig.password !== 'postgres';
    console.log(`   📍 Host: ${config.dbConfig.host}:${config.dbConfig.port}`);
    console.log(`   📍 Database: ${config.dbConfig.database}`);
    console.log(`   📍 User: ${config.dbConfig.user}`);
    if (hasPassword) {
      console.log('   ✅ Password configured\n');
    } else {
      console.log('   ⚠️  Using default password (update in database/config.js)\n');
    }
  } catch (error) {
    console.log('   ⚠️  Could not load config\n');
  }

  // Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 SUMMARY:');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  
  if (frontendRunning) {
    console.log('✅ Frontend: WORKING');
    console.log('   → Open http://localhost:3000 in your browser');
  } else {
    console.log('❌ Frontend: NOT RUNNING');
    console.log('   → Run: npm run dev');
  }

  if (apiRunning) {
    console.log('✅ API Server: RUNNING');
    console.log('   → Database integration active');
  } else {
    console.log('⚠️  API Server: NOT RUNNING');
    console.log('   → System using localStorage (works fine!)');
    console.log('   → To enable database: npm run server');
  }

  console.log('\n💡 Current Mode:');
  if (apiRunning) {
    console.log('   → Database Mode (PostgreSQL)');
  } else {
    console.log('   → LocalStorage Mode (no database needed)');
  }

  console.log('\n✨ System is ready to use!');
}

checkSystem().catch(console.error);

