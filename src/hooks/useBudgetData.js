
import { useState, useEffect, useCallback } from 'react';

export const useBudgetData = () => {
  const [expenses, setExpenses] = useState([]);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const loadData = () => {
      try {
        const storedExpenses = JSON.parse(localStorage.getItem('harcamalar') || '[]');
        const storedActivities = JSON.parse(localStorage.getItem('activities') || '[]');
        setExpenses(storedExpenses);
        setActivities(storedActivities);
      } catch (error) {
        console.error("Error loading budget data:", error);
      }
    };

    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, []);

  const getBudgetSummary = useCallback((activityCode) => {
    // Get activity to find estimated budget
    const activity = activities.find(a => a.code === activityCode);
    const estimatedBudget = activity ? (Number(activity.budget) || 0) : 0;

    // Get expenses for this activity
    // Matching by 'faaliyet_kodu' which corresponds to activity.code
    const activityExpenses = expenses.filter(e => e.faaliyet_kodu === activityCode);
    
    // Sum all expenses found in Budget Management for this activity
    const realizedExpenses = activityExpenses.reduce((sum, e) => sum + (Number(e.toplam_tutar) || 0), 0);

    const remainingBudget = estimatedBudget - realizedExpenses;

    return {
      estimatedBudget,
      realizedExpenses,
      remainingBudget
    };
  }, [activities, expenses]);

  const checkExpenseRecords = useCallback((activityCode) => {
    return expenses.some(e => e.faaliyet_kodu === activityCode);
  }, [expenses]);

  return {
    getBudgetSummary,
    checkExpenseRecords
  };
};
