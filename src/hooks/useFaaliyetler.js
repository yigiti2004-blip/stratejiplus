import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import { getCompanyData } from '@/lib/supabase';

export const useFaaliyetler = () => {
  const { currentUser } = useAuthContext();
  const [faaliyetler, setFaaliyetler] = useState([]);

  const loadFaaliyetler = useCallback(async () => {
    try {
      const hasSupabase =
        !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (hasSupabase && companyId && userId) {
        const activitiesRaw = await getCompanyData('activities', userId, companyId, isAdmin);
        const mapped =
          (activitiesRaw || []).map((item) => ({
            ...item,
            faaliyet_kodu: item.code ?? item.faaliyet_kodu,
            faaliyet_adi: item.name ?? item.faaliyet_adi,
          })) || [];

        setFaaliyetler(mapped);

        try {
          localStorage.setItem('activities', JSON.stringify(activitiesRaw || []));
        } catch {
          // ignore cache errors
        }
      } else {
        const storedActivities = localStorage.getItem('activities');
        if (storedActivities) {
          try {
            const parsed = JSON.parse(storedActivities);
            const mapped = parsed.map((item) => ({
              faaliyet_kodu: item.code,
              faaliyet_adi: item.name,
              ...item,
            }));
            setFaaliyetler(mapped);
          } catch (error) {
            console.error('Error loading activities from localStorage:', error);
            setFaaliyetler([]);
          }
        } else {
          // Default mock data if no SP data exists yet
          setFaaliyetler([
            { faaliyet_kodu: 'F.1.1.1', faaliyet_adi: 'Personel Eğitimlerinin Planlanması' },
            { faaliyet_kodu: 'F.1.2.1', faaliyet_adi: 'IT Altyapı İyileştirme Projesi' },
            { faaliyet_kodu: 'F.2.1.1', faaliyet_adi: 'Yeni Pazar Araştırması' },
            { faaliyet_kodu: 'F.3.1.1', faaliyet_adi: 'Müşteri Memnuniyeti Anketi' },
          ]);
        }
      }
    } catch (error) {
      console.error('Failed to load activities for budget module:', error);
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  useEffect(() => {
    loadFaaliyetler();
  }, [loadFaaliyetler]);

  return { faaliyetler, setFaaliyetler };
};