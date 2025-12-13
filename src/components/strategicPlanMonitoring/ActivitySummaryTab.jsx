
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Calendar, Target, Layers, Coins, Building2, Tag, TrendingUp, Wallet } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useIndicatorCalculations } from '@/hooks/useIndicatorCalculations';
import { useBudgetData } from '@/hooks/useBudgetData';

const ActivitySummaryTab = ({ activity, hierarchy }) => {
  const { target, objective, area } = hierarchy || {};
  const { calculateIndicatorCompletion, calculateIndicatorValue, getProgressColor } = useIndicatorCalculations();
  const { getBudgetSummary } = useBudgetData();
  
  const allIndicators = JSON.parse(localStorage.getItem('indicators') || '[]');
  const relatedIndicators = allIndicators.filter(i => i.targetId === target?.id);

  const budgetSummary = getBudgetSummary(activity.code);

  const formatMoney = (amount) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(amount);
  };

  return (
    <div className="space-y-6">
      {/* Financial Summary Section */}
      <Card className="border-blue-200 shadow-sm bg-blue-50/30">
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wallet className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-gray-900">Mali Özet</h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase">Tahmini Bütçe</span>
              <div className="text-lg font-bold text-gray-900">
                {formatMoney(budgetSummary.estimatedBudget)}
              </div>
            </div>
            
            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase">Gerçekleşen Harcama</span>
              <div className="text-lg font-bold text-gray-900">
                {formatMoney(budgetSummary.realizedExpenses)}
              </div>
            </div>

            <div className="space-y-1">
              <span className="text-xs font-medium text-gray-500 uppercase">Kalan Bütçe</span>
              <div className={`text-lg font-bold ${budgetSummary.remainingBudget < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                {formatMoney(budgetSummary.remainingBudget)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Basic Info */}
        <Card className="col-span-2 border-gray-200 shadow-sm">
          <CardContent className="p-6 space-y-4">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Faaliyet Adı</h3>
              <div className="text-lg font-bold text-gray-900">{activity.name}</div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                   <Tag className="w-3 h-3" /> Kod
                </span>
                <div className="font-mono text-sm font-bold bg-gray-100 px-2 py-1 rounded inline-block">
                  {activity.code}
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs font-medium text-gray-500 uppercase flex items-center gap-1">
                   <Building2 className="w-3 h-3" /> Sorumlu Birim
                </span>
                <div className="font-medium text-gray-900">
                  {activity.responsibleUnit || '-'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hierarchy Info */}
        <Card className="col-span-2 border-gray-200 shadow-sm bg-gray-50/50">
          <CardContent className="p-6 space-y-4">
             <h4 className="font-semibold text-gray-900 border-b border-gray-200 pb-2 mb-2">İlişkili Kayıtlar</h4>
             
             {area && (
               <div className="flex items-start gap-3">
                 <div className="mt-1"><Layers className="w-4 h-4 text-blue-600" /></div>
                 <div>
                   <div className="text-xs text-gray-500">Stratejik Alan</div>
                   <div className="text-sm font-medium text-gray-900">
                     <span className="font-bold text-blue-700 mr-1">{area.code}</span>
                     {area.name}
                   </div>
                 </div>
               </div>
             )}

             {objective && (
               <div className="flex items-start gap-3">
                 <div className="mt-1"><Target className="w-4 h-4 text-indigo-600" /></div>
                 <div>
                   <div className="text-xs text-gray-500">Amaç</div>
                   <div className="text-sm font-medium text-gray-900">
                     <span className="font-bold text-indigo-700 mr-1">{objective.code}</span>
                     {objective.name}
                   </div>
                 </div>
               </div>
             )}

             {target && (
               <div className="flex items-start gap-3">
                 <div className="mt-1"><Target className="w-4 h-4 text-emerald-600" /></div>
                 <div>
                   <div className="text-xs text-gray-500">Hedef</div>
                   <div className="text-sm font-medium text-gray-900">
                     <span className="font-bold text-emerald-700 mr-1">{target.code}</span>
                     {target.name}
                   </div>
                 </div>
               </div>
             )}
          </CardContent>
        </Card>

        {/* Date & Budget */}
        <Card className="border-gray-200 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="w-5 h-5 text-gray-400" />
              <h4 className="font-semibold text-gray-900">Planlanan Takvim</h4>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm border-b border-gray-100 pb-2">
                <span className="text-gray-500">Başlangıç</span>
                <span className="font-medium font-mono">{formatDate(activity.startDate)}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-gray-500">Bitiş</span>
                <span className="font-medium font-mono">{formatDate(activity.endDate)}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Note: Original 'Mali Bilgiler' card removed as it's replaced by top Financial Summary section */}

        {/* Indicators Section */}
        {relatedIndicators.length > 0 && (
           <Card className="col-span-2 border-gray-200 shadow-sm">
              <CardContent className="p-6">
                 <div className="flex items-center gap-2 mb-4">
                   <TrendingUp className="w-5 h-5 text-indigo-500" />
                   <h4 className="font-semibold text-gray-900">Bağlı Göstergeler ve Değerleri</h4>
                 </div>
                 
                 <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                       <thead>
                          <tr className="border-b border-gray-100 text-left">
                             <th className="pb-3 text-gray-500 font-medium">Gösterge Adı</th>
                             <th className="pb-3 text-gray-500 font-medium text-right">Hedef</th>
                             <th className="pb-3 text-gray-500 font-medium text-right">Gerçekleşen</th>
                             <th className="pb-3 text-gray-500 font-medium text-right w-24">Durum</th>
                          </tr>
                       </thead>
                       <tbody>
                          {relatedIndicators.map(ind => {
                             const achieved = calculateIndicatorValue(ind.id);
                             const completion = Math.round(calculateIndicatorCompletion(ind.id));
                             const color = getProgressColor(completion);
                             
                             return (
                                <tr key={ind.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                   <td className="py-3 pr-4">
                                      <div className="font-medium text-gray-900">
                                         <span className="font-bold mr-1">{ind.code}</span> {ind.name}
                                      </div>
                                   </td>
                                   <td className="py-3 text-right font-mono text-gray-600">{ind.targetValue}</td>
                                   <td className="py-3 text-right font-mono font-bold text-gray-900">{achieved}</td>
                                   <td className="py-3 pl-4">
                                      <div className="flex flex-col items-end gap-1">
                                         <span className="text-xs font-bold text-gray-700">%{completion}</span>
                                         <div className="w-16 h-1.5 bg-gray-100 rounded-full">
                                            <div className={`h-full rounded-full ${color}`} style={{width: `${Math.min(completion, 100)}%`}}></div>
                                         </div>
                                      </div>
                                   </td>
                                </tr>
                             );
                          })}
                       </tbody>
                    </table>
                 </div>
              </CardContent>
           </Card>
        )}
      </div>
    </div>
  );
};

export default ActivitySummaryTab;
