import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from './useAuthContext';

export const useRiskData = () => {
  const { currentUser } = useAuthContext();
  const [risks, setRisks] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Load data on mount - filtered by company
  useEffect(() => {
    const companyId = currentUser?.companyId;
    const allRisks = JSON.parse(localStorage.getItem('risks') || '[]');
    const allProjects = JSON.parse(localStorage.getItem('risk_projects') || '[]');
    
    // Filter by company_id
    const filterByCompany = (arr) => {
      if (!companyId) return arr; // Backward compatibility
      return arr.filter(item => item.companyId === companyId);
    };
    
    setRisks(filterByCompany(allRisks));
    setProjects(filterByCompany(allProjects));
  }, [currentUser?.companyId]);

  // Sync with localStorage
  useEffect(() => {
    localStorage.setItem('risks', JSON.stringify(risks));
  }, [risks]);

  useEffect(() => {
    localStorage.setItem('risk_projects', JSON.stringify(projects));
  }, [projects]);

  // --- RISK OPERATIONS ---
  const addRisk = (riskData) => {
    const newRisk = {
      ...riskData,
      id: riskData.id || uuidv4(),
      companyId: currentUser?.companyId, // Add company_id
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      score: Number(riskData.probability) * Number(riskData.impact),
      actionPlans: [],
      monitoringLogs: []
    };
    setRisks(prev => [newRisk, ...prev]);
    // Also save to localStorage with all risks
    const allRisks = JSON.parse(localStorage.getItem('risks') || '[]');
    allRisks.push(newRisk);
    localStorage.setItem('risks', JSON.stringify(allRisks));
    return newRisk;
  };

  const updateRisk = (id, updates) => {
    setRisks(prev => prev.map(r => {
      if (r.id === id) {
        const updated = { ...r, ...updates, updatedAt: new Date().toISOString() };
        if (updates.probability || updates.impact) {
          updated.score = Number(updated.probability || r.probability) * Number(updated.impact || r.impact);
        }
        return updated;
      }
      return r;
    }));
  };

  const deleteRisk = (id) => {
    setRisks(prev => prev.filter(r => r.id !== id));
  };

  // --- PROJECT OPERATIONS ---
  const addProject = (projectData) => {
    const newProject = {
      ...projectData,
      id: uuidv4(),
      createdAt: new Date().toISOString()
    };
    setProjects(prev => [...prev, newProject]);
  };

  const updateProject = (id, updates) => {
    setProjects(prev => prev.map(p => p.id === id ? { ...p, ...updates } : p));
  };

  const deleteProject = (id) => {
    setProjects(prev => prev.filter(p => p.id !== id));
  };

  // --- SUB-MODULE OPERATIONS ---
  const addActionPlan = (riskId, actionData) => {
    setRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        const newAction = { ...actionData, id: uuidv4(), createdAt: new Date().toISOString() };
        return { ...r, actionPlans: [...(r.actionPlans || []), newAction] };
      }
      return r;
    }));
  };

  const updateActionPlan = (riskId, actionId, updates) => {
    setRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        return {
          ...r,
          actionPlans: r.actionPlans.map(a => a.id === actionId ? { ...a, ...updates } : a)
        };
      }
      return r;
    }));
  };

  const deleteActionPlan = (riskId, actionId) => {
    setRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        return { ...r, actionPlans: r.actionPlans.filter(a => a.id !== actionId) };
      }
      return r;
    }));
  };

  const addMonitoringLog = (riskId, logData) => {
    setRisks(prev => prev.map(r => {
      if (r.id === riskId) {
        const newLog = { ...logData, id: uuidv4(), createdAt: new Date().toISOString() };
        // Optionally update the main risk probability/impact if latest log changes it
        // For now, we just log it as requested
        return { ...r, monitoringLogs: [newLog, ...(r.monitoringLogs || [])] };
      }
      return r;
    }));
  };

  return {
    risks,
    projects,
    addRisk,
    updateRisk,
    deleteRisk,
    addProject,
    updateProject,
    deleteProject,
    addActionPlan,
    updateActionPlan,
    deleteActionPlan,
    addMonitoringLog
  };
};