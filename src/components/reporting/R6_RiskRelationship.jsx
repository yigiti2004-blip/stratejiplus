
import React, { useState, useEffect, useMemo } from 'react';
import { FileDown, FileSpreadsheet } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getRiskLevel } from '@/lib/calculations';
import { exportToPDF, exportToExcel } from './exportUtils';

const R6_RiskRelationship = () => {
  const [risks, setRisks] = useState([]);
  const [filterLevel, setFilterLevel] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const riskData = JSON.parse(localStorage.getItem('risks') || '[]');
    // Mocking relationships as they might not be fully defined in simple schema
    const processed = riskData.map(r => {
      const level = getRiskLevel(r.score);
      return {
        ...r,
        levelLabel: level.label,
        affectedTargetsCount: Math.floor(Math.random() * 3), // Mock
        affectedActivitiesCount: Math.floor(Math.random() * 5), // Mock
        lastReview: r.updatedAt || new Date().toISOString()
      };
    });
    setRisks(processed);
  }, []);

  const filteredData = useMemo(() => {
    return risks.filter(r => {
      if (filterLevel !== 'all' && r.levelLabel !== filterLevel) return false;
      if (filterStatus !== 'all' && r.status !== filterStatus) return false;
      return true;
    });
  }, [risks, filterLevel, filterStatus]);

  const columns = [
    { header: 'Risk Tanımı', dataKey: 'name' },
    { header: 'Seviye', dataKey: 'levelLabel' },
    { header: 'Etkilenen Hedef', dataKey: 'affectedTargetsCount' },
    { header: 'Etkilenen Faaliyet', dataKey: 'affectedActivitiesCount' },
    { header: 'Durum', dataKey: 'status' },
    { header: 'Son İnceleme', dataKey: 'lastReviewFormatted' }
  ];

  const handleExport = (type) => {
    const exportData = filteredData.map(item => ({
      ...item,
      lastReviewFormatted: new Date(item.lastReview).toLocaleDateString('tr-TR')
    }));
    
    if (type === 'pdf') exportToPDF('Risk_Iliskileri', exportData, columns);
    else exportToExcel('Risk_Iliskileri', exportData, columns);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-4 bg-gray-50 p-4 rounded-lg border border-gray-200">
        <select 
          className="p-2 border rounded-md text-sm min-w-[200px] bg-white text-gray-900"
          value={filterLevel}
          onChange={(e) => setFilterLevel(e.target.value)}
        >
          <option value="all">Tüm Seviyeler</option>
          <option value="Kritik">Kritik</option>
          <option value="Yüksek">Yüksek</option>
          <option value="Orta">Orta</option>
          <option value="Düşük">Düşük</option>
        </select>

        <select 
          className="p-2 border rounded-md text-sm bg-white text-gray-900"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="all">Tüm Durumlar</option>
          <option value="Aktif">Aktif</option>
          <option value="Pasif">Pasif</option>
          <option value="Kapandı">Kapandı</option>
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
              <th className="px-6 py-3">Risk Tanımı</th>
              <th className="px-6 py-3">Seviye</th>
              <th className="px-6 py-3 text-center">Etkilenen Hedef</th>
              <th className="px-6 py-3 text-center">Etkilenen Faaliyet</th>
              <th className="px-6 py-3">Durum</th>
              <th className="px-6 py-3 text-right">Son İnceleme</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredData.map((row, idx) => (
              <tr key={row.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                <td className="px-6 py-4 font-medium">{row.name}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded text-xs font-bold ${
                    row.levelLabel === 'Kritik' ? 'bg-red-100 text-red-800' :
                    row.levelLabel === 'Yüksek' ? 'bg-orange-100 text-orange-800' :
                    row.levelLabel === 'Orta' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {row.levelLabel}
                  </span>
                </td>
                <td className="px-6 py-4 text-center">{row.affectedTargetsCount}</td>
                <td className="px-6 py-4 text-center">{row.affectedActivitiesCount}</td>
                <td className="px-6 py-4">{row.status}</td>
                <td className="px-6 py-4 text-right text-gray-500">{new Date(row.lastReview).toLocaleDateString('tr-TR')}</td>
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

export default R6_RiskRelationship;
