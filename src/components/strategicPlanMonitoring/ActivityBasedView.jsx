
import React, { useState, useMemo } from 'react';
import { Search, Filter, Calendar, Building2, Coins, ChevronRight } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import ActivityDetailPanel from './ActivityDetailPanel';

const ActivityBasedView = ({ areas, objectives, targets, activities, indicators }) => { // added indicators prop
  const [filters, setFilters] = useState({
    search: '',
    areaId: 'all',
    objectiveId: 'all',
    targetId: 'all',
    responsible: 'all'
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedActivity, setSelectedActivity] = useState(null);
  
  const itemsPerPage = 10;

  // Derive Data
  const tableData = useMemo(() => {
    return activities.map(activity => {
      const target = targets.find(t => t.id === activity.targetId);
      const objective = target ? objectives.find(o => o.id === target.objectiveId) : null;
      const area = objective ? areas.find(a => a.id === objective.strategicAreaId) : null;
      
      return {
        ...activity,
        targetCode: target?.code || '-',
        targetName: target?.name || '-',
        objectiveCode: objective?.code || '-',
        areaCode: area?.code || '-',
        areaId: area?.id,
        objectiveId: objective?.id,
        targetId: target?.id,
        // Full objects for hierarchy passing
        _hierarchy: { target, objective, area }
      };
    });
  }, [activities, targets, objectives, areas]);

  // Filter Data
  const filteredData = useMemo(() => {
    return tableData.filter(item => {
      const matchesSearch = item.name.toLowerCase().includes(filters.search.toLowerCase()) || 
                            item.code.toLowerCase().includes(filters.search.toLowerCase());
      const matchesArea = filters.areaId === 'all' || item.areaId === filters.areaId;
      const matchesObjective = filters.objectiveId === 'all' || item.objectiveId === filters.objectiveId;
      const matchesTarget = filters.targetId === 'all' || item.targetId === filters.targetId;
      const matchesResponsible = filters.responsible === 'all' || item.responsibleUnit === filters.responsible;

      return matchesSearch && matchesArea && matchesObjective && matchesTarget && matchesResponsible;
    });
  }, [tableData, filters]);

  // Pagination
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);
  const currentData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Helper for unique filter options
  const uniqueResponsibles = useMemo(() => {
    return [...new Set(activities.map(a => a.responsibleUnit).filter(Boolean))];
  }, [activities]);

  // Dependent Dropdowns
  const availableObjectives = useMemo(() => {
    if (filters.areaId === 'all') return objectives;
    return objectives.filter(o => o.strategicAreaId === filters.areaId);
  }, [objectives, filters.areaId]);

  const availableTargets = useMemo(() => {
    if (filters.objectiveId === 'all') {
      if (filters.areaId === 'all') return targets;
      const validObjIds = availableObjectives.map(o => o.id);
      return targets.filter(t => validObjIds.includes(t.objectiveId));
    }
    return targets.filter(t => t.objectiveId === filters.objectiveId);
  }, [targets, availableObjectives, filters.objectiveId, filters.areaId]);

  return (
    <div className="space-y-6 relative">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm flex flex-wrap gap-4">
        <div className="flex-1 min-w-[240px]">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder="Faaliyet adı veya kodu ara..."
              className="pl-9"
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value, currentPage: 1 }))}
            />
          </div>
        </div>
        
        <div className="w-[180px]">
          <Select 
            value={filters.areaId} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, areaId: val, objectiveId: 'all', targetId: 'all', currentPage: 1 }))}
          >
            <SelectTrigger className="bg-white text-gray-900">
              <SelectValue placeholder="Alan Seç" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="all">Tüm Alanlar</SelectItem>
              {areas.map(a => <SelectItem key={a.id} value={a.id}>{a.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select 
            value={filters.objectiveId} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, objectiveId: val, targetId: 'all', currentPage: 1 }))}
            disabled={availableObjectives.length === 0}
          >
            <SelectTrigger className="bg-white text-gray-900">
              <SelectValue placeholder="Amaç Seç" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="all">Tüm Amaçlar</SelectItem>
              {availableObjectives.map(o => <SelectItem key={o.id} value={o.id}>{o.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select 
            value={filters.targetId} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, targetId: val, currentPage: 1 }))}
            disabled={availableTargets.length === 0}
          >
            <SelectTrigger className="bg-white text-gray-900">
              <SelectValue placeholder="Hedef Seç" />
            </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="all">Tüm Hedefler</SelectItem>
              {availableTargets.map(t => <SelectItem key={t.id} value={t.id}>{t.code}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>

        <div className="w-[180px]">
          <Select 
            value={filters.responsible} 
            onValueChange={(val) => setFilters(prev => ({ ...prev, responsible: val, currentPage: 1 }))}
          >
          <SelectTrigger className="bg-white text-gray-900">
            <SelectValue placeholder="Birim Seç" />
          </SelectTrigger>
            <SelectContent className="bg-white text-gray-900">
              <SelectItem value="all">Tüm Birimler</SelectItem>
              {uniqueResponsibles.map(u => <SelectItem key={u} value={u}>{u}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead className="w-[100px]">Kod</TableHead>
              <TableHead>Faaliyet Adı</TableHead>
              <TableHead>Bağlı Olduğu Hedef</TableHead>
              <TableHead className="w-[150px]">Tarih Aralığı</TableHead>
              <TableHead className="w-[150px]">Sorumlu Birim</TableHead>
              <TableHead className="text-right w-[120px]">Bütçe</TableHead>
              <TableHead className="w-[40px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentData.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-12 text-gray-500">
                  Kayıt bulunamadı.
                </TableCell>
              </TableRow>
            ) : (
              currentData.map((row) => (
                <TableRow 
                  key={row.id} 
                  className="hover:bg-blue-50/50 cursor-pointer group transition-colors"
                  onClick={() => setSelectedActivity(row)}
                >
                  <TableCell>
                    <Badge variant="outline" className="bg-gray-100 text-gray-700 font-mono border-gray-300 group-hover:bg-white transition-colors">
                      {row.code}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium text-gray-800 group-hover:text-blue-700 transition-colors">
                    {row.name}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <span className="font-mono text-xs text-emerald-600 font-bold mr-1">{row.targetCode}</span>
                    {row.targetName}
                  </TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <div className="flex flex-col text-xs">
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3"/> {formatDate(row.startDate)}</span>
                      <span className="flex items-center gap-1 mt-1 opacity-70"><Calendar className="w-3 h-3"/> {formatDate(row.endDate)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {row.responsibleUnit && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-700">
                        <Building2 className="w-3.5 h-3.5 text-gray-400" />
                        {row.responsibleUnit}
                      </div>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono text-sm">
                    {row.budget ? (
                      <span className="flex items-center justify-end gap-1 text-emerald-700 font-medium">
                        {Number(row.budget).toLocaleString('tr-TR')} ₺
                      </span>
                    ) : '-'}
                  </TableCell>
                  <TableCell>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200 bg-gray-50">
            <div className="text-sm text-gray-500">
              Toplam {filteredData.length} kayıt, Sayfa {currentPage} / {totalPages}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}>
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Panel */}
      <ActivityDetailPanel 
        activity={selectedActivity}
        hierarchy={selectedActivity?._hierarchy}
        isOpen={!!selectedActivity}
        onClose={() => setSelectedActivity(null)}
        indicators={indicators || []}
      />
    </div>
  );
};

export default ActivityBasedView;
