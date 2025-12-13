
import React, { useMemo, useState } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const RevisionHistoryReport = () => {
  const revisions = JSON.parse(localStorage.getItem('revisionLogs') || '[]');
  
  const [filters, setFilters] = useState({});

  const reportData = useMemo(() => {
    return revisions.map(rev => ({
      date: rev.date || rev.createdAt,
      type: rev.revisionType || 'Genel',
      relatedElement: rev.relatedElementId || '-',
      reason: rev.description || '-',
      status: rev.status || 'Onaylandı', // Assuming approved if in logs typically
      approvedBy: rev.approvedBy || 'Sistem'
    }));
  }, [revisions]);

  const filteredData = reportData.filter(item => {
    if (filters.type && filters.type !== 'all' && item.type !== filters.type) return false;
    return true;
  });
  
  const uniqueTypes = [...new Set(reportData.map(r => r.type).filter(Boolean))];

  const columns = [
    { title: 'Tarih', key: 'date', sortable: true, render: r => formatDate(r.date) },
    { title: 'Revizyon Tipi', key: 'type', sortable: true },
    { title: 'İlgili Kayıt', key: 'relatedElement' },
    { title: 'Gerekçe', key: 'reason' },
    { title: 'Onaylayan', key: 'approvedBy' },
    { 
      title: 'Durum', 
      key: 'status',
      render: r => <Badge variant="outline">{r.status}</Badge>
    }
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
                 key: 'type', 
                 label: 'Revizyon Tipi', 
                 type: 'select', 
                 options: uniqueTypes.map(t => ({ value: t, label: t })) 
               }
             ]}
           />
        </div>
        <div className="mb-6 ml-4">
           <ExportButtons data={filteredData} columns={columns} fileName="Revizyon_Gecmisi_Raporu" />
        </div>
      </div>
      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default RevisionHistoryReport;
