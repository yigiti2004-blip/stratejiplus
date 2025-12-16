import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import { getCompanyData } from '@/lib/supabase';

// Local default demo data (used only when Supabase is not configured)
const DEFAULT_FASILLER = [
  {
    fasil_id: 1,
    fasil_kodu: 'F01',
    fasil_adi: 'Personel Giderleri',
    fasil_aciklama: 'Maaş ve ücretler',
    yillik_toplam_limit: 500000,
    yillik_tahsis_limit: 450000,
    mali_yil: 2024,
    sorumlu_birim: 'İK Müdürlüğü',
    sorumlu_kisi: 'Ahmet Yılmaz',
    durum: 'Aktif',
  },
];

export const useFasiller = () => {
  const { currentUser } = useAuthContext();
  const [fasiller, setFasiller] = useState([]);

  const loadFasiller = useCallback(async () => {
    try {
      const hasSupabase =
        !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (hasSupabase && companyId && userId) {
        const chaptersRaw = await getCompanyData('budget_chapters', userId, companyId, isAdmin);

        const mapped =
          (chaptersRaw || []).map((item) => ({
            ...item,
            fasil_id: item.id ?? item.fasil_id,
            fasil_kodu: item.code ?? item.fasil_kodu,
            fasil_adi: item.name ?? item.fasil_adi,
            // Optional fields if they exist in schema
            fasil_aciklama: item.description ?? item.fasil_aciklama ?? '',
            yillik_toplam_limit:
              item.yearly_total_limit ?? item.yillik_toplam_limit ?? item.limit ?? 0,
            yillik_tahsis_limit:
              item.yearly_allocation_limit ?? item.yillik_tahsis_limit ?? null,
            mali_yil: item.fiscal_year ?? item.mali_yil ?? new Date().getFullYear(),
            sorumlu_birim: item.responsible_unit ?? item.sorumlu_birim ?? '',
            sorumlu_kisi: item.responsible_person ?? item.sorumlu_kisi ?? '',
            durum: item.status ?? item.durum ?? 'Aktif',
          })) || [];

        setFasiller(mapped);
        // Mirror to localStorage just for client-side caching
        try {
          localStorage.setItem('fasiller', JSON.stringify(mapped));
        } catch {
          // ignore cache errors
        }
      } else {
        // Fallback: try localStorage, then demo defaults
        try {
          const stored = localStorage.getItem('fasiller');
          if (stored) {
            setFasiller(JSON.parse(stored));
          } else {
            setFasiller(DEFAULT_FASILLER);
          }
        } catch (e) {
          console.error('Failed to parse fasiller from localStorage', e);
          setFasiller(DEFAULT_FASILLER);
        }
      }
    } catch (error) {
      console.error('Failed to load budget chapters (fasiller):', error);
      // Last-resort fallback
      if (!fasiller || fasiller.length === 0) {
        setFasiller(DEFAULT_FASILLER);
      }
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  useEffect(() => {
    loadFasiller();
  }, [loadFasiller]);

  // Whenever fasiller changes (due to local edits), keep localStorage in sync for calculations
  useEffect(() => {
    try {
      if (fasiller && fasiller.length > 0) {
        localStorage.setItem('fasiller', JSON.stringify(fasiller));
        window.dispatchEvent(new Event('storage'));
      }
    } catch (e) {
      console.error('Failed to save fasiller to localStorage', e);
    }
  }, [fasiller]);

  return { fasiller, setFasiller };
};