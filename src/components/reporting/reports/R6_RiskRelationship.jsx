
import React, { useState, useEffect, useMemo } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { Badge } from '@/components/ui/badge';

const R6_RiskRelationship = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ level: 'all', status: 'all' });

  useEffect(() => {
    const risks = JSON.parse(localStorage.getItem('risks') || '[]');
    
    const processed = risks.map(risk => ({
      name: risk.riskName || risk.definition,
      level: risk.riskLevel || 'Düşük',
      targetCount: (risk.relatedTargets || []).length,
      activityCount: (risk.relatedActivities || []).length,
      actions: risk.actions ? risk.actions.length : 0, // Assuming actions is an array or we just count text length if string
      status: risk.status || 'Aktif',
      lastReview: risk.updatedAt || risk.createdAt
    }));

    setData(processed);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.level !== 'all' && item.level !== filters.level) return false;
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);

  const columns = [
    { header: 'Risk Tanımı', dataKey: 'name' },
    { 
      header: 'Risk Seviyesi', 
      dataKey: 'level',
      render: r => (
        <Badge className={
          r.level === 'Kritik' ? 'bg-red-600' :
          r.level === 'Yüksek' ? 'bg-orange-600' :
          r.level === 'Orta' ? 'bg-yellow-600' : 'bg-blue-600'
        }>
          {r.level}
        </Badge>
      )
    },
    { header: 'Etkilenen Hedef', dataKey: 'targetCount' },
    { header: 'Etkilenen Faaliyet', dataKey: 'activityCount' },
    { header: 'Aksiyon Sayısı', dataKey: 'actions' },
    { header: 'Durum', dataKey: 'status' },
    { header: 'Son İnceleme', dataKey: 'lastReview', render: r => new Date(r.lastReview).toLocaleDateString('tr-TR') }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="w-full md:w-auto flex-1">
          <ReportFilters
            filters={filters}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
            onReset={() => setFilters({ level: 'all', status: 'all' })}
            filterConfig={[
              { 
                key: 'level', 
                label: 'Risk Seviyesi', 
                type: 'select', 
                options: ['Düşük', 'Orta', 'Yüksek', 'Kritik'].map(l => ({ value: l, label: l })) 
              },
              { 
                key: 'status', 
                label: 'Durum', 
                type: 'select', 
                options: ['Aktif', 'Pasif', 'Kapandı'].map(s => ({ value: s, label: s })) 
              }
            ]}
          />
        </div>
        <ExportButtons data={filteredData} columns={columns} fileName="R6_Risk_Iliskileri" />
      </div>

      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default R6_RiskRelationship;
