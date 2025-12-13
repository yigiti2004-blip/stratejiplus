
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Layers, Target, ListChecks, Activity } from 'lucide-react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';

const R1_StrategicPlanStatus = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ area: 'all', status: 'all' });

  useEffect(() => {
    // Read local storage
    const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
    const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
    const targets = JSON.parse(localStorage.getItem('targets') || '[]');
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    // Process Data
    const processed = areas.map(area => {
      const areaObjs = objectives.filter(o => o.strategicAreaId === area.id);
      const areaTargets = targets.filter(t => areaObjs.some(o => o.id === t.objectiveId));
      
      // Calculate Avg Completion for Targets
      let totalCompletion = 0;
      areaTargets.forEach(t => {
        // Simplified: assuming completion is stored or defaults to 0
        totalCompletion += parseFloat(t.completionPercentage || 0);
      });
      const avgCompletion = areaTargets.length > 0 ? (totalCompletion / areaTargets.length).toFixed(1) : 0;

      // Activity count linked to these targets
      const areaActivityCount = activities.filter(a => areaTargets.some(t => t.id === a.targetId)).length;

      return {
        id: area.id,
        name: area.name,
        objCount: areaObjs.length,
        targetCount: areaTargets.length,
        actCount: areaActivityCount,
        completion: avgCompletion,
        status: area.status || 'Aktif'
      };
    });

    setData(processed);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.area !== 'all' && item.id !== filters.area) return false;
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);

  // Columns for Table & Export
  const columns = [
    { header: 'Stratejik Alan Adı', dataKey: 'name' },
    { header: 'Amaç Sayısı', dataKey: 'objCount' },
    { header: 'Hedef Sayısı', dataKey: 'targetCount' },
    { header: 'Faaliyet Sayısı', dataKey: 'actCount' },
    { 
      header: 'Ortalama Tamamlanma %', 
      dataKey: 'completion',
      render: (row) => (
        <span className={`${row.completion > 70 ? 'text-green-400' : 'text-yellow-400'} font-bold`}>
          %{row.completion}
        </span>
      )
    }
  ];

  // Unique areas for filter
  const uniqueAreas = data.map(d => ({ value: d.id, label: d.name }));

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Stratejik Alan</p>
              <h3 className="text-2xl font-bold text-white">{filteredData.length}</h3>
            </div>
            <Layers className="h-8 w-8 text-blue-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Amaç</p>
              <h3 className="text-2xl font-bold text-white">{filteredData.reduce((acc, curr) => acc + curr.objCount, 0)}</h3>
            </div>
            <Target className="h-8 w-8 text-purple-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Hedef</p>
              <h3 className="text-2xl font-bold text-white">{filteredData.reduce((acc, curr) => acc + curr.targetCount, 0)}</h3>
            </div>
            <Activity className="h-8 w-8 text-green-500 opacity-70" />
          </CardContent>
        </Card>
        <Card className="bg-gray-800 border-gray-700">
          <CardContent className="p-6 flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-400">Faaliyet</p>
              <h3 className="text-2xl font-bold text-white">{filteredData.reduce((acc, curr) => acc + curr.actCount, 0)}</h3>
            </div>
            <ListChecks className="h-8 w-8 text-yellow-500 opacity-70" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="w-full md:w-auto flex-1">
          <ReportFilters
            filters={filters}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
            onReset={() => setFilters({ area: 'all', status: 'all' })}
            filterConfig={[
              { key: 'area', label: 'Stratejik Alan Seç', type: 'select', options: uniqueAreas },
              { key: 'status', label: 'Durum', type: 'select', options: [{ value: 'Aktif', label: 'Aktif' }, { value: 'Pasif', label: 'Pasif' }] }
            ]}
          />
        </div>
        <ExportButtons data={filteredData} columns={columns} fileName="R1_Stratejik_Plan_Durum" />
      </div>

      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default R1_StrategicPlanStatus;
