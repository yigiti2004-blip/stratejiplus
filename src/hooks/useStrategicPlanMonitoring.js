
import { useState, useEffect } from 'react';

export const useStrategicPlanMonitoring = () => {
  const [data, setData] = useState({
    areas: [],
    objectives: [],
    targets: [],
    indicators: [],
    activities: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = () => {
      try {
        const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
        const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
        const targets = JSON.parse(localStorage.getItem('targets') || '[]');
        const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');
        const activities = JSON.parse(localStorage.getItem('activities') || '[]');

        setData({
          areas,
          objectives,
          targets,
          indicators,
          activities
        });
      } catch (error) {
        console.error("Error loading SP data for monitoring:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
    
    // Listen for storage changes to keep in sync
    const handleStorageChange = () => loadData();
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

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
      // Mock completion rate based on monitoring records could be calculated here
      completionRate: Math.floor(Math.random() * 100) // Placeholder for now as per instructions "Simple data entry"
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
