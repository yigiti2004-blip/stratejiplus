import React, { useState, useMemo } from 'react';
import { ChevronLeft, ChevronRight, ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRiskLevel } from '@/lib/calculations';
import { RISK_TYPES } from '@/data/riskTypes';

const RiskSummaryList = ({ risks, onViewRisk, spData, projects }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState({ key: 'score', direction: 'desc' });
  const itemsPerPage = 10;

  // Helpers
  const getRiskTypeBadge = (typeId) => {
    const type = RISK_TYPES.find(t => t.id === typeId);
    if (!type) return <Badge variant="outline">Bilinmiyor</Badge>;
    
    // Custom colors mapping based on specs
    const colorMap = {
      sp: 'bg-purple-100 text-purple-700 hover:bg-purple-200 border-purple-200',
      surec: 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
      proje: 'bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200',
      kurumsal: 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-gray-200'
    };

    return <Badge className={`${colorMap[typeId]} border font-medium`}>{type.label}</Badge>;
  };

  const getStatusBadge = (status) => {
    const styles = {
      'Aktif': 'bg-green-100 text-green-700 hover:bg-green-200 border-green-200',
      'İzleniyor': 'bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200',
      'Kapatıldı': 'bg-gray-100 text-gray-600 hover:bg-gray-200 border-gray-200'
    };
    return <Badge className={`${styles[status] || styles['Aktif']} border rounded-full px-3`}>{status}</Badge>;
  };

  const getScoreBadge = (score) => {
    const level = getRiskLevel(score);
    // Custom colors mapping based on specs
    const colorMap = {
      'Low': 'bg-emerald-500 text-white',
      'Medium': 'bg-amber-400 text-white', // Darker yellow for text readability
      'High': 'bg-orange-500 text-white',
      'Critical': 'bg-red-500 text-white'
    };

    return (
      <div className={`px-3 py-1 rounded-md text-xs font-bold text-center w-24 mx-auto shadow-sm ${colorMap[level.value]}`}>
        {score} ({level.label})
      </div>
    );
  };

  const getRelatedRecordText = (risk) => {
    if (risk.riskType === 'sp') {
      const item = (spData[risk.relatedRecordType] || []).find(i => i.id === risk.relatedRecordId);
      return item ? `${risk.relatedRecordType}: ${item.name}` : '-';
    }
    if (risk.riskType === 'surec') return risk.processName || '-';
    if (risk.riskType === 'proje') {
      const proj = projects.find(p => p.id === risk.projectId);
      return proj ? proj.name : '-';
    }
    return risk.description ? (risk.description.length > 30 ? risk.description.substring(0,30) + '...' : risk.description) : 'Genel';
  };

  const getLastMonitoringDate = (risk) => {
    if (!risk.monitoringLogs || risk.monitoringLogs.length === 0) return '-';
    // Sort logs descending by date
    const sorted = [...risk.monitoringLogs].sort((a,b) => new Date(b.monitoringDate) - new Date(a.monitoringDate));
    const date = new Date(sorted[0].monitoringDate);
    return date.toLocaleDateString('tr-TR');
  };

  // Processing Data
  const filteredRisks = useMemo(() => {
    return risks.filter(r => r.status === 'Aktif');
  }, [risks]);

  const sortedRisks = useMemo(() => {
    let sortableItems = [...filteredRisks];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        let aValue, bValue;

        // Custom Sort Logic
        if (sortConfig.key === 'score') {
           aValue = a.score;
           bValue = b.score;
        } else if (sortConfig.key === 'lastMonitoring') {
           const getLastDate = (r) => {
             if(!r.monitoringLogs?.length) return 0;
             return new Date([...r.monitoringLogs].sort((x,y) => new Date(y.monitoringDate) - new Date(x.monitoringDate))[0].monitoringDate).getTime();
           };
           aValue = getLastDate(a);
           bValue = getLastDate(b);
        } else {
           aValue = a[sortConfig.key];
           bValue = b[sortConfig.key];
        }

        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [filteredRisks, sortConfig]);

  // Pagination Logic
  const totalPages = Math.ceil(sortedRisks.length / itemsPerPage);
  const currentData = sortedRisks.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const SortIcon = ({ columnKey }) => {
     if (sortConfig.key !== columnKey) return <ArrowUpDown className="w-3 h-3 ml-1 text-gray-400 opacity-0 group-hover:opacity-50" />;
     return sortConfig.direction === 'asc' 
        ? <ArrowUp className="w-3 h-3 ml-1 text-blue-600" /> 
        : <ArrowDown className="w-3 h-3 ml-1 text-blue-600" />;
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h3 className="text-lg font-bold text-gray-900">Tüm Riskler (Özet Liste)</h3>
        <span className="text-sm text-gray-500 bg-white px-3 py-1 rounded-full border shadow-sm">
           Toplam {filteredRisks.length} Aktif Risk
        </span>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[140px] cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => requestSort('riskType')}>
                 <div className="flex items-center">Risk Türü <SortIcon columnKey="riskType"/></div>
              </TableHead>
              <TableHead className="cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => requestSort('name')}>
                 <div className="flex items-center">Risk Adı <SortIcon columnKey="name"/></div>
              </TableHead>
              <TableHead>İlişkili Kayıt</TableHead>
              <TableHead className="text-center w-[140px] cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => requestSort('score')}>
                 <div className="flex items-center justify-center">Skor / Seviye <SortIcon columnKey="score"/></div>
              </TableHead>
              <TableHead className="w-[120px] cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => requestSort('status')}>
                 <div className="flex items-center">Durum <SortIcon columnKey="status"/></div>
              </TableHead>
              <TableHead className="w-[150px] cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => requestSort('responsible')}>
                 <div className="flex items-center">Sorumlu <SortIcon columnKey="responsible"/></div>
              </TableHead>
              <TableHead className="text-right w-[150px] cursor-pointer group hover:bg-gray-100 transition-colors" onClick={() => requestSort('lastMonitoring')}>
                 <div className="flex items-center justify-end">Son İzleme <SortIcon columnKey="lastMonitoring"/></div>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length > 0 ? (
              currentData.map((risk) => (
                <TableRow key={risk.id} className="hover:bg-blue-50/30 transition-colors group">
                  <TableCell>{getRiskTypeBadge(risk.riskType)}</TableCell>
                  <TableCell>
                    <span 
                       onClick={() => onViewRisk && onViewRisk(risk)}
                       className="font-medium text-gray-900 cursor-pointer hover:text-blue-600 hover:underline decoration-blue-300 underline-offset-4 transition-all"
                    >
                      {risk.name}
                    </span>
                  </TableCell>
                  <TableCell className="text-sm text-gray-600 max-w-[200px] truncate" title={getRelatedRecordText(risk)}>
                    {getRelatedRecordText(risk)}
                  </TableCell>
                  <TableCell className="text-center">
                    {getScoreBadge(risk.score)}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(risk.status)}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    {risk.responsible || '-'}
                  </TableCell>
                  <TableCell className="text-right text-sm font-mono text-gray-600">
                    {getLastMonitoringDate(risk)}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center text-gray-500">
                   Görüntülenecek aktif risk bulunamadı.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
          <div className="text-sm text-gray-500">
            Sayfa <span className="font-medium">{currentPage}</span> / {totalPages}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default RiskSummaryList;