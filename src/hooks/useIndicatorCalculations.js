
import { useState, useEffect, useCallback } from 'react';

export const useIndicatorCalculations = () => {
  const [data, setData] = useState({
    areas: [],
    objectives: [],
    targets: [],
    indicators: [],
    activities: [],
    monitoringRecords: []
  });
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(() => {
    try {
      const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
      const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
      const targets = JSON.parse(localStorage.getItem('targets') || '[]');
      const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');
      const activities = JSON.parse(localStorage.getItem('activities') || '[]');
      const monitoringRecords = JSON.parse(localStorage.getItem('activityMonitoringRecords') || '[]');

      setData({
        areas,
        objectives,
        targets,
        indicators,
        activities,
        monitoringRecords
      });
    } catch (error) {
      console.error("Error loading calculation data:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    // Custom event for immediate updates within the same window
    window.addEventListener('monitoring-update', loadData);
    
    return () => {
      window.removeEventListener('storage', loadData);
      window.removeEventListener('monitoring-update', loadData);
    };
  }, [loadData]);

  // 1. Calculate specific indicator achieved value
  const calculateIndicatorValue = useCallback((indicatorId) => {
    const relevantRecords = data.monitoringRecords.filter(record => 
      record.indicatorValues && 
      record.indicatorValues[indicatorId] !== undefined
    );

    const totalValue = relevantRecords.reduce((sum, record) => {
      return sum + Number(record.indicatorValues[indicatorId] || 0);
    }, 0);

    return totalValue;
  }, [data.monitoringRecords]);

  // 2. Calculate indicator completion percentage
  const calculateIndicatorCompletion = useCallback((indicatorId) => {
    const indicator = data.indicators.find(i => i.id === indicatorId);
    if (!indicator || !indicator.targetValue) return 0;

    const achieved = calculateIndicatorValue(indicatorId);
    const target = Number(indicator.targetValue);

    if (target === 0) return 0;
    
    const percentage = (achieved / target) * 100;
    return Math.min(percentage, 100); // Cap at 100% or allow over-performance? Usually capped for progress bars, but let's return raw.
  }, [data.indicators, calculateIndicatorValue]);

  // Helper: Average of array
  const average = (arr) => arr.length === 0 ? 0 : arr.reduce((a, b) => a + b, 0) / arr.length;

  // 3. Calculate Target Completion
  const calculateTargetCompletion = useCallback((targetId) => {
    const targetIndicators = data.indicators.filter(i => i.targetId === targetId);
    
    // Only include indicators that have monitoring records (active indicators)
    const activeIndicators = targetIndicators.filter(ind => {
      const hasRecords = data.monitoringRecords.some(r => 
        r.indicatorValues && r.indicatorValues[ind.id] !== undefined
      );
      return hasRecords;
    });

    if (activeIndicators.length === 0) return 0;

    const completions = activeIndicators.map(ind => calculateIndicatorCompletion(ind.id));
    return average(completions);
  }, [data.indicators, data.monitoringRecords, calculateIndicatorCompletion]);

  // 4. Calculate Objective Completion
  const calculateObjectiveCompletion = useCallback((objectiveId) => {
    const objectiveTargets = data.targets.filter(t => t.objectiveId === objectiveId);
    
    // Only include targets that have some progress (via their indicators)
    const activeTargets = objectiveTargets.filter(t => calculateTargetCompletion(t.id) > 0);

    if (activeTargets.length === 0) return 0;

    const completions = activeTargets.map(t => calculateTargetCompletion(t.id));
    return average(completions);
  }, [data.targets, calculateTargetCompletion]);

  // 5. Calculate Strategic Area Completion
  const calculateStrategicAreaCompletion = useCallback((areaId) => {
    const areaObjectives = data.objectives.filter(o => o.strategicAreaId === areaId);
    
    const activeObjectives = areaObjectives.filter(o => calculateObjectiveCompletion(o.id) > 0);

    if (activeObjectives.length === 0) return 0;

    const completions = activeObjectives.map(o => calculateObjectiveCompletion(o.id));
    return average(completions);
  }, [data.objectives, calculateObjectiveCompletion]);

  // 6. Calculate Overall Plan Completion
  const calculatePlanCompletion = useCallback(() => {
    const activeAreas = data.areas.filter(a => calculateStrategicAreaCompletion(a.id) > 0);

    if (activeAreas.length === 0) return 0;

    const completions = activeAreas.map(a => calculateStrategicAreaCompletion(a.id));
    return average(completions);
  }, [data.areas, calculateStrategicAreaCompletion]);

  // Helper for colors
  const getProgressColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-200';
    if (percentage <= 25) return 'bg-red-500';
    if (percentage <= 50) return 'bg-orange-500';
    if (percentage <= 75) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getProgressBadgeColor = (percentage) => {
    if (percentage === 0) return 'bg-gray-100 text-gray-600 border-gray-200';
    if (percentage <= 25) return 'bg-red-100 text-red-700 border-red-200';
    if (percentage <= 50) return 'bg-orange-100 text-orange-700 border-orange-200';
    if (percentage <= 75) return 'bg-yellow-100 text-yellow-700 border-yellow-200';
    return 'bg-green-100 text-green-700 border-green-200';
  };

  return {
    loading,
    calculateIndicatorValue,
    calculateIndicatorCompletion,
    calculateTargetCompletion,
    calculateObjectiveCompletion,
    calculateStrategicAreaCompletion,
    calculatePlanCompletion,
    getProgressColor,
    getProgressBadgeColor
  };
};
