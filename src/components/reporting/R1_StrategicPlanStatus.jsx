
import React, { useState, useEffect, useMemo } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { calculateAreaStats } from '@/lib/calculations';
import { exportToPDF, exportToExcel } from './exportUtils';

const R1_StrategicPlanStatus = () => {
  const [data, setData] = useState([]);
  const [filterArea, setFilterArea] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
    const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
    const targets = JSON.parse(localStorage.getItem('targets') || '[]');
    const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');

    const processedData = areas.map(area => {
      const stats = calculateAreaStats(area, objectives, targets, indicators);
      const areaActivities = activities.filter(act => {
        const objIds = stats.objectives.map(o => o.id);
        // This is a simplification; ideally activities link to targets which link to objectives
        // Assuming we can find them via hierarchy or if activities have direct area link (unlikely)
        // Let's count activities by checking if their target belongs to one of the objectives
        // For now, let's just count total activities for the area if possible, or just use what we have.
        // Better approach: Filter activities that belong to targets of this area.
        return true; // Placeholder logic if direct link missing, but let's try to be more precise
      });
      
      // Count actual activities for this area
      let activityCount = 0;
      stats.objectives.forEach(obj => {
        obj.targets.forEach(tgt => {
           const acts = activities.filter(a => a.targetId === tgt.id);
           activityCount += acts.length;
        });
      });

      return {
        id: area.id,
        name: area.name,
        status: area.status,
        objectiveCount: stats.objectives.length,
        targetCount: stats.objectives.reduce((acc, o) => acc + o.targets.length, 0),
        activityCount: activityCount,
        completion: stats.completion
      };
    });

    setData(processedData);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filterArea !== 'all' && item.id !== filterArea) return false;
      if (filterStatus !== 'all' && item.status !== filterStatus) return false;
      return true;
    });
  }, [data, filterArea, filterStatus]);

  const columns = [
    { header: 'Stratejik Alan', dataKey: 'name' },
    { header: 'Amaç Sayısı', dataKey: 'objectiveCount' },
    { header: 'Hedef Sayısı', dataKey: 'targetCount' },
    { header: 'Faaliyet Sayısı', dataKey: 'activityCount' },
    { header: 'Tamamlanma %', dataKey: 'completion' },
    { header: 'Durum', dataKey: 'status' },
  ];

  const handleExportPDF = () => {
    const exportData = filteredData.map(item => ({
      ...item,
      completion: `%${item.completion.toFixed(1)}`
    }));
    exportToPDF('Stratejik_Plan_Durum', exportData, columns);
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map(item => ({
      ...item,
      completion: `%${item.completion.toFixed(1)}`
    }));
    exportToExcel('Stratejik_Plan_Durum', exportData, columns);
  };

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <select 
          className="p-2 border rounded-md text-sm min-w-[200px] bg-white text-gray-900"
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
        >
          <option value="all">Tüm Alanlar</option>
          {data.map(area => (
            <option key={area.id} value={area.id}>{area.name}</option>
          ))}
        </select>

        <select 
          className="p-2 border rounded-md text-sm min-w-[150px] bg-white text-gray-900"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="Aktif">Aktif</option>
          <option value="Pasif">Pasif</option>
        </select>

        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-2">
            <FileDown className="w-4 h-4" /> PDF
          </Button>
          <Button variant="outline" size="sm" onClick={handleExportExcel} className="gap-2">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Toplam Alan</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filteredData.length}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Toplam Amaç</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filteredData.reduce((acc, i) => acc + i.objectiveCount, 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Toplam Hedef</CardTitle></CardHeader>
          <CardContent><div className="text-2xl font-bold">{filteredData.reduce((acc, i) => acc + i.targetCount, 0)}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-sm font-medium text-gray-500">Ort. Tamamlanma</CardTitle></CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              %{filteredData.length ? (filteredData.reduce((acc, i) => acc + i.completion, 0) / filteredData.length).toFixed(1) : 0}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-3">Stratejik Alan</th>
              <th className="px-6 py-3 text-center">Amaç</th>
              <th className="px-6 py-3 text-center">Hedef</th>
              <th className="px-6 py-3 text-center">Faaliyet</th>
              <th className="px-6 py-3 text-center">Tamamlanma</th>
              <th className="px-6 py-3 text-center">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredData.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 font-medium">{row.name}</td>
                <td className="px-6 py-4 text-center">{row.objectiveCount}</td>
                <td className="px-6 py-4 text-center">{row.targetCount}</td>
                <td className="px-6 py-4 text-center">{row.activityCount}</td>
                <td className="px-6 py-4 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    row.completion >= 80 ? 'bg-green-100 text-green-800' :
                    row.completion >= 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    %{row.completion.toFixed(1)}
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-gray-500">{row.status}</td>
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

export default R1_StrategicPlanStatus;
