
import React, { useMemo, useState } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const ActivityCompletionReport = () => {
  const activities = JSON.parse(localStorage.getItem('activities') || '[]');
  // Mock monitoring data structure logic since it might be distributed in keys like `activity_monitoring_${id}` or centralized
  // Based on code provided earlier, it uses useActivityMonitoring hook which reads from `activity_monitoring_${id}`
  // For reporting across ALL activities, we need to scan local storage or assume a structure. 
  // IMPORTANT: The prompt says "READ-ONLY Data Source: Plan İzleme -> Activities, İzleme & Kanıtlar".
  // Since we can't easily iterate all localstorage keys safely in a mock env without knowing exact IDs beforehand (well we do have activity IDs), 
  // we will try to fetch monitoring data for each activity.

  const [filters, setFilters] = useState({});

  const reportData = useMemo(() => {
    return activities.map(act => {
      // Simulate fetching monitoring data
      const monitoringKey = `activity_monitoring_${act.id}`;
      const records = JSON.parse(localStorage.getItem(monitoringKey) || '[]');
      
      const latestRecord = records.length > 0 
        ? records.sort((a,b) => new Date(b.recordDate) - new Date(a.recordDate))[0] 
        : null;

      const evidenceCount = records.reduce((acc, rec) => acc + (rec.evidenceFiles?.length || 0), 0);
      
      return {
        code: act.code,
        name: act.name,
        responsibleUnit: act.responsibleUnit || '-',
        completion: latestRecord?.completionPercentage || 0,
        recordCount: records.length,
        evidenceCount: evidenceCount,
        lastUpdate: latestRecord ? formatDate(latestRecord.recordDate) : '-',
        status: latestRecord?.status || 'Başlamadı'
      };
    });
  }, [activities]);

  const filteredData = reportData.filter(item => {
     if (filters.responsibleUnit && filters.responsibleUnit !== 'all' && item.responsibleUnit !== filters.responsibleUnit) return false;
     if (filters.status && filters.status !== 'all' && item.status !== filters.status) return false;
     return true;
  });

  const uniqueUnits = [...new Set(activities.map(a => a.responsibleUnit).filter(Boolean))];
  const uniqueStatuses = [...new Set(reportData.map(a => a.status).filter(Boolean))];

  const columns = [
    { title: 'Kod', key: 'code', sortable: true },
    { title: 'Faaliyet Adı', key: 'name' },
    { title: 'Sorumlu Birim', key: 'responsibleUnit', sortable: true },
    { title: 'Tamamlanma %', key: 'completion', sortable: true, render: r => `%${r.completion}` },
    { title: 'İzleme Kaydı', key: 'recordCount', sortable: true },
    { title: 'Kanıt Sayısı', key: 'evidenceCount', sortable: true },
    { title: 'Son Güncelleme', key: 'lastUpdate', sortable: true },
    { 
      title: 'Durum', 
      key: 'status', 
      render: (row) => (
        <Badge variant="outline" className="bg-gray-50">{row.status}</Badge>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <div className="flex-1 max-w-4xl">
           <ReportFilters 
             filters={filters}
             onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
             onReset={() => setFilters({})}
             filterConfig={[
               { 
                 key: 'responsibleUnit', 
                 label: 'Sorumlu Birim', 
                 type: 'select', 
                 options: uniqueUnits.map(u => ({ value: u, label: u })) 
               },
               { 
                 key: 'status', 
                 label: 'Durum', 
                 type: 'select', 
                 options: uniqueStatuses.map(s => ({ value: s, label: s })) 
               }
             ]}
           />
        </div>
        <div className="mb-6 ml-4">
           <ExportButtons data={filteredData} columns={columns} fileName="Faaliyet_Tamamlanma_Raporu" />
        </div>
      </div>
      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default ActivityCompletionReport;
