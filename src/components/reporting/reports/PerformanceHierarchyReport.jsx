
import React, { useMemo, useState } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { Badge } from '@/components/ui/badge';

const PerformanceHierarchyReport = () => {
  const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
  const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
  const targets = JSON.parse(localStorage.getItem('targets') || '[]');
  const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');

  const calculateCompletion = (targetId) => {
    const targetIndicators = indicators.filter(i => i.targetId === targetId);
    if (!targetIndicators.length) return 0;
    const sum = targetIndicators.reduce((acc, ind) => {
       const actual = parseFloat(ind.actualValue) || 0;
       const target = parseFloat(ind.targetValue) || 1;
       return acc + Math.min((actual / target) * 100, 100);
    }, 0);
    return Math.round(sum / targetIndicators.length);
  };

  const [filters, setFilters] = useState({});

  const flatData = useMemo(() => {
    const rows = [];
    areas.forEach(area => {
       const areaObjs = objectives.filter(o => o.strategicAreaId === area.id);
       
       areaObjs.forEach(obj => {
          const objTargets = targets.filter(t => t.objectiveId === obj.id);
          
          if (objTargets.length === 0) {
             rows.push({
               areaCode: area.code,
               areaName: area.name,
               objCode: obj.code,
               objName: obj.name,
               targetCode: '-',
               targetName: '-',
               completion: 0,
               status: 'Pasif'
             });
          } else {
             objTargets.forEach(tgt => {
               rows.push({
                 areaCode: area.code,
                 areaName: area.name,
                 objCode: obj.code,
                 objName: obj.name,
                 targetCode: tgt.code,
                 targetName: tgt.name,
                 completion: calculateCompletion(tgt.id),
                 status: 'Aktif'
               });
             });
          }
       });

       if (areaObjs.length === 0) {
         rows.push({
            areaCode: area.code,
            areaName: area.name,
            objCode: '-', objName: '-', targetCode: '-', targetName: '-', completion: 0, status: 'Boş'
         });
       }
    });
    return rows;
  }, [areas, objectives, targets, indicators]);

  const filteredData = flatData.filter(item => {
    if (filters.areaCode && filters.areaCode !== 'all' && item.areaCode !== filters.areaCode) return false;
    if (filters.objCode && filters.objCode !== 'all' && item.objCode !== filters.objCode) return false;
    return true;
  });

  const columns = [
    { title: 'Alan Kodu', key: 'areaCode', sortable: true },
    { title: 'Amaç Kodu', key: 'objCode', sortable: true },
    { title: 'Amaç Adı', key: 'objName' },
    { title: 'Hedef Kodu', key: 'targetCode', sortable: true },
    { title: 'Hedef Adı', key: 'targetName' },
    { 
      title: 'Başarı %', 
      key: 'completion', 
      sortable: true,
      render: (row) => (
         row.targetCode !== '-' ? <Badge variant={row.completion >= 50 ? 'outline' : 'destructive'} className={row.completion >= 50 ? 'bg-green-50 text-green-700 border-green-200' : ''}>%{row.completion}</Badge> : '-'
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex-1 max-w-3xl">
           <ReportFilters 
             filters={filters}
             onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
             onReset={() => setFilters({})}
             filterConfig={[
               { 
                 key: 'areaCode', 
                 label: 'Stratejik Alan', 
                 type: 'select', 
                 options: areas.map(a => ({ value: a.code, label: a.code })) 
               },
               { 
                 key: 'objCode', 
                 label: 'Stratejik Amaç', 
                 type: 'select', 
                 options: objectives.map(o => ({ value: o.code, label: o.code })) 
               }
             ]}
           />
        </div>
        <div className="mb-6 ml-4">
           <ExportButtons data={filteredData} columns={columns} fileName="Performans_Hiyerarsi_Raporu" />
        </div>
      </div>

      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default PerformanceHierarchyReport;
