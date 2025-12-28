
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from './useAuthContext';
import { getCompanyData, insertCompanyData, updateCompanyData, deleteCompanyData } from '@/lib/supabase';

export const useInstitutionalContinuity = () => {
  const { currentUser } = useAuthContext();
  const [continuityActivities, setContinuityActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (!companyId || !userId) {
        // Fallback to localStorage for backward compatibility
        try {
          const stored = localStorage.getItem('institutionalContinuityActivities');
          if (stored) {
            setContinuityActivities(JSON.parse(stored));
          }
        } catch {
          setContinuityActivities([]);
        }
        setLoading(false);
        return;
      }

      // Try to load from Supabase first
      // Using annual_work_plan_items table with source_type = 'kurumsal-süreklilik'
      const workItemsRaw = await getCompanyData('annual_work_plan_items', userId, companyId, isAdmin);
      const continuityItems = (workItemsRaw || [])
        .filter(item => item.source_type === 'kurumsal-süreklilik')
        .map(item => ({
          id: item.id,
          workName: item.notes || item.work_name || '',
          startDate: item.planned_start || item.start_date,
          endDate: item.planned_end || item.end_date,
          responsibleUnit: item.responsible_unit || '',
          period: item.period || 'her-yıl',
          description: item.notes || '',
          isActive: item.status !== 'Pasif',
          deactivatedAt: item.status === 'Pasif' ? item.updated_at : null,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
        }));

      if (continuityItems.length > 0) {
        setContinuityActivities(continuityItems);
      } else {
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem('institutionalContinuityActivities');
          if (stored) {
            setContinuityActivities(JSON.parse(stored));
          } else {
            setContinuityActivities([]);
          }
        } catch {
          setContinuityActivities([]);
        }
      }
    } catch (error) {
      console.error('Failed to load continuity activities:', error);
      // Fallback to localStorage
      try {
        const stored = localStorage.getItem('institutionalContinuityActivities');
        if (stored) {
          setContinuityActivities(JSON.parse(stored));
        }
      } catch {
        setContinuityActivities([]);
      }
    } finally {
      setLoading(false);
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const saveToStorage = (activities) => {
    // Always save to localStorage as backup
    localStorage.setItem('institutionalContinuityActivities', JSON.stringify(activities));
    setContinuityActivities(activities);
    window.dispatchEvent(new Event('annual-plan-update'));
  };

  const addContinuityActivity = async (data) => {
    const companyId = currentUser?.companyId;
    const userId = currentUser?.id || currentUser?.userId;

    const newActivity = {
      id: `cont-${uuidv4()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      deactivatedAt: null,
      ...data
    };

    // Try to save to Supabase
    if (companyId && userId) {
      try {
        const payload = {
          id: newActivity.id,
          year: data.year || new Date().getFullYear(),
          planned_start: data.startDate || null,
          planned_end: data.endDate || null,
          status: 'Aktif',
          notes: data.workName || data.description || '',
          source_type: 'kurumsal-süreklilik',
          responsible_unit: data.responsibleUnit || '',
          period: data.period || 'her-yıl',
        };

        await insertCompanyData('annual_work_plan_items', payload, userId, companyId);
      } catch (error) {
        console.error('Error saving continuity activity to Supabase:', error);
      }
    }

    // Also save to localStorage as backup
    saveToStorage([...continuityActivities, newActivity]);
    return newActivity;
  };

  const updateContinuityActivity = async (id, data) => {
    const userId = currentUser?.id || currentUser?.userId;

    // Try to update in Supabase
    if (userId) {
      try {
        const updates = {
          planned_start: data.startDate || undefined,
          planned_end: data.endDate || undefined,
          notes: data.workName || data.description || undefined,
          responsible_unit: data.responsibleUnit || undefined,
        };

        // Remove undefined values
        Object.keys(updates).forEach(key => {
          if (updates[key] === undefined) {
            delete updates[key];
          }
        });

        const companyId = currentUser?.companyId;
        await updateCompanyData('annual_work_plan_items', id, updates, userId, companyId);
      } catch (error) {
        console.error('Error updating continuity activity in Supabase:', error);
      }
    }

    // Update localStorage
    const updated = continuityActivities.map(item =>
      item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
    );
    saveToStorage(updated);
  };

  const toggleContinuityStatus = async (id, isActive) => {
    const userId = currentUser?.id || currentUser?.userId;

    // Try to update in Supabase
    if (userId) {
      try {
        const companyId = currentUser?.companyId;
        await updateCompanyData('annual_work_plan_items', id, {
          status: isActive ? 'Aktif' : 'Pasif',
        }, userId, companyId);
      } catch (error) {
        console.error('Error toggling continuity status in Supabase:', error);
      }
    }

    // Update localStorage
    const updated = continuityActivities.map(item =>
      item.id === id ? {
        ...item,
        isActive,
        deactivatedAt: isActive ? null : new Date().toISOString()
      } : item
    );
    saveToStorage(updated);
  };

  const deleteContinuityActivity = async (id) => {
    const userId = currentUser?.id || currentUser?.userId;

    // Try to delete from Supabase
    if (userId) {
      try {
        const companyId = currentUser?.companyId;
        await deleteCompanyData('annual_work_plan_items', id, userId, companyId);
      } catch (error) {
        console.error('Error deleting continuity activity from Supabase:', error);
      }
    }

    // Update localStorage
    const updated = continuityActivities.filter(item => item.id !== id);
    saveToStorage(updated);
  };

  const generateContinuityInstancesForYear = useCallback((year, activities = continuityActivities) => {
    const instances = [];

    activities.forEach(template => {
      const createdYear = new Date(template.createdAt).getFullYear();
      if (year < createdYear) return;

      // If deactivated, check if deactivated year is before target year
      if (!template.isActive && template.deactivatedAt) {
        const deactivatedYear = new Date(template.deactivatedAt).getFullYear();
        if (year > deactivatedYear) return;
      }

      // Base dates parsing
      const baseStart = new Date(template.startDate);
      const baseEnd = new Date(template.endDate);
      const durationMs = baseEnd - baseStart;

      const generateItem = (startDate, suffix = '') => {
        const endDate = new Date(startDate.getTime() + durationMs);
        // Only include if it starts within the target year
        if (startDate.getFullYear() === year) {
          instances.push({
            id: `${template.id}-${year}${suffix}`,
            workName: template.workName,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            responsibleUnit: template.responsibleUnit,
            sourceType: 'kurumsal-süreklilik',
            sourceId: template.id,
            year: year,
            isReadOnly: false,
            description: template.description,
            originalTemplate: template
          });
        }
      };

      // Recurrence Logic
      const startMonth = baseStart.getMonth();
      const startDay = baseStart.getDate();

      if (template.period === 'her-yıl') {
        const targetDate = new Date(year, startMonth, startDay);
        generateItem(targetDate);
      } else if (template.period === '3-ayda-bir') {
        for (let i = 0; i < 4; i++) {
          const targetDate = new Date(year, startMonth + (i * 3), startDay);
          generateItem(targetDate, `-q${i + 1}`);
        }
      } else if (template.period === '6-ayda-bir') {
        for (let i = 0; i < 2; i++) {
          const targetDate = new Date(year, startMonth + (i * 6), startDay);
          generateItem(targetDate, `-h${i + 1}`);
        }
      } else if (template.period === 'belirli-ay') {
        const targetDate = new Date(year, startMonth, startDay);
        generateItem(targetDate);
      }
    });

    return instances;
  }, [continuityActivities]);

  return {
    continuityActivities,
    loading,
    addContinuityActivity,
    updateContinuityActivity,
    deleteContinuityActivity,
    toggleContinuityStatus,
    generateContinuityInstancesForYear,
    reload: loadData
  };
};
