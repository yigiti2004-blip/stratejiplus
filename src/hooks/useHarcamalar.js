import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import { getCompanyData } from '@/lib/supabase';

export const useHarcamalar = () => {
  const { currentUser } = useAuthContext();
  const [harcamalar, setHarcamalar] = useState([]);

  const loadHarcamalar = useCallback(async () => {
    try {
      const hasSupabase =
        !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (hasSupabase && companyId && userId) {
        const expensesRaw = await getCompanyData('expenses', userId, companyId, isAdmin);

        const mapped =
          (expensesRaw || []).map((item) => ({
            ...item,
            harcama_id: item.id ?? item.harcama_id,
            faaliyet_kodu:
              item.activity_code ?? item.faaliyet_kodu ?? item.activity_id ?? '',
            fasil_id: item.budget_chapter_id ?? item.fasil_id ?? null,
            harcama_adi: item.description ?? item.harcama_adi ?? '',
            harcama_tarihi: item.expense_date ?? item.harcama_tarihi ?? null,
            tutar_kdv_hariç: item.amount ?? item.tutar_kdv_hariç ?? 0,
            toplam_tutar: item.total_amount ?? item.toplam_tutar ?? 0,
            durum: item.status ?? item.durum ?? 'Onaylandı',
          })) || [];

        setHarcamalar(mapped);

        // Cache to localStorage for client-side calculations/fallback
        try {
          localStorage.setItem('harcamalar', JSON.stringify(mapped));
        } catch {
          // ignore cache errors
        }
      } else {
        // Fallback: localStorage only
        try {
          const stored = localStorage.getItem('harcamalar');
          setHarcamalar(stored ? JSON.parse(stored) : []);
        } catch (e) {
          console.error('Failed to parse harcamalar from localStorage', e);
          setHarcamalar([]);
        }
      }
    } catch (error) {
      console.error('Failed to load expenses (harcamalar):', error);
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  useEffect(() => {
    loadHarcamalar();
  }, [loadHarcamalar]);

  // Keep localStorage updated when user adds/edits items on the client
  useEffect(() => {
    try {
      localStorage.setItem('harcamalar', JSON.stringify(harcamalar));
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error('Failed to save harcamalar to localStorage', e);
    }
  }, [harcamalar]);

  return { harcamalar, setHarcamalar };
};