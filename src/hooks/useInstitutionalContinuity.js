
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useInstitutionalContinuity = () => {
  const [continuityActivities, setContinuityActivities] = useState([]);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('institutionalContinuityActivities');
      if (stored) {
        setContinuityActivities(JSON.parse(stored));
      }
    } catch (error) {
      console.error("Failed to load continuity activities", error);
    }
  }, []);

  const saveToStorage = (activities) => {
    localStorage.setItem('institutionalContinuityActivities', JSON.stringify(activities));
    setContinuityActivities(activities);
    window.dispatchEvent(new Event('annual-plan-update'));
  };

  const addContinuityActivity = (data) => {
    const newActivity = {
      id: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isActive: true,
      deactivatedAt: null,
      ...data
    };
    saveToStorage([...continuityActivities, newActivity]);
    return newActivity;
  };

  const updateContinuityActivity = (id, data) => {
    const updated = continuityActivities.map(item => 
      item.id === id ? { ...item, ...data, updatedAt: new Date().toISOString() } : item
    );
    saveToStorage(updated);
  };

  const toggleContinuityStatus = (id, isActive) => {
    const updated = continuityActivities.map(item => 
      item.id === id ? { 
        ...item, 
        isActive, 
        deactivatedAt: isActive ? null : new Date().toISOString() 
      } : item
    );
    saveToStorage(updated);
  };

  const deleteContinuityActivity = (id) => {
    const updated = continuityActivities.filter(item => item.id !== id);
    saveToStorage(updated);
  };

  const generateContinuityInstancesForYear = useCallback((year, activities = continuityActivities) => {
    const instances = [];

    activities.forEach(template => {
      // Logic: Only generate if active or (inactive but deactivated AFTER this year)
      // For simplicity in this requirement: "Previous year records are NOT deleted"
      // We check if it was created before or during this year.
      
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
            id: `${template.id}-${year}${suffix}`, // Unique ID for this instance
            workName: template.workName,
            startDate: startDate.toISOString().split('T')[0],
            endDate: endDate.toISOString().split('T')[0],
            responsibleUnit: template.responsibleUnit,
            sourceType: 'kurumsal-süreklilik',
            sourceId: template.id,
            year: year,
            isReadOnly: false, // Can edit the template via this instance
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
          generateItem(targetDate, `-q${i+1}`);
        }
      } else if (template.period === '6-ayda-bir') {
        for (let i = 0; i < 2; i++) {
          const targetDate = new Date(year, startMonth + (i * 6), startDay);
          generateItem(targetDate, `-h${i+1}`);
        }
      } else if (template.period === 'belirli-ay') {
        // Assume the base start date already holds the correct month
        // Just replicate for the target year
        const targetDate = new Date(year, startMonth, startDay);
        generateItem(targetDate);
      }
    });

    return instances;
  }, [continuityActivities]);

  return {
    continuityActivities,
    addContinuityActivity,
    updateContinuityActivity,
    deleteContinuityActivity,
    toggleContinuityStatus,
    generateContinuityInstancesForYear
  };
};
