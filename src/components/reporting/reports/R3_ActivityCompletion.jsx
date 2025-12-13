
import React, { useState, useEffect, useMemo } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { Badge } from '@/components/ui/badge';

const R3_ActivityCompletion = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ unit: 'all', range: 'all' });

  useEffect(() => {
    const activities = JSON.parse(localStorage.getItem('activities') || '[]');
    
    // In a real scenario, we'd efficiently query all monitoring records.
    // Here we simulate checking each activity for its monitoring data
    const processed = activities.map(act => {
      // Attempt to find monitoring data.
      // Assuming pattern "activity_monitoring_[ID]" based on previous app logic context
      const monData = JSON.parse(localStorage.getItem(`activity_monitoring_${act.id}`) || '[]');
      
      const lastRecord = monData.length > 0 ? monData[monData.length - 1] : null;
      const completion = lastRecord ? lastRecord.completionPercentage : 0;
      const evidenceCount = monData.reduce((acc, r) => acc + (r.evidenceFiles?.length || 0), 0);
      
      return {
        code: act.code || act.id,
        name: act.name,
        unit: act.responsibleUnit || 'Belirtilmemiş',
        completion: parseFloat(completion || 0),
        recordCount: monData.length,
        evidenceCount: evidenceCount,
        lastUpdate: act.updatedAt ? new Date(act.updatedAt).toLocaleDateString('tr-TR') : '-'
      };
    });

    setData(processed);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.unit !== 'all' && item.unit !== filters.unit) return false;
      
      if (filters.range === '0-25' && (item.completion < 0 || item.completion > 25)) return false;
      if (filters.range === '25-50' && (item.completion <= 25 || item.completion > 50)) return false;
      if (filters.range === '50-75' && (item.completion <= 50 || item.completion > 75)) return false;
      if (filters.range === '75-100' && (item.completion <= 75)) return false;

      return true;
    });
  }, [data, filters]);

  const uniqueUnits = [...new Set(data.map(d => d.unit))].map(u => ({ value: u, label: u }));

  const columns = [
    { header: 'Faaliyet Kodu', dataKey: 'code' },
    { header: 'Faaliyet Adı', dataKey: 'name' },
    { header: 'Sorumlu Birim', dataKey: 'unit' },
    { 
      header: 'Son Gerçekleşme %', 
      dataKey: 'completion',
      render: (row) => (
        <Badge className={row.completion >= 50 ? 'bg-green-600' : 'bg-red-600'}>
          %{row.completion}
        </Badge>
      )
    },
    { header: 'İzleme Kaydı', dataKey: 'recordCount' },
    { header: 'Kanıt Dosyası', dataKey: 'evidenceCount' },
    { header: 'Son Güncelleme', dataKey: 'lastUpdate' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="w-full md:w-auto flex-1">
          <ReportFilters
            filters={filters}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
            onReset={() => setFilters({ unit: 'all', range: 'all' })}
            filterConfig={[
              { key: 'unit', label: 'Sorumlu Birim Seç', type: 'select', options: uniqueUnits },
              { 
                key: 'range', 
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
        <ExportButtons data={filteredData} columns={columns} fileName="R3_Faaliyet_Gerceklesme" />
      </div>

      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default R3_ActivityCompletion;
