// Company/Tenant Filter Utility
// Filters data based on user's company_id

/**
 * Filter data array by company_id
 * @param {Array} data - Array of items with companyId field
 * @param {string} companyId - Company ID to filter by
 * @returns {Array} Filtered array
 */
export const filterByCompany = (data, companyId) => {
  if (!data || !Array.isArray(data)) return [];
  if (!companyId) return data; // If no companyId, return all (for backward compatibility)
  return data.filter(item => item.companyId === companyId);
};

/**
 * Get all data filtered by company from localStorage
 * @param {string} companyId - Company ID
 * @returns {Object} Filtered data object
 */
export const getCompanyData = (companyId) => {
  if (!companyId) {
    // Return all data if no companyId (backward compatibility)
    return {
      units: JSON.parse(localStorage.getItem('units') || '[]'),
      users: JSON.parse(localStorage.getItem('users') || '[]'),
      strategicAreas: JSON.parse(localStorage.getItem('strategicAreas') || '[]'),
      strategicObjectives: JSON.parse(localStorage.getItem('strategicObjectives') || '[]'),
      targets: JSON.parse(localStorage.getItem('targets') || '[]'),
      indicators: JSON.parse(localStorage.getItem('indicators') || '[]'),
      activities: JSON.parse(localStorage.getItem('activities') || '[]'),
      risks: JSON.parse(localStorage.getItem('risks') || '[]'),
      expenses: JSON.parse(localStorage.getItem('expenses') || '[]'),
      budgetChapters: JSON.parse(localStorage.getItem('budgetChapters') || '[]'),
    };
  }

  return {
    units: filterByCompany(JSON.parse(localStorage.getItem('units') || '[]'), companyId),
    users: filterByCompany(JSON.parse(localStorage.getItem('users') || '[]'), companyId),
    strategicAreas: filterByCompany(JSON.parse(localStorage.getItem('strategicAreas') || '[]'), companyId),
    strategicObjectives: filterByCompany(JSON.parse(localStorage.getItem('strategicObjectives') || '[]'), companyId),
    targets: filterByCompany(JSON.parse(localStorage.getItem('targets') || '[]'), companyId),
    indicators: filterByCompany(JSON.parse(localStorage.getItem('indicators') || '[]'), companyId),
    activities: filterByCompany(JSON.parse(localStorage.getItem('activities') || '[]'), companyId),
    risks: filterByCompany(JSON.parse(localStorage.getItem('risks') || '[]'), companyId),
    expenses: filterByCompany(JSON.parse(localStorage.getItem('expenses') || '[]'), companyId),
    budgetChapters: filterByCompany(JSON.parse(localStorage.getItem('budgetChapters') || '[]'), companyId),
  };
};

/**
 * Save data with company_id automatically set
 * @param {string} key - localStorage key
 * @param {Object|Array} item - Item to save (will get companyId from currentUser)
 * @param {string} companyId - Company ID
 */
export const saveWithCompany = (key, item, companyId) => {
  if (!companyId) {
    // Backward compatibility - save without companyId
    const existing = JSON.parse(localStorage.getItem(key) || '[]');
    const updated = Array.isArray(item) ? item : [...existing, { ...item }];
    localStorage.setItem(key, JSON.stringify(updated));
    return;
  }

  const existing = JSON.parse(localStorage.getItem(key) || '[]');
  const itemWithCompany = Array.isArray(item) 
    ? item.map(i => ({ ...i, companyId }))
    : { ...item, companyId };
  
  if (Array.isArray(item)) {
    localStorage.setItem(key, JSON.stringify(itemWithCompany));
  } else {
    // Update or add single item
    const index = existing.findIndex(i => i.id === item.id || i.userId === item.userId);
    if (index >= 0) {
      existing[index] = itemWithCompany;
    } else {
      existing.push(itemWithCompany);
    }
    localStorage.setItem(key, JSON.stringify(existing));
  }
};

