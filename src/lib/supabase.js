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
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching ${table}:`, error);
    return [];
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

  // Map camelCase to snake_case for Supabase
  const snakeCaseData = {
    ...data,
    company_id: companyId,
    // Map common camelCase fields to snake_case
    organization_id: data.organizationId || data.organization_id,
    strategic_area_id: data.strategicAreaId || data.strategic_area_id,
    objective_id: data.objectiveId || data.objective_id,
    target_id: data.targetId || data.target_id,
    indicator_id: data.indicatorId || data.indicator_id,
    budget_chapter_id: data.budgetChapterId || data.budget_chapter_id,
    responsible_unit: data.responsibleUnit || data.responsible_unit,
    planned_budget: data.plannedBudget || data.planned_budget,
    actual_budget: data.actualBudget || data.actual_budget,
    target_value: data.targetValue || data.target_value,
    actual_value: data.actualValue || data.actual_value,
    start_date: data.startDate || data.start_date,
    end_date: data.endDate || data.end_date,
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

  console.log('Inserting into', table, ':', snakeCaseData);

  const { data: result, error } = await supabase
    .from(table)
    .insert([snakeCaseData])
    .select()
    .single();

  if (error) {
    console.error(`Error inserting into ${table}:`, error);
    console.error('Error details:', JSON.stringify(error, null, 2));
    return { data: null, error };
  }

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
    planned_budget: updates.plannedBudget || updates.planned_budget,
    actual_budget: updates.actualBudget || updates.actual_budget,
    target_value: updates.targetValue || updates.target_value,
    actual_value: updates.actualValue || updates.actual_value,
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

