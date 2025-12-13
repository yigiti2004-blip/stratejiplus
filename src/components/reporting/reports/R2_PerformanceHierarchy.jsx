
import React, { useState, useEffect, useMemo } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { Badge } from '@/components/ui/badge';

const R2_PerformanceHierarchy = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ area: 'all', completionRange: 'all' });

  useEffect(() => {
    const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
    const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
    const targets = JSON.parse(localStorage.getItem('targets') || '[]');

    // Flatten hierarchy for table display with indentation simulation
    let flatList = [];

    areas.forEach(area => {
      // Area Row
      flatList.push({
        id: area.id,
        type: 'area',
        name: area.name,
        completion: calculateAvgCompletion(area, objectives, targets),
        indent: 0,
        areaId: area.id // For filtering
      });

      const areaObjs = objectives.filter(o => o.strategicAreaId === area.id);
      areaObjs.forEach(obj => {
        // Objective Row
        flatList.push({
          id: obj.id,
          type: 'objective',
          name: obj.name,
          completion: calculateAvgCompletion(null, [obj], targets),
          indent: 1,
          areaId: area.id
        });

        const objTargets = targets.filter(t => t.objectiveId === obj.id);
        objTargets.forEach(tgt => {
          // Target Row
          flatList.push({
            id: tgt.id,
            type: 'target',
            name: tgt.name,
            completion: parseFloat(tgt.completionPercentage || 0),
            indent: 2,
            areaId: area.id
          });
        });
      });
    });

    setData(flatList);
  }, []);

  const calculateAvgCompletion = (area, objectives, targets) => {
    // Helper to calc avg for parent nodes
    let relevantTargets = [];
    if (area) {
       const areaObjIds = objectives.filter(o => o.strategicAreaId === area.id).map(o => o.id);
       relevantTargets = targets.filter(t => areaObjIds.includes(t.objectiveId));
    } else {
       // Single objective passed
       const objIds = objectives.map(o => o.id);
       relevantTargets = targets.filter(t => objIds.includes(t.objectiveId));
    }
    
    if (relevantTargets.length === 0) return 0;
    const total = relevantTargets.reduce((acc, t) => acc + parseFloat(t.completionPercentage || 0), 0);
    return (total / relevantTargets.length).toFixed(1);
  };

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.area !== 'all' && item.areaId !== filters.area) return false;
      
      const comp = parseFloat(item.completion);
      if (filters.completionRange === '0-25' && (comp < 0 || comp > 25)) return false;
      if (filters.completionRange === '25-50' && (comp <= 25 || comp > 50)) return false;
      if (filters.completionRange === '50-75' && (comp <= 50 || comp > 75)) return false;
      if (filters.completionRange === '75-100' && (comp <= 75)) return false;

      return true;
    });
  }, [data, filters]);

  const columns = [
    { 
      header: 'Hiyerarşi', 
      dataKey: 'name',
      render: (row) => (
        <div style={{ paddingLeft: `${row.indent * 20}px` }} className="flex items-center">
          {row.type === 'area' && <span className="font-bold text-blue-400 mr-2">ALAN:</span>}
          {row.type === 'objective' && <span className="font-semibold text-purple-400 mr-2">AMAÇ:</span>}
          {row.type === 'target' && <span className="text-gray-400 mr-2 text-xs">HEDEF:</span>}
          <span className={row.type === 'area' ? 'font-bold' : ''}>{row.name}</span>
        </div>
      )
    },
    { 
      header: 'Tamamlanma %', 
      dataKey: 'completion',
      render: (row) => (
        <Badge variant="outline" className={`
          ${row.completion >= 75 ? 'border-green-500 text-green-500' : 
            row.completion >= 50 ? 'border-yellow-500 text-yellow-500' : 'border-red-500 text-red-500'}
        `}>
          %{row.completion}
        </Badge>
      )
    }
  ];

  const uniqueAreas = [...new Set(data.filter(i => i.type === 'area').map(i => ({ value: i.id, label: i.name })))];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="w-full md:w-auto flex-1">
          <ReportFilters
            filters={filters}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
            onReset={() => setFilters({ area: 'all', completionRange: 'all' })}
            filterConfig={[
              { key: 'area', label: 'Stratejik Alan Seç', type: 'select', options: uniqueAreas },
              { 
                key: 'completionRange', 
                label: 'Tamamlanma %', 
                type: 'select', 
                options: [
                  { value: '0-25', label: '%0 - %25' },
                  { value: '25-50', label: '%25 - %50' },
                  { value: '50-75', label: '%50 - %75' },
                  { value: '75-100', label: '%75 - %100' }
                ] 
              }
            ]}
          />
        </div>
        <ExportButtons data={filteredData} columns={columns} fileName="R2_Performans_Hiyerarsisi" />
      </div>

      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default R2_PerformanceHierarchy;
