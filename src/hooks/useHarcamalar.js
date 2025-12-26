import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import { getCompanyData, insertCompanyData, updateCompanyData, deleteCompanyData } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

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
        // Load expenses from Supabase
        const expensesRaw = await getCompanyData('expenses', userId, companyId, isAdmin);

        // Also load activities to map activity_id to faaliyet_kodu
        const activitiesRaw = await getCompanyData('activities', userId, companyId, isAdmin);
        const activityMap = {};
        (activitiesRaw || []).forEach((act) => {
          activityMap[act.id] = act.code;
        });

        // Map Supabase fields to frontend format
        const mapped = (expensesRaw || []).map((item) => {
          const faaliyet_kodu = activityMap[item.activity_id] || item.activity_id || '';
          // Ensure budget_chapter_id is converted to string for consistent matching
          const fasilId = item.budget_chapter_id ? String(item.budget_chapter_id).trim() : '';

          return {
            ...item,
            harcama_id: item.id,
            faaliyet_kodu,
            fasil_id: fasilId,
            harcama_adi: item.description || '',
            harcama_tarihi: item.expense_date || '',
            tutar_kdv_hariç: item.amount || 0,
            // Calculate KDV percentage from amount and total_amount
            kdv_yuzde: item.amount && item.total_amount && item.amount > 0
              ? Math.round(((item.total_amount - item.amount) / item.amount) * 100)
              : 0,
            toplam_tutar: item.total_amount || 0,
            durum: item.status || 'Beklemede',
            aciklama: item.description || '',
          };
        });

        console.log('📥 Loaded expenses from Supabase:', mapped.length, 'items');
        console.log('📥 Expense fasil_ids:', mapped.map(h => ({
          harcama_id: h.harcama_id,
          fasil_id: h.fasil_id,
          fasil_id_type: typeof h.fasil_id,
          budget_chapter_id_from_db: expensesRaw.find(e => e.id === h.harcama_id)?.budget_chapter_id
        })));

        setHarcamalar(mapped);
      } else {
        // No Supabase configured - set empty array
        setHarcamalar([]);
      }
    } catch (error) {
      console.error('Failed to load expenses (harcamalar):', error);
      setHarcamalar([]);
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  useEffect(() => {
    loadHarcamalar();
  }, [loadHarcamalar]);

  const addHarcama = async (formData) => {
    const companyId = currentUser?.companyId;
    const userId = currentUser?.id || currentUser?.userId;
    if (!companyId || userId == null) {
      console.error('Missing user/company for addHarcama');
      throw new Error('Missing user/company for addHarcama');
    }

    const hasSupabase =
      !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (hasSupabase) {
      // Find activity_id from faaliyet_kodu
      const activitiesRaw = await getCompanyData('activities', userId, companyId, currentUser?.roleId === 'admin');
      const activity = (activitiesRaw || []).find((act) => act.code === formData.faaliyet_kodu);

      if (!activity) {
        throw new Error(`Activity with code "${formData.faaliyet_kodu}" not found`);
      }

      // Map frontend fields to Supabase schema
      // fasil_id should already be a string from the form, but ensure it's trimmed
      const budgetChapterId = formData.fasil_id ? String(formData.fasil_id).trim() : null;

      const payload = {
        id: formData.harcama_id || `exp-${uuidv4()}`,
        activity_id: activity.id,
        budget_chapter_id: budgetChapterId || null,
        description: formData.harcama_adi || formData.aciklama || '',
        amount: Number(formData.tutar_kdv_hariç) || 0,
        total_amount: Number(formData.toplam_tutar) || 0,
        expense_date: formData.harcama_tarihi || null,
        status: formData.durum || 'Beklemede',
      };

      console.log('💾 Saving expense to Supabase:', {
        budget_chapter_id: budgetChapterId,
        formData_fasil_id: formData.fasil_id,
        formData_fasil_id_type: typeof formData.fasil_id,
        payload_budget_chapter_id: payload.budget_chapter_id
      });

      const { error } = await insertCompanyData('expenses', payload, userId, companyId);
      if (error) {
        console.error('Error inserting into expenses:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
        throw error;
      }

      await loadHarcamalar();
    } else {
      throw new Error('Supabase is required for expense management');
    }
  };

  const updateHarcama = async (id, formData) => {
    const companyId = currentUser?.companyId;
    const userId = currentUser?.id || currentUser?.userId;
    if (userId == null) {
      throw new Error('Missing user for updateHarcama');
    }

    const hasSupabase =
      !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (hasSupabase) {
      // Find activity_id from faaliyet_kodu if changed
      let activity_id = null;
      if (formData.faaliyet_kodu) {
        const activitiesRaw = await getCompanyData('activities', userId, companyId, currentUser?.roleId === 'admin');
        const activity = (activitiesRaw || []).find((act) => act.code === formData.faaliyet_kodu);
        if (activity) {
          activity_id = activity.id;
        }
      }

      // Map frontend fields to Supabase schema
      const updates = {
        ...(activity_id && { activity_id }),
        ...(formData.fasil_id && { budget_chapter_id: formData.fasil_id }),
        ...(formData.harcama_adi && { description: formData.harcama_adi }),
        ...(formData.aciklama && { description: formData.aciklama }),
        ...(formData.tutar_kdv_hariç !== undefined && { amount: Number(formData.tutar_kdv_hariç) }),
        ...(formData.toplam_tutar !== undefined && { total_amount: Number(formData.toplam_tutar) }),
        ...(formData.harcama_tarihi && { expense_date: formData.harcama_tarihi }),
        ...(formData.durum && { status: formData.durum }),
      };

      const { error } = await updateCompanyData('expenses', id, updates, userId);
      if (error) {
        console.error('Error updating expenses:', error);
        throw error;
      }

      await loadHarcamalar();
    } else {
      throw new Error('Supabase is required for expense management');
    }
  };

  const deleteHarcama = async (id) => {
    const userId = currentUser?.id || currentUser?.userId;
    if (userId == null) {
      throw new Error('Missing user for deleteHarcama');
    }

    const hasSupabase =
      !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (hasSupabase) {
      const { error } = await deleteCompanyData('expenses', id, userId);
      if (error) {
        console.error('Error deleting expenses:', error);
        throw error;
      }

      await loadHarcamalar();
    } else {
      throw new Error('Supabase is required for expense management');
    }
  };

  return { harcamalar, addHarcama, updateHarcama, deleteHarcama, loadHarcamalar };
};
