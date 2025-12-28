
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from './useAuthContext';
import { getCompanyData, insertCompanyData, updateCompanyData, deleteCompanyData } from '@/lib/supabase';

export const useAnnualWorkPlan = () => {
  const { currentUser } = useAuthContext();
  const [yearSpecificWork, setYearSpecificWork] = useState([]);
  const [spActivities, setSpActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (!companyId || !userId) {
        console.warn('useAnnualWorkPlan: Missing user/company info');
        setYearSpecificWork([]);
        setSpActivities([]);
        setLoading(false);
        return;
      }

      // Load Strategic Plan activities from Supabase
      const activitiesRaw = await getCompanyData('activities', userId, companyId, isAdmin);
      const mappedActivities = (activitiesRaw || []).map((a) => ({
        ...a,
        // Normalize field names for annual plan
        plannedStartDate: a.start_date || a.plannedStartDate,
        plannedEndDate: a.end_date || a.plannedEndDate,
        responsibleUnit: a.responsible_unit || a.responsibleUnit,
      }));
      setSpActivities(mappedActivities);

      // Load year-specific work items from Supabase
      const workItemsRaw = await getCompanyData('annual_work_plan_items', userId, companyId, isAdmin);
      const mappedWorkItems = (workItemsRaw || []).map((item) => ({
        id: item.id,
        year: item.year,
        workName: item.notes || item.work_name || 'İsimsiz İş',
        startDate: item.planned_start || item.start_date,
        endDate: item.planned_end || item.end_date,
        responsibleUnit: item.responsible_unit || '',
        sourceType: item.source_type || 'yıla-özgü',
        sourceId: item.activity_id || item.id,
        status: item.status || 'Planlandı',
        description: item.notes || item.description || '',
        activityId: item.activity_id,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
      }));

      console.log('📥 Loaded annual work plan items from Supabase:', mappedWorkItems.length);
      setYearSpecificWork(mappedWorkItems);

    } catch (error) {
      console.error('Failed to load annual work plan data:', error);
      setSpActivities([]);
      setYearSpecificWork([]);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  useEffect(() => {
    loadData();
    window.addEventListener('annual-plan-update', loadData);
    window.addEventListener('storage', loadData);
    return () => {
      window.removeEventListener('annual-plan-update', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, [loadData]);

  const addYearSpecificWork = async (data) => {
    const companyId = currentUser?.companyId;
    const userId = currentUser?.id || currentUser?.userId;

    if (!companyId || !userId) {
      console.error('Missing user/company for addYearSpecificWork');
      throw new Error('Missing user/company for addYearSpecificWork');
    }

    const newId = `awp-${uuidv4()}`;

      // Map frontend fields to Supabase schema
      const payload = {
        id: newId,
        year: Number(data.year) || new Date().getFullYear(),
        activity_id: data.activityId || null,
        planned_start: data.startDate || null,
        planned_end: data.endDate || null,
        actual_start: null,
        actual_end: null,
        status: data.status || 'Planlandı',
        notes: data.description || '',
        work_name: data.workName || data.description || 'İsimsiz İş',
        source_type: 'yıla-özgü',
        responsible_unit: data.responsibleUnit || '',
      };

    console.log('💾 Saving annual work plan item to Supabase:', payload);

    const { data: result, error } = await insertCompanyData('annual_work_plan_items', payload, userId, companyId);

    if (error) {
      console.error('Error inserting annual work plan item:', error);
      throw error;
    }

    // Reload data
    await loadData();
    window.dispatchEvent(new Event('annual-plan-update'));

    return { ...data, id: newId };
  };

  const updateYearSpecificWork = async (id, data) => {
    const userId = currentUser?.id || currentUser?.userId;
    const companyId = currentUser?.companyId;

    if (!userId) {
      throw new Error('Missing user for updateYearSpecificWork');
    }

      // Map frontend fields to Supabase schema
      const updates = {
        year: data.year ? Number(data.year) : undefined,
        planned_start: data.startDate || undefined,
        planned_end: data.endDate || undefined,
        status: data.status || undefined,
        notes: data.description || undefined,
        work_name: data.workName || undefined,
        responsible_unit: data.responsibleUnit || undefined,
      };

    // Remove undefined values
    Object.keys(updates).forEach(key => {
      if (updates[key] === undefined) {
        delete updates[key];
      }
    });

    console.log('💾 Updating annual work plan item:', id, updates);

    const { error } = await updateCompanyData('annual_work_plan_items', id, updates, userId, companyId);

    if (error) {
      console.error('Error updating annual work plan item:', error);
      throw error;
    }

    // Reload data
    await loadData();
    window.dispatchEvent(new Event('annual-plan-update'));
  };

  const deleteYearSpecificWork = async (id) => {
    const userId = currentUser?.id || currentUser?.userId;
    const companyId = currentUser?.companyId;

    if (!userId) {
      throw new Error('Missing user for deleteYearSpecificWork');
    }

    console.log('🗑️ Deleting annual work plan item:', id);

    const { error } = await deleteCompanyData('annual_work_plan_items', id, userId, companyId);

    if (error) {
      console.error('Error deleting annual work plan item:', error);
      throw error;
    }

    // Reload data
    await loadData();
    window.dispatchEvent(new Event('annual-plan-update'));
  };

  const getStrategicPlanActivitiesForYear = useCallback((year) => {
    return spActivities.filter(activity => {
      if (!activity.plannedStartDate || !activity.plannedEndDate) return false;
      const startYear = new Date(activity.plannedStartDate).getFullYear();
      const endYear = new Date(activity.plannedEndDate).getFullYear();
      // Include if it overlaps with the year
      return startYear <= year && endYear >= year;
    }).map(activity => ({
      id: activity.id,
      workName: activity.name || activity.description?.substring(0, 50) || "İsimsiz Faaliyet",
      startDate: activity.plannedStartDate,
      endDate: activity.plannedEndDate,
      responsibleUnit: activity.responsibleUnit || activity.responsible_unit,
      sourceType: 'stratejik-plan',
      sourceId: activity.id,
      year: year,
      isReadOnly: true,
      description: activity.description,
      originalActivity: activity
    }));
  }, [spActivities]);

  const getYearSpecificWorkForYear = useCallback((year) => {
    return yearSpecificWork
      .filter(item => Number(item.year) === Number(year) && item.sourceType === 'yıla-özgü')
      .map(item => ({
        ...item,
        isReadOnly: false
      }));
  }, [yearSpecificWork]);

  return {
    yearSpecificWork,
    spActivities,
    loading,
    addYearSpecificWork,
    updateYearSpecificWork,
    deleteYearSpecificWork,
    getStrategicPlanActivitiesForYear,
    getYearSpecificWorkForYear,
    reload: loadData
  };
};
