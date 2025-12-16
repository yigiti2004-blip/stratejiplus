import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from './useAuthContext';
import { getCompanyData, insertCompanyData, updateCompanyData, deleteCompanyData } from '@/lib/supabase';

export const useRiskData = () => {
  const { currentUser } = useAuthContext();
  const [risks, setRisks] = useState([]);
  const [projects, setProjects] = useState([]);
  
  // Load data from Supabase - filtered by company
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) return;
      
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      try {
        const [risksData, projectsData] = await Promise.all([
          getCompanyData('risks', userId, companyId, isAdmin),
          getCompanyData('risk_projects', userId, companyId, isAdmin),
        ]);

        // Map snake_case to camelCase
        const mapRisk = (item) => ({
          ...item,
          companyId: item.company_id || item.companyId,
          // normalize casing for UI
          riskType: item.risk_type || item.riskType || 'sp',
          actionPlans: item.action_plans || item.actionPlans || [],
          monitoringLogs: item.monitoring_logs || item.monitoringLogs || [],
        });

        const mapProject = (item) => ({
          ...item,
          companyId: item.company_id || item.companyId,
        });

        setRisks(risksData.map(mapRisk));
        setProjects(projectsData.map(mapProject));
      } catch (error) {
        console.error('Error loading risk data:', error);
      }
    };

    loadData();
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  // --- RISK OPERATIONS ---
  const addRisk = async (riskData) => {
    const userId = currentUser?.id || currentUser?.userId;
    const companyId = currentUser?.companyId;
    
    if (!companyId) {
      console.error('No companyId available for adding risk');
      return null;
    }
    
    // Only include fields that exist in the risks table schema
    const newRisk = {
      id: riskData.id || uuidv4(),
      name: riskData.name || '',
      risk_type: riskData.riskType || riskData.risk_type || 'sp',
      description: riskData.description || null,
      probability: Number(riskData.probability) || 3,
      impact: Number(riskData.impact) || 3,
      score: Number(riskData.probability || 3) * Number(riskData.impact || 3),
      status: riskData.status || 'Aktif',
      responsible: riskData.responsible || null,
      related_record_type: riskData.relatedRecordType || riskData.related_record_type || null,
      related_record_id: riskData.relatedRecordId || riskData.related_record_id || null,
    };

    console.log('Adding risk with data:', newRisk);
    const { data, error } = await insertCompanyData('risks', newRisk, userId, companyId);
    
    if (error) {
      console.error('Error adding risk:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(`Risk eklenirken hata oluştu: ${error.message || JSON.stringify(error)}`);
      return null;
    }

    console.log('Risk added successfully, refreshing data...');
    // Refresh data
    const [risksData] = await Promise.all([
      getCompanyData('risks', userId, companyId, currentUser?.roleId === 'admin'),
    ]);
    
    console.log('Loaded risks from Supabase:', risksData);
    
    const mapRisk = (item) => ({
      ...item,
      companyId: item.company_id || item.companyId,
      riskType: item.risk_type || item.riskType || 'sp',
      actionPlans: item.action_plans || item.actionPlans || [],
      monitoringLogs: item.monitoring_logs || item.monitoringLogs || [],
    });
    
    const mappedRisks = risksData.map(mapRisk);
    console.log('Mapped risks for UI:', mappedRisks);
    setRisks(mappedRisks);
    return data;
  };

  const updateRisk = async (id, updates) => {
    const userId = currentUser?.id || currentUser?.userId;
    
    const updateData = { ...updates };
    if (updates.probability || updates.impact) {
      updateData.score = Number(updates.probability || risks.find(r => r.id === id)?.probability) * 
                         Number(updates.impact || risks.find(r => r.id === id)?.impact);
    }

    const { error } = await updateCompanyData('risks', id, updateData, userId);
    
    if (error) {
      console.error('Error updating risk:', error);
      return;
    }

    // Refresh data
    const companyId = currentUser?.companyId;
    const isAdmin = currentUser?.roleId === 'admin';
    const [risksData] = await Promise.all([
      getCompanyData('risks', userId, companyId, isAdmin),
    ]);
    
    const mapRisk = (item) => ({
      ...item,
      companyId: item.company_id || item.companyId,
      riskType: item.risk_type || item.riskType || 'sp',
      actionPlans: item.action_plans || item.actionPlans || [],
      monitoringLogs: item.monitoring_logs || item.monitoringLogs || [],
    });
    
    setRisks(risksData.map(mapRisk));
  };

  const deleteRisk = async (id) => {
    const userId = currentUser?.id || currentUser?.userId;
    
    const { error } = await deleteCompanyData('risks', id, userId);
    
    if (error) {
      console.error('Error deleting risk:', error);
      return;
    }

    // Refresh data
    const companyId = currentUser?.companyId;
    const isAdmin = currentUser?.roleId === 'admin';
    const [risksData] = await Promise.all([
      getCompanyData('risks', userId, companyId, isAdmin),
    ]);
    
    const mapRisk = (item) => ({
      ...item,
      companyId: item.company_id || item.companyId,
      actionPlans: item.action_plans || item.actionPlans || [],
      monitoringLogs: item.monitoring_logs || item.monitoringLogs || [],
    });
    
    setRisks(risksData.map(mapRisk));
  };

  // --- PROJECT OPERATIONS ---
  const addProject = async (projectData) => {
    const userId = currentUser?.id || currentUser?.userId;
    const companyId = currentUser?.companyId;
    
    const newProject = {
      ...projectData,
      id: uuidv4(),
    };

    const { error } = await insertCompanyData('risk_projects', newProject, userId, companyId);
    
    if (error) {
      console.error('Error adding project:', error);
      return;
    }

    // Refresh data
    const isAdmin = currentUser?.roleId === 'admin';
    const [projectsData] = await Promise.all([
      getCompanyData('risk_projects', userId, companyId, isAdmin),
    ]);
    
    const mapProject = (item) => ({
      ...item,
      companyId: item.company_id || item.companyId,
    });
    
    setProjects(projectsData.map(mapProject));
  };

  const updateProject = async (id, updates) => {
    const userId = currentUser?.id || currentUser?.userId;
    
    const { error } = await updateCompanyData('risk_projects', id, updates, userId);
    
    if (error) {
      console.error('Error updating project:', error);
      return;
    }

    // Refresh data
    const companyId = currentUser?.companyId;
    const isAdmin = currentUser?.roleId === 'admin';
    const [projectsData] = await Promise.all([
      getCompanyData('risk_projects', userId, companyId, isAdmin),
    ]);
    
    const mapProject = (item) => ({
      ...item,
      companyId: item.company_id || item.companyId,
    });
    
    setProjects(projectsData.map(mapProject));
  };

  const deleteProject = async (id) => {
    const userId = currentUser?.id || currentUser?.userId;
    
    const { error } = await deleteCompanyData('risk_projects', id, userId);
    
    if (error) {
      console.error('Error deleting project:', error);
      return;
    }

    // Refresh data
    const companyId = currentUser?.companyId;
    const isAdmin = currentUser?.roleId === 'admin';
    const [projectsData] = await Promise.all([
      getCompanyData('risk_projects', userId, companyId, isAdmin),
    ]);
    
    const mapProject = (item) => ({
      ...item,
      companyId: item.company_id || item.companyId,
    });
    
    setProjects(projectsData.map(mapProject));
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