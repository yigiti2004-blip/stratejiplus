
import React, { useState, useEffect } from 'react';
import { 
  ChevronDown, ChevronRight, 
  ExternalLink, DollarSign, AlertTriangle, FileText,
  Calendar, Users, Target, TrendingUp, Clock, CheckCircle,
  ArrowRight, Eye, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';
import { getCompanyData } from '@/lib/supabase';

export default function StrategicSnapshot() {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  const [strategies, setStrategies] = useState([]);
  const [expandedNodes, setExpandedNodes] = useState({});
  const [selectedElement, setSelectedElement] = useState(null);
  const [elementDetails, setElementDetails] = useState(null);
  const [activityTimeline, setActivityTimeline] = useState([]);
  const [budgetData, setBudgetData] = useState({});
  const [trackingRecords, setTrackingRecords] = useState([]);
  const [risksData, setRisksData] = useState([]);
  const [revisionsData, setRevisionsData] = useState([]);
  const [budgetChapters, setBudgetChapters] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [allActivities, setAllActivities] = useState([]);

  // Diagnostic function - logs data structure for debugging
  const logTimelineData = async (activityId) => {
    console.log('=== TIMELINE DATA DEBUG ===');
    console.log('Activity ID:', activityId);
    
    const companyId = currentUser?.companyId;
    const userId = currentUser?.id || currentUser?.userId;
    const isAdmin = currentUser?.roleId === 'admin';
    
    let risks = [];
    let revisions = [];
    
    if (companyId && userId) {
      const [risksRaw, revisionsRaw] = await Promise.all([
        getCompanyData('risks', userId, companyId, isAdmin),
        getCompanyData('revisions', userId, companyId, isAdmin),
      ]);
      risks = risksRaw || [];
      revisions = revisionsRaw || [];
    }
    
    console.log('Total Risks in system:', risks.length);
    // console.log('Risks data sample:', risks.slice(0, 2));
    
    console.log('Total Revisions in system:', revisions.length);
    // console.log('Revisions data sample:', revisions.slice(0, 2));
    
    // Find risks linked to this activity
    const linkedRisks = risks.filter(risk => {
      return (risk.linkedActivities && Array.isArray(risk.linkedActivities) && risk.linkedActivities.includes(activityId)) ||
             (risk.activityId === activityId) ||
             (risk.relatedActivities && Array.isArray(risk.relatedActivities) && risk.relatedActivities.includes(activityId)) ||
             (risk.activities && Array.isArray(risk.activities) && risk.activities.includes(activityId));
    });
    console.log('Risks linked to activity:', linkedRisks.length, linkedRisks);
    
    // Find revisions linked to this activity
    const linkedRevisions = revisions.filter(revision => {
      return (revision.scope && Array.isArray(revision.scope) && revision.scope.includes(activityId)) ||
             (revision.affectedActivities && Array.isArray(revision.affectedActivities) && revision.affectedActivities.includes(activityId)) ||
             (revision.itemId === activityId && revision.itemType === 'Faaliyet') ||
             (revision.activityId === activityId) ||
             (revision.activities && Array.isArray(revision.activities) && revision.activities.includes(activityId)) ||
             (revision.relatedActivities && Array.isArray(revision.relatedActivities) && revision.relatedActivities.includes(activityId)) ||
             (revision.scopeItems && Array.isArray(revision.scopeItems) && revision.scopeItems.some(item => item.id === activityId || item.activityId === activityId));
    });
    console.log('Revisions linked to activity:', linkedRevisions.length, linkedRevisions);
  };

  // Build activity timeline - FIXED with proper data structure handling
  const buildActivityTimeline = (activityId, trackingRecords, budgetData, risksData, revisionsData) => {
    const timeline = [];

    // 1. Get tracking records for this activity
    const activityTracking = trackingRecords.filter(record => record.activityId === activityId);
    activityTracking.forEach(record => {
      timeline.push({
        date: record.recordDate,
        source: 'Plan İzleme',
        sourceIcon: 'tracking',
        description: record.description || 'İzleme Kaydı',
        value: `${record.progressPercentage || 0}%`,
        notes: record.notes,
        type: 'tracking'
      });
    });

    // 2. Get budget movements for this activity
    Object.values(budgetData).forEach((chapterInfo) => {
      if (chapterInfo.activities && chapterInfo.activities[activityId]) {
        const activityBudget = chapterInfo.activities[activityId];
        if (activityBudget.expenses && Array.isArray(activityBudget.expenses)) {
          activityBudget.expenses.forEach(expense => {
            timeline.push({
              date: expense.date,
              source: 'Bütçe',
              sourceIcon: 'budget',
              description: expense.description || 'Harcama Kaydı',
              value: `₺${new Intl.NumberFormat('tr-TR').format(expense.amount)}`,
              notes: expense.notes,
              type: 'budget'
            });
          });
        }
      }
    });

    // 3. Get risks related to this activity - FIXED
    if (Array.isArray(risksData)) {
      risksData.forEach(risk => {
        // Check multiple possible field names for activity linkage
        const isLinkedToActivity = 
          (risk.linkedActivities && Array.isArray(risk.linkedActivities) && risk.linkedActivities.includes(activityId)) ||
          (risk.activityId === activityId) ||
          (risk.relatedActivities && Array.isArray(risk.relatedActivities) && risk.relatedActivities.includes(activityId)) ||
          (risk.activities && Array.isArray(risk.activities) && risk.activities.includes(activityId));

        if (isLinkedToActivity) {
          // Add initial risk record
          const riskInitialDate = risk.createdDate || risk.identificationDate || risk.date || new Date().toISOString();
          timeline.push({
            date: riskInitialDate,
            source: 'Risk Yönetimi',
            sourceIcon: 'risk',
            description: `Risk: ${risk.definition || risk.name || risk.title || 'Tanımsız Risk'}`,
            riskCode: risk.code || risk.riskCode || '-',
            previousImpact: '-',
            previousProbability: '-',
            currentImpact: risk.impact || risk.impactLevel || '-',
            currentProbability: risk.probability || risk.probabilityLevel || '-',
            riskReduced: false,
            notes: `Etki: ${risk.impact || risk.impactLevel || '-'} | Olasılık: ${risk.probability || risk.probabilityLevel || '-'}`,
            type: 'risk',
            value: `${risk.impact || risk.impactLevel || '-'} / ${risk.probability || risk.probabilityLevel || '-'}`
          });

          // Add risk change history if exists
          if (risk.changeHistory && Array.isArray(risk.changeHistory) && risk.changeHistory.length > 0) {
            risk.changeHistory.forEach(change => {
              timeline.push({
                date: change.date || change.changeDate || change.recordDate,
                source: 'Risk Yönetimi',
                sourceIcon: 'risk',
                description: `Risk Değişikliği: ${risk.definition || risk.name || risk.title || 'Tanımsız Risk'}`,
                riskCode: risk.code || risk.riskCode || '-',
                previousImpact: change.previousImpact || change.previousLevel || change.oldImpact || '-',
                previousProbability: change.previousProbability || change.oldProbability || '-',
                currentImpact: change.newImpact || change.newLevel || change.impact || '-',
                currentProbability: change.newProbability || change.probability || '-',
                riskReduced: risk.changeStatus === 'Azaldı' || change.status === 'Azaldı' || change.reduced === true,
                notes: change.reason || change.notes || change.description || '',
                type: 'risk',
                value: `${change.previousLevel || change.previousImpact || '-'} → ${change.newLevel || change.newImpact || '-'}`
              });
            });
          }

          // Add risk history entries if exists (alternative structure)
          if (risk.history && Array.isArray(risk.history) && risk.history.length > 0) {
            risk.history.forEach(historyEntry => {
              timeline.push({
                date: historyEntry.date || historyEntry.recordDate,
                source: 'Risk Yönetimi',
                sourceIcon: 'risk',
                description: `Risk Güncelleme: ${risk.definition || risk.name || risk.title || 'Tanımsız Risk'}`,
                riskCode: risk.code || risk.riskCode || '-',
                previousImpact: historyEntry.previousImpact || '-',
                previousProbability: historyEntry.previousProbability || '-',
                currentImpact: historyEntry.currentImpact || historyEntry.impact || '-',
                currentProbability: historyEntry.currentProbability || historyEntry.probability || '-',
                riskReduced: historyEntry.reduced === true,
                notes: historyEntry.notes || historyEntry.description || '',
                type: 'risk',
                value: `${historyEntry.previousImpact || '-'} → ${historyEntry.currentImpact || '-'}`
              });
            });
          }
        }
      });
    }

    // 4. Get revisions that include this activity in scope - FIXED
    if (Array.isArray(revisionsData)) {
      revisionsData.forEach(revision => {
        // Check multiple possible field names for activity inclusion
        const isActivityInScope = 
          (revision.scope && Array.isArray(revision.scope) && revision.scope.includes(activityId)) ||
          (revision.affectedActivities && Array.isArray(revision.affectedActivities) && revision.affectedActivities.includes(activityId)) ||
          (revision.itemId === activityId && revision.itemType === 'Faaliyet') ||
          (revision.activityId === activityId) ||
          (revision.activities && Array.isArray(revision.activities) && revision.activities.includes(activityId)) ||
          (revision.relatedActivities && Array.isArray(revision.relatedActivities) && revision.relatedActivities.includes(activityId)) ||
          (revision.scopeItems && Array.isArray(revision.scopeItems) && revision.scopeItems.some(item => item.id === activityId || item.activityId === activityId));

        if (isActivityInScope) {
          timeline.push({
            date: revision.revisionDate || revision.createdDate || revision.date,
            source: 'Revizyon',
            sourceIcon: 'revision',
            description: `Revizyon: ${revision.itemName || revision.name || 'Faaliyet Revizyonu'}`,
            revisionType: revision.revisionType || revision.type || revision.changeType || '-',
            revisionReason: revision.reason || revision.description || revision.notes || '-',
            approvalStatus: revision.approvalStatus || revision.status || 'Taslak',
            notes: revision.notes || revision.comments || '',
            type: 'revision',
            value: revision.approvalStatus === 'Onaylandı' ? '✓ Onaylandı' : 'Taslak'
          });
        }
      });
    }

    // Sort by date (newest first)
    return timeline.sort((a, b) => {
      const dateA = new Date(a.date || 0);
      const dateB = new Date(b.date || 0);
      return dateB - dateA;
    });
  };

  // Load all data (Supabase for SP hierarchy, localStorage for other modules)
  useEffect(() => {
    const loadData = async () => {
      try {
        // --- 1) Build Strategic Plan hierarchy from Supabase (per tenant) ---
        const companyId = currentUser?.companyId;
        const userId = currentUser?.id || currentUser?.userId;
        const isAdmin = currentUser?.roleId === 'admin';

        let areas = [];
        let objectives = [];
        let targets = [];
        let activities = [];

        if (companyId && userId) {
          const [
            areasRaw,
            objectivesRaw,
            targetsRaw,
            activitiesRaw,
          ] = await Promise.all([
            getCompanyData('strategic_areas', userId, companyId, isAdmin),
            getCompanyData('strategic_objectives', userId, companyId, isAdmin),
            getCompanyData('targets', userId, companyId, isAdmin),
            getCompanyData('activities', userId, companyId, isAdmin),
          ]);

          const mapAreas = (items) =>
            (items || []).map((item) => ({
              ...item,
              companyId: item.company_id || item.companyId,
              responsibleUnit: item.responsible_unit || item.responsibleUnit || '-',
            }));

          const mapObjectives = (items) =>
            (items || []).map((item) => ({
              ...item,
              companyId: item.company_id || item.companyId,
              strategicAreaId: item.strategic_area_id || item.strategicAreaId,
              responsibleUnit: item.responsible_unit || item.responsibleUnit || '-',
            }));

          const mapTargets = (items) =>
            (items || []).map((item) => ({
              ...item,
              companyId: item.company_id || item.companyId,
              objectiveId: item.objective_id || item.objectiveId,
              completion: Number(item.completion_percentage ?? item.completion ?? 0),
              responsibleUnit: item.responsible_unit || item.responsibleUnit || '-',
            }));

          const mapActivities = (items) =>
            (items || []).map((item) => ({
              ...item,
              companyId: item.company_id || item.companyId,
              targetId: item.target_id || item.targetId,
              budgetChapterId: item.budget_chapter_id || item.budgetChapterId,
              plannedBudget: item.planned_budget ?? item.plannedBudget,
              completion: Number(item.completion ?? 0),
            }));

          areas = mapAreas(areasRaw);
          objectives = mapObjectives(objectivesRaw);
          targets = mapTargets(targetsRaw);
          activities = mapActivities(activitiesRaw);
        }

        // --- 2) Budget & other modules from Supabase ---
        let budgetChapters = [];
        let expenses = [];
        
        if (companyId && userId) {
          const [budgetChaptersRaw, expensesRaw] = await Promise.all([
            getCompanyData('budget_chapters', userId, companyId, isAdmin),
            getCompanyData('expenses', userId, companyId, isAdmin),
          ]);
          
          budgetChapters = (budgetChaptersRaw || []).map(item => ({
            ...item,
            id: item.id,
            code: item.code,
            name: item.name,
          }));
          
          expenses = (expensesRaw || []).map(item => ({
            ...item,
            id: item.id,
            activityId: item.activity_id,
            amount: Number(item.amount) || 0,
            status: item.status,
          }));
        }

        // Enrich activities with chapter info, budget & responsible unit for compatibility
        activities = activities.map((a) => {
          const chapter = budgetChapters.find((c) => c.id === (a.budgetChapterId || a.budget_chapter_id));
          return {
            ...a,
            chapterCode: chapter?.code || '-',
            chapterName: chapter?.name || '-',
            estimatedBudget: Number(a.plannedBudget ?? a.planned_budget ?? 0),
            completion: Number(a.completion ?? 0),
            responsibleUnit: a.responsibleUnit || a.responsible_unit || '-',
          };
        });

        const strategiesData = areas.map((area) => ({
          ...area,
          objectives: objectives
            .filter((o) => o.strategicAreaId === area.id)
            .map((obj) => ({
              ...obj,
              targets: targets
                .filter((t) => t.objectiveId === obj.id)
                .map((target) => ({
                  ...target,
                  activities: activities.filter((a) => a.targetId === target.id),
                })),
            })),
        }));

        setStrategies(strategiesData);

        // --- 3) Load other modules from Supabase ---
        let trackingRecords = [];
        let risksData = [];
        let revisionsData = [];
        
        if (companyId && userId) {
          const [realizationRecordsRaw, risksRaw, revisionsRaw] = await Promise.all([
            getCompanyData('activity_realization_records', userId, companyId, isAdmin),
            getCompanyData('risks', userId, companyId, isAdmin),
            getCompanyData('revisions', userId, companyId, isAdmin),
          ]);
          
          // Map realization records to tracking records format
          trackingRecords = (realizationRecordsRaw || []).map(item => ({
            id: item.id,
            activityId: item.activity_id,
            recordDate: item.record_date || item.created_at,
            completionPercentage: Number(item.completion_percentage) || 0,
          }));
          
          risksData = (risksRaw || []).map(item => ({
            ...item,
            id: item.id,
            name: item.name,
            relatedRecordId: item.related_record_id,
            relatedRecordType: item.related_record_type,
          }));
          
          revisionsData = (revisionsRaw || []).map(item => ({
            ...item,
            id: item.id,
            entityId: item.entity_id,
            entityType: item.entity_type,
          }));
        }

        // Build budgetData map for lookups
        const budgetData = {};
        activities.forEach((act) => {
          const key = `${act.chapterCode}-${act.chapterName}`;
          if (!budgetData[key]) budgetData[key] = { activities: {} };

          // Get actual expenses for this activity
          const actExpenses = expenses.filter(
            (e) => (e.activityId || e.activity_id) === act.id && e.status !== 'Reddedildi'
          );

          // Also store raw expenses list for timeline
          const expenseList = actExpenses.map((e) => ({
            date: e.date || e.expense_date,
            description: e.description,
            amount: Number(e.amount),
            notes: '',
          }));

          const actual = actExpenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);

          budgetData[key].activities[act.id] = {
            actualSpending: actual,
            expenses: expenseList,
          };
        });

        // Auto-expand first area
        if (strategiesData.length > 0) {
          setExpandedNodes({ [`area-${strategiesData[0].id}`]: true });
          selectElement('area', strategiesData[0], trackingRecords, budgetData, risksData, revisionsData);
        }
      } catch (error) {
        console.error('Veri yükleme hatası (Supabase + localStorage):', error);
      }
    };

    loadData();
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  // Toggle expand/collapse
  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => ({
      ...prev,
      [nodeId]: !prev[nodeId]
    }));
  };

  // Select element and load details
  const selectElement = (type, element, trackingRecords, budgetData, risksData, revisionsData) => {
    const details = {
      type: type,
      id: element.id,
      code: element.code || '-',
      name: element.name || '-',
      description: element.description || '-',
      startDate: element.startDate || element.plannedStartDate || null,
      endDate: element.endDate || element.plannedEndDate || null,
      responsibleUnit: element.responsibleUnit || '-',
      linkedTarget: null,
      performance: 0,
      trackingRecords: [],
      budget: {
        estimated: 0,
        actual: 0,
        variance: 0,
        variancePercent: 0
      },
      risks: {
        total: 0,
        reduced: 0,
        list: []
      },
      revisions: {
        total: 0,
        lastDate: null,
        list: []
      }
    };

    // Calculate performance based on type
    if (type === 'area') {
      let totalPerformance = 0;
      let targetCount = 0;
      element.objectives?.forEach(obj => {
        obj.targets?.forEach(target => {
          totalPerformance += target.completion || 0;
          targetCount++;
        });
      });
      details.performance = targetCount > 0 ? Math.round(totalPerformance / targetCount) : 0;

      // Get budget for all activities in area
      let totalEstimated = 0;
      let totalActual = 0;
      element.objectives?.forEach(obj => {
        obj.targets?.forEach(target => {
          target.activities?.forEach(activity => {
            const chapterKey = `${activity.chapterCode}-${activity.chapterName}`;
            const chapterBudgetInfo = budgetData[chapterKey] || {};
            totalEstimated += activity.estimatedBudget || 0;
            totalActual += chapterBudgetInfo.activities?.[activity.id]?.actualSpending || 0;
          });
        });
      });
      details.budget.estimated = totalEstimated;
      details.budget.actual = totalActual;
      details.budget.variance = totalActual - totalEstimated;
      details.budget.variancePercent = totalEstimated > 0 ? ((details.budget.variance / totalEstimated) * 100).toFixed(2) : 0;

      // Get risks for area
      const areaRisks = risksData.filter(risk => {
        return element.objectives?.some(obj =>
          obj.targets?.some(target =>
            target.linkedRisks?.includes(risk.id)
          )
        );
      });
      details.risks.total = areaRisks.length;
      details.risks.reduced = areaRisks.filter(r => r.changeStatus === 'Azaldı').length;
      details.risks.list = areaRisks;

      // Get revisions for area
      const areaRevisions = revisionsData.filter(rev => {
        return element.objectives?.some(obj =>
          obj.targets?.some(target =>
            target.id === rev.itemId || (rev.itemType === 'Hedef' && target.id === rev.itemId)
          )
        );
      });
      details.revisions.total = areaRevisions.length;
      if (areaRevisions.length > 0) {
        const lastRevision = areaRevisions.sort((a, b) => new Date(b.revisionDate) - new Date(a.revisionDate))[0];
        details.revisions.lastDate = lastRevision.revisionDate;
      }
      details.revisions.list = areaRevisions;

      setActivityTimeline([]);

    } else if (type === 'objective') {
      let totalPerformance = 0;
      let targetCount = 0;
      element.targets?.forEach(target => {
        totalPerformance += target.completion || 0;
        targetCount++;
      });
      details.performance = targetCount > 0 ? Math.round(totalPerformance / targetCount) : 0;

      // Get budget for all activities in objective
      let totalEstimated = 0;
      let totalActual = 0;
      element.targets?.forEach(target => {
        target.activities?.forEach(activity => {
          const chapterKey = `${activity.chapterCode}-${activity.chapterName}`;
          const chapterBudgetInfo = budgetData[chapterKey] || {};
          totalEstimated += activity.estimatedBudget || 0;
          totalActual += chapterBudgetInfo.activities?.[activity.id]?.actualSpending || 0;
        });
      });
      details.budget.estimated = totalEstimated;
      details.budget.actual = totalActual;
      details.budget.variance = totalActual - totalEstimated;
      details.budget.variancePercent = totalEstimated > 0 ? ((details.budget.variance / totalEstimated) * 100).toFixed(2) : 0;

      // Get risks for objective
      const objectiveRisks = risksData.filter(risk => {
        return element.targets?.some(target =>
          target.linkedRisks?.includes(risk.id)
        );
      });
      details.risks.total = objectiveRisks.length;
      details.risks.reduced = objectiveRisks.filter(r => r.changeStatus === 'Azaldı').length;
      details.risks.list = objectiveRisks;

      // Get revisions for objective
      const objectiveRevisions = revisionsData.filter(rev => {
        return element.targets?.some(target =>
          target.id === rev.itemId || (rev.itemType === 'Hedef' && target.id === rev.itemId)
        );
      });
      details.revisions.total = objectiveRevisions.length;
      if (objectiveRevisions.length > 0) {
        const lastRevision = objectiveRevisions.sort((a, b) => new Date(b.revisionDate) - new Date(a.revisionDate))[0];
        details.revisions.lastDate = lastRevision.revisionDate;
      }
      details.revisions.list = objectiveRevisions;

      setActivityTimeline([]);

    } else if (type === 'target') {
      details.performance = element.completion || 0;
      details.startDate = element.startDate || element.plannedStartDate || null;
      details.endDate = element.endDate || element.plannedEndDate || null;
      details.responsibleUnit = element.responsibleUnit || '-';

      // Get budget for all activities in target
      let totalEstimated = 0;
      let totalActual = 0;
      element.activities?.forEach(activity => {
        const chapterKey = `${activity.chapterCode}-${activity.chapterName}`;
        const chapterBudgetInfo = budgetData[chapterKey] || {};
        totalEstimated += activity.estimatedBudget || 0;
        totalActual += chapterBudgetInfo.activities?.[activity.id]?.actualSpending || 0;
      });
      details.budget.estimated = totalEstimated;
      details.budget.actual = totalActual;
      details.budget.variance = totalActual - totalEstimated;
      details.budget.variancePercent = totalEstimated > 0 ? ((details.budget.variance / totalEstimated) * 100).toFixed(2) : 0;

      // Get risks for target
      const targetRisks = risksData.filter(risk =>
        element.linkedRisks?.includes(risk.id)
      );
      details.risks.total = targetRisks.length;
      details.risks.reduced = targetRisks.filter(r => r.changeStatus === 'Azaldı').length;
      details.risks.list = targetRisks;

      // Get revisions for target
      const targetRevisions = revisionsData.filter(rev =>
        rev.itemId === element.id || (rev.itemType === 'Hedef' && rev.itemId === element.id)
      );
      details.revisions.total = targetRevisions.length;
      if (targetRevisions.length > 0) {
        const lastRevision = targetRevisions.sort((a, b) => new Date(b.revisionDate) - new Date(a.revisionDate))[0];
        details.revisions.lastDate = lastRevision.revisionDate;
      }
      details.revisions.list = targetRevisions;

      setActivityTimeline([]);

    } else if (type === 'activity') {
      details.performance = element.completion || 0;
      details.startDate = element.startDate || element.plannedStartDate || null;
      details.endDate = element.endDate || element.plannedEndDate || null;
      details.responsibleUnit = element.responsibleUnit || '-';

      // Get budget for activity
      const chapterKey = `${element.chapterCode}-${element.chapterName}`;
      const chapterBudgetInfo = budgetData[chapterKey] || {};
      details.budget.estimated = element.estimatedBudget || 0;
      details.budget.actual = chapterBudgetInfo.activities?.[element.id]?.actualSpending || 0;
      details.budget.variance = details.budget.actual - details.budget.estimated;
      details.budget.variancePercent = details.budget.estimated > 0 ? ((details.budget.variance / details.budget.estimated) * 100).toFixed(2) : 0;

      // Get tracking records for activity
      const activityTracking = trackingRecords.filter(record => record.activityId === element.id);
      details.trackingRecords = activityTracking.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));

      // Get revisions for activity
      const activityRevisions = revisionsData.filter(rev =>
        rev.itemId === element.id || (rev.itemType === 'Faaliyet' && rev.itemId === element.id)
      );
      details.revisions.total = activityRevisions.length;
      if (activityRevisions.length > 0) {
        const lastRevision = activityRevisions.sort((a, b) => new Date(b.revisionDate) - new Date(a.revisionDate))[0];
        details.revisions.lastDate = lastRevision.revisionDate;
      }
      details.revisions.list = activityRevisions;

      // Build activity timeline - ENHANCED with Risk and Revisions
      const timeline = buildActivityTimeline(element.id, trackingRecords, budgetData, risksData, revisionsData);
      setActivityTimeline(timeline);
      
      // DEBUG: Log timeline data
      logTimelineData(element.id);
    }

    setSelectedElement({ type, element });
    setElementDetails(details);
  };

  // Get status color
  const getStatusColor = (performance) => {
    if (performance >= 75) return 'bg-green-900 text-green-200';
    if (performance >= 50) return 'bg-yellow-900 text-yellow-200';
    return 'bg-red-900 text-red-200';
  };

  // Get status text
  const getStatusText = (performance) => {
    if (performance >= 75) return 'İyi';
    if (performance >= 50) return 'İzlenmeli';
    return 'Kritik';
  };

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Format date
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('tr-TR');
  };

  // Get timeline source color
  const getTimelineSourceColor = (source) => {
    switch (source) {
      case 'Plan İzleme':
        return 'border-cyan-500 bg-cyan-900/30';
      case 'Bütçe':
        return 'border-green-500 bg-green-900/30';
      case 'Risk Yönetimi':
        return 'border-red-500 bg-red-900/30';
      case 'Revizyon':
        return 'border-purple-500 bg-purple-900/30';
      default:
        return 'border-gray-500 bg-gray-900';
    }
  };

  // Navigate to Plan İzleme with activity code
  const navigateToPlanTracking = () => {
    if (elementDetails?.type === 'activity' && elementDetails?.code) {
      navigate('/plan-izleme', { state: { activityCode: elementDetails.code } });
    }
  };

  // Navigate to Budget with activity code
  const navigateToBudget = () => {
    if (elementDetails?.type === 'activity' && elementDetails?.code) {
       navigate('/budget', { state: { activityCode: elementDetails.code } }); 
    }
  };

  // Data is now loaded from Supabase and stored in state above

  return (
    <div className="flex h-[calc(100vh-theme(spacing.24))] bg-gray-900 text-white rounded-lg overflow-hidden border border-gray-800">
      {/* Left Panel - Tree */}
      <div className="w-1/3 bg-gray-800 border-r border-gray-700 overflow-y-auto">
        <div className="p-6">
          <h2 className="text-2xl font-bold mb-6">Stratejik Plan Ağacı</h2>
          
          {strategies.length > 0 ? (
            <div className="space-y-2">
              {strategies.map((area) => (
                <div key={area.id}>
                  {/* Area */}
                  <div
                    onClick={() => {
                      toggleNode(`area-${area.id}`);
                      selectElement('area', area, trackingRecords, budgetData, risksData, revisionsData);
                    }}
                    className={`p-3 rounded cursor-pointer transition ${
                      selectedElement?.element?.id === area.id && selectedElement?.type === 'area'
                        ? 'bg-blue-600 text-white'
                        : 'hover:bg-gray-700'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {expandedNodes[`area-${area.id}`] ? (
                        <ChevronDown size={18} />
                      ) : (
                        <ChevronRight size={18} />
                      )}
                      <span className="font-semibold text-sm">{area.name}</span>
                    </div>
                  </div>

                  {/* Objectives */}
                  {expandedNodes[`area-${area.id}`] && area.objectives?.map((objective) => (
                    <div key={objective.id} className="ml-4">
                      <div
                        onClick={() => {
                          toggleNode(`objective-${objective.id}`);
                          selectElement('objective', objective, trackingRecords, budgetData, risksData, revisionsData);
                        }}
                        className={`p-3 rounded cursor-pointer transition ${
                          selectedElement?.element?.id === objective.id && selectedElement?.type === 'objective'
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-gray-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          {expandedNodes[`objective-${objective.id}`] ? (
                            <ChevronDown size={18} />
                          ) : (
                            <ChevronRight size={18} />
                          )}
                          <span className="font-semibold text-sm">{objective.name}</span>
                        </div>
                      </div>

                      {/* Targets */}
                      {expandedNodes[`objective-${objective.id}`] && objective.targets?.map((target) => (
                        <div key={target.id} className="ml-4">
                          <div
                            onClick={() => {
                              toggleNode(`target-${target.id}`);
                              selectElement('target', target, trackingRecords, budgetData, risksData, revisionsData);
                            }}
                            className={`p-3 rounded cursor-pointer transition ${
                              selectedElement?.element?.id === target.id && selectedElement?.type === 'target'
                                ? 'bg-blue-600 text-white'
                                : 'hover:bg-gray-700'
                            }`}
                          >
                            <div className="flex items-center gap-2">
                              {expandedNodes[`target-${target.id}`] ? (
                                <ChevronDown size={18} />
                              ) : (
                                <ChevronRight size={18} />
                              )}
                              <span className="font-semibold text-sm">{target.name}</span>
                            </div>
                          </div>

                          {/* Activities */}
                          {expandedNodes[`target-${target.id}`] && target.activities?.map((activity) => (
                            <div
                              key={activity.id}
                              onClick={() => {
                                selectElement('activity', activity, trackingRecords, budgetData, risksData, revisionsData);
                              }}
                              className={`ml-4 p-3 rounded cursor-pointer transition ${
                                selectedElement?.element?.id === activity.id && selectedElement?.type === 'activity'
                                  ? 'bg-blue-600 text-white'
                                  : 'hover:bg-gray-700'
                              }`}
                            >
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-sm">{activity.name}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400">Stratejik plan bulunamadı</p>
          )}
        </div>
      </div>

      {/* Right Panel - Details */}
      <div className="w-2/3 bg-gray-900 overflow-y-auto">
        {elementDetails ? (
          <div className="p-8">
            {/* Header Section */}
            <div className="mb-8 pb-8 border-b border-gray-700">
              <h1 className="text-3xl font-bold mb-4">{elementDetails.name}</h1>
              
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-gray-400 text-sm mb-1">Kod</p>
                  <p className="text-lg font-semibold text-gray-200">{elementDetails.code}</p>
                </div>
                <div>
                  <p className="text-gray-400 text-sm mb-1">Sorumlu Birim</p>
                  <p className="text-lg font-semibold text-gray-200">{elementDetails.responsibleUnit}</p>
                </div>
              </div>

              {elementDetails.description && (
                <div className="mt-4">
                  <p className="text-gray-400 text-sm mb-1">Açıklama</p>
                  <p className="text-gray-300">{elementDetails.description}</p>
                </div>
              )}
            </div>

            {/* Performance Section */}
            <div className="mb-8 pb-8 border-b border-gray-700">
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <TrendingUp size={20} className="text-blue-400" />
                Gerçekleşme Oranı
              </h3>
              
              <div className="bg-gray-800 rounded-lg p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="text-5xl font-bold text-blue-400">{elementDetails.performance}%</p>
                  </div>
                  <span className={`px-4 py-2 rounded font-semibold ${getStatusColor(elementDetails.performance)}`}>
                    {getStatusText(elementDetails.performance)}
                  </span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full ${
                      elementDetails.performance >= 75
                        ? 'bg-green-500'
                        : elementDetails.performance >= 50
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${elementDetails.performance}%` }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Time Information Section */}
            {(elementDetails.startDate || elementDetails.endDate) && (
              <div className="mb-8 pb-8 border-b border-gray-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Calendar size={20} className="text-purple-400" />
                  Zaman Bilgisi
                </h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Başlangıç Tarihi</p>
                    <p className="text-lg font-semibold text-gray-200">{formatDate(elementDetails.startDate)}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Bitiş Tarihi</p>
                    <p className="text-lg font-semibold text-gray-200">{formatDate(elementDetails.endDate)}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tracking Records Section */}
            {elementDetails.trackingRecords.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Clock size={20} className="text-cyan-400" />
                  İzleme Kayıtları ({elementDetails.trackingRecords.length})
                </h3>
                
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {elementDetails.trackingRecords.map((record, idx) => (
                    <div key={idx} className="bg-gray-800 rounded-lg p-4 border-l-4 border-cyan-500">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-semibold text-gray-200">{record.description || 'İzleme Kaydı'}</p>
                          <p className="text-sm text-gray-400">{formatDate(record.recordDate)}</p>
                        </div>
                        <p className="text-lg font-bold text-cyan-400">{record.progressPercentage || 0}%</p>
                      </div>
                      {record.notes && (
                        <p className="text-sm text-gray-300 mt-2">{record.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">Not: İzleme kayıtları Plan İzleme modülünden okunmaktadır.</p>
              </div>
            )}

            {/* Budget Section */}
            {(elementDetails.budget.estimated > 0 || elementDetails.budget.actual > 0) && (
              <div className="mb-8 pb-8 border-b border-gray-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-green-400" />
                  Bütçe Özeti
                </h3>
                
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Tahmini Bütçe</p>
                    <p className="text-xl font-bold text-green-400">{formatCurrency(elementDetails.budget.estimated)}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Gerçekleşen</p>
                    <p className="text-xl font-bold text-blue-400">{formatCurrency(elementDetails.budget.actual)}</p>
                  </div>
                  <div className={`rounded-lg p-4 ${elementDetails.budget.variance > 0 ? 'bg-red-900' : 'bg-green-900'}`}>
                    <p className="text-gray-400 text-sm mb-2">Sapma</p>
                    <p className={`text-xl font-bold ${elementDetails.budget.variance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      {formatCurrency(elementDetails.budget.variance)}
                    </p>
                    <p className={`text-sm ${elementDetails.budget.variance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                      ({elementDetails.budget.variancePercent}%)
                    </p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Not: Bütçe bilgileri Bütçe Yönetimi modülünden okunmaktadır.</p>
              </div>
            )}

            {/* Activity Timeline Section - Only for Activities */}
            {elementDetails.type === 'activity' && activityTimeline.length > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <Activity size={20} className="text-indigo-400" />
                  Faaliyet Hareketleri ({activityTimeline.length})
                </h3>
                
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {activityTimeline.map((event, idx) => (
                    <div key={idx} className={`rounded-lg p-4 border-l-4 ${getTimelineSourceColor(event.source)}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className={`text-xs font-bold px-2 py-1 rounded ${
                              event.source === 'Plan İzleme' ? 'bg-cyan-900 text-cyan-200' :
                              event.source === 'Bütçe' ? 'bg-green-900 text-green-200' :
                              event.source === 'Risk Yönetimi' ? 'bg-red-900 text-red-200' :
                              'bg-purple-900 text-purple-200'
                            }`}>
                              {event.source}
                            </span>
                            <p className="text-sm text-gray-400">{formatDate(event.date)}</p>
                          </div>
                          
                          {/* Plan İzleme Entry */}
                          {event.type === 'tracking' && (
                            <>
                              <p className="font-semibold text-gray-200">{event.description}</p>
                              {event.notes && (
                                <p className="text-sm text-gray-400 mt-1">{event.notes}</p>
                              )}
                            </>
                          )}

                          {/* Bütçe Entry */}
                          {event.type === 'budget' && (
                            <>
                              <p className="font-semibold text-gray-200">{event.description}</p>
                              {event.notes && (
                                <p className="text-sm text-gray-400 mt-1">{event.notes}</p>
                              )}
                            </>
                          )}

                          {/* Risk Entry */}
                          {event.type === 'risk' && (
                            <>
                              <p className="font-semibold text-gray-200">{event.description}</p>
                              <div className="mt-2 text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Etki:</span>
                                  <span className="text-gray-300">{event.previousImpact} → <span className="font-bold text-red-400">{event.currentImpact}</span></span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Olasılık:</span>
                                  <span className="text-gray-300">{event.previousProbability} → <span className="font-bold text-red-400">{event.currentProbability}</span></span>
                                </div>
                              </div>
                              {event.riskReduced && (
                                <div className="mt-2">
                                  <span className="text-xs font-bold px-2 py-1 rounded bg-green-900 text-green-200">
                                    ✓ Etkisi Düşürüldü
                                  </span>
                                </div>
                              )}
                              {event.notes && (
                                <p className="text-sm text-gray-400 mt-2">{event.notes}</p>
                              )}
                            </>
                          )}

                          {/* Revizyon Entry */}
                          {event.type === 'revision' && (
                            <>
                              <p className="font-semibold text-gray-200">{event.description}</p>
                              <div className="mt-2 text-sm space-y-1">
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Tür:</span>
                                  <span className="text-gray-300 font-semibold">{event.revisionType}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Neden:</span>
                                  <span className="text-gray-300">{event.revisionReason}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span className="text-gray-400">Durum:</span>
                                  <span className={`font-semibold ${
                                    event.approvalStatus === 'Onaylandı' ? 'text-green-400' :
                                    event.approvalStatus === 'Taslak' ? 'text-yellow-400' :
                                    'text-gray-400'
                                  }`}>
                                    {event.approvalStatus}
                                  </span>
                                </div>
                              </div>
                              {event.notes && (
                                <p className="text-sm text-gray-400 mt-2">{event.notes}</p>
                              )}
                            </>
                          )}
                        </div>
                        
                        <p className={`text-lg font-bold ml-4 ${
                          event.source === 'Plan İzleme' ? 'text-cyan-400' :
                          event.source === 'Bütçe' ? 'text-green-400' :
                          event.source === 'Risk Yönetimi' ? 'text-red-400' :
                          'text-purple-400'
                        }`}>
                          {event.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-3">Not: Faaliyet hareketleri Plan İzleme, Bütçe Yönetimi, Risk Yönetimi ve Revizyonlar modüllerinden okunmaktadır.</p>
              </div>
            )}

            {/* Risk Section */}
            {elementDetails.risks.total > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <AlertTriangle size={20} className="text-red-400" />
                  Risk Özeti
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Toplam Risk</p>
                    <p className="text-3xl font-bold text-red-400">{elementDetails.risks.total}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Etkisi Düşürülen</p>
                    <p className="text-3xl font-bold text-green-400">{elementDetails.risks.reduced}</p>
                  </div>
                </div>

                {elementDetails.risks.list.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3 text-gray-300">Bağlı Riskler:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {elementDetails.risks.list.map((risk, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm">
                          <span className="text-red-400 mt-1">•</span>
                          <div>
                            <p className="text-gray-200">{risk.definition}</p>
                            <p className="text-xs text-gray-400">Kod: {risk.code}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">Not: Risk bilgileri Risk Yönetimi modülünden okunmaktadır.</p>
              </div>
            )}

            {/* Revision Section */}
            {elementDetails.revisions.total > 0 && (
              <div className="mb-8 pb-8 border-b border-gray-700">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileText size={20} className="text-purple-400" />
                  Revizyon Bilgisi
                </h3>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Toplam Revizyon</p>
                    <p className="text-3xl font-bold text-purple-400">{elementDetails.revisions.total}</p>
                  </div>
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-gray-400 text-sm mb-2">Son Revizyon Tarihi</p>
                    <p className="text-lg font-bold text-gray-200">{formatDate(elementDetails.revisions.lastDate)}</p>
                  </div>
                </div>

                {elementDetails.revisions.list.length > 0 && (
                  <div className="bg-gray-800 rounded-lg p-4">
                    <p className="text-sm font-semibold mb-3 text-gray-300">Revizyon Geçmişi:</p>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {elementDetails.revisions.list.sort((a, b) => new Date(b.revisionDate) - new Date(a.revisionDate)).map((revision, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-sm border-l-2 border-purple-500 pl-3">
                          <div className="flex-1">
                            <p className="text-gray-200">{revision.itemName || 'Revizyon'}</p>
                            <p className="text-xs text-gray-400">Tür: {revision.revisionType || '-'} | Durum: {revision.approvalStatus || '-'}</p>
                            <p className="text-xs text-gray-500">{formatDate(revision.revisionDate)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-3">Not: Revizyon bilgileri Revizyonlar modülünden okunmaktadır.</p>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3 mt-8 flex-wrap">
              {elementDetails.type === 'activity' && (
                <>
                  <button
                    onClick={navigateToPlanTracking}
                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition flex items-center gap-2 text-sm"
                  >
                    <Eye size={18} />
                    Plan İzleme Kayıtlarını Aç
                    <ExternalLink size={16} />
                  </button>
                  {(elementDetails.budget.estimated > 0 || elementDetails.budget.actual > 0) && (
                    <button
                      onClick={navigateToBudget}
                      className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center gap-2 text-sm"
                    >
                      <DollarSign size={18} />
                      Bütçe Harcamalarına Git
                      <ExternalLink size={16} />
                    </button>
                  )}
                  {elementDetails.risks.total > 0 && (
                    <button
                      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center gap-2 text-sm"
                    >
                      <AlertTriangle size={18} />
                      Risk Kayıtlarını Gör
                    </button>
                  )}
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-gray-400 text-lg">Sol taraftan bir öğe seçin</p>
          </div>
        )}
      </div>
    </div>
  );
}
