import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import { getCompanyData, insertCompanyData, updateCompanyData, deleteCompanyData } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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

  // --- CRUD helpers for fasiller tied to Supabase ---
  const addFasil = async (formData) => {
    const companyId = currentUser?.companyId;
    const userId = currentUser?.id || currentUser?.userId;
    if (!companyId || userId == null) {
      console.error('Missing user/company for addFasil');
      throw new Error('Missing user/company for addFasil');
    }

    const hasSupabase =
      !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (hasSupabase) {
      // Supabase: only store fields that exist in schema (id, code, name, company_id)
      const payload = {
        id: formData.fasil_id || `fasil-${uuidv4()}`,
        code: formData.fasil_kodu,
        name: formData.fasil_adi,
      };

      const { error } = await insertCompanyData('budget_chapters', payload, userId, companyId);
      if (error) {
        console.error('Error inserting into budget_chapters:', error);
        throw error;
      }
      await loadFasiller();
    } else {
      // localStorage fallback
      const newFasil = {
        ...formData,
        fasil_id: formData.fasil_id || Date.now(),
      };
      setFasiller((prev) => [...prev, newFasil]);
    }
  };

  const updateFasil = async (id, formData) => {
    const userId = currentUser?.id || currentUser?.userId;
    if (userId == null) {
      throw new Error('Missing user for updateFasil');
    }

    const hasSupabase =
      !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (hasSupabase) {
      // Supabase: only update fields that exist in schema
      const updates = {
        code: formData.fasil_kodu,
        name: formData.fasil_adi,
      };

      const { error } = await updateCompanyData('budget_chapters', id, updates, userId);
      if (error) {
        console.error('Error updating budget_chapters:', error);
        throw error;
      }
      await loadFasiller();
    } else {
      // localStorage fallback
      setFasiller((prev) =>
        prev.map((f) => (f.fasil_id === id ? { ...f, ...formData } : f))
      );
    }
  };

  const deleteFasil = async (id) => {
    const userId = currentUser?.id || currentUser?.userId;
    if (userId == null) {
      throw new Error('Missing user for deleteFasil');
    }

    const hasSupabase =
      !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (hasSupabase) {
      const { error } = await deleteCompanyData('budget_chapters', id, userId);
      if (error) {
        console.error('Error deleting budget_chapters:', error);
        throw error;
      }
      await loadFasiller();
    } else {
      // localStorage fallback
      setFasiller((prev) => prev.filter((f) => f.fasil_id !== id));
    }
  };

  // Keep local cache in sync
  useEffect(() => {
    try {
      if (fasiller && fasiller.length > 0) {
        localStorage.setItem('fasiller', JSON.stringify(fasiller));
      }
    } catch (e) {
      console.error('Failed to save fasiller to localStorage:', e);
    }
  }, [fasiller]);

  return { fasiller, addFasil, updateFasil, deleteFasil };
};