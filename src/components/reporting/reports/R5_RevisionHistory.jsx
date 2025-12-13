
import React, { useState, useEffect, useMemo } from 'react';
import ReportFilters from '../shared/ReportFilters';
import ReportTable from '../shared/ReportTable';
import ExportButtons from '../shared/ExportButtons';
import { Badge } from '@/components/ui/badge';

const R5_RevisionHistory = () => {
  const [data, setData] = useState([]);
  const [filters, setFilters] = useState({ type: 'all', status: 'all' });

  useEffect(() => {
    // Reading "revisionLogs" or similar key
    const revisions = JSON.parse(localStorage.getItem('revisionLogs') || '[]');
    
    const processed = revisions.map(rev => ({
      date: rev.date || rev.createdAt,
      type: rev.revisionType || 'Genel',
      element: rev.relatedElementId || 'Bilinmiyor',
      reason: rev.description || rev.reason || '-',
      status: rev.status || 'Onaylandı',
      approvedBy: rev.approvedBy || 'Sistem',
      approvedDate: rev.approvedAt || rev.date
    }));

    setData(processed);
  }, []);

  const filteredData = useMemo(() => {
    return data.filter(item => {
      if (filters.type !== 'all' && item.type !== filters.type) return false;
      if (filters.status !== 'all' && item.status !== filters.status) return false;
      return true;
    });
  }, [data, filters]);

  const uniqueTypes = [...new Set(data.map(d => d.type))].map(t => ({ value: t, label: t }));

  const columns = [
    { header: 'Revizyon Tarihi', dataKey: 'date', render: r => new Date(r.date).toLocaleDateString('tr-TR') },
    { header: 'Revizyon Tipi', dataKey: 'type' },
    { header: 'İlgili Plan Öğesi', dataKey: 'element' },
    { header: 'Gerekçe', dataKey: 'reason' },
    { 
      header: 'Onay Durumu', 
      dataKey: 'status',
      render: r => (
        <Badge variant="outline" className={r.status === 'Reddedildi' ? 'border-red-500 text-red-500' : 'border-green-500 text-green-500'}>
          {r.status}
        </Badge>
      )
    },
    { header: 'Onaylayan', dataKey: 'approvedBy' },
    { header: 'Onay Tarihi', dataKey: 'approvedDate', render: r => r.approvedDate ? new Date(r.approvedDate).toLocaleDateString('tr-TR') : '-' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div className="w-full md:w-auto flex-1">
          <ReportFilters
            filters={filters}
            onFilterChange={(key, val) => setFilters(prev => ({ ...prev, [key]: val }))}
            onReset={() => setFilters({ type: 'all', status: 'all' })}
            filterConfig={[
              { key: 'type', label: 'Revizyon Tipi Seç', type: 'select', options: uniqueTypes },
              { 
                key: 'status', 
                label: 'Onay Durumu', 
                type: 'select', 
                options: [
                  { value: 'Onaylandı', label: 'Onaylandı' },
                  { value: 'Beklemede', label: 'Beklemede' },
                  { value: 'Reddedildi', label: 'Reddedildi' }
                ] 
              }
            ]}
          />
        </div>
        <ExportButtons data={filteredData} columns={columns} fileName="R5_Revizyon_Gecmisi" />
      </div>

      <ReportTable columns={columns} data={filteredData} />
    </div>
  );
};

export default R5_RevisionHistory;
