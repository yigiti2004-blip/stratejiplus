import { useState, useEffect } from 'react';
import { useAuthContext } from './useAuthContext';
import { getCompanyData } from '@/lib/supabase';

export const useBirimler = () => {
  const { currentUser } = useAuthContext();
  const [birimler, setBirimler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBirimler = async () => {
      try {
        const companyId = currentUser?.companyId;
        const userId = currentUser?.id || currentUser?.userId;
        const isAdmin = currentUser?.roleId === 'admin';

        if (companyId && userId) {
          // Prefer Supabase units per company
          const units = await getCompanyData('units', userId, companyId, isAdmin);
          const formatted = (units || []).map((org) => ({
            birim_id: org.id || org.unit_id || org.unitId,
            birim_adi: org.unit_name || org.name || org.unitName,
            birim_kodu: org.unit_code || org.code || org.unitCode,
          }));
          setBirimler(formatted);
        } else {
          // Fallback to localStorage seed
          const storedUnits = JSON.parse(localStorage.getItem('units') || '[]');
          const storedOrgs =
            storedUnits.length > 0
              ? storedUnits
              : JSON.parse(localStorage.getItem('organizations') || '[]');
          const formatted = storedOrgs.map((org) => ({
            birim_id: org.unitId || org.id,
            birim_adi: org.unitName || org.name,
            birim_kodu: org.unitCode || org.type || org.code,
          }));
          setBirimler(formatted);
        }
      } catch (err) {
        setError(err);
        setBirimler([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBirimler();
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  return { birimler, loading, error };
};