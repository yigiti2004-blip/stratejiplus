import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, AlertTriangle, DollarSign, FileText,
  ChevronRight, Calendar, Activity, Target, Zap,
  ArrowUpRight, ArrowDownRight, Clock, CheckCircle,
  AlertCircle, TrendingDown
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '@/hooks/useAuthContext';
import { getCompanyData } from '@/lib/supabase';

export default function Dashboard() {
  const navigate = useNavigate();
  const { currentUser } = useAuthContext();
  
  const [dashboardData, setDashboardData] = useState({
    // Layer 1 - Corporate Status Band
    overallCompletion: 0,
    criticalAlarms: 0,
    totalBudgetVariance: 0,
    lastUpdateDate: new Date().toLocaleDateString('tr-TR'),
    
    // Layer 2 - Summary Cards
    performance: {
      completedActivities: 0,
      totalActivities: 0,
      delayedActivities: 0,
      unmonitoredActivities: 0
    },
    risk: {
      critical: 0,
      high: 0,
      medium: 0,
      reduced: 0
    },
    budget: {
      estimated: 0,
      actual: 0,
      variance: 0,
      topVarianceActivities: []
    },
    revision: {
      pendingApproval: 0,
      thisMonthCount: 0,
      mostRevisedItem: null
    },
    
    // Layer 3 - Admin Radar
    attentionRequired: [],
    topCriticalRisks: [],
    topVarianceActivities: []
  });

  // Load and calculate all data from Supabase
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        const companyId = currentUser?.companyId;
        const userId = currentUser?.id || currentUser?.userId;
        const isAdmin = currentUser?.roleId === 'admin';

        if (!companyId || !userId) {
          console.warn('Dashboard: Missing user/company info');
          return;
        }

        // Load all data from Supabase
        const [
          areas,
          objectives,
          targets,
          activities,
          expenses,
          budgetChapters,
          risks,
          revisions,
          realizationRecords
        ] = await Promise.all([
          getCompanyData('strategic_areas', userId, companyId, isAdmin),
          getCompanyData('strategic_objectives', userId, companyId, isAdmin),
          getCompanyData('targets', userId, companyId, isAdmin),
          getCompanyData('activities', userId, companyId, isAdmin),
          getCompanyData('expenses', userId, companyId, isAdmin),
          getCompanyData('budget_chapters', userId, companyId, isAdmin),
          getCompanyData('risks', userId, companyId, isAdmin),
          getCompanyData('revisions', userId, companyId, isAdmin),
          getCompanyData('activity_realization_records', userId, companyId, isAdmin)
        ]);

        const newData = { ...dashboardData };

        // Map activities from Supabase format
        const mappedActivities = (activities || []).map(activity => ({
          id: activity.id,
          code: activity.code,
          name: activity.name,
          completion: Number(activity.completion) || 0,
          plannedBudget: Number(activity.planned_budget) || 0,
          actualBudget: Number(activity.actual_budget) || 0,
          startDate: activity.start_date,
          endDate: activity.end_date,
          status: activity.status,
          budgetChapterId: activity.budget_chapter_id,
          targetId: activity.target_id,
          indicatorId: activity.indicator_id,
          responsibleUnit: activity.responsible_unit
        }));

        // Map expenses from Supabase format
        const mappedExpenses = (expenses || []).map(expense => ({
          id: expense.id,
          activityId: expense.activity_id,
          amount: Number(expense.amount) || 0,
          totalAmount: Number(expense.total_amount) || 0,
          status: expense.status,
          expenseDate: expense.expense_date
        }));

        // Map budget chapters
        const mappedBudgetChapters = (budgetChapters || []).map(chapter => ({
          id: chapter.id,
          code: chapter.code,
          name: chapter.name
        }));

        // Map risks from Supabase format
        const mappedRisks = (risks || []).map(risk => ({
          id: risk.id,
          code: risk.code || risk.id,
          name: risk.name,
          definition: risk.description || risk.name,
          probability: Number(risk.probability) || 0,
          impact: Number(risk.impact) || 0,
          score: Number(risk.score) || (Number(risk.probability) || 0) * (Number(risk.impact) || 0),
          status: risk.status,
          changeStatus: risk.change_status,
          relatedRecordType: risk.related_record_type,
          relatedRecordId: risk.related_record_id,
          linkedActivities: risk.related_record_type === 'activity' && risk.related_record_id 
            ? [risk.related_record_id] 
            : []
        }));

        // Map revisions from Supabase format
        const mappedRevisions = (revisions || []).map(revision => ({
          id: revision.id,
          revisionType: revision.revision_type,
          entityType: revision.entity_type,
          entityId: revision.entity_id,
          approvalStatus: revision.status || 'Beklemede',
          revisionDate: revision.created_at,
          createdDate: revision.created_at,
          itemName: revision.entity_type || 'Bilinmeyen'
        }));

        // Map realization records (for monitoring history)
        const mappedTrackingRecords = (realizationRecords || []).map(record => ({
          id: record.id,
          activityId: record.activity_id,
          recordDate: record.record_date || record.created_at,
          completionPercentage: Number(record.completion_percentage) || 0
        }));

        // ===== CALCULATE PERFORMANCE METRICS =====
        let totalActivities = mappedActivities.length;
        let completedActivities = 0;
        let totalCompletion = 0;
        let delayedCount = 0;
        let unmonitoredCount = 0;
        const allActivitiesList = [];

        mappedActivities.forEach(activity => {
          const chapter = mappedBudgetChapters.find(c => c.id === activity.budgetChapterId);
          const chapterCode = chapter ? chapter.code : '-';
          const chapterName = chapter ? chapter.name : '-';
          const completion = activity.completion || 0;

          allActivitiesList.push({
            id: activity.id,
            code: activity.code,
            name: activity.name,
            completion: completion,
            startDate: activity.startDate,
            endDate: activity.endDate,
            estimatedBudget: activity.plannedBudget,
            chapterCode: chapterCode,
            chapterName: chapterName
          });

          totalCompletion += completion;
          if (completion >= 100) completedActivities++;

          // Check if delayed
          if (activity.endDate && new Date(activity.endDate) < new Date() && completion < 100) {
            delayedCount++;
          }

          // Check if unmonitored (no realization record in last 60 days)
          const activityTracking = mappedTrackingRecords.filter(r => r.activityId === activity.id);
          if (activityTracking.length === 0) {
            if (activity.startDate && new Date(activity.startDate) < new Date()) {
              unmonitoredCount++;
            }
          } else {
            const lastTracking = activityTracking.sort((a, b) => 
              new Date(b.recordDate) - new Date(a.recordDate)
            )[0];
            const daysSinceTracking = Math.floor(
              (new Date() - new Date(lastTracking.recordDate)) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceTracking > 60) {
              unmonitoredCount++;
            }
          }
        });

        newData.performance = {
          completedActivities,
          totalActivities,
          delayedActivities: delayedCount,
          unmonitoredActivities: unmonitoredCount
        };

        newData.overallCompletion = totalActivities > 0 
          ? Math.round(totalCompletion / totalActivities) 
          : 0;

        // ===== CALCULATE RISK METRICS =====
        let criticalRisks = 0;
        let highRisks = 0;
        let mediumRisks = 0;
        let reducedRisks = 0;

        mappedRisks.forEach(risk => {
          const score = risk.score;
          let level = 'Düşük';
          if (score >= 16) level = 'Kritik';
          else if (score >= 11) level = 'Yüksek';
          else if (score >= 6) level = 'Orta';

          if (level === 'Kritik') criticalRisks++;
          else if (level === 'Yüksek') highRisks++;
          else if (level === 'Orta') mediumRisks++;
          if (risk.changeStatus === 'Azaldı') reducedRisks++;
        });

        newData.risk = {
          critical: criticalRisks,
          high: highRisks,
          medium: mediumRisks,
          reduced: reducedRisks
        };

        // ===== CALCULATE BUDGET METRICS =====
        let totalEstimated = 0;
        let totalActual = 0;
        const activityVariances = [];

        allActivitiesList.forEach(activity => {
          totalEstimated += activity.estimatedBudget;

          const activityExpenses = mappedExpenses.filter(
            e => e.activityId === activity.id && e.status !== 'Reddedildi'
          );
          const actualSpending = activityExpenses.reduce(
            (sum, e) => sum + (Number(e.amount) || 0), 0
          );
          totalActual += actualSpending;

          const variance = actualSpending - activity.estimatedBudget;
          activityVariances.push({
            code: activity.code,
            name: activity.name,
            estimated: activity.estimatedBudget,
            actual: actualSpending,
            variance: variance,
            variancePercent: activity.estimatedBudget > 0 
              ? ((variance / activity.estimatedBudget) * 100).toFixed(2) 
              : 0
          });
        });

        const totalVariance = totalActual - totalEstimated;
        const topVarianceActivities = activityVariances
          .sort((a, b) => Math.abs(b.variance) - Math.abs(a.variance))
          .slice(0, 3);

        newData.budget = {
          estimated: totalEstimated,
          actual: totalActual,
          variance: totalVariance,
          topVarianceActivities
        };

        // ===== CALCULATE REVISION METRICS =====
        let pendingApproval = 0;
        let thisMonthCount = 0;
        const revisionCounts = {};
        const now = new Date();
        const thisMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

        mappedRevisions.forEach(revision => {
          if (revision.approvalStatus === 'Taslak' || revision.approvalStatus === 'Beklemede') {
            pendingApproval++;
          }

          const revisionDateStr = revision.revisionDate || revision.createdDate;
          if (revisionDateStr) {
            const revisionMonth = revisionDateStr.substring(0, 7);
            if (revisionMonth === thisMonth) {
              thisMonthCount++;
            }
          }

          const itemName = revision.itemName || 'Bilinmeyen';
          revisionCounts[itemName] = (revisionCounts[itemName] || 0) + 1;
        });

        const mostRevisedItem = Object.entries(revisionCounts).length > 0
          ? Object.entries(revisionCounts).sort((a, b) => b[1] - a[1])[0]
          : null;

        newData.revision = {
          pendingApproval,
          thisMonthCount,
          mostRevisedItem: mostRevisedItem 
            ? { name: mostRevisedItem[0], count: mostRevisedItem[1] } 
            : null
        };

        // ===== CALCULATE CRITICAL ALARMS =====
        const isBudgetCritical = totalVariance > (totalEstimated * 0.1);
        newData.criticalAlarms = criticalRisks + (isBudgetCritical ? 1 : 0) + delayedCount;

        // ===== BUILD ATTENTION REQUIRED LIST =====
        const attentionList = [];

        // Add critical risk activities
        mappedRisks.forEach(risk => {
          const score = risk.score;
          if (score >= 16) {
            if (risk.linkedActivities && risk.linkedActivities.length > 0) {
              risk.linkedActivities.forEach(actId => {
                const activity = allActivitiesList.find(a => a.id === actId);
                if (activity && (activity.completion || 0) < 50) {
                  attentionList.push({
                    code: activity.code,
                    name: activity.name,
                    reason: 'Kritik Risk + Düşük İlerleme',
                    type: 'risk',
                    severity: 'critical',
                    module: 'risk-management'
                  });
                }
              });
            }
          }
        });

        // Add budget overrun activities
        activityVariances.forEach(av => {
          if (av.actual > av.estimated * 1.2 && av.estimated > 0) {
            const activity = allActivitiesList.find(a => a.code === av.code);
            if (activity && (activity.completion || 0) < 50) {
              attentionList.push({
                code: av.code,
                name: av.name,
                reason: 'Bütçe Aşımı + Düşük İlerleme',
                type: 'budget',
                severity: 'high',
                module: 'budget-management'
              });
            }
          }
        });

        // Add unmonitored activities
        allActivitiesList.forEach(activity => {
          const activityTracking = mappedTrackingRecords.filter(r => r.activityId === activity.id);
          let isUnmonitored = false;

          if (activityTracking.length === 0) {
            if (activity.startDate && new Date(activity.startDate) < new Date()) {
              isUnmonitored = true;
            }
          } else {
            const lastTracking = activityTracking.sort((a, b) => 
              new Date(b.recordDate) - new Date(a.recordDate)
            )[0];
            const daysSinceTracking = Math.floor(
              (new Date() - new Date(lastTracking.recordDate)) / (1000 * 60 * 60 * 24)
            );
            if (daysSinceTracking > 60) {
              isUnmonitored = true;
            }
          }

          if (isUnmonitored) {
            attentionList.push({
              code: activity.code,
              name: activity.name,
              reason: '60+ Gün İzleme Yok',
              type: 'monitoring',
              severity: 'medium',
              module: 'plan-tracking'
            });
          }
        });

        const uniqueAttention = Array.from(
          new Map(attentionList.map(item => [item.code, item])).values()
        ).slice(0, 10);

        newData.attentionRequired = uniqueAttention;

        // ===== BUILD TOP CRITICAL RISKS =====
        newData.topCriticalRisks = mappedRisks
          .filter(r => r.score >= 16)
          .slice(0, 3)
          .map(r => ({
            code: r.code,
            definition: r.definition || r.name,
            impact: r.impact,
            probability: r.probability
          }));

        // ===== BUILD TOP VARIANCE ACTIVITIES =====
        newData.topVarianceActivities = topVarianceActivities;

        // ===== SET LAST UPDATE DATE =====
        if (mappedTrackingRecords.length > 0) {
          const lastTracking = mappedTrackingRecords.sort((a, b) => 
            new Date(b.recordDate) - new Date(a.recordDate)
          )[0];
          newData.lastUpdateDate = new Date(lastTracking.recordDate).toLocaleDateString('tr-TR');
        }

        setDashboardData(newData);
      } catch (error) {
        console.error('Dashboard veri yükleme hatası:', error);
      }
    };

    if (currentUser?.companyId) {
      loadDashboardData();
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  // Format currency
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get severity color
  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'border-red-500 bg-red-900';
      case 'high':
        return 'border-orange-500 bg-orange-900';
      case 'medium':
        return 'border-yellow-500 bg-yellow-900';
      default:
        return 'border-gray-500 bg-gray-800';
    }
  };

  const getSeverityBadgeColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-900 text-red-200';
      case 'high':
        return 'bg-orange-900 text-orange-200';
      case 'medium':
        return 'bg-yellow-900 text-yellow-200';
      default:
        return 'bg-gray-700 text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      {/* LAYER 1 - Corporate Status Band */}
      <div className="mb-8 bg-gradient-to-r from-gray-800 to-gray-700 rounded-lg p-6 border border-gray-600">
        <div className="grid grid-cols-4 gap-6">
          {/* Overall Completion */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Genel Tamamlanma</p>
              <p className="text-4xl font-bold text-blue-400">{dashboardData.overallCompletion}%</p>
            </div>
            <TrendingUp size={32} className="text-blue-400 opacity-50" />
          </div>

          {/* Critical Alarms */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Kritik Alarm</p>
              <p className={`text-4xl font-bold ${dashboardData.criticalAlarms > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {dashboardData.criticalAlarms}
              </p>
            </div>
            <AlertTriangle size={32} className={dashboardData.criticalAlarms > 0 ? 'text-red-400 opacity-50' : 'text-green-400 opacity-50'} />
          </div>

          {/* Total Budget Variance */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Toplam Bütçe Sapması</p>
              <p className={`text-3xl font-bold ${dashboardData.budget.variance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatCurrency(dashboardData.budget.variance)}
              </p>
            </div>
            <DollarSign size={32} className={dashboardData.budget.variance > 0 ? 'text-red-400 opacity-50' : 'text-green-400 opacity-50'} />
          </div>

          {/* Last Update */}
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-sm mb-1">Son Güncelleme</p>
              <p className="text-lg font-semibold text-gray-200">{dashboardData.lastUpdateDate}</p>
            </div>
            <Calendar size={32} className="text-purple-400 opacity-50" />
          </div>
        </div>
      </div>

      {/* LAYER 2 - 4 Summary Cards */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        {/* Card 1: Performance */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Performans</h3>
            <Activity size={20} className="text-cyan-400" />
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Tamamlanan</span>
              <span className="font-bold text-cyan-400">{dashboardData.performance.completedActivities}/{dashboardData.performance.totalActivities}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Geciken</span>
              <span className={`font-bold ${dashboardData.performance.delayedActivities > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {dashboardData.performance.delayedActivities}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">İzleme Yok (60+ gün)</span>
              <span className={`font-bold ${dashboardData.performance.unmonitoredActivities > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                {dashboardData.performance.unmonitoredActivities}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/plan-izleme')}
            className="w-full px-4 py-2 bg-cyan-600 text-white rounded hover:bg-cyan-700 transition flex items-center justify-center gap-2 text-sm"
          >
            Plan İzleme'ye Git
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Card 2: Risk Status */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Risk Durumu</h3>
            <AlertTriangle size={20} className="text-red-400" />
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Kritik</span>
              <span className="font-bold text-red-400">{dashboardData.risk.critical}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Yüksek</span>
              <span className="font-bold text-orange-400">{dashboardData.risk.high}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Orta</span>
              <span className="font-bold text-yellow-400">{dashboardData.risk.medium}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className="text-gray-400 text-sm">Etkisi Düşürülen</span>
              <span className="font-bold text-green-400">{dashboardData.risk.reduced}</span>
            </div>
          </div>
          <button
            onClick={() => navigate('/risks')}
            className="w-full px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition flex items-center justify-center gap-2 text-sm"
          >
            Risk Yönetimi'ne Git
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Card 3: Budget Usage */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Bütçe Kullanımı</h3>
            <DollarSign size={20} className="text-green-400" />
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Tahmini</span>
              <span className="font-bold text-gray-300">{formatCurrency(dashboardData.budget.estimated)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Gerçekleşen</span>
              <span className="font-bold text-blue-400">{formatCurrency(dashboardData.budget.actual)}</span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-gray-700">
              <span className="text-gray-400 text-sm">Sapma</span>
              <span className={`font-bold ${dashboardData.budget.variance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                {formatCurrency(dashboardData.budget.variance)}
              </span>
            </div>
          </div>
          <button
            onClick={() => navigate('/budget')}
            className="w-full px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition flex items-center justify-center gap-2 text-sm"
          >
            Bütçe Yönetimi'ne Git
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Card 4: Revision Activity */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold">Revizyon Hareketleri</h3>
            <FileText size={20} className="text-purple-400" />
          </div>
          <div className="space-y-3 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Onay Bekleyen</span>
              <span className={`font-bold ${dashboardData.revision.pendingApproval > 0 ? 'text-orange-400' : 'text-green-400'}`}>
                {dashboardData.revision.pendingApproval}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-400 text-sm">Bu Ay Oluşturulan</span>
              <span className="font-bold text-purple-400">{dashboardData.revision.thisMonthCount}</span>
            </div>
            {dashboardData.revision.mostRevisedItem && (
              <div className="pt-2 border-t border-gray-700">
                <p className="text-gray-400 text-xs mb-1">En Çok Revizyon Gören</p>
                <p className="text-sm font-semibold text-gray-200 truncate">{dashboardData.revision.mostRevisedItem.name}</p>
                <p className="text-xs text-gray-500">({dashboardData.revision.mostRevisedItem.count} revizyon)</p>
              </div>
            )}
          </div>
          <button
            onClick={() => navigate('/revisions')}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 transition flex items-center justify-center gap-2 text-sm"
          >
            Revizyonlar'a Git
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* LAYER 3 - Admin Radar */}
      <div className="grid grid-cols-3 gap-6">
        {/* A) Attention Required */}
        <div className="col-span-2 bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertCircle size={20} className="text-red-400" />
            Dikkat Gerektirenler
          </h3>
          {dashboardData.attentionRequired.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {dashboardData.attentionRequired.map((item, idx) => (
                <div key={idx} className={`flex items-center justify-between p-3 rounded border-l-4 ${getSeverityColor(item.severity)} bg-opacity-20`}>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-200">{item.code} - {item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className={`text-xs font-bold px-2 py-1 rounded ${getSeverityBadgeColor(item.severity)}`}>
                        {item.reason}
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      if (item.module === 'plan-tracking') navigate('/plan-izleme');
                      else if (item.module === 'budget-management') navigate('/budget');
                      else if (item.module === 'risk-management') navigate('/risks');
                    }}
                    className="ml-2 px-3 py-1 bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition text-xs flex items-center gap-1"
                  >
                    Detaya Git
                    <ChevronRight size={14} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-400 text-center py-8">Dikkat gerektirenler yok</p>
          )}
        </div>

        {/* B) Top 3 Lists */}
        <div className="space-y-6">
          {/* Top 3 Critical Risks */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Zap size={20} className="text-red-400" />
              En Kritik 3 Risk
            </h3>
            {dashboardData.topCriticalRisks.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.topCriticalRisks.map((risk, idx) => (
                  <div key={idx} className="p-3 bg-red-900 bg-opacity-30 rounded border-l-2 border-red-500">
                    <p className="font-semibold text-gray-200 text-sm">{risk.code}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2">{risk.definition}</p>
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="px-2 py-1 bg-red-900 text-red-200 rounded">Etki: {risk.impact}</span>
                      <span className="px-2 py-1 bg-orange-900 text-orange-200 rounded">Olas: {risk.probability}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6 text-sm">Kritik risk yok</p>
            )}
          </div>

          {/* Top 3 Variance Activities */}
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <TrendingDown size={20} className="text-orange-400" />
              En Çok Sapma Yaşayan 3 Faaliyet
            </h3>
            {dashboardData.topVarianceActivities.length > 0 ? (
              <div className="space-y-3">
                {dashboardData.topVarianceActivities.map((activity, idx) => (
                  <div key={idx} className={`p-3 rounded border-l-2 ${activity.variance > 0 ? 'bg-red-900 bg-opacity-30 border-red-500' : 'bg-green-900 bg-opacity-30 border-green-500'}`}>
                    <p className="font-semibold text-gray-200 text-sm">{activity.code}</p>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-1">{activity.name}</p>
                    <div className="flex justify-between items-center mt-2 text-xs">
                      <span className="text-gray-400">Sapma:</span>
                      <span className={`font-bold ${activity.variance > 0 ? 'text-red-400' : 'text-green-400'}`}>
                        {formatCurrency(activity.variance)} ({activity.variancePercent}%)
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-400 text-center py-6 text-sm">Sapma yok</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
