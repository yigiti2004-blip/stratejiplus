import React, { useState, useEffect, useCallback } from 'react';
import { useRevisionData } from '@/hooks/useRevisionData';
import { useAuthContext } from '@/hooks/useAuthContext';
import { getCompanyData } from '@/lib/supabase';
import { Clock, CheckCircle, ArrowRight, Search } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';

const ITEM_LEVELS = ['Alan', 'Amaç', 'Hedef', 'Gösterge', 'Faaliyet'];

const fetchItemsByLevel = async (level, userId, companyId, isAdmin) => {
  try {
    const tableMap = { 
        'Alan': 'strategic_areas', 
        'Amaç': 'strategic_objectives', 
        'Hedef': 'targets', 
        'Gösterge': 'indicators', 
        'Faaliyet': 'activities'
    };
    const table = tableMap[level];
    if (!table) return [];
    
    const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!hasSupabase || !userId || !companyId) {
      return [];
    }
    
    const data = await getCompanyData(table, userId, companyId, isAdmin);
    
    return (data || []).map(item => ({
       id: item.id,
       code: item.code,
       name: item.name,
       ...item
    }));
  } catch (e) {
    console.error("Error fetching items for level " + level, e);
    return [];
  }
};

const RevisionHistory = ({ itemId, onSelectItem }) => {
  const { currentUser } = useAuthContext();
  const { getRevisionsByItemId } = useRevisionData();
  const [selectedLevel, setSelectedLevel] = useState('Alan');
  const [availableItems, setAvailableItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItem, setSelectedItem] = useState(null);
  const [loadingItems, setLoadingItems] = useState(false);

  const loadItemsForLevel = useCallback(async (level) => {
    setLoadingItems(true);
    try {
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';
      
      const items = await fetchItemsByLevel(level, userId, companyId, isAdmin);
      setAvailableItems(items);
      setSearchTerm('');
    } catch (error) {
      console.error('Error loading items for level:', level, error);
      setAvailableItems([]);
    } finally {
      setLoadingItems(false);
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  useEffect(() => {
    loadItemsForLevel(selectedLevel);
  }, [selectedLevel, loadItemsForLevel]);

  const filteredItems = availableItems.filter(item => {
    if (!searchTerm) return true;
    const lower = searchTerm.toLowerCase();
    return (item.code && item.code.toLowerCase().includes(lower)) ||
           (item.name && item.name.toLowerCase().includes(lower));
  });

  const revisions = selectedItem?.id ? getRevisionsByItemId(selectedItem.id) : [];

  if (!selectedItem) {
    return (
      <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2 text-gray-900"><Search className="w-5 h-5 text-gray-900"/> Öğe Seçimi</h3>
        
        <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
          <div className="w-1/3">
            <Label className="mb-1.5 block text-gray-900">Öğe Seviyesi</Label>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger className="bg-white text-gray-900 border-gray-300"><SelectValue /></SelectTrigger>
              <SelectContent className="bg-white">
                {ITEM_LEVELS.map(l => <SelectItem key={l} value={l} className="text-gray-900 focus:bg-gray-100">{l}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="w-2/3">
            <Label className="mb-1.5 block text-gray-900">Ara (Kod veya Ad)</Label>
            <Input 
              placeholder="Aramak için yazınız..." 
              value={searchTerm} 
              onChange={(e) => setSearchTerm(e.target.value)} 
              className="bg-white text-gray-900 border-gray-300"
            />
          </div>
        </div>

        <div className="border rounded-md overflow-hidden bg-white">
          <Table>
            <TableHeader className="bg-gray-50">
              <TableRow>
                <TableHead className="w-[120px] text-gray-900 font-semibold">Kod</TableHead>
                <TableHead className="text-gray-900 font-semibold">Ad / Tanım</TableHead>
                <TableHead className="w-[100px] text-right text-gray-900 font-semibold">Seç</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingItems ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-400">Yükleniyor...</TableCell></TableRow>
              ) : filteredItems.length === 0 ? (
                <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-400">Kayıt bulunamadı.</TableCell></TableRow>
              ) : (
                filteredItems.map(item => (
                  <TableRow key={item.id} className="hover:bg-blue-50/50 cursor-pointer transition-colors" onClick={() => setSelectedItem(item)}>
                    <TableCell className="font-mono font-medium text-blue-600">{item.code}</TableCell>
                    <TableCell className="text-gray-900">{item.name}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="ghost" className="h-8 w-8 p-0 text-gray-900 hover:text-blue-600"><ArrowRight className="w-4 h-4"/></Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (revisions.length === 0) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{selectedItem.code} - {selectedItem.name}</h3>
            <p className="text-sm text-gray-500">Seviye: {selectedLevel}</p>
          </div>
          <Button variant="outline" onClick={() => setSelectedItem(null)}>Farklı Öğe Seç</Button>
        </div>
        <div className="text-center py-10 text-gray-400 border rounded-lg bg-gray-50">
          Bu öğe için revizyon geçmişi bulunmamaktadır.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{selectedItem.code} - {selectedItem.name}</h3>
          <p className="text-sm text-gray-500">Seviye: {selectedLevel}</p>
        </div>
        <Button variant="outline" onClick={() => setSelectedItem(null)}>Farklı Öğe Seç</Button>
      </div>
      <ScrollArea className="h-[500px] w-full pr-4">
        <div className="relative border-l-2 border-gray-200 ml-3 space-y-8 py-4">
        {revisions.map((rev, idx) => (
          <div key={rev.revisionId} className="relative pl-8">
            {/* Timeline Dot */}
            <div className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full border-2 border-white ${idx === 0 ? 'bg-green-500' : 'bg-gray-400'}`}></div>
            
            {/* Content */}
            <div className="bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-bold text-gray-900">{rev.revisionType?.label || 'Revizyon'}</div>
                  <div className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3"/> {new Date(rev.createdAt).toLocaleDateString('tr-TR')}
                  </div>
                </div>
                <span className="text-xs font-mono bg-gray-100 px-2 py-1 rounded text-gray-600">
                  {rev.decisionNo || '-'}
                </span>
              </div>
              
              <div className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded border border-gray-100 italic">
                "{rev.reasonText}"
              </div>

              {/* Quick Diff */}
              {rev.changedFields && rev.changedFields.length > 0 && (
                 <div className="text-xs space-y-2 mt-2 border-t pt-2">
                    <div className="font-semibold text-gray-600">Değişen Alanlar:</div>
                    {rev.changedFields.map(field => (
                       <div key={field} className="grid grid-cols-[1fr,auto,1fr] gap-2 items-center">
                          <div className="text-red-500 truncate text-right bg-red-50 px-1 rounded line-through decoration-red-500/50">
                             {typeof rev.beforeState[field] === 'string' ? rev.beforeState[field] : JSON.stringify(rev.beforeState[field])}
                          </div>
                          <ArrowRight className="w-3 h-3 text-gray-400"/>
                          <div className="text-green-600 truncate bg-green-50 px-1 rounded font-medium">
                             {typeof rev.afterState[field] === 'string' ? rev.afterState[field] : JSON.stringify(rev.afterState[field])}
                          </div>
                       </div>
                    ))}
                 </div>
              )}
            </div>
          </div>
        ))}
        </div>
      </ScrollArea>
    </div>
  );
};

export default RevisionHistory;