import React, { useState } from 'react';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useRevisionData } from '@/hooks/useRevisionData';
import { Eye, Search, Filter } from 'lucide-react';
import { REVISION_STATUSES } from '@/data/revisionTypes';

const RevisionList = ({ onViewDetail }) => {
  const { revisions } = useRevisionData();
  const [filterText, setFilterText] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredRevisions = revisions.filter(rev => {
    const matchesText = 
      rev.itemCode?.toLowerCase().includes(filterText.toLowerCase()) ||
      rev.itemName?.toLowerCase().includes(filterText.toLowerCase()) ||
      rev.decisionNo?.toLowerCase().includes(filterText.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || rev.status === statusFilter;
    
    return matchesText && matchesStatus;
  });

  const getStatusBadge = (statusId) => {
    const status = REVISION_STATUSES.find(s => s.id === statusId) || { label: statusId, color: 'bg-gray-100' };
    return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${status.color}`}>{status.label}</span>;
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
          <Input 
            placeholder="Kod, Ad veya Karar No ile ara..." 
            className="pl-8 bg-white"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px] bg-white">
              <SelectValue placeholder="Durum Filtrele" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tümü</SelectItem>
              {REVISION_STATUSES.map(s => (
                <SelectItem key={s.id} value={s.id}>{s.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border bg-white">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Seviye</TableHead>
              <TableHead>Kod</TableHead>
              <TableHead>Öğe Adı</TableHead>
              <TableHead>Revizyon Türü</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRevisions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              filteredRevisions.map((rev) => (
                <TableRow key={rev.revisionId} className="hover:bg-gray-50">
                  <TableCell className="font-medium text-xs">
                    {new Date(rev.createdAt).toLocaleDateString('tr-TR')}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{rev.itemLevel}</Badge>
                  </TableCell>
                  <TableCell className="font-mono text-xs font-bold text-blue-600">
                    {rev.itemCode}
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate" title={rev.itemName}>
                    {rev.itemName}
                  </TableCell>
                  <TableCell className="text-xs">
                    {rev.revisionType?.label || '-'}
                  </TableCell>
                  <TableCell>
                    {getStatusBadge(rev.status)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" onClick={() => onViewDetail(rev)}>
                      <Eye className="h-4 w-4 mr-1" /> İncele
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default RevisionList;