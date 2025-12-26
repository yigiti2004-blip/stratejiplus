import { useState, useEffect, useCallback } from 'react';
import { useAuthContext } from './useAuthContext';
import { getCompanyData, insertCompanyData } from '@/lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Hook for managing Activity Realization Records
 * - Data entry ONLY at Activity level
 * - Records are immutable (no edit, no delete)
 * - Upper levels calculate automatically as averages
 */
export const useActivityRealization = () => {
  const { currentUser } = useAuthContext();
  const [realizationRecords, setRealizationRecords] = useState([]);
  const [activities, setActivities] = useState([]);
  const [hierarchyData, setHierarchyData] = useState({
    areas: [],
    objectives: [],
    targets: [],
    indicators: [],
  });
  const [loading, setLoading] = useState(true);

  // Load all realization records
  const loadRealizationRecords = useCallback(async () => {
    try {
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (!companyId || !userId) {
        setRealizationRecords([]);
        return;
      }

      const records = await getCompanyData('activity_realization_records', userId, companyId, isAdmin);
      
      // Sort by date (chronological order - like bank statement)
      const sorted = (records || []).sort((a, b) => {
        const dateA = new Date(a.record_date || a.created_at);
        const dateB = new Date(b.record_date || b.created_at);
        return dateA - dateB;
      });

      setRealizationRecords(sorted);
    } catch (error) {
      console.error('Error loading realization records:', error);
      setRealizationRecords([]);
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  // Load activities
  const loadActivities = useCallback(async () => {
    try {
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (!companyId || !userId) {
        setActivities([]);
        return;
      }

      const activitiesData = await getCompanyData('activities', userId, companyId, isAdmin);
      setActivities(activitiesData || []);
    } catch (error) {
      console.error('Error loading activities:', error);
      setActivities([]);
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  // Load hierarchy data
  const loadHierarchy = useCallback(async () => {
    try {
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (!companyId || !userId) {
        setHierarchyData({ areas: [], objectives: [], targets: [], indicators: [] });
        return;
      }

      const [areas, objectives, targets, indicators] = await Promise.all([
        getCompanyData('strategic_areas', userId, companyId, isAdmin),
        getCompanyData('strategic_objectives', userId, companyId, isAdmin),
        getCompanyData('targets', userId, companyId, isAdmin),
        getCompanyData('indicators', userId, companyId, isAdmin),
      ]);

      setHierarchyData({
        areas: areas || [],
        objectives: objectives || [],
        targets: targets || [],
        indicators: indicators || [],
      });
    } catch (error) {
      console.error('Error loading hierarchy:', error);
      setHierarchyData({ areas: [], objectives: [], targets: [], indicators: [] });
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  useEffect(() => {
    const loadAll = async () => {
      setLoading(true);
      await Promise.all([loadRealizationRecords(), loadActivities(), loadHierarchy()]);
      setLoading(false);
    };
    loadAll();
  }, [loadRealizationRecords, loadActivities, loadHierarchy]);

  /**
   * Check if user can add realization record for an activity
   * Authorization rules:
   * - User role is admin
   * - User is listed as Activity Responsible (TODO: implement when field exists)
   * - User's unit matches Activity Responsible Unit
   * - View-only role: never can enter data
   */
  const canAddRealization = useCallback((activity) => {
    if (!activity || !currentUser) return false;

    // View-only role: never can enter data
    if (currentUser.roleId === 'view-only') {
      return false;
    }

    // Admin can always add
    if (currentUser.roleId === 'admin') {
      return true;
    }

    // Check if user's unit matches activity responsible unit
    const userUnitId = currentUser.unitId;
    const activityResponsibleUnit = activity.responsible_unit || activity.responsibleUnit;

    if (userUnitId && activityResponsibleUnit) {
      // TODO: Match unit_id with responsible_unit (may need to load units and match by name)
      // For now, return true if both exist (will be refined)
      return true;
    }

    // TODO: Check if user is listed as Activity Responsible
    // This requires a responsible_persons field in activities table

    return false;
  }, [currentUser]);

  /**
   * Add a new realization record (immutable - no edit/delete allowed)
   */
  const addRealizationRecord = async (activityId, recordData) => {
    const companyId = currentUser?.companyId;
    const userId = currentUser?.id || currentUser?.userId;

    if (!companyId || !userId) {
      throw new Error('Missing user/company information');
    }

    // Get activity to check authorization
    const activity = activities.find(a => a.id === activityId);
    if (!activity) {
      throw new Error('Activity not found');
    }

    if (!canAddRealization(activity)) {
      throw new Error('You do not have permission to add realization records for this activity');
    }

    const payload = {
      id: `real-${uuidv4()}`,
      activity_id: activityId,
      record_date: recordData.recordDate,
      completion_percentage: Number(recordData.completionPercentage),
      work_performed: recordData.workPerformed || '',
      expense_flag: recordData.expenseFlag || 'No',
      detailed_description: recordData.detailedDescription || null,
      evidence_url: recordData.evidenceUrl || null,
      evidence_file_name: recordData.evidenceFileName || null,
      outcome_note: recordData.outcomeNote || null,
      created_by: userId,
    };

    const { error } = await insertCompanyData('activity_realization_records', payload, userId, companyId);
    
    if (error) {
      console.error('Error adding realization record:', error);
      throw error;
    }

    // Reload records
    await loadRealizationRecords();
  };

  /**
   * Get realization records for a specific activity
   */
  const getRecordsForActivity = useCallback((activityId) => {
    return realizationRecords.filter(r => r.activity_id === activityId);
  }, [realizationRecords]);

  /**
   * Calculate average completion for an activity
   */
  const calculateActivityCompletion = useCallback((activityId) => {
    const records = getRecordsForActivity(activityId);
    if (records.length === 0) return 0;
    
    const sum = records.reduce((acc, r) => acc + (Number(r.completion_percentage) || 0), 0);
    return sum / records.length;
  }, [getRecordsForActivity]);

  /**
   * Calculate average completion for indicators (average of activities)
   */
  const calculateIndicatorCompletion = useCallback((indicatorId, indicatorActivities) => {
    if (!indicatorActivities || indicatorActivities.length === 0) return 0;
    
    const completions = indicatorActivities
      .map(activity => calculateActivityCompletion(activity.id))
      .filter(c => c > 0);
    
    if (completions.length === 0) return 0;
    
    const sum = completions.reduce((acc, c) => acc + c, 0);
    return sum / completions.length;
  }, [calculateActivityCompletion]);

  /**
   * Calculate average completion for targets (average of indicators and direct activities)
   */
  const calculateTargetCompletion = useCallback((targetId, targetIndicators, targetActivities) => {
    const indicatorCompletions = (targetIndicators || []).map(indicator => {
      const indicatorActivities = activities.filter(a => 
        (a.indicator_id === indicator.id || a.indicatorId === indicator.id)
      );
      return calculateIndicatorCompletion(indicator.id, indicatorActivities);
    }).filter(c => c > 0);

    const activityCompletions = (targetActivities || []).filter(a => 
      (a.target_id === targetId || a.targetId === targetId) && 
      (!a.indicator_id && !a.indicatorId)
    ).map(act => calculateActivityCompletion(act.id)).filter(c => c > 0);

    const allCompletions = [...indicatorCompletions, ...activityCompletions];
    if (allCompletions.length === 0) return 0;
    
    const sum = allCompletions.reduce((acc, c) => acc + c, 0);
    return sum / allCompletions.length;
  }, [activities, calculateIndicatorCompletion, calculateActivityCompletion]);

  /**
   * Calculate average completion for objectives (average of targets)
   */
  const calculateObjectiveCompletion = useCallback((objectiveId, objectiveTargets) => {
    if (!objectiveTargets || objectiveTargets.length === 0) return 0;
    
    const targetCompletions = objectiveTargets.map(target => {
      const targetIndicators = hierarchyData.indicators.filter(i => 
        i.target_id === target.id || i.targetId === target.id
      );
      const targetActivities = activities.filter(a => 
        (a.target_id === target.id || a.targetId === target.id) && 
        (!a.indicator_id && !a.indicatorId)
      );
      return calculateTargetCompletion(target.id, targetIndicators, targetActivities);
    }).filter(c => c > 0);
    
    if (targetCompletions.length === 0) return 0;
    
    const sum = targetCompletions.reduce((acc, c) => acc + c, 0);
    return sum / targetCompletions.length;
  }, [hierarchyData.indicators, activities, calculateTargetCompletion]);

  /**
   * Calculate average completion for strategic areas (average of objectives)
   */
  const calculateAreaCompletion = useCallback((areaId, areaObjectives) => {
    if (!areaObjectives || areaObjectives.length === 0) return 0;
    
    const objectiveCompletions = areaObjectives.map(objective => {
      const objectiveTargets = hierarchyData.targets.filter(t => 
        t.objective_id === objective.id || t.objectiveId === objective.id
      );
      return calculateObjectiveCompletion(objective.id, objectiveTargets);
    }).filter(c => c > 0);
    
    if (objectiveCompletions.length === 0) return 0;
    
    const sum = objectiveCompletions.reduce((acc, c) => acc + c, 0);
    return sum / objectiveCompletions.length;
  }, [hierarchyData.targets, calculateObjectiveCompletion]);

  return {
    realizationRecords,
    activities,
    loading,
    loadRealizationRecords,
    addRealizationRecord,
    getRecordsForActivity,
    calculateActivityCompletion,
    calculateIndicatorCompletion,
    calculateTargetCompletion,
    calculateObjectiveCompletion,
    calculateAreaCompletion,
    canAddRealization,
  };
};

