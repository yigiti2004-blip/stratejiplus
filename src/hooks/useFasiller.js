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
          (chaptersRaw || []).map((item) => {
            // Handle null/undefined values properly for numeric fields
            const yearlyTotalLimit = item.yearly_total_limit ?? item.yillik_toplam_limit ?? item.limit;
            const yillikToplamLimit = yearlyTotalLimit != null ? Number(yearlyTotalLimit) : 0;

            return {
              ...item,
              fasil_id: item.id ?? item.fasil_id,
              fasil_kodu: item.code ?? item.fasil_kodu,
              fasil_adi: item.name ?? item.fasil_adi,
              // Optional fields if they exist in schema
              fasil_aciklama: item.description ?? item.fasil_aciklama ?? '',
              yillik_toplam_limit: yillikToplamLimit,
              yillik_tahsis_limit:
                item.yearly_allocation_limit != null ? Number(item.yearly_allocation_limit) : (item.yillik_tahsis_limit != null ? Number(item.yillik_tahsis_limit) : null),
              mali_yil: item.fiscal_year ?? item.mali_yil ?? new Date().getFullYear(),
              sorumlu_birim: item.responsible_unit ?? item.sorumlu_birim ?? '',
              sorumlu_kisi: item.responsible_person ?? item.sorumlu_kisi ?? '',
              durum: item.status ?? item.durum ?? 'Aktif',
            };
          }) || [];

        setFasiller(mapped);
      } else {
        // No Supabase configured - set empty array
        setFasiller([]);
      }
    } catch (error) {
      console.error('Failed to load budget chapters (fasiller):', error);
      setFasiller([]);
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
      // name is NOT NULL in schema, so we must always send a non-empty string
      const safeName = (formData.fasil_adi || '').trim() || formData.fasil_kodu || 'Yeni Fasıl';
      const safeCode = (formData.fasil_kodu || '').trim() || `F-${Date.now()}`;

      const payload = {
        id: formData.fasil_id || `fasil-${uuidv4()}`,
        code: safeCode,
        name: safeName,
        // Extra fields map directly to extended budget_chapters columns
        description: formData.fasil_aciklama || null,
        yearly_total_limit: formData.yillik_toplam_limit != null ? Number(formData.yillik_toplam_limit) : null,
        yearly_allocation_limit:
          formData.yillik_tahsis_limit != null ? Number(formData.yillik_tahsis_limit) : null,
        fiscal_year: formData.mali_yil != null ? Number(formData.mali_yil) : new Date().getFullYear(),
        responsible_unit: formData.sorumlu_birim || null,
        responsible_person: formData.sorumlu_kisi || null,
        status: formData.durum || 'Aktif',
      };

      const { error } = await insertCompanyData('budget_chapters', payload, userId, companyId);
      if (error) {
        console.error('Error inserting into budget_chapters:', error);
        throw error;
      }
      await loadFasiller();
    } else {
      throw new Error('Supabase is required for budget chapter management');
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
      const updates = {};

      if (formData.fasil_kodu !== undefined) {
        const safeCode = (formData.fasil_kodu || '').trim();
        if (safeCode) updates.code = safeCode;
      }

      if (formData.fasil_adi !== undefined) {
        const safeName = (formData.fasil_adi || '').trim();
        if (safeName) updates.name = safeName;
      }

      if (formData.fasil_aciklama !== undefined) {
        updates.description = formData.fasil_aciklama || null;
      }

      if (formData.yillik_toplam_limit !== undefined) {
        updates.yearly_total_limit =
          formData.yillik_toplam_limit != null ? Number(formData.yillik_toplam_limit) : null;
      }

      if (formData.yillik_tahsis_limit !== undefined) {
        updates.yearly_allocation_limit =
          formData.yillik_tahsis_limit != null ? Number(formData.yillik_tahsis_limit) : null;
      }

      if (formData.mali_yil !== undefined) {
        updates.fiscal_year =
          formData.mali_yil != null ? Number(formData.mali_yil) : new Date().getFullYear();
      }

      if (formData.sorumlu_birim !== undefined) {
        updates.responsible_unit = formData.sorumlu_birim || null;
      }

      if (formData.sorumlu_kisi !== undefined) {
        updates.responsible_person = formData.sorumlu_kisi || null;
      }

      if (formData.durum !== undefined) {
        updates.status = formData.durum || 'Aktif';
      }

      const companyId = currentUser?.companyId;
      const { error } = await updateCompanyData('budget_chapters', id, updates, userId, companyId);
      if (error) {
        console.error('Error updating budget_chapters:', error);
        throw error;
      }
      await loadFasiller();
    } else {
      throw new Error('Supabase is required for budget chapter management');
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
      const companyId = currentUser?.companyId;
      const { error } = await deleteCompanyData('budget_chapters', id, userId, companyId);
      if (error) {
        console.error('Error deleting budget_chapters:', error);
        throw error;
      }
      await loadFasiller();
    } else {
      throw new Error('Supabase is required for budget chapter management');
    }
  };

  return { fasiller, addFasil, updateFasil, deleteFasil };
};