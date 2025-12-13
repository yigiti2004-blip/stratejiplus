
import React, { useState, useEffect, useMemo } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateActivityBudget, formatCurrency } from '@/lib/calculations';
import { exportToPDF, exportToExcel } from './exportUtils';

const R4_BudgetVariance = () => {
  const [data, setData] = useState([]);
  const [filterChapter, setFilterChapter] = useState('all');
  const [filterVariance, setFilterVariance] = useState('all');

  useEffect(() => {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    const chapters = JSON.parse(localStorage.getItem('budgetChapters') || '[]');

    const processed = activities.map(act => {
      const budgetData = calculateActivityBudget(act, expenses);
      const chapter = chapters.find(c => c.id === act.budgetChapterId);
      return {
        ...budgetData,
        chapterName: chapter ? chapter.name : 'Tanımsız'
      };
    });
    setData(processed);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterChapter !== 'all' && item.budgetChapterId !== filterChapter) return false;
      
      if (filterVariance === 'positive' && item.variance < 0) return false;
      if (filterVariance === 'negative' && item.variance >= 0) return false;
      
      return true;
    });
  }, [data, filterChapter, filterVariance]);

  const chapters = useMemo(() => {
    const uniqueIds = [...new Set(data.map(d => d.budgetChapterId).filter(Boolean))];
    return uniqueIds.map(id => {
      const item = data.find(d => d.budgetChapterId === id);
      return { id, name: item.chapterName };
    });
  }, [data]);

  const columns = [
    { header: 'Kod', dataKey: 'code' },
    { header: 'Faaliyet', dataKey: 'name' },
    { header: 'Fasıl', dataKey: 'chapterName' },
    { header: 'Tahmini Bütçe', dataKey: 'plannedBudgetFormatted' },
    { header: 'Gerçekleşen', dataKey: 'actualBudgetFormatted' },
    { header: 'Sapma Tutarı', dataKey: 'varianceFormatted' },
    { header: 'Sapma %', dataKey: 'variancePercentageFormatted' }
  ];

  const handleExport = (type) => {
    const exportData = filteredData.map(item => ({
      ...item,
      plannedBudgetFormatted: formatCurrency(item.plannedBudget),
      actualBudgetFormatted: formatCurrency(item.actualBudget),
      varianceFormatted: formatCurrency(item.variance),
      variancePercentageFormatted: `%${item.variancePercentage.toFixed(1)}`
    }));
    
    if (type === 'pdf') exportToPDF('Butce_Sapma_Raporu', exportData, columns);
    else exportToExcel('Butce_Sapma_Raporu', exportData, columns);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <select 
          className="p-2 border rounded-md text-sm min-w-[200px] bg-white text-gray-900"
          value={filterChapter}
          onChange={(e) => setFilterChapter(e.target.value)}
        >
          <option value="all">Tüm Fasıllar</option>
          {chapters.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>

        <select 
          className="p-2 border rounded-md text-sm bg-white text-gray-900"
          value={filterVariance}
          onChange={(e) => setFilterVariance(e.target.value)}
        >
          <option value="all">Tüm Sapmalar</option>
          <option value="positive">Pozitif (Bütçe Altı)</option>
          <option value="negative">Negatif (Bütçe Üstü)</option>
        </select>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')} className="gap-2">
            <FileDown className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={() => handleExport('excel')} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-3">Kod</th>
              <th className="px-6 py-3">Faaliyet</th>
              <th className="px-6 py-3 text-right">Tahmini</th>
              <th className="px-6 py-3 text-right">Gerçekleşen</th>
              <th className="px-6 py-3 text-right">Sapma</th>
              <th className="px-6 py-3 text-right">Sapma %</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredData.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 font-mono text-xs">{row.code}</td>
                <td className="px-6 py-4">{row.name}</td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(row.plannedBudget)}</td>
                <td className="px-6 py-4 text-right font-medium">{formatCurrency(row.actualBudget)}</td>
                <td className={`px-6 py-4 text-right font-bold ${row.variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {formatCurrency(row.variance)}
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${row.variance >= 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    %{row.variancePercentage.toFixed(1)}
                  </span>
                </td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Veri bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default R4_BudgetVariance;
