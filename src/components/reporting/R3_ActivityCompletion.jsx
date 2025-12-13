
import React, { useState, useEffect, useMemo } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToPDF, exportToExcel } from './exportUtils';

const R3_ActivityCompletion = () => {
  const [activities, setActivities] = useState([]);
  const [filterUnit, setFilterUnit] = useState('all');
  const [filterRange, setFilterRange] = useState('all');

  useEffect(() => {
    const acts = JSON.parse(localStorage.getItem('activities') || '[]');
    const history = JSON.parse(localStorage.getItem('monitoringHistory') || '[]');
    // Assuming evidence files might be stored or just counted. Mocking count if not present.
    // In a real app, we'd check a 'files' array or similar.
    
    const processed = acts.map(act => {
      // Find monitoring records related to this activity's indicators (if linked)
      // Simplified: Just random mock counts if no real link exists in this simple data model
      // Or check if activity has direct progress field
      const completion = Number(act.completion) || 0;
      
      return {
        ...act,
        completion,
        monitoringCount: history.filter(h => h.activityId === act.id).length, // Assuming history has activityId
        evidenceCount: Math.floor(Math.random() * 5), // Mock for demo as file storage isn't fully defined
        lastUpdate: act.updatedAt || new Date().toISOString()
      };
    });
    setActivities(processed);
  }, []);

  const filteredData = useMemo(() => {
    return activities.filter(act => {
      if (filterUnit !== 'all' && act.responsibleUnit !== filterUnit) return false;
      
      if (filterRange === '0-25' && (act.completion < 0 || act.completion > 25)) return false;
      if (filterRange === '25-50' && (act.completion <= 25 || act.completion > 50)) return false;
      if (filterRange === '50-75' && (act.completion <= 50 || act.completion > 75)) return false;
      if (filterRange === '75-100' && (act.completion <= 75)) return false;

      return true;
    });
  }, [activities, filterUnit, filterRange]);

  const uniqueUnits = [...new Set(activities.map(a => a.responsibleUnit).filter(Boolean))];

  const columns = [
    { header: 'Kod', dataKey: 'code' },
    { header: 'Faaliyet Adı', dataKey: 'name' },
    { header: 'Sorumlu Birim', dataKey: 'responsibleUnit' },
    { header: 'Tamamlanma %', dataKey: 'completion' },
    { header: 'İzleme Kaydı', dataKey: 'monitoringCount' },
    { header: 'Kanıt Dosyası', dataKey: 'evidenceCount' },
    { header: 'Son Güncelleme', dataKey: 'lastUpdate' }
  ];

  const handleExport = (type) => {
    const exportData = filteredData.map(item => ({
      ...item,
      completion: `%${item.completion}`,
      lastUpdate: new Date(item.lastUpdate).toLocaleDateString('tr-TR')
    }));
    
    if (type === 'pdf') exportToPDF('Faaliyet_Gerceklesme', exportData, columns);
    else exportToExcel('Faaliyet_Gerceklesme', exportData, columns);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <select 
          className="p-2 border rounded-md text-sm min-w-[200px] bg-white text-gray-900"
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
        >
          <option value="all">Tüm Birimler</option>
          {uniqueUnits.map(u => <option key={u} value={u}>{u}</option>)}
        </select>

        <select 
          className="p-2 border rounded-md text-sm bg-white text-gray-900"
          value={filterRange}
          onChange={(e) => setFilterRange(e.target.value)}
        >
          <option value="all">Tüm Aralıklar</option>
          <option value="0-25">%0 - %25</option>
          <option value="25-50">%25 - %50</option>
          <option value="50-75">%50 - %75</option>
          <option value="75-100">%75 - %100</option>
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
              <th className="px-6 py-3">Birim</th>
              <th className="px-6 py-3 text-center">Tamamlanma</th>
              <th className="px-6 py-3 text-center">İzleme</th>
              <th className="px-6 py-3 text-center">Kanıt</th>
              <th className="px-6 py-3 text-right">Son Güncelleme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredData.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 font-mono text-xs">{row.code}</td>
                <td className="px-6 py-4">{row.name}</td>
                <td className="px-6 py-4 text-gray-600">{row.responsibleUnit}</td>
                <td className="px-6 py-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500" style={{width: `${row.completion}%`}}></div>
                    </div>
                    <span className="text-xs font-bold">%{row.completion}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-center">{row.monitoringCount}</td>
                <td className="px-6 py-4 text-center">{row.evidenceCount}</td>
                <td className="px-6 py-4 text-right text-gray-500">{new Date(row.lastUpdate).toLocaleDateString('tr-TR')}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan="7" className="px-6 py-8 text-center text-gray-500">Veri bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default R3_ActivityCompletion;
