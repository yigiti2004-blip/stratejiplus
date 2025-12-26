import { useState, useEffect, useMemo } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from './useAuthContext';
import { getCompanyData, insertCompanyData, updateCompanyData, deleteCompanyData } from '@/lib/supabase';

export const useRiskData = () => {
  const { currentUser } = useAuthContext();
  const [risks, setRisks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Load data from Supabase - filtered by company
  useEffect(() => {
    const loadData = async () => {
      if (!currentUser) {
        console.log('No currentUser, skipping risk data load');
        setLoading(false);
        return;
      }
      
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (!companyId) {
        console.warn('No companyId available for loading risks');
        setLoading(false);
        return;
      }

      console.log('Loading risks for company:', companyId, 'user:', userId);
      try {
        setLoading(true);
        const [risksData, projectsData] = await Promise.all([
          getCompanyData('risks', userId, companyId, isAdmin),
          getCompanyData('risk_projects', userId, companyId, isAdmin),
        ]);

        console.log('Raw risks data from Supabase:', risksData);
        console.log('Raw projects data from Supabase:', projectsData);

        // Map snake_case to camelCase
        const mapRisk = (item) => {
          const probability = Number(item.probability || item.prob || 0);
          const impact = Number(item.impact || 0);
          const scoreFromDb = item.score;
          const computedScore =
            !Number.isNaN(probability) && !Number.isNaN(impact)
              ? probability * impact
              : 0;

          return {
            ...item,
            companyId: item.company_id || item.companyId,
            // normalize casing for UI
            riskType: item.risk_type || item.riskType || 'sp',
            score: scoreFromDb ?? computedScore,
            actionPlans: item.action_plans || item.actionPlans || [],
            monitoringLogs: item.monitoring_logs || item.monitoringLogs || [],
          };
        };

        const mapProject = (item) => ({
          ...item,
          companyId: item.company_id || item.companyId,
          // Map project_name back to name for UI compatibility
          name: item.project_name || item.name || '',
          // Keep other fields that might be in the form but not in DB (for display only)
          manager: item.manager || '',
          startDate: item.start_date || item.startDate || '',
          endDate: item.end_date || item.endDate || '',
          status: item.status || 'Aktif',
        });

        const mappedRisks = risksData.map(mapRisk);
        const mappedProjects = projectsData.map(mapProject);
        
        console.log('Mapped risks for UI:', mappedRisks);
        console.log('Mapped projects for UI:', mappedProjects);
        
        setRisks(mappedRisks);
        setProjects(mappedProjects);
      } catch (error) {
        console.error('Error loading risk data:', error);
        console.error('Error details:', JSON.stringify(error, null, 2));
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
    
    // Only include fields that exist in the risks table schema.
    // NOTE: We deliberately do NOT send `score` because the column is configured
    // in Supabase to use its own default/generation; sending a value causes
    // "cannot insert a non-DEFAULT value into column \"score\"" errors.
    const newRisk = {
      id: riskData.id || uuidv4(),
      name: riskData.name || '',
      risk_type: riskData.riskType || riskData.risk_type || 'sp',
      description: riskData.description || null,
      probability: Number(riskData.probability) || 3,
      impact: Number(riskData.impact) || 3,
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
    
    const mapRisk = (item) => {
      const probability = Number(item.probability || item.prob || 0);
      const impact = Number(item.impact || 0);
      const scoreFromDb = item.score;
      const computedScore =
        !Number.isNaN(probability) && !Number.isNaN(impact)
          ? probability * impact
          : 0;

      return {
        ...item,
        companyId: item.company_id || item.companyId,
        riskType: item.risk_type || item.riskType || 'sp',
        score: scoreFromDb ?? computedScore,
        actionPlans: item.action_plans || item.actionPlans || [],
        monitoringLogs: item.monitoring_logs || item.monitoringLogs || [],
      };
    };
    
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
    
    const mapRisk = (item) => {
      const probability = Number(item.probability || item.prob || 0);
      const impact = Number(item.impact || 0);
      const scoreFromDb = item.score;
      const computedScore =
        !Number.isNaN(probability) && !Number.isNaN(impact)
          ? probability * impact
          : 0;

      return {
        ...item,
        companyId: item.company_id || item.companyId,
        riskType: item.risk_type || item.riskType || 'sp',
        score: scoreFromDb ?? computedScore,
        actionPlans: item.action_plans || item.actionPlans || [],
        monitoringLogs: item.monitoring_logs || item.monitoringLogs || [],
      };
    };
    
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
    
    if (!companyId) {
      console.error('No companyId available for adding project');
      alert('Şirket bilgisi bulunamadı. Lütfen tekrar giriş yapın.');
      return;
    }
    
    // Include all fields from the form
    const newProject = {
      id: projectData.id || uuidv4(),
      project_name: projectData.name || projectData.project_name || '',
      description: projectData.description || null,
      risk_id: projectData.riskId || projectData.risk_id || null,
      manager: projectData.manager || null,
      start_date: projectData.startDate || projectData.start_date || null,
      end_date: projectData.endDate || projectData.end_date || null,
      status: projectData.status || 'Aktif',
    };

    console.log('Adding project with data:', newProject);
    const { data, error } = await insertCompanyData('risk_projects', newProject, userId, companyId);
    
    if (error) {
      console.error('Error adding project:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(`Proje eklenirken hata oluştu: ${error.message || JSON.stringify(error)}`);
      return;
    }

    console.log('Project added successfully, refreshing data...');
    // Refresh data
    const isAdmin = currentUser?.roleId === 'admin';
    const [projectsData] = await Promise.all([
      getCompanyData('risk_projects', userId, companyId, isAdmin),
    ]);
    
    console.log('Loaded projects from Supabase:', projectsData);
    
    const mapProject = (item) => ({
      ...item,
      companyId: item.company_id || item.companyId,
      // Map project_name back to name for UI compatibility
      name: item.project_name || item.name || '',
      // Keep other fields that might be in the form but not in DB (for display only)
      manager: item.manager || '',
      startDate: item.start_date || item.startDate || '',
      endDate: item.end_date || item.endDate || '',
      status: item.status || 'Aktif',
    });
    
    const mappedProjects = projectsData.map(mapProject);
    console.log('Mapped projects for UI:', mappedProjects);
    setProjects(mappedProjects);
    return data;
  };

  const updateProject = async (id, updates) => {
    const userId = currentUser?.id || currentUser?.userId;
    
    // Map UI fields to DB fields
    const updateData = {
      project_name: updates.name || updates.project_name || null,
      description: updates.description || null,
      risk_id: updates.riskId || updates.risk_id || null,
      manager: updates.manager || null,
      start_date: updates.startDate || updates.start_date || null,
      end_date: updates.endDate || updates.end_date || null,
      status: updates.status || null,
    };
    
    console.log('Updating project with data:', updateData);
    const { error } = await updateCompanyData('risk_projects', id, updateData, userId);
    
    if (error) {
      console.error('Error updating project:', error);
      console.error('Error details:', JSON.stringify(error, null, 2));
      alert(`Proje güncellenirken hata oluştu: ${error.message || JSON.stringify(error)}`);
      return;
    }

    console.log('Project updated successfully, refreshing data...');
    // Refresh data
    const companyId = currentUser?.companyId;
    const isAdmin = currentUser?.roleId === 'admin';
    const [projectsData] = await Promise.all([
      getCompanyData('risk_projects', userId, companyId, isAdmin),
    ]);
    
    console.log('Loaded projects from Supabase after update:', projectsData);
    
    const mapProject = (item) => ({
      ...item,
      companyId: item.company_id || item.companyId,
      // Map project_name back to name for UI compatibility
      name: item.project_name || item.name || '',
      // Keep other fields that might be in the form but not in DB (for display only)
      manager: item.manager || '',
      startDate: item.start_date || item.startDate || '',
      endDate: item.end_date || item.endDate || '',
      status: item.status || 'Aktif',
    });
    
    const mappedProjects = projectsData.map(mapProject);
    console.log('Mapped projects for UI after update:', mappedProjects);
    setProjects(mappedProjects);
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
      // Map project_name back to name for UI compatibility
      name: item.project_name || item.name || '',
      // Keep other fields that might be in the form but not in DB (for display only)
      manager: item.manager || '',
      startDate: item.start_date || item.startDate || '',
      endDate: item.end_date || item.endDate || '',
      status: item.status || 'Aktif',
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
    loading,
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