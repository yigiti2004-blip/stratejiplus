// Hook to get company-filtered data
import { useState, useEffect } from 'react';
import { useAuthContext } from './useAuthContext';
import { getCompanyData } from '@/lib/companyFilter';

/**
 * Hook to get all data filtered by current user's company
 */
export const useCompanyData = () => {
  const { currentUser } = useAuthContext();
  const [data, setData] = useState({
    units: [],
    users: [],
    strategicAreas: [],
    strategicObjectives: [],
    targets: [],
    indicators: [],
    activities: [],
    risks: [],
    expenses: [],
    budgetChapters: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const companyId = currentUser?.companyId;
    const companyData = getCompanyData(companyId);
    setData(companyData);
    setLoading(false);
  }, [currentUser?.companyId]);

  // Reload when storage changes
  useEffect(() => {
    const handleStorageChange = () => {
      const companyId = currentUser?.companyId;
      const companyData = getCompanyData(companyId);
      setData(companyData);
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [currentUser?.companyId]);

  return { data, loading };
};

