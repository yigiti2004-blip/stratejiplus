
import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useActivityMonitoring = (activityId) => {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load records for specific activity
  useEffect(() => {
    if (!activityId) return;

    const loadRecords = () => {
      try {
        const allRecords = JSON.parse(localStorage.getItem('activityMonitoringRecords') || '[]');
        const activityRecords = allRecords.filter(r => r.activityId === activityId);
        // Sort by date descending (newest first)
        activityRecords.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
        setRecords(activityRecords);
      } catch (error) {
        console.error("Error loading monitoring records:", error);
      } finally {
        setLoading(false);
      }
    };

    loadRecords();
    
    // Listen for changes
    window.addEventListener('storage', loadRecords);
    // Custom event listener for same-window updates
    window.addEventListener('monitoring-update', loadRecords);
    
    return () => {
      window.removeEventListener('storage', loadRecords);
      window.removeEventListener('monitoring-update', loadRecords);
    };
  }, [activityId]);

  // Add new record
  const addRecord = (recordData) => {
    try {
      const allRecords = JSON.parse(localStorage.getItem('activityMonitoringRecords') || '[]');
      
      const newRecord = {
        id: uuidv4(),
        activityId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        indicatorValues: recordData.indicatorValues || {},
        budgetStatus: recordData.budgetStatus || "Henüz harcama girişi yapılmadı", // Added new field
        ...recordData
      };

      const updatedAllRecords = [...allRecords, newRecord];
      localStorage.setItem('activityMonitoringRecords', JSON.stringify(updatedAllRecords));
      
      // Dispatch custom event to notify other components (like calculations) immediately
      window.dispatchEvent(new Event('monitoring-update'));
      
      return newRecord;
    } catch (error) {
      console.error("Error adding record:", error);
      throw error;
    }
  };

  // Update existing record
  const updateRecord = (recordId, updates) => {
    try {
      const allRecords = JSON.parse(localStorage.getItem('activityMonitoringRecords') || '[]');
      
      const updatedAllRecords = allRecords.map(record => {
        if (record.id === recordId) {
          return {
            ...record,
            ...updates,
            updatedAt: new Date().toISOString()
          };
        }
        return record;
      });

      localStorage.setItem('activityMonitoringRecords', JSON.stringify(updatedAllRecords));
      
      window.dispatchEvent(new Event('monitoring-update'));
      
      return true;
    } catch (error) {
      console.error("Error updating record:", error);
      throw error;
    }
  };

  // Delete record
  const deleteRecord = (recordId) => {
    try {
      const allRecords = JSON.parse(localStorage.getItem('activityMonitoringRecords') || '[]');
      const filteredRecords = allRecords.filter(r => r.id !== recordId);
      
      localStorage.setItem('activityMonitoringRecords', JSON.stringify(filteredRecords));
      
      window.dispatchEvent(new Event('monitoring-update'));
      
      return true;
    } catch (error) {
      console.error("Error deleting record:", error);
      throw error;
    }
  };

  return {
    records,
    loading,
    addRecord,
    updateRecord,
    deleteRecord
  };
};
