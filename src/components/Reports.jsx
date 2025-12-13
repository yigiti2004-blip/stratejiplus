import React, { useState, useEffect } from 'react';
import { 
  BarChart3, PieChart, TrendingUp, Download, Calendar, 
  FileText, Filter, ArrowRight, Target, Layers, DollarSign, CheckCircle2,
  Briefcase, History
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { 
  calculateCompletion, 
  calculateIndicatorStats, 
  formatCurrency,
  calculateChapterBudget,
  calculateActivityBudget,
  getBudgetStatus
} from '@/lib/calculations';
import { useToast } from '@/components/ui/use-toast';

// --- CHART COMPONENTS (Mock Visuals for MVP) ---

const SimpleBarChart = ({ data, height = 200 }) => (
  <div className="w-full flex items-end gap-2" style={{ height }}>
    {data.map((item, idx) => (
      <div key={idx} className="flex-1 flex flex-col items-center group relative">
        <div className="absolute bottom-full mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-xs p-1 rounded whitespace-nowrap z-10">
          {item.label}: {item.value}%
        </div>
        <div 
          className={`w-full rounded-t-sm transition-all duration-500 ${item.color || 'bg-blue-500'}`} 
          style={{ height: `${Math.max(item.value, 5)}%` }} 
        />
        <span className="text-[10px] text-gray-500 mt-2 truncate w-full text-center">{item.label}</span>
      </div>
    ))}
  </div>
);

const Reports = ({ currentUser }) => {
  const { toast } = useToast();
  const [period, setPeriod] = useState('2025');
  
  // Data States
  const [objectives, setObjectives] = useState([]);
  const [targets, setTargets] = useState([]);
  const [indicators, setIndicators] = useState([]);
  const [chapters, setChapters] = useState([]);
  const [activities, setActivities] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const lObjs = JSON.parse(localStorage.getItem('strategicObjectives') || '[]').filter(i => i.status !== 'İptal Edildi');
      const lTargets = JSON.parse(localStorage.getItem('targets') || '[]').filter(i => i.status !== 'İptal Edildi');
      const lInds = JSON.parse(localStorage.getItem('indicators') || '[]').filter(i => i.status !== 'İptal Edildi');
      const lChaps = JSON.parse(localStorage.getItem('budgetChapters') || '[]').filter(i => i.status !== 'İptal Edildi');
      const lActs = JSON.parse(localStorage.getItem('activities') || '[]').filter(i => i.status !== 'İptal Edildi');
      const lExps = JSON.parse(localStorage.getItem('expenses') || '[]'); 
      const lLogs = JSON.parse(localStorage.getItem('revisionLogs') || '[]');

      setObjectives(lObjs);
      setTargets(lTargets);
      setIndicators(lInds);
      setChapters(lChaps);
      setActivities(lActs);
      setExpenses(lExps);
      setLogs(lLogs);
    } catch (error) {
      console.error("Report data load error:", error);
    }
  };

  // --- CALCULATIONS ---
  const strategicData = objectives.map(obj => {
    const objTargets = targets.filter(t => t.objectiveId === obj.id);
    const targetCompletions = objTargets.map(t => {
      const tInds = indicators.filter(i => i.targetId === t.id);
      const indCompletions = tInds.map(i => calculateCompletion(i.actualValue, i.targetValue));
      return indCompletions.length ? indCompletions.reduce((a,b) => a+b, 0) / indCompletions.length : 0;
    });
    const avgCompletion = targetCompletions.length ? targetCompletions.reduce((a,b) => a+b, 0) / targetCompletions.length : 0;
    return { label: `A${obj.id.split('-')[1] || '?' }`, fullLabel: obj.title, value: Math.round(avgCompletion), color: avgCompletion >= 80 ? 'bg-green-500' : avgCompletion >= 50 ? 'bg-yellow-500' : 'bg-red-500' };
  });

  const processedActivities = activities.map(a => calculateActivityBudget(a, expenses));
  const budgetData = chapters.map(chap => calculateChapterBudget(chap, processedActivities));
  const totalPlanned = budgetData.reduce((acc, c) => acc + c.plannedTotal, 0);
  const totalActual = budgetData.reduce((acc, c) => acc + c.actualTotal, 0);
  const realizationRate = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  const handleExport = (reportName) => toast({ title: "Rapor İndiriliyor", description: `${reportName} excel formatında hazırlanıyor...` });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-[#0D1522] p-8 rounded-[14px] shadow-2xl border border-gray-800 relative overflow-hidden">
        <div className="absolute right-0 top-0 w-64 h-64 bg-purple-500/10 blur-[80px] rounded-full pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-purple-600 rounded-lg text-white shadow-lg shadow-purple-600/30">
                <FileText className="w-6 h-6" />
              </div>
              <h1 className="text-3xl font-bold text-white">Rapor Merkezi</h1>
            </div>
            <p className="text-gray-400 text-lg">Kurumsal performans, bütçe ve faaliyet raporları.</p>
          </div>
          <div className="flex items-center gap-3 bg-[#1F2937] p-2 rounded-lg border border-gray-700">
            <Calendar className="w-5 h-5 text-gray-400" />
            <select value={period} onChange={(e) => setPeriod(e.target.value)} className="bg-transparent text-white border-none focus:ring-0 text-sm font-medium cursor-pointer">
              <option value="2025">2025 Dönemi</option>
              <option value="2024">2024 Dönemi</option>
            </select>
          </div>
        </div>
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="premium-card bg-gradient-to-br from-blue-500/10 to-transparent border-blue-500/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2"><Target className="w-4 h-4 text-blue-500"/> Ortalama Hedef Başarısı</h3>
          <div className="text-3xl font-bold text-gray-900">{Math.round(strategicData.reduce((acc, i) => acc + i.value, 0) / (strategicData.length || 1))}%</div>
          <div className="mt-2 h-1.5 w-full bg-blue-100 rounded-full overflow-hidden"><div className="h-full bg-blue-500 rounded-full" style={{ width: `${Math.round(strategicData.reduce((acc, i) => acc + i.value, 0) / (strategicData.length || 1))}%` }}></div></div>
        </div>
        <div className="premium-card bg-gradient-to-br from-green-500/10 to-transparent border-green-500/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2"><DollarSign className="w-4 h-4 text-green-500"/> Bütçe Gerçekleşme</h3>
          <div className="text-3xl font-bold text-gray-900">%{realizationRate.toFixed(1)}</div>
           <div className="text-xs text-gray-500 mt-1">{formatCurrency(totalActual)} / {formatCurrency(totalPlanned)}</div>
        </div>
        <div className="premium-card bg-gradient-to-br from-purple-500/10 to-transparent border-purple-500/20">
          <h3 className="text-sm font-medium text-gray-500 mb-2 flex items-center gap-2"><Briefcase className="w-4 h-4 text-purple-500"/> Revizyon Analizi</h3>
          <div className="text-3xl font-bold text-gray-900">{logs.length}</div>
          <div className="text-xs text-gray-500 mt-1">{logs.filter(l => l.revisionType === 'cancel').length} Kapsam Dışı, {logs.filter(l => l.revisionType === 'modify').length} Düzenleme</div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* STRATEGIC PERFORMANCE REPORT */}
        <div className="premium-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><BarChart3 className="w-5 h-5 text-blue-600"/> Stratejik Amaç Performansı</h2>
            <Button onClick={() => handleExport('Stratejik Performans')} variant="outline" size="sm" className="h-8 text-xs"><Download className="w-3 h-3 mr-2"/> Excel</Button>
          </div>
          <div className="mb-8"><SimpleBarChart data={strategicData} height={240} /></div>
          <div className="space-y-4">
            {objectives.map((obj, idx) => {
              const score = strategicData[idx]?.value || 0;
              return (
                <div key={obj.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100">
                  <div className="flex-1 mr-4">
                    <div className="text-sm font-bold text-gray-900 line-clamp-1" title={obj.title}>{obj.title}</div>
                    <div className="text-xs text-gray-500">Amaç Kodu: {obj.id}</div>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold ${score >= 80 ? 'bg-green-100 text-green-700' : score >= 50 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>%{score}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* BUDGET REPORT */}
        <div className="premium-card">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><PieChart className="w-5 h-5 text-green-600"/> Bütçe Gerçekleşme Raporu</h2>
            <Button onClick={() => handleExport('Bütçe Raporu')} variant="outline" size="sm" className="h-8 text-xs"><Download className="w-3 h-3 mr-2"/> Excel</Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Bütçe Faslı</th>
                  <th className="px-4 py-3 text-right">Planlanan</th>
                  <th className="px-4 py-3 text-right">Harcanan</th>
                  <th className="px-4 py-3 text-center">%</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {budgetData.map(chap => {
                  const realization = chap.plannedTotal > 0 ? (chap.actualTotal / chap.plannedTotal) * 100 : 0;
                  let badgeClass = "bg-green-100 text-green-700"; 
                  if (realization < 60) badgeClass = "bg-yellow-100 text-yellow-700"; 
                  if (realization > 100) badgeClass = "bg-red-100 text-red-700"; 

                  return (
                    <tr key={chap.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{chap.code}<div className="text-xs text-gray-500 font-normal truncate max-w-[150px]" title={chap.name}>{chap.name}</div></td>
                      <td className="px-4 py-3 text-right font-mono text-gray-600">{formatCurrency(chap.plannedTotal)}</td>
                      <td className="px-4 py-3 text-right font-mono text-gray-900 font-medium">{formatCurrency(chap.actualTotal)}</td>
                      <td className="px-4 py-3 text-center"><span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${badgeClass}`}>%{realization.toFixed(1)}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* REVISION REPORT SECTION */}
      <div className="premium-card">
         <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2"><History className="w-5 h-5 text-purple-600"/> Revizyon & Analiz Raporu</h2>
            <Button onClick={() => handleExport('Revizyon Raporu')} variant="outline" size="sm" className="h-8 text-xs"><Download className="w-3 h-3 mr-2"/> Excel</Button>
         </div>
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
               <h4 className="font-bold text-gray-800 text-sm mb-4">Son YK Kararları</h4>
               <ul className="space-y-3">
                  {logs.filter(l => l.ykDecision?.no).slice(0, 5).map(l => (
                     <li key={l.id} className="flex justify-between items-center text-sm">
                        <div className="flex items-center gap-2">
                           <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                           <span className="font-mono text-xs text-blue-600 bg-blue-50 px-1 rounded">{l.ykDecision.no}</span>
                        </div>
                        <span className="text-gray-500 text-xs">{new Date(l.ykDecision.date).toLocaleDateString('tr-TR')}</span>
                     </li>
                  ))}
                  {logs.filter(l => l.ykDecision?.no).length === 0 && <li className="text-gray-400 text-xs italic">Kayıt bulunamadı.</li>}
               </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
               <h4 className="font-bold text-gray-800 text-sm mb-4">Eklenen Analizler</h4>
               <div className="flex flex-wrap gap-2">
                  {['Bütçe Analizi', 'Risk Analizi', 'Performans Analizi', 'Diğer'].map(type => {
                     const count = logs.reduce((acc, l) => acc + (l.analyses?.filter(a => a.type === type).length || 0), 0);
                     return (
                        <div key={type} className="bg-white border border-gray-200 px-3 py-2 rounded-lg flex flex-col items-center min-w-[80px]">
                           <span className="text-lg font-bold text-gray-900">{count}</span>
                           <span className="text-[10px] text-gray-500">{type.split(' ')[0]}</span>
                        </div>
                     )
                  })}
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default Reports;