
import React, { useMemo, useState } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { formatCurrency } from '@/lib/utils';

const BudgetVarianceReport = () => {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
  
  const [filters, setFilters] = useState({});

  const reportData = useMemo(() => {
    return activities.map(act => {
      // Calculate actual spending for this activity
      // Assuming expense records might have 'relatedActivityCode' or we match by text or logic used in existing app
      // Based on previous code in MonitoringRecordForm: checkExpenseRecords(activityCode)
      const actExpenses = expenses.filter(e => e.relatedActivityCode === act.code);
      const actualTotal = actExpenses.reduce((acc, curr) => acc + parseFloat(curr.amount || 0), 0);
      const estimatedBudget = parseFloat(act.budget || 0);
      const variance = estimatedBudget - actualTotal;
      const variancePercent = estimatedBudget > 0 ? (variance / estimatedBudget) * 100 : 0;

      return {
        code: act.code,
        name: act.name,
        estimatedBudget: estimatedBudget,
        actualSpending: actualTotal,
        varianceAmount: variance,
        variancePercent: variancePercent.toFixed(1),
        status: variance < 0 ? 'Bütçe Aşımı' : 'Bütçe İçi'
      };
    });
  }, [activities, expenses]);

  const filteredData = reportData.filter(item => {
    if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
    return true;
  });

  const columns = [
    { title: 'Kod', key: 'code', sortable: true },
    { title: 'Faaliyet Adı', key: 'name' },
    { title: 'Tahmini Bütçe', key: 'estimatedBudget', sortable: true, render: r => formatCurrency(r.estimatedBudget) },
    { title: 'Gerçekleşen', key: 'actualSpending', sortable: true, render: r => formatCurrency(r.actualSpending) },
    { 
      title: 'Sapma Tutarı', 
      key: 'varianceAmount', 
      sortable: true, 
      render: r => <span className={r.varianceAmount < 0 ? 'text-red-600 font-bold' : 'text-green-600'}>{formatCurrency(r.varianceAmount)}</span> 
    },
    { title: 'Sapma %', key: 'variancePercent', render: r => `%${r.variancePercent}` },
    { 
      title: 'Durum', 
      key: 'status',
      render: r => (
         <span className={`px-2 py-1 rounded text-xs font-bold ${r.status === 'Bütçe Aşımı' ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
            {r.status}
         </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex-1 max-w-2xl">
           <ReportFilters 
             filters={filters}
             onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
             onReset={() => setFilters({})}
             filterConfig={[
               { 
                 key: 'status', 
                 label: 'Durum', 
                 type: 'select', 
                 options: [{value: 'Bütçe Aşımı', label: 'Bütçe Aşımı'}, {value: 'Bütçe İçi', label: 'Bütçe İçi'}] 
               }
             ]}
           />
        </div>
        <div className="mb-6 ml-4">
           <ExportButtons data={filteredData} columns={columns} fileName="Butce_Sapma_Raporu" />
        </div>
      </div>
      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default BudgetVarianceReport;
