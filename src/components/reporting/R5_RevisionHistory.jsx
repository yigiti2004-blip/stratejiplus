
import React, { useState, useEffect, useMemo } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { exportToPDF, exportToExcel } from './exportUtils';

const R5_RevisionHistory = () => {
  const [revisions, setRevisions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const revs = JSON.parse(localStorage.getItem('revisions') || '[]');
    setRevisions(revs);
  }, []);

  const filteredData = useMemo(() => {
    return revisions.filter(rev => {
      if (filterType !== 'all' && rev.type !== filterType) return false;
      if (filterStatus !== 'all' && rev.status !== filterStatus) return false;
      return true;
    });
  }, [revisions, filterType, filterStatus]);

  const uniqueTypes = [...new Set(revisions.map(r => r.type).filter(Boolean))];

  const columns = [
    { header: 'Tarih', dataKey: 'dateFormatted' },
    { header: 'Tip', dataKey: 'type' },
    { header: 'İlgili Öğe', dataKey: 'relatedElement' },
    { header: 'Gerekçe', dataKey: 'reason' },
    { header: 'Durum', dataKey: 'status' },
    { header: 'Onaylayan', dataKey: 'approvedBy' }
  ];

  const handleExport = (type) => {
    const exportData = filteredData.map(item => ({
      ...item,
      dateFormatted: new Date(item.date).toLocaleDateString('tr-TR'),
      relatedElement: item.relatedElement || '-'
    }));
    
    if (type === 'pdf') exportToPDF('Revizyon_Gecmisi', exportData, columns);
    else exportToExcel('Revizyon_Gecmisi', exportData, columns);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <select 
          className="p-2 border rounded-md text-sm min-w-[200px] bg-white text-gray-900"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tüm Tipler</option>
          {uniqueTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>

        <select 
          className="p-2 border rounded-md text-sm bg-white text-gray-900"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="Onaylandı">Onaylandı</option>
          <option value="Beklemede">Beklemede</option>
          <option value="Reddedildi">Reddedildi</option>
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

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="bg-gray-100 text-gray-700 font-semibold">
            <tr>
              <th className="px-6 py-3">Tarih</th>
              <th className="px-6 py-3">Tip</th>
              <th className="px-6 py-3">İlgili Öğe</th>
              <th className="px-6 py-3">Gerekçe</th>
              <th className="px-6 py-3">Durum</th>
              <th className="px-6 py-3">Onaylayan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredData.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 text-gray-600">{new Date(row.date).toLocaleDateString('tr-TR')}</td>
                <td className="px-6 py-4 font-medium">{row.type}</td>
                <td className="px-6 py-4 text-gray-600">{row.relatedElement || '-'}</td>
                <td className="px-6 py-4 text-gray-600 max-w-xs truncate" title={row.reason}>{row.reason}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    row.status === 'Onaylandı' ? 'bg-green-100 text-green-800' :
                    row.status === 'Reddedildi' ? 'bg-red-100 text-red-800' :
                    'bg-yellow-100 text-yellow-800'
                  }`}>
                    {row.status}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-500">{row.approvedBy || '-'}</td>
              </tr>
            ))}
            {filteredData.length === 0 && (
              <tr><td colSpan="6" className="px-6 py-8 text-center text-gray-500">Veri bulunamadı.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default R5_RevisionHistory;
