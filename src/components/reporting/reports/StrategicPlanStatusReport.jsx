
import React, { useMemo, useState } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { Card, CardContent } from '@/components/ui/card';
import { Target, Layers, ListChecks } from 'lucide-react';

const StrategicPlanStatusReport = () => {
  // Read Data
  const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
  const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
  const targets = JSON.parse(localStorage.getItem('targets') || '[]');
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');

  // Helper to calculate completion (simplified logic reused)
  const calculateCompletion = (targetId) => {
    const targetIndicators = indicators.filter(i => i.targetId === targetId);
    if (!targetIndicators.length) return 0;
    const sum = targetIndicators.reduce((acc, ind) => {
       const actual = parseFloat(ind.actualValue) || 0;
       const target = parseFloat(ind.targetValue) || 1;
       const rate = Math.min((actual / target) * 100, 100);
       return acc + rate;
    }, 0);
    return Math.round(sum / targetIndicators.length);
  };

  const [filters, setFilters] = useState({});

  // Process Data
  const reportData = useMemo(() => {
    return areas.map(area => {
      const areaObjectives = objectives.filter(o => o.strategicAreaId === area.id);
      const areaTargets = targets.filter(t => areaObjectives.some(o => o.id === t.objectiveId));
      const areaActivities = activities.filter(a => areaTargets.some(t => t.id === a.targetId));

      const totalCompletion = areaTargets.reduce((acc, t) => acc + calculateCompletion(t.id), 0);
      const avgCompletion = areaTargets.length ? Math.round(totalCompletion / areaTargets.length) : 0;

      return {
        id: area.id,
        code: area.code,
        name: area.name,
        objectiveCount: areaObjectives.length,
        targetCount: areaTargets.length,
        activityCount: areaActivities.length,
        avgCompletion: avgCompletion,
        status: 'Aktif' // Assuming active by default in this view
      };
    });
  }, [areas, objectives, targets, activities, indicators]);

  // Apply Filters
  const filteredData = reportData.filter(item => {
    if (filters.areaId && filters.areaId !== 'all' && item.id !== filters.areaId) return false;
    return true;
  });

  const columns = [
    { title: 'Kod', key: 'code', sortable: true },
    { title: 'Stratejik Alan Adı', key: 'name', sortable: true },
    { title: 'Amaç Sayısı', key: 'objectiveCount', sortable: true },
    { title: 'Hedef Sayısı', key: 'targetCount', sortable: true },
    { title: 'Faaliyet Sayısı', key: 'activityCount', sortable: true },
    { 
      title: 'Ort. Başarı %', 
      key: 'avgCompletion', 
      sortable: true,
      render: (row) => (
        <span className={`font-bold ${row.avgCompletion >= 70 ? 'text-green-600' : row.avgCompletion >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
          %{row.avgCompletion}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
         <Card>
            <CardContent className="p-4 flex flex-col items-center text-center">
               <Layers className="w-6 h-6 text-blue-500 mb-2"/>
               <div className="text-2xl font-bold">{areas.length}</div>
               <div className="text-xs text-gray-500">Stratejik Alan</div>
            </CardContent>
         </Card>
         <Card>
            <CardContent className="p-4 flex flex-col items-center text-center">
               <Target className="w-6 h-6 text-indigo-500 mb-2"/>
               <div className="text-2xl font-bold">{objectives.length}</div>
               <div className="text-xs text-gray-500">Stratejik Amaç</div>
            </CardContent>
         </Card>
         <Card>
            <CardContent className="p-4 flex flex-col items-center text-center">
               <Target className="w-6 h-6 text-purple-500 mb-2"/>
               <div className="text-2xl font-bold">{targets.length}</div>
               <div className="text-xs text-gray-500">Hedef</div>
            </CardContent>
         </Card>
         <Card>
            <CardContent className="p-4 flex flex-col items-center text-center">
               <ListChecks className="w-6 h-6 text-green-500 mb-2"/>
               <div className="text-2xl font-bold">{activities.length}</div>
               <div className="text-xs text-gray-500">Faaliyet</div>
            </CardContent>
         </Card>
      </div>

      <div className="flex justify-between items-end">
        <div className="flex-1 max-w-2xl">
           <ReportFilters 
             filters={filters}
             onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
             onReset={() => setFilters({})}
             filterConfig={[
               { 
                 key: 'areaId', 
                 label: 'Stratejik Alan', 
                 type: 'select', 
                 options: areas.map(a => ({ value: a.id, label: a.code })) 
               }
             ]}
           />
        </div>
        <div className="mb-6 ml-4">
           <ExportButtons data={filteredData} columns={columns} fileName="Stratejik_Plan_Durum_Raporu" />
        </div>
      </div>

      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default StrategicPlanStatusReport;
