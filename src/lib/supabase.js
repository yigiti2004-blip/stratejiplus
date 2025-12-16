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

  // Set user context for RLS
  await setUserContext(userId);

  // Query with RLS automatically applied
  let query = supabase
    .from(table)
    .select('*');

  // If not admin, manually filter by company_id (RLS might allow all)
  if (!isAdmin && companyId) {
    query = query.eq('company_id', companyId);
  }

  const { data, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
  }

  // Double-check filtering (in case RLS allows all)
  if (!isAdmin && companyId && data) {
    return data.filter(item => (item.company_id || item.companyId) === companyId);
  }

  return data || [];
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
    expenses: ['id', 'budget_chapter_id', 'activity_id', 'description', 'amount', 'total_amount', 'expense_date', 'status', 'company_id', 'created_at', 'updated_at'],
    budget_chapters: ['id', 'code', 'name', 'company_id', 'created_at', 'updated_at'],
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
    responsible_unit: data.responsibleUnit || data.responsible_unit || null,
    planned_budget: data.plannedBudget !== undefined ? data.plannedBudget : (data.planned_budget !== undefined ? data.planned_budget : null),
    actual_budget: data.actualBudget !== undefined ? data.actualBudget : (data.actual_budget !== undefined ? data.actual_budget : null),
    target_value: data.targetValue !== undefined ? data.targetValue : (data.target_value !== undefined ? data.target_value : null),
    actual_value: data.actualValue !== undefined ? data.actualValue : (data.actual_value !== undefined ? data.actual_value : null),
    // activities/targets use plannedStartDate/plannedEndDate in forms; map them to start_date/end_date
    start_date: data.startDate || data.plannedStartDate || data.start_date || null,
    end_date: data.endDate || data.plannedEndDate || data.end_date || null,
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
  delete snakeCaseData.responsibleUnit;
  delete snakeCaseData.plannedBudget;
  delete snakeCaseData.actualBudget;
  delete snakeCaseData.targetValue;
  delete snakeCaseData.actualValue;
  delete snakeCaseData.startDate;
  delete snakeCaseData.endDate;
  delete snakeCaseData.companyId;
  
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
export const updateCompanyData = async (table, id, updates, userId) => {
  if (!supabase) {
    // Fallback to localStorage
    const existing = JSON.parse(localStorage.getItem(table) || '[]');
    const updated = existing.map(item => 
      item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item
    );
    localStorage.setItem(table, JSON.stringify(updated));
    return { data: updated.find(item => item.id === id), error: null };
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
    start_date: updates.startDate || updates.start_date,
    end_date: updates.endDate || updates.end_date,
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

  const { data, error } = await supabase
    .from(table)
    .update(snakeCaseUpdates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${table}:`, error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { data: null, error };
  }

  return { data, error: null };
}

// Helper to delete data
export const deleteCompanyData = async (table, id, userId) => {
  if (!supabase) {
    // Fallback to localStorage
    const existing = JSON.parse(localStorage.getItem(table) || '[]');
    const filtered = existing.filter(item => item.id !== id);
    localStorage.setItem(table, JSON.stringify(filtered));
    return { error: null };
  }

  await setUserContext(userId);

  const { error } = await supabase
    .from(table)
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting from ${table}:`, error);
    return { error };
  }

  return { error: null };
}

