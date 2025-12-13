
import React, { useState, useEffect, useMemo } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';

const R4_BudgetVariance = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ chapter: 'all', varianceRange: 'all' });

  useEffect(() => {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const chapters = JSON.parse(localStorage.getItem('budgetChapters') || '[]');

    const processed = activities.map(act => {
      // Calculate actuals
      const actExpenses = expenses.filter(e => e.relatedActivityCode === act.code || e.activityId === act.id);
      const actualSpending = actExpenses.reduce((acc, e) => acc + parseFloat(e.amount || 0), 0);
      
      const estimated = parseFloat(act.budget || 0);
      const variance = estimated - actualSpending;
      const variancePercent = estimated > 0 ? ((variance / estimated) * 100).toFixed(1) : 0;
      
      // Find chapter name
      const chapter = chapters.find(c => c.id === act.budgetChapterId);

      return {
        code: act.code,
        name: act.name,
        estimated: estimated,
        actual: actualSpending,
        variance: variance,
        variancePercent: variancePercent,
        chapter: chapter ? chapter.name : 'Genel',
        status: variance < 0 ? 'Bütçe Aşıldı' : 'Bütçe İçi'
      };
    });

    setData(processed);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.chapter !== 'all' && item.chapter !== filters.chapter) return false;
      
      // Variance % range logic (simplified for variance magnitude)
      // Assuming range is about ABSOLUTE deviation magnitude relative to budget
      // Or simply mapping the requested dropdown options: 0-10%, 10-20%, 20%+
      // We'll use the absolute percentage of the variance relative to budget.
      const vPct = Math.abs(parseFloat(item.variancePercent));
      
      if (filters.varianceRange === '0-10' && vPct > 10) return false;
      if (filters.varianceRange === '10-20' && (vPct <= 10 || vPct > 20)) return false;
      if (filters.varianceRange === '20+' && vPct <= 20) return false;

      return true;
    });
  }, [data, filters]);

  const formatMoney = (val) => {
    return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(val);
  };

  const columns = [
    { header: 'Faaliyet Kodu', dataKey: 'code' },
    { header: 'Faaliyet Adı', dataKey: 'name' },
    { header: 'Tahmini Bütçe', dataKey: 'estimated', render: r => formatMoney(r.estimated) },
    { header: 'Gerçekleşen', dataKey: 'actual', render: r => formatMoney(r.actual) },
    { 
      header: 'Sapma Tutarı', 
      dataKey: 'variance', 
      render: r => <span className={r.variance < 0 ? 'text-red-500 font-bold' : 'text-green-500'}>{formatMoney(r.variance)}</span>
    },
    { header: 'Sapma %', dataKey: 'variancePercent', render: r => `%${r.variancePercent}` },
    { header: 'Fasıl', dataKey: 'chapter' },
    { 
      header: 'Durum', 
      dataKey: 'status',
      render: r => <span className={r.status === 'Bütçe Aşıldı' ? 'text-red-400 font-bold' : 'text-green-400'}>{r.status}</span>
    }
  ];

  const uniqueChapters = [...new Set(data.map(d => d.chapter))].map(c => ({ value: c, label: c }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="w-full md:w-auto flex-1">
          <ReportFilters
            filters={filters}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
            onReset={() => setFilters({ chapter: 'all', varianceRange: 'all' })}
            filterConfig={[
              { key: 'chapter', label: 'Fasıl Seç', type: 'select', options: uniqueChapters },
              { 
                key: 'varianceRange', 
                label: 'Sapma %', 
                type: 'select', 
                options: [
                  { value: '0-10', label: '%0 - %10' },
                  { value: '10-20', label: '%10 - %20' },
                  { value: '20+', label: '%20+' }
                ] 
              }
            ]}
          />
        </div>
        <ExportButtons data={filteredData} columns={columns} fileName="R4_Butce_Sapmasi" />
      </div>

      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default R4_BudgetVariance;
