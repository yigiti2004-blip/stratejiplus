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
  if (!supabase) return;
  
  try {
    // Set the user context for RLS policies
    await supabase.rpc('set_user_context', { user_id: userId });
  } catch (error) {
    console.warn('Could not set user context:', error);
    // Fallback: Use session variable
    await supabase.rpc('exec_sql', {
      sql: `SET LOCAL app.current_user_id = '${userId}'`
    });
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

  const { data: result, error } = await supabase
    .from(table)
    .insert([{ ...data, company_id: companyId }])
    .select()
    .single();

  if (error) {
    console.error(`Error inserting into ${table}:`, error);
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

  const { data, error } = await supabase
    .from(table)
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating ${table}:`, error);
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

