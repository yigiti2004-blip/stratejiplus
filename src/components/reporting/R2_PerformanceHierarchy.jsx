
import React, { useState, useEffect, useMemo } from 'react';
import { FileDown, FileSpreadsheet, ChevronRight, ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { calculateAreaStats } from '@/lib/calculations';
import { exportToPDF, exportToExcel } from './exportUtils';

const R2_PerformanceHierarchy = () => {
  const [hierarchy, setHierarchy] = useState([]);
  const [filterArea, setFilterArea] = useState('all');
  const [filterRange, setFilterRange] = useState('all');

  useEffect(() => {
    const areas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
    const objectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
    const targets = JSON.parse(localStorage.getItem('targets') || '[]');
    const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');

    const processed = areas.map(area => calculateAreaStats(area, objectives, targets, indicators));
    setHierarchy(processed);
  }, []);

  const filteredHierarchy = useMemo(() => {
    return hierarchy.filter(area => {
      if (filterArea !== 'all' && area.id !== filterArea) return false;
      
      // Range filter applies to the Area completion for simplicity in this view
      if (filterRange === '0-25' && (area.completion < 0 || area.completion > 25)) return false;
      if (filterRange === '25-50' && (area.completion <= 25 || area.completion > 50)) return false;
      if (filterRange === '50-75' && (area.completion <= 50 || area.completion > 75)) return false;
      if (filterRange === '75-100' && (area.completion <= 75)) return false;
      
      return true;
    });
  }, [hierarchy, filterArea, filterRange]);

  const handleExport = (type) => {
    // Flatten for export
    const flatData = [];
    filteredHierarchy.forEach(area => {
      flatData.push({ type: 'ALAN', name: area.name, completion: `%${area.completion.toFixed(1)}` });
      area.objectives.forEach(obj => {
        flatData.push({ type: '  AMAÇ', name: obj.name, completion: `%${obj.completion.toFixed(1)}` });
        obj.targets.forEach(tgt => {
          flatData.push({ type: '    HEDEF', name: tgt.name, completion: `%${tgt.completion.toFixed(1)}` });
        });
      });
    });

    const cols = [
      { header: 'Tip', dataKey: 'type' },
      { header: 'Tanım', dataKey: 'name' },
      { header: 'Tamamlanma', dataKey: 'completion' }
    ];

    if (type === 'pdf') exportToPDF('Performans_Hiyerarsisi', flatData, cols);
    else exportToExcel('Performans_Hiyerarsisi', flatData, cols);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <select 
          className="p-2 border rounded-md text-sm min-w-[200px] bg-white text-gray-900"
          value={filterArea}
          onChange={(e) => setFilterArea(e.target.value)}
        >
          <option value="all">Tüm Alanlar</option>
          {hierarchy.map(h => <option key={h.id} value={h.id}>{h.name}</option>)}
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

      <div className="border rounded-lg bg-white overflow-hidden">
        <div className="grid grid-cols-12 bg-gray-100 p-3 font-semibold text-sm text-gray-700 border-b">
          <div className="col-span-10">Hiyerarşi</div>
          <div className="col-span-2 text-center">Tamamlanma</div>
        </div>
        <div className="divide-y divide-gray-100">
          {filteredHierarchy.map(area => (
            <div key={area.id}>
              {/* Area Row */}
              <div className="grid grid-cols-12 p-3 bg-blue-50/50 hover:bg-blue-50 items-center">
                <div className="col-span-10 flex items-center gap-2 font-bold text-blue-900">
                  <ChevronDown className="w-4 h-4" />
                  {area.code} - {area.name}
                </div>
                <div className="col-span-2 text-center font-bold text-blue-700">%{area.completion.toFixed(1)}</div>
              </div>
              
              {/* Objectives */}
              {area.objectives.map(obj => (
                <div key={obj.id}>
                  <div className="grid grid-cols-12 p-3 pl-8 hover:bg-gray-50 items-center border-t border-gray-100">
                    <div className="col-span-10 flex items-center gap-2 font-semibold text-gray-800">
                      <div className="w-1.5 h-1.5 rounded-full bg-gray-400"></div>
                      {obj.code} - {obj.name}
                    </div>
                    <div className="col-span-2 text-center text-gray-600">%{obj.completion.toFixed(1)}</div>
                  </div>

                  {/* Targets */}
                  {obj.targets.map(tgt => (
                    <div key={tgt.id} className="grid grid-cols-12 p-2 pl-16 hover:bg-gray-50 items-center text-sm border-t border-gray-50">
                      <div className="col-span-10 text-gray-600 flex items-center gap-2">
                        <span className="text-gray-400">-</span>
                        {tgt.code} - {tgt.name}
                      </div>
                      <div className="col-span-2 text-center text-gray-500">%{tgt.completion.toFixed(1)}</div>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ))}
          {filteredHierarchy.length === 0 && (
            <div className="p-8 text-center text-gray-500">Veri bulunamadı.</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default R2_PerformanceHierarchy;
