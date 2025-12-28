// Supabase Client Configuration
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase environment variables not set. Using localStorage fallback.');
}

// Create Supabase client
export const supabase = supabaseUrl && supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null

// Helper function to set current user context for RLS
export const setUserContext = async (userId) => {
  if (!supabase || !userId) return;

  try {
    // Set the user context for RLS policies
    await supabase.rpc('set_user_context', { user_id: String(userId) });
  } catch (error) {
    // Silently fail - RLS policies will use default behavior
    // This is expected if the function doesn't exist yet
    console.debug('User context not set (function may not exist):', error?.message);
  }
}

// Helper to get data with company filtering
export const getCompanyData = async (table, userId, companyId, isAdmin = false) => {
  if (!supabase) {
    // Fallback to localStorage
    const data = JSON.parse(localStorage.getItem(table) || '[]');
    return isAdmin ? data : data.filter(item => item.companyId === companyId);
  }

  // ALWAYS filter by company_id - even for admins, unless explicitly requesting all
  // This ensures strict multi-tenancy
  if (!companyId) {
    console.error(`❌ CRITICAL: getCompanyData called without companyId for table ${table}, userId: ${userId}`);
    console.error(`Stack trace:`, new Error().stack);
    return [];
  }

  // Set user context for RLS
  await setUserContext(userId);

  // ALWAYS filter by company_id - enforce multi-tenancy at database level
  console.log(`🔍 getCompanyData: table=${table}, companyId=${companyId}, userId=${userId}`);
  let query = supabase
    .from(table)
    .select('*')
    .eq('company_id', companyId); // ALWAYS filter by company_id

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }

  // Additional client-side filtering as a safety measure
  const filtered = (data || []).filter(item => {
    const itemCompanyId = item.company_id || item.companyId;
    const matches = itemCompanyId === companyId;
    if (!matches && itemCompanyId) {
      console.warn(`⚠️ Multi-tenancy violation detected in ${table}: item ${item.id} has company_id=${itemCompanyId}, expected ${companyId}`);
    }
    return matches;
  });

  if (filtered.length !== (data || []).length) {
    console.error(`❌ Data filtering mismatch for ${table}: expected ${data?.length}, got ${filtered.length} - multi-tenancy violation!`);
  }

  console.log(`✅ getCompanyData: table=${table}, returned ${filtered.length} records for companyId=${companyId}`);
  return filtered;
}

// Helper to insert data with company filtering
export const insertCompanyData = async (table, data, userId, companyId) => {
  if (!supabase) {
    // Fallback to localStorage
    const existing = JSON.parse(localStorage.getItem(table) || '[]');
    const newData = [...existing, { ...data, companyId }];
    localStorage.setItem(table, JSON.stringify(newData));
    return { data: newData, error: null };
  }

  await setUserContext(userId);

  // Define valid columns for each table (to filter out invalid fields)
  const validColumns = {
    strategic_areas: ['id', 'code', 'name', 'organization_id', 'responsible_unit', 'description', 'company_id', 'created_at', 'updated_at'],
    strategic_objectives: ['id', 'code', 'name', 'strategic_area_id', 'responsible_unit', 'description', 'company_id', 'created_at', 'updated_at'],
    targets: ['id', 'code', 'name', 'objective_id', 'responsible_unit', 'target_value', 'actual_value', 'completion_percentage', 'company_id', 'created_at', 'updated_at'],
    indicators: ['id', 'code', 'name', 'target_id', 'target_value', 'actual_value', 'unit', 'measurement_type', 'frequency', 'responsible_unit', 'company_id', 'created_at', 'updated_at'],
    activities: ['id', 'code', 'name', 'indicator_id', 'target_id', 'responsible_unit', 'planned_budget', 'actual_budget', 'start_date', 'end_date', 'status', 'completion', 'company_id', 'created_at', 'updated_at'],
    risks: ['id', 'name', 'risk_type', 'description', 'probability', 'impact', 'score', 'status', 'responsible', 'related_record_type', 'related_record_id', 'company_id', 'created_at', 'updated_at'],
    risk_projects: ['id', 'risk_id', 'project_name', 'description', 'manager', 'start_date', 'end_date', 'status', 'company_id', 'created_at', 'updated_at'],
    expenses: ['id', 'budget_chapter_id', 'activity_id', 'description', 'amount', 'total_amount', 'expense_date', 'status', 'company_id', 'created_at', 'updated_at'],
    // Extended budget_chapters schema to support Fasıl extra fields
    budget_chapters: [
      'id',
      'code',
      'name',
      'description',
      'yearly_total_limit',
      'yearly_allocation_limit',
      'fiscal_year',
      'responsible_unit',
      'responsible_person',
      'status',
      'company_id',
      'created_at',
      'updated_at',
    ],
    activity_realization_records: [
      'id',
      'activity_id',
      'record_date',
      'completion_percentage',
      'work_performed',
      'expense_flag',
      'detailed_description',
      'evidence_url',
      'evidence_file_name',
      'outcome_note',
      'created_by',
      'company_id',
      'created_at',
    ],
    revisions: [
      'id',
      'revision_type',
      'entity_type',
      'entity_id',
      'changes',
      'reason',
      'approved_by',
      'approval_date',
      'status',
      'company_id',
      'created_at',
      'updated_at',
    ],
    annual_work_plan_items: [
      'id',
      'year',
      'activity_id',
      'planned_start',
      'planned_end',
      'actual_start',
      'actual_end',
      'status',
      'notes',
      'work_name',
      'source_type',
      'responsible_unit',
      'company_id',
      'created_at',
      'updated_at',
    ],
  };

  // Validate companyId exists
  if (!companyId) {
    console.error('No companyId provided for insert');
    return { data: null, error: { message: 'Company ID is required' } };
  }

  // Map camelCase to snake_case for Supabase
  const snakeCaseData = {
    ...data,
    company_id: companyId,
    // Map common camelCase fields to snake_case
    organization_id: data.organizationId || data.organization_id || null,
    strategic_area_id: data.strategicAreaId || data.strategic_area_id || null,
    objective_id: data.objectiveId || data.objective_id || null,
    target_id: data.targetId || data.target_id || null,
    indicator_id: data.indicatorId || data.indicator_id || null,
    budget_chapter_id: data.budgetChapterId || data.budget_chapter_id || null,
    // Risk-specific mappings
    risk_type: data.riskType || data.risk_type || null,
    related_record_type: data.relatedRecordType || data.related_record_type || null,
    related_record_id: data.relatedRecordId || data.related_record_id || null,
    responsible_unit: data.responsibleUnit || data.responsible_unit || null,
    planned_budget: data.plannedBudget !== undefined ? data.plannedBudget : (data.planned_budget !== undefined ? data.planned_budget : null),
    actual_budget: data.actualBudget !== undefined ? data.actualBudget : (data.actual_budget !== undefined ? data.actual_budget : null),
    target_value: data.targetValue !== undefined ? data.targetValue : (data.target_value !== undefined ? data.target_value : null),
    actual_value: data.actualValue !== undefined ? data.actualValue : (data.actual_value !== undefined ? data.actual_value : null),
    // activities/targets use plannedStartDate/plannedEndDate in forms; map them to start_date/end_date
    start_date: data.startDate || data.plannedStartDate || data.start_date || null,
    end_date: data.endDate || data.plannedEndDate || data.end_date || null,
    // risk_projects: map name to project_name
    project_name: data.projectName || data.project_name || data.name || '',
    // risk_projects: map manager, dates, status
    manager: data.manager || null,
    start_date: data.startDate || data.start_date || null,
    end_date: data.endDate || data.end_date || null,
    status: data.status || 'Aktif',
    // Ensure required fields
    code: data.code || data.id || `SA-${Date.now()}`,
    name: data.name || '',
  };

  // Remove camelCase duplicates
  delete snakeCaseData.organizationId;
  delete snakeCaseData.strategicAreaId;
  delete snakeCaseData.objectiveId;
  delete snakeCaseData.targetId;
  delete snakeCaseData.indicatorId;
  delete snakeCaseData.budgetChapterId;
  delete snakeCaseData.riskType;
  delete snakeCaseData.relatedRecordType;
  delete snakeCaseData.relatedRecordId;
  delete snakeCaseData.responsibleUnit;
  delete snakeCaseData.plannedBudget;
  delete snakeCaseData.actualBudget;
  delete snakeCaseData.targetValue;
  delete snakeCaseData.actualValue;
  delete snakeCaseData.startDate;
  delete snakeCaseData.endDate;
  delete snakeCaseData.companyId;
  delete snakeCaseData.projectName;
  // Only remove `name` when we're inserting into risk_projects,
  // where `project_name` is the actual column used.
  if (table === 'risk_projects') {
    delete snakeCaseData.name;
  }

  // Filter out fields that don't exist in the table schema
  const validFields = validColumns[table] || Object.keys(snakeCaseData);
  const filteredData = {};

  validFields.forEach(field => {
    if (snakeCaseData.hasOwnProperty(field)) {
      const value = snakeCaseData[field];
      // Convert empty strings to null, keep arrays/objects as is for now
      if (value === '') {
        filteredData[field] = null;
      } else if (value !== undefined && value !== null) {
        filteredData[field] = value;
      }
    }
  });

  // Remove fields that are arrays/objects if they're not in valid columns (like responsiblePersons)
  Object.keys(snakeCaseData).forEach(key => {
    if (!validFields.includes(key)) {
      // Skip fields not in schema (like shortName, responsiblePersons, etc.)
      console.debug(`Skipping field not in schema: ${key}`);
    }
  });

  console.log('Inserting into', table, ':', filteredData);
  console.log('Valid fields for', table, ':', validFields);

  const { data: result, error } = await supabase
    .from(table)
    .insert([filteredData])
    .select()
    .single();

  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    console.error('Data attempted:', JSON.stringify(snakeCaseData, null, 2));
    return { data: null, error };
  }

  console.log('Successfully inserted:', result);
  return { data: result, error: null };
}

// Helper to update data
export const updateCompanyData = async (table, id, updates, userId, companyId = null) => {
  if (!supabase) {
    // Fallback to localStorage
    const existing = JSON.parse(localStorage.getItem(table) || '[]');
    const updated = existing.map(item =>
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    localStorage.setItem(table, JSON.stringify(updated));
    return { data: updated.find(item => item.id === id), error: null };
  }

  // CRITICAL: Require companyId for multi-tenancy
  if (!companyId) {
    console.error(`updateCompanyData: companyId is required for table ${table}, id ${id}`);
    return { data: null, error: { message: 'Company ID is required for multi-tenancy' } };
  }

  await setUserContext(userId);

  // Map camelCase to snake_case for Supabase
  const snakeCaseUpdates = {
    ...updates,
    updated_at: new Date().toISOString(),
    // Map common camelCase fields to snake_case
    organization_id: updates.organizationId || updates.organization_id,
    strategic_area_id: updates.strategicAreaId || updates.strategic_area_id,
    objective_id: updates.objectiveId || updates.objective_id,
    target_id: updates.targetId || updates.target_id,
    indicator_id: updates.indicatorId || updates.indicator_id,
    responsible_unit: updates.responsibleUnit || updates.responsible_unit,
    planned_budget: updates.plannedBudget ?? updates.planned_budget,
    actual_budget: updates.actualBudget ?? updates.actual_budget,
    target_value: updates.targetValue || updates.target_value,
    actual_value: updates.actualValue || updates.actual_value,
    start_date: updates.startDate || updates.plannedStartDate || updates.start_date,
    end_date: updates.endDate || updates.plannedEndDate || updates.end_date,
  };

  // Remove camelCase duplicates
  delete snakeCaseUpdates.organizationId;
  delete snakeCaseUpdates.strategicAreaId;
  delete snakeCaseUpdates.objectiveId;
  delete snakeCaseUpdates.targetId;
  delete snakeCaseUpdates.indicatorId;
  delete snakeCaseUpdates.responsibleUnit;
  delete snakeCaseUpdates.plannedBudget;
  delete snakeCaseUpdates.actualBudget;
  delete snakeCaseUpdates.targetValue;
  delete snakeCaseUpdates.actualValue;
  delete snakeCaseUpdates.startDate;
  delete snakeCaseUpdates.endDate;
  delete snakeCaseUpdates.companyId;

  console.log('Updating', table, id, ':', snakeCaseUpdates);

  // CRITICAL: ALWAYS filter by company_id AND id to enforce multi-tenancy
  // This ensures users can only update records from their own company
  const { data, error } = await supabase
    .from(table)
    .update(snakeCaseUpdates)
    .eq('id', id)
    .eq('company_id', companyId) // ALWAYS filter by company_id
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${table}:`, error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    // If no rows affected, it means the record doesn't exist or belongs to different company
    if (error.code === 'PGRST116') {
      return { data: null, error: { message: 'Record not found or access denied (multi-tenancy violation)' } };
    }
    return { data: null, error };
  }

  return { data, error: null };
}

// Helper to delete data
export const deleteCompanyData = async (table, id, userId, companyId = null) => {
  if (!supabase) {
    // Fallback to localStorage
    const existing = JSON.parse(localStorage.getItem(table) || '[]');
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem(table, JSON.stringify(filtered));
    return { error: null };
  }

  // CRITICAL: Require companyId for multi-tenancy
  if (!companyId) {
    console.error(`deleteCompanyData: companyId is required for table ${table}, id ${id}`);
    return { error: { message: 'Company ID is required for multi-tenancy' } };
  }

  await setUserContext(userId);

  // CRITICAL: ALWAYS filter by company_id AND id to enforce multi-tenancy
  // This ensures users can only delete records from their own company
  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id)
    .eq('company_id', companyId); // ALWAYS filter by company_id

  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    return { error };
  }

  return { error: null };
}

