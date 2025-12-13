
import React, { useMemo, useState } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const RiskRelationshipReport = () => {
  const risks = JSON.parse(localStorage.getItem('risks') || '[]');
  
  const [filters, setFilters] = useState({});

  const reportData = useMemo(() => {
    return risks.map(risk => ({
      definition: risk.riskName || risk.definition || 'Tanımsız Risk',
      level: risk.riskLevel || 'Düşük',
      affectedTargetsCount: risk.relatedTargets?.length || 0,
      affectedActivitiesCount: risk.relatedActivities?.length || 0,
      mitigationStatus: risk.actionPlanStatus || 'Planlanmadı',
      lastReview: risk.updatedAt || risk.createdAt,
      status: risk.status || 'Aktif'
    }));
  }, [risks]);

  const filteredData = reportData.filter(item => {
    if (filters.level && filters.level !== 'all' && item.level !== filters.level) return false;
    return true;
  });
  
  const uniqueLevels = [...new Set(reportData.map(r => r.level).filter(Boolean))];

  const columns = [
    { title: 'Risk Tanımı', key: 'definition' },
    { 
       title: 'Risk Seviyesi', 
       key: 'level', 
       sortable: true,
       render: r => (
          <Badge className={
             r.level === 'Yüksek' || r.level === 'Kritik' ? 'bg-red-100 text-red-700 hover:bg-red-200' : 
             r.level === 'Orta' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' : 
             'bg-green-100 text-green-700 hover:bg-green-200'
          }>
             {r.level}
          </Badge>
       )
    },
    { title: 'Etkilenen Hedef', key: 'affectedTargetsCount', sortable: true },
    { title: 'Etkilenen Faaliyet', key: 'affectedActivitiesCount', sortable: true },
    { title: 'Önlem Durumu', key: 'mitigationStatus' },
    { title: 'Son Kontrol', key: 'lastReview', render: r => formatDate(r.lastReview) }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex-1 max-w-2xl">
           <ReportFilters 
             filters={filters}
             onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
             onReset={() => setFilters({})}
             filterConfig={[
               { 
                 key: 'level', 
                 label: 'Risk Seviyesi', 
                 type: 'select', 
                 options: uniqueLevels.map(l => ({ value: l, label: l })) 
               }
             ]}
           />
        </div>
        <div className="mb-6 ml-4">
           <ExportButtons data={filteredData} columns={columns} fileName="Risk_Analiz_Raporu" />
        </div>
      </div>
      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default RiskRelationshipReport;
