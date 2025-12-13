
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useAnnualWorkPlan = () => {
  const [yearSpecificWork, setYearSpecificWork] = useState([]);
  const [spActivities, setSpActivities] = useState([]);

  const loadData = useCallback(() => {
    try {
      // Load Year Specific Work
      const storedSpecific = localStorage.getItem('yearSpecificPlannedWork');
      if (storedSpecific) {
        setYearSpecificWork(JSON.parse(storedSpecific));
      }

      // Load SP Activities
      const storedSp = localStorage.getItem('activities');
      if (storedSp) {
        setSpActivities(JSON.parse(storedSp));
      }
    } catch (error) {
      console.error("Failed to load annual work plan data", error);
    }
  }, []);

  useEffect(() => {
    loadData();
    window.addEventListener('annual-plan-update', loadData);
    window.addEventListener('storage', loadData); // Listen for SP changes too
    return () => {
      window.removeEventListener('annual-plan-update', loadData);
      window.removeEventListener('storage', loadData);
    };
  }, [loadData]);

  const saveSpecificWork = (workItems) => {
    localStorage.setItem('yearSpecificPlannedWork', JSON.stringify(workItems));
    setYearSpecificWork(workItems);
    window.dispatchEvent(new Event('annual-plan-update'));
  };

  const addYearSpecificWork = (data) => {
    const newItem = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      sourceType: 'yıla-özgü',
      ...data
    };
    saveSpecificWork([...yearSpecificWork, newItem]);
    return newItem;
  };

  const updateYearSpecificWork = (id, data) => {
    const updated = yearSpecificWork.map(item => 
      item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
    );
    saveSpecificWork(updated);
  };

  const deleteYearSpecificWork = (id) => {
    const updated = yearSpecificWork.filter(item => item.id !== id);
    saveSpecificWork(updated);
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
      responsibleUnit: activity.responsibleUnit,
      sourceType: 'stratejik-plan',
      sourceId: activity.id,
      year: year, // Just context
      isReadOnly: true,
      description: activity.description,
      originalActivity: activity
    }));
  }, [spActivities]);

  const getYearSpecificWorkForYear = useCallback((year) => {
    return yearSpecificWork.filter(item => Number(item.year) === Number(year)).map(item => ({
      ...item,
      workName: item.workName,
      isReadOnly: false
    }));
  }, [yearSpecificWork]);

  return {
    yearSpecificWork,
    spActivities,
    addYearSpecificWork,
    updateYearSpecificWork,
    deleteYearSpecificWork,
    getStrategicPlanActivitiesForYear,
    getYearSpecificWorkForYear
  };
};
