// Migration Script: localStorage → Supabase
// Run this after setting up Supabase and running schema.sql

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { initializeData } from '../src/lib/data-initializer.js';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // Use service role key for migration

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials!');
  console.error('Set VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function migrateData() {
  console.log('🚀 Starting migration to Supabase...\n');

  try {
    // 1. Ensure localStorage has initial data
    console.log('📦 Initializing data in localStorage...');
    initializeData();

    // 2. Migrate Companies
    console.log('\n📊 Migrating Companies...');
    const companies = [
      { company_id: 'company-a', company_name: 'TechCorp A', company_code: 'TCA', status: 'aktif' },
      { company_id: 'company-b', company_name: 'Manufacturing B', company_code: 'MB', status: 'aktif' },
    ];

    for (const company of companies) {
      const { error } = await supabase
        .from('companies')
        .upsert(company, { onConflict: 'company_id' });
      
      if (error) {
        console.error(`  ❌ Error migrating company ${company.company_id}:`, error.message);
      } else {
        console.log(`  ✅ Migrated company: ${company.company_name}`);
      }
    }

    // 3. Migrate Units
    console.log('\n🏢 Migrating Units...');
    const units = JSON.parse(localStorage.getItem('units') || '[]');
    let unitsMigrated = 0;

    for (const unit of units) {
      const { error } = await supabase
        .from('units')
        .upsert({
          unit_id: unit.unitId,
          unit_name: unit.unitName,
          unit_code: unit.unitCode,
          company_id: unit.companyId,
          status: unit.status || 'aktif',
          created_at: unit.createdAt,
          updated_at: unit.updatedAt,
        }, { onConflict: 'unit_id' });
      
      if (error) {
        console.error(`  ❌ Error migrating unit ${unit.unitId}:`, error.message);
      } else {
        unitsMigrated++;
      }
    }
    console.log(`  ✅ Migrated ${unitsMigrated} units`);

    // 4. Migrate Users (with password hashing)
    console.log('\n👥 Migrating Users...');
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    let usersMigrated = 0;

    for (const user of users) {
      // Hash password if not already hashed
      let passwordHash = user.password_hash || user.password;
      if (!passwordHash.startsWith('$2')) { // Not bcrypt hashed
        passwordHash = await bcrypt.hash(passwordHash, 10);
      }

      const { error } = await supabase
        .from('users')
        .upsert({
          user_id: user.userId,
          full_name: user.fullName,
          email: user.email,
          password_hash: passwordHash,
          role_id: user.roleId,
          unit_id: user.unitId,
          company_id: user.companyId,
          status: user.status || 'aktif',
          must_change_password: user.mustChangePassword || false,
          last_login_date: user.lastLoginDate,
          created_at: user.createdAt,
          updated_at: user.updatedAt,
        }, { onConflict: 'user_id' });
      
      if (error) {
        console.error(`  ❌ Error migrating user ${user.email}:`, error.message);
      } else {
        usersMigrated++;
      }
    }
    console.log(`  ✅ Migrated ${usersMigrated} users`);

    // 5. Migrate Strategic Areas
    console.log('\n🎯 Migrating Strategic Areas...');
    const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
    let areasMigrated = 0;

    for (const area of areas) {
      const { error } = await supabase
        .from('strategic_areas')
        .upsert({
          id: area.id,
          code: area.code,
          name: area.name,
          organization_id: area.organizationId,
          responsible_unit: area.responsibleUnit,
          description: area.description,
          company_id: area.companyId,
          created_at: area.createdAt,
          updated_at: area.updatedAt,
        }, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error migrating area ${area.id}:`, error.message);
      } else {
        areasMigrated++;
      }
    }
    console.log(`  ✅ Migrated ${areasMigrated} strategic areas`);

    // 6. Migrate Strategic Objectives
    console.log('\n📋 Migrating Strategic Objectives...');
    const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
    let objectivesMigrated = 0;

    for (const obj of objectives) {
      const { error } = await supabase
        .from('strategic_objectives')
        .upsert({
          id: obj.id,
          code: obj.code,
          name: obj.name,
          strategic_area_id: obj.strategicAreaId,
          responsible_unit: obj.responsibleUnit,
          description: obj.description,
          company_id: obj.companyId,
          created_at: obj.createdAt,
          updated_at: obj.updatedAt,
        }, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error migrating objective ${obj.id}:`, error.message);
      } else {
        objectivesMigrated++;
      }
    }
    console.log(`  ✅ Migrated ${objectivesMigrated} strategic objectives`);

    // 7. Migrate Targets
    console.log('\n🎯 Migrating Targets...');
    const targets = JSON.parse(localStorage.getItem('targets') || '[]');
    let targetsMigrated = 0;

    for (const target of targets) {
      const { error } = await supabase
        .from('targets')
        .upsert({
          id: target.id,
          code: target.code,
          name: target.name,
          objective_id: target.objectiveId,
          responsible_unit: target.responsibleUnit,
          target_value: target.targetValue,
          actual_value: target.actualValue,
          completion_percentage: target.completionPercentage,
          company_id: target.companyId,
          created_at: target.createdAt,
          updated_at: target.updatedAt,
        }, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error migrating target ${target.id}:`, error.message);
      } else {
        targetsMigrated++;
      }
    }
    console.log(`  ✅ Migrated ${targetsMigrated} targets`);

    // 8. Migrate Indicators
    console.log('\n📊 Migrating Indicators...');
    const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');
    let indicatorsMigrated = 0;

    for (const indicator of indicators) {
      const { error } = await supabase
        .from('indicators')
        .upsert({
          id: indicator.id,
          code: indicator.code,
          name: indicator.name,
          target_id: indicator.targetId,
          unit_of_measure: indicator.unitOfMeasure,
          target_value: indicator.targetValue,
          actual_value: indicator.actualValue,
          frequency: indicator.frequency,
          responsible_unit: indicator.responsibleUnit,
          company_id: indicator.companyId,
          created_at: indicator.createdAt,
          updated_at: indicator.updatedAt,
        }, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error migrating indicator ${indicator.id}:`, error.message);
      } else {
        indicatorsMigrated++;
      }
    }
    console.log(`  ✅ Migrated ${indicatorsMigrated} indicators`);

    // 9. Migrate Activities
    console.log('\n⚙️ Migrating Activities...');
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    let activitiesMigrated = 0;

    for (const activity of activities) {
      const { error } = await supabase
        .from('activities')
        .upsert({
          id: activity.id,
          code: activity.code,
          name: activity.name,
          indicator_id: activity.indicatorId,
          responsible_unit: activity.responsibleUnit,
          planned_budget: activity.plannedBudget,
          actual_budget: activity.actualBudget,
          start_date: activity.startDate,
          end_date: activity.endDate,
          status: activity.status,
          company_id: activity.companyId,
          created_at: activity.createdAt,
          updated_at: activity.updatedAt,
        }, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error migrating activity ${activity.id}:`, error.message);
      } else {
        activitiesMigrated++;
      }
    }
    console.log(`  ✅ Migrated ${activitiesMigrated} activities`);

    // 10. Migrate Risks
    console.log('\n⚠️ Migrating Risks...');
    const risks = JSON.parse(localStorage.getItem('risks') || '[]');
    let risksMigrated = 0;

    for (const risk of risks) {
      const { error } = await supabase
        .from('risks')
        .upsert({
          id: risk.id,
          name: risk.name,
          risk_type: risk.riskType,
          description: risk.description,
          probability: risk.probability,
          impact: risk.impact,
          status: risk.status,
          responsible: risk.responsible,
          related_record_type: risk.relatedRecordType,
          related_record_id: risk.relatedRecordId,
          company_id: risk.companyId,
          created_at: risk.createdAt,
          updated_at: risk.updatedAt,
        }, { onConflict: 'id' });
      
      if (error) {
        console.error(`  ❌ Error migrating risk ${risk.id}:`, error.message);
      } else {
        risksMigrated++;
      }
    }
    console.log(`  ✅ Migrated ${risksMigrated} risks`);

    console.log('\n✅ Migration complete!');
    console.log('\n📝 Next steps:');
    console.log('  1. Verify data in Supabase dashboard');
    console.log('  2. Test login with migrated users');
    console.log('  3. Deploy to Vercel');

  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

migrateData();

