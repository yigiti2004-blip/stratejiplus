import React, { useState } from 'react';
import { Search, Filter, Eye, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getRiskLevel } from '@/lib/calculations';
import { RISK_TYPES, RISK_STATUSES } from '@/data/riskTypes';

const RiskList = ({ risks, onView, onEdit, onDelete }) => {
  const [filters, setFilters] = useState({
    search: '',
    type: 'all',
    status: 'all',
    level: 'all'
  });

  const filteredRisks = risks.filter(risk => {
    const level = getRiskLevel(risk.score).value;
    
    const matchesSearch = risk.name.toLowerCase().includes(filters.search.toLowerCase());
    const matchesType = filters.type === 'all' || risk.riskType === filters.type;
    const matchesStatus = filters.status === 'all' || risk.status === filters.status;
    const matchesLevel = filters.level === 'all' || level === filters.level;

    return matchesSearch && matchesType && matchesStatus && matchesLevel;
  });

  return (
    <div className="space-y-4">
       {/* Filters */}
       <div className="bg-white p-4 rounded-lg border shadow-sm flex flex-wrap gap-4 items-end">
          <div className="w-full md:w-64">
             <label className="text-xs font-semibold text-gray-500 mb-1 block">Arama</label>
             <div className="relative">
                <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-400" />
                <Input 
                   placeholder="Risk adı ara..." 
                   className="pl-8" 
                   value={filters.search}
                   onChange={e => setFilters({...filters, search: e.target.value})}
                />
             </div>
          </div>
          
          <div className="w-40">
             <label className="text-xs font-semibold text-gray-500 mb-1 block">Risk Türü</label>
             <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.type}
                onChange={e => setFilters({...filters, type: e.target.value})}
             >
                <option value="all">Tümü</option>
                {RISK_TYPES.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
             </select>
          </div>

          <div className="w-40">
             <label className="text-xs font-semibold text-gray-500 mb-1 block">Durum</label>
             <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.status}
                onChange={e => setFilters({...filters, status: e.target.value})}
             >
                <option value="all">Tümü</option>
                {RISK_STATUSES.map(s => <option key={s.id} value={s.value}>{s.label}</option>)}
             </select>
          </div>

          <div className="w-40">
             <label className="text-xs font-semibold text-gray-500 mb-1 block">Risk Seviyesi</label>
             <select 
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={filters.level}
                onChange={e => setFilters({...filters, level: e.target.value})}
             >
                <option value="all">Tümü</option>
                <option value="Critical">Kritik</option>
                <option value="High">Yüksek</option>
                <option value="Medium">Orta</option>
                <option value="Low">Düşük</option>
             </select>
          </div>
       </div>

       {/* Table */}
       <div className="bg-white rounded-lg border shadow-sm overflow-hidden">
          <Table>
             <TableHeader className="bg-gray-50">
                <TableRow>
                   <TableHead className="pl-6">Risk Adı</TableHead>
                   <TableHead>Tür</TableHead>
                   <TableHead>Skor</TableHead>
                   <TableHead>Sorumlu</TableHead>
                   <TableHead>Durum</TableHead>
                   <TableHead className="text-right pr-6">İşlemler</TableHead>
                </TableRow>
             </TableHeader>
             <TableBody>
                {filteredRisks.length === 0 ? (
                   <TableRow><TableCell colSpan={6} className="text-center py-8 text-gray-400">Kayıt bulunamadı.</TableCell></TableRow>
                ) : (
                   filteredRisks.map(risk => {
                      const typeDef = RISK_TYPES.find(t => t.id === risk.riskType);
                      const level = getRiskLevel(risk.score);
                      return (
                         <TableRow key={risk.id} className="hover:bg-gray-50 group">
                            <TableCell className="pl-6 font-medium">{risk.name}</TableCell>
                            <TableCell>
                               <Badge className={typeDef?.color}>{typeDef?.label}</Badge>
                            </TableCell>
                            <TableCell>
                               <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold ${level.bg} ${level.text}`}>
                                  {risk.score} ({level.label})
                               </span>
                            </TableCell>
                            <TableCell className="text-sm text-gray-600">{risk.responsible}</TableCell>
                            <TableCell>
                               <Badge variant="outline">{risk.status}</Badge>
                            </TableCell>
                            <TableCell className="text-right pr-6">
                               <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button variant="ghost" size="sm" onClick={() => onView(risk)} className="h-8 w-8 p-0 text-blue-600"><Eye className="w-4 h-4"/></Button>
                                  <Button variant="ghost" size="sm" onClick={() => onEdit(risk)} className="h-8 w-8 p-0 text-green-600"><Edit2 className="w-4 h-4"/></Button>
                                  <Button variant="ghost" size="sm" onClick={() => onDelete(risk.id)} className="h-8 w-8 p-0 text-red-600"><Trash2 className="w-4 h-4"/></Button>
                               </div>
                            </TableCell>
                         </TableRow>
                      );
                   })
                )}
             </TableBody>
          </Table>
       </div>
    </div>
  );
};

export default RiskList;