
import { useState, useEffect } from 'react';
import { useAuthContext } from './useAuthContext';
import { getCompanyData } from '@/lib/supabase';

export const useStrategicPlanMonitoring = () => {
  const { currentUser } = useAuthContext();
  const [data, setData] = useState({
    areas: [],
    objectives: [],
    targets: [],
    indicators: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const companyId = currentUser?.companyId;
        const userId = currentUser?.id || currentUser?.userId;
        const isAdmin = currentUser?.roleId === 'admin';

        let areas = [];
        let objectives = [];
        let targets = [];
        let indicators = [];
        let activities = [];

        if (companyId && userId) {
          const [
            areasRaw,
            objectivesRaw,
            targetsRaw,
            indicatorsRaw,
            activitiesRaw,
          ] = await Promise.all([
            getCompanyData('strategic_areas', userId, companyId, isAdmin),
            getCompanyData('strategic_objectives', userId, companyId, isAdmin),
            getCompanyData('targets', userId, companyId, isAdmin),
            getCompanyData('indicators', userId, companyId, isAdmin),
            getCompanyData('activities', userId, companyId, isAdmin),
          ]);

          const mapAreas = (items) =>
            (items || []).map((item) => ({
              ...item,
              companyId: item.company_id || item.companyId,
            }));

          const mapObjectives = (items) =>
            (items || []).map((item) => ({
              ...item,
              companyId: item.company_id || item.companyId,
              strategicAreaId: item.strategic_area_id || item.strategicAreaId,
            }));

          const mapTargets = (items) =>
            (items || []).map((item) => ({
              ...item,
              companyId: item.company_id || item.companyId,
              objectiveId: item.objective_id || item.objectiveId,
            }));

          const mapIndicators = (items) =>
            (items || []).map((item) => ({
              ...item,
              companyId: item.company_id || item.companyId,
              targetId: item.target_id || item.targetId,
              targetValue: item.target_value ?? item.targetValue,
            }));

          const mapActivities = (items) =>
            (items || []).map((item) => ({
              ...item,
              companyId: item.company_id || item.companyId,
              targetId: item.target_id || item.targetId,
              // normalize fields used in Activity-based view
              responsibleUnit: item.responsible_unit || item.responsibleUnit || '',
              startDate: item.start_date || item.startDate || null,
              endDate: item.end_date || item.endDate || null,
              budget:
                item.planned_budget ??
                item.actual_budget ??
                item.plannedBudget ??
                item.actualBudget ??
                item.budget ??
                null,
            }));

          areas = mapAreas(areasRaw);
          objectives = mapObjectives(objectivesRaw);
          targets = mapTargets(targetsRaw);
          indicators = mapIndicators(indicatorsRaw);
          activities = mapActivities(activitiesRaw);
        }

        setData({
          areas,
          objectives,
          targets,
          indicators,
          activities,
        });
      } catch (error) {
        console.error('Error loading SP data for monitoring (Supabase):', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  // --- DERIVED DATA & HELPERS ---

  // Get full hierarchy for a target
  const getTargetHierarchy = (targetId) => {
    const target = data.targets.find(t => t.id === targetId);
    if (!target) return null;
    
    const objective = data.objectives.find(o => o.id === target.objectiveId);
    const area = objective ? data.areas.find(a => a.id === objective.strategicAreaId) : null;
    
    return { target, objective, area };
  };

  // Get full hierarchy for an activity
  const getActivityHierarchy = (activityId) => {
    const activity = data.activities.find(a => a.id === activityId);
    if (!activity) return null;

    const targetHierarchy = getTargetHierarchy(activity.targetId);
    return { activity, ...targetHierarchy };
  };

  // Counts for Strategic Area Cards
  const getAreaStats = (areaId) => {
    const areaObjectives = data.objectives.filter(o => o.strategicAreaId === areaId);
    const objectiveIds = areaObjectives.map(o => o.id);
    const areaTargets = data.targets.filter(t => objectiveIds.includes(t.objectiveId));
    const areaActivities = data.activities.filter(a => areaTargets.some(t => t.id === a.targetId));

    return {
      objectivesCount: areaObjectives.length,
      targetsCount: areaTargets.length,
      activitiesCount: areaActivities.length,
    };
  };

  return {
    ...data,
    loading,
    getTargetHierarchy,
    getActivityHierarchy,
    getAreaStats
  };
};
