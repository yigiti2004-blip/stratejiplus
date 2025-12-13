import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  ArrowUpRight, Calendar, Layers, ShieldAlert, DollarSign, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateAreaStats, getRiskLevel, formatCurrency } from '@/lib/calculations';
import { CompanyBadge } from '@/components/CompanyBadge';

// Memoized Sub-components
const KPICard = React.memo(({ title, value, subtext, icon: Icon, color, trend }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="premium-card relative overflow-hidden group"
  >
    <div className={`absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity`}>
       <Icon className={`w-24 h-24 ${color.replace('bg-', 'text-')}`} />
    </div>
    
    <div className="relative z-10">
      <div className="flex justify-between items-start mb-4">
        <div className={`p-3 rounded-[14px] ${color} bg-opacity-10`}>
          <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
      </div>
      
      <div>
        <h3 className="text-3xl font-bold text-gray-900 mb-1">{value}</h3>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide">{title}</p>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center text-sm">
        {trend && (
          <span className="text-green-600 font-medium flex items-center mr-2 bg-green-50 px-2 py-0.5 rounded-full">
            <ArrowUpRight className="w-3 h-3 mr-1" />
            {trend}
          </span>
        )}
        <span className="text-gray-400 text-xs">{subtext}</span>
      </div>
    </div>
  </motion.div>
));

const Dashboard = ({ currentUser }) => {
  // Consolidated State
  const [data, setData] = useState({
    areas: [],
    objectives: [],
    targets: [],
    indicators: [],
    activities: [],
    risks: [],
    expenses: [],
    budgetChapters: []
  });
  const [loading, setLoading] = useState(true);

  // Load Data - Filtered by Company (unless admin)
  useEffect(() => {
    const loadAllData = () => {
      try {
        const isAdmin = currentUser?.roleId === 'admin';
        const companyId = currentUser?.companyId;
        const allAreas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
        const allObjectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
        const allTargets = JSON.parse(localStorage.getItem('targets') || '[]');
        const allIndicators = JSON.parse(localStorage.getItem('indicators') || '[]');
        const allActivities = JSON.parse(localStorage.getItem('activities') || '[]');
        const allRisks = JSON.parse(localStorage.getItem('risks') || '[]');
        const allExpenses = JSON.parse(localStorage.getItem('expenses') || '[]');
        const allBudgetChapters = JSON.parse(localStorage.getItem('budgetChapters') || '[]');

        // Admin sees all data, others see only their company
        const filterByCompany = (arr) => {
          if (isAdmin) return arr; // Admin sees all companies
          if (!companyId) return arr; // Backward compatibility
          return arr.filter(item => item.companyId === companyId);
        };

        const newData = {
          areas: filterByCompany(allAreas),
          objectives: filterByCompany(allObjectives),
          targets: filterByCompany(allTargets),
          indicators: filterByCompany(allIndicators),
          activities: filterByCompany(allActivities),
          risks: filterByCompany(allRisks),
          expenses: filterByCompany(allExpenses),
          budgetChapters: filterByCompany(allBudgetChapters),
        };
        setData(newData);
      } catch (e) {
        console.error("Failed to load dashboard data", e);
      } finally {
        setLoading(false);
      }
    };
    
    loadAllData();
  }, [currentUser?.companyId, currentUser?.roleId]);

  // Calculations - Already filtered by company in loadAllData
  const calculatedHierarchy = useMemo(() => {
    if (loading) return [];
    // Data is already filtered by company, just filter by unit if needed
    const userOrgId = currentUser?.unitId || currentUser?.organizationId;
    const orgAreas = userOrgId 
      ? data.areas.filter(a => (a.organizationId === userOrgId) || (a.unitId === userOrgId))
      : data.areas; // Show all company areas if no unit filter
    return orgAreas.map(area => 
      calculateAreaStats(area, data.objectives, data.targets, data.indicators)
    );
  }, [data.areas, data.objectives, data.targets, data.indicators, currentUser?.unitId || currentUser?.organizationId, loading]);

  const overallCompletion = useMemo(() => {
    if (calculatedHierarchy.length === 0) return 0;
    const total = calculatedHierarchy.reduce((sum, area) => sum + area.completion, 0);
    return total / calculatedHierarchy.length;
  }, [calculatedHierarchy]);

  const stats = useMemo(() => {
    if (loading) return { planned: 0, actual: 0, utilization: 0, totalIndicators: 0, completedIndicators: 0 };
    
    const planned = data.activities.reduce((sum, a) => sum + (Number(a.plannedBudget) || 0), 0);
    const actual = data.expenses.filter(e => e.status === 'Onaylandı').reduce((sum, e) => sum + (Number(e.totalAmount) || 0), 0);
    const utilization = planned > 0 ? (actual / planned) * 100 : 0;
    
    const totalIndicators = data.indicators.length;
    const completedIndicators = data.indicators.filter(i => Number(i.actualValue) >= Number(i.targetValue)).length;

    return { planned, actual, utilization, totalIndicators, completedIndicators };
  }, [data.activities, data.expenses, data.indicators, loading]);

  // Risk Stats
  const riskStats = useMemo(() => {
    if (loading) return { total: 0, critical: 0, high: 0, medium: 0, low: 0 };
    const rStats = { total: data.risks.length, critical: 0, high: 0, medium: 0, low: 0 };
    
    data.risks.forEach(risk => {
      if (risk.status === 'Kapandı') return;
      const level = getRiskLevel(risk.score);
      if (level.value === 'Critical') rStats.critical++;
      if (level.value === 'High') rStats.high++;
      if (level.value === 'Medium') rStats.medium++;
      if (level.value === 'Low') rStats.low++;
    });
    return rStats;
  }, [data.risks, loading]);

  const topRisks = useMemo(() => {
    if (loading) return [];
    return data.risks
      .filter(r => r.status === 'Aktif')
      .sort((a,b) => b.score - a.score)
      .slice(0, 3);
  }, [data.risks, loading]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Yükleniyor...</div>;
  }

  return (
    <div className="space-y-8">
      {/* HERO SECTION */}
      <div className="bg-[#0D1522] rounded-[14px] p-8 text-white shadow-2xl border border-gray-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#3B82F6] opacity-10 rounded-full -translate-y-1/2 translate-x-1/2 blur-[100px]"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#10B981] opacity-5 rounded-full translate-y-1/2 -translate-x-1/2 blur-[80px]"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-center gap-8">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-3 py-1 rounded-full text-xs font-medium text-blue-400 mb-4">
              <Calendar className="w-3 h-3" />
              <span>2025 Mali Yılı</span>
            </div>
            <h1 className="text-4xl font-bold mb-3 tracking-tight text-white">Hoşgeldin, {currentUser.name}</h1>
            <p className="text-gray-400 max-w-xl text-lg">
              Stratejik plan performans göstergeleri ve risk durumları aşağıda özetlenmiştir.
            </p>
          </div>
          
          <div className="bg-white/5 p-6 rounded-2xl border border-white/10 backdrop-blur-sm min-w-[240px] text-center shadow-xl">
            <div className="text-sm text-gray-400 mb-2 font-medium uppercase tracking-wider">Genel Tamamlanma</div>
            <div className="text-5xl font-bold text-[#3B82F6] mb-4">%{overallCompletion.toFixed(1)}</div>
            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-blue-600 to-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.5)]" 
                style={{ width: `${overallCompletion}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Toplam Gösterge" 
          value={stats.totalIndicators} 
          subtext={`${stats.completedIndicators} tanesi hedefe ulaştı`}
          icon={Target}
          color="bg-blue-500"
        />
        <KPICard 
          title="Risk Durumu" 
          value={riskStats.total} 
          subtext={`${riskStats.critical} kritik risk tespit edildi`}
          icon={ShieldAlert}
          color="bg-red-500"
        />
        <KPICard 
          title="Bütçe Kullanımı" 
          value={`%${stats.utilization.toFixed(1)}`}
          subtext={`Harcama: ${formatCurrency(stats.actual)}`}
          icon={DollarSign}
          color="bg-green-500"
        />
        <KPICard 
          title="Stratejik Alanlar" 
          value={data.areas.length} 
          subtext="Performans takibi yapılıyor"
          icon={Layers}
          color="bg-yellow-500"
        />
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT: Strategic Areas */}
        <div className="lg:col-span-2 premium-card">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-3">
               <div className="w-1 h-6 bg-blue-500 rounded-full"></div>
               Stratejik Alan Performansı
            </h2>
            <Button variant="outline" size="sm" className="text-gray-600 border-gray-200 hover:bg-gray-50">Detaylı Rapor</Button>
          </div>
          
          <div className="space-y-8">
            {calculatedHierarchy.map((area) => (
              <div key={area.id} className="group">
                <div className="flex justify-between items-end mb-3">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-[6px] border border-blue-100">{area.code}</span>
                    <span className="font-semibold text-gray-800 text-sm">{area.name}</span>
                    {currentUser?.roleId === 'admin' && area.companyId && (
                      <CompanyBadge companyId={area.companyId} size="sm" />
                    )}
                  </div>
                  <span className="font-bold text-gray-900 text-lg">%{area.completion.toFixed(1)}</span>
                </div>
                <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: `${area.completion}%` }}
                    transition={{ duration: 1 }}
                    className={`h-full rounded-full relative ${
                      area.completion >= 80 ? 'bg-green-500' : 
                      area.completion >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                  >
                     <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite] skew-x-12"></div>
                  </motion.div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: Risk Summary Widget */}
        <div className="premium-card border-t-4 border-t-red-500">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <ShieldAlert className="w-6 h-6 text-red-500"/>
              Risk Özeti
            </h2>
            <span className="text-xs text-red-600 bg-red-50 px-2 py-1 rounded font-medium border border-red-100">Canlı İzleme</span>
          </div>

          <div className="space-y-4">
            {/* Critical */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FEF2F2] border border-red-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-gray-800">Kritik Riskler</span>
              </div>
              <span className="text-2xl font-bold text-red-600">{riskStats.critical}</span>
            </div>

            {/* High */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FFF7ED] border border-orange-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-orange-500" />
                <span className="font-bold text-gray-800">Yüksek Riskler</span>
              </div>
              <span className="text-2xl font-bold text-orange-600">{riskStats.high}</span>
            </div>

            {/* Medium */}
            <div className="flex items-center justify-between p-4 rounded-xl bg-[#FEFCE8] border border-yellow-100 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-4">
                <div className="w-2 h-2 rounded-full bg-yellow-500" />
                <span className="font-bold text-gray-800">Orta Seviye</span>
              </div>
              <span className="text-2xl font-bold text-yellow-600">{riskStats.medium}</span>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-100">
             <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">En Kritik 3 Risk</h3>
             <ul className="space-y-3">
               {topRisks.map(r => (
                   <li key={r.id} className="text-sm text-gray-600 truncate flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                      <AlertTriangle className="w-4 h-4 text-red-500 shrink-0"/>
                      <span className="font-medium text-gray-700 flex-1">{r.name}</span>
                      {currentUser?.roleId === 'admin' && r.companyId && (
                        <CompanyBadge companyId={r.companyId} size="sm" />
                      )}
                   </li>
                 ))}
                {topRisks.length === 0 && <li className="text-sm text-gray-400 italic text-center py-2">Kayıt bulunamadı</li>}
             </ul>
          </div>
        </div>

      </div>
    </div>
  );
};

export default React.memo(Dashboard);