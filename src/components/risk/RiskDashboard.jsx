import React from 'react';
import { ArrowUpRight, ArrowDownRight, Activity, ShieldAlert, CheckCircle2 } from 'lucide-react';
import RiskMatrix from './RiskMatrix';
import RiskSummaryList from './RiskSummaryList';
import { getRiskLevel } from '@/lib/calculations';
import { useRiskData } from '@/hooks/useRiskData';

const KPICard = ({ title, value, subtext, trend, color = "blue" }) => {
  const colors = {
     blue: "bg-blue-50 text-blue-700 border-blue-100",
     green: "bg-green-50 text-green-700 border-green-100",
     red: "bg-red-50 text-red-700 border-red-100",
     orange: "bg-orange-50 text-orange-700 border-orange-100"
  };

  return (
    <div className={`p-4 rounded-xl border ${colors[color]} shadow-sm`}>
       <div className="text-xs font-bold uppercase opacity-70 mb-1">{title}</div>
       <div className="text-2xl font-bold">{value}</div>
       {subtext && <div className="text-xs mt-1 opacity-80">{subtext}</div>}
       {trend && (
          <div className={`text-xs mt-2 flex items-center ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
             {trend === 'up' ? <ArrowUpRight className="w-3 h-3 mr-1"/> : <ArrowDownRight className="w-3 h-3 mr-1"/>}
             {trend === 'up' ? 'Artış' : 'Azalış'}
          </div>
       )}
    </div>
  );
};

const RiskDashboard = ({ risks, onViewRisk }) => {
  const { projects } = useRiskData();
  
  // Load SP Data for relationships display in summary list
  const spData = {
     'Stratejik Alan': JSON.parse(localStorage.getItem('strategicAreas') || '[]'),
     'Amaç': JSON.parse(localStorage.getItem('strategicObjectives') || '[]'),
     'Hedef': JSON.parse(localStorage.getItem('targets') || '[]'),
     'Gösterge': JSON.parse(localStorage.getItem('indicators') || '[]'),
     'Faaliyet': JSON.parse(localStorage.getItem('activities') || '[]')
  };

  // KPI Calculations
  const totalRisks = risks.length;
  
  // KPI 1: Action Completion Rate
  const allActions = risks.flatMap(r => r.actionPlans || []);
  const completedActions = allActions.filter(a => a.status === 'Tamamlandı').length;
  const actionCompletionRate = allActions.length > 0 ? Math.round((completedActions / allActions.length) * 100) : 0;

  // KPI 2: Monitoring Rate (Active risks with logs in last 6 months?) - simplified to just existence of logs
  const activeRisks = risks.filter(r => r.status === 'Aktif');
  const activeWithLogs = activeRisks.filter(r => r.monitoringLogs && r.monitoringLogs.length > 0).length;
  const monitoringRate = activeRisks.length > 0 ? Math.round((activeWithLogs / activeRisks.length) * 100) : 0;

  // KPI 3: Improved Risks (Score decreased)
  const improvedRisks = risks.filter(r => {
     if (!r.monitoringLogs || r.monitoringLogs.length === 0) return false;
     const latestLog = r.monitoringLogs.sort((a,b) => new Date(b.monitoringDate) - new Date(a.monitoringDate))[0];
     return latestLog.score < r.score;
  }).length;

  // KPI 4: Critical Risk Rate
  const criticalRisks = risks.filter(r => getRiskLevel(r.score).value === 'Critical').length;
  const criticalRate = totalRisks > 0 ? Math.round((criticalRisks / totalRisks) * 100) : 0;

  return (
    <div className="space-y-8">
       {/* KPI Section */}
       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <KPICard 
             title="Önlem Faaliyeti Tamamlanma" 
             value={`%${actionCompletionRate}`} 
             subtext={`${completedActions} / ${allActions.length} Eylem`}
             color="green"
          />
          <KPICard 
             title="Risk İzleme Oranı" 
             value={`%${monitoringRate}`} 
             subtext="Aktif riskler"
             color="blue"
          />
          <KPICard 
             title="İyileştirilen Risk" 
             value={improvedRisks} 
             subtext="Skoru düşen risk sayısı"
             color="green"
          />
          <KPICard 
             title="Kritik Risk Oranı" 
             value={`%${criticalRate}`} 
             subtext={`${criticalRisks} Kritik Risk`}
             color="red"
          />
       </div>

       {/* Matrix & Distribution Section */}
       <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RiskMatrix risks={risks} onRiskClick={onViewRisk} />
          
          <div className="bg-white p-6 rounded-xl border shadow-sm">
             <h3 className="text-lg font-bold text-gray-800 mb-6">Risk Dağılımı (Türe Göre)</h3>
             <div className="space-y-6">
                {['sp', 'surec', 'proje', 'kurumsal'].map(type => {
                   const count = risks.filter(r => r.riskType === type).length;
                   const percentage = totalRisks > 0 ? Math.round((count / totalRisks) * 100) : 0;
                   const labels = { sp: 'Stratejik Plan', surec: 'Süreç', proje: 'Proje', kurumsal: 'Kurumsal' };
                   const colors = { sp: 'bg-purple-500', surec: 'bg-blue-500', proje: 'bg-orange-500', kurumsal: 'bg-gray-500' };
                   const textColors = { sp: 'text-purple-600', surec: 'text-blue-600', proje: 'text-orange-600', kurumsal: 'text-gray-600' };
                   
                   return (
                      <div key={type}>
                         <div className="flex justify-between text-sm mb-2">
                            <span className={`font-medium ${textColors[type]}`}>{labels[type]}</span>
                            <span className="font-bold text-gray-700">{count} <span className="text-xs font-normal text-gray-500 ml-1">({percentage}%)</span></span>
                         </div>
                         <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
                            <div className={`h-2.5 rounded-full ${colors[type]} transition-all duration-1000`} style={{ width: `${percentage}%` }}></div>
                         </div>
                      </div>
                   );
                })}
             </div>
          </div>
       </div>

       {/* Summary List Section */}
       <RiskSummaryList 
          risks={risks} 
          onViewRisk={onViewRisk}
          spData={spData}
          projects={projects}
       />
    </div>
  );
};

export default RiskDashboard;