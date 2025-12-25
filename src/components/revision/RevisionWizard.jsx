import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ArrowRight, ArrowLeft, Check, AlertTriangle, FileText, Layout, 
  Target, Info, Save, X, Search, RotateCcw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { REVISION_TYPES } from '@/data/revisionTypes';
import { REVISION_REASONS } from '@/data/revisionReasons';
import { useRevisionData } from '@/hooks/useRevisionData';
import { useToast } from '@/components/ui/use-toast';
import { useAuthContext } from '@/hooks/useAuthContext';
import { getCompanyData } from '@/lib/supabase';

// Data fetching helper - Supabase only, no localStorage fallback
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
    
    // Require Supabase configuration
    const hasSupabase = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!hasSupabase || !userId || !companyId) {
      console.warn('Supabase not configured or missing user/company info');
      return [];
    }
    
    // Load from Supabase only
    const data = await getCompanyData(table, userId, companyId, isAdmin);
    
    // Normalize data for table display
    return (data || []).map(item => ({
       id: item.id,
       code: item.code,
       name: item.name,
       // Map snake_case to camelCase for compatibility
       companyId: item.company_id || item.companyId,
       strategicAreaId: item.strategic_area_id || item.strategicAreaId,
       objectiveId: item.objective_id || item.objectiveId,
       targetId: item.target_id || item.targetId,
       indicatorId: item.indicator_id || item.indicatorId,
       responsibleUnit: item.responsible_unit || item.responsibleUnit,
       // Include all other fields
       ...item
    }));
  } catch (e) {
    console.error("Error fetching items for level " + level, e);
    return [];
  }
};

const ITEM_LEVELS = [
  'Alan', 'Amaç', 'Hedef', 'Gösterge', 'Faaliyet'
];

const RevisionWizard = ({ initialItem, onClose, onSuccess }) => {
  const { saveRevision } = useRevisionData();
  const { toast } = useToast();
  const { currentUser } = useAuthContext();
  const [step, setStep] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [availableItems, setAvailableItems] = useState([]);
  const [selectedLevel, setSelectedLevel] = useState('Alan');
  const [loadingItems, setLoadingItems] = useState(false);

  const [formData, setFormData] = useState({
    itemLevel: '',
    itemCode: '',
    itemName: '',
    itemId: '',
    originalItem: null,
    
    revisionType: '',
    revisionReason: '',
    reasonText: '',
    otherReasonText: '', // For "Diğer"
    analyses: [],
    
    beforeState: {},
    afterState: {},
    
    decisionNo: '',
    decisionDate: new Date().toISOString().split('T')[0],
    proposedBy: 'Mevcut Kullanıcı', 
    status: 'review'
  });

  // Load items for a specific level from Supabase
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

  // Initialization Logic
  useEffect(() => {
    if (initialItem) {
      const level = initialItem.level || 'Bilinmiyor';
      
      setFormData(prev => ({
        ...prev,
        itemLevel: level,
        itemCode: initialItem.code,
        itemName: initialItem.name,
        itemId: initialItem.id,
        originalItem: initialItem,
        beforeState: { ...initialItem },
        afterState: { ...initialItem }
      }));
      
      // Also set list state to match in case user goes back to change
      if (ITEM_LEVELS.includes(level)) {
        setSelectedLevel(level);
      }
    } else {
        // If no initial item, load defaults for selection
        loadItemsForLevel('Alan');
    }
  }, [initialItem, loadItemsForLevel]);

  // Handle Level Change in Step 1
  useEffect(() => {
    if (!initialItem || step === 1) { // Only auto-fetch if we are in selection mode
       loadItemsForLevel(selectedLevel);
    }
  }, [selectedLevel, step, initialItem, loadItemsForLevel]);

  const filteredItems = useMemo(() => {
     if (!searchTerm) return availableItems;
     const lower = searchTerm.toLowerCase();
     return availableItems.filter(i => 
        (i.code && i.code.toLowerCase().includes(lower)) ||
        (i.name && i.name.toLowerCase().includes(lower))
     );
  }, [availableItems, searchTerm]);

  const handleSelectItem = (item) => {
     setFormData(prev => ({
        ...prev,
        itemLevel: selectedLevel,
        itemCode: item.code,
        itemName: item.name,
        itemId: item.id,
        originalItem: item,
        beforeState: { ...item },
        afterState: { ...item }
     }));
  };

  const handleResetSelection = () => {
     setFormData(prev => ({
        ...prev,
        itemId: '',
        itemCode: '',
        itemName: '',
        originalItem: null
     }));
  };

  const handleNext = () => {
      // Validation for Step 1
      if (step === 1 && !formData.itemId) {
          toast({ title: "Seçim Yapınız", description: "Lütfen revizyon yapılacak öğeyi seçiniz.", variant: "destructive" });
          return;
      }
      // Validation for Step 2
      if (step === 2) {
          if (!formData.revisionType) {
              toast({ title: "Eksik Bilgi", description: "Revizyon türünü seçiniz.", variant: "destructive" });
              return;
          }
          if (!formData.revisionReason) {
              toast({ title: "Eksik Bilgi", description: "Revizyon nedenini seçiniz.", variant: "destructive" });
              return;
          }
          if (formData.revisionReason.value === 'other' && !formData.otherReasonText.trim()) {
              toast({ title: "Eksik Bilgi", description: "Diğer neden için açıklama giriniz.", variant: "destructive" });
              return;
          }
      }

      setStep(prev => prev + 1);
  };
  
  const handleBack = () => setStep(prev => prev - 1);

  const handleFieldChange = (field, value, isAfterState = false) => {
    if (isAfterState) {
        setFormData(prev => ({
            ...prev,
            afterState: { ...prev.afterState, [field]: value }
        }));
    } else {
        setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleFinish = () => {
    // Determine changed fields
    const changedFields = [];
    Object.keys(formData.afterState).forEach(key => {
        if (JSON.stringify(formData.beforeState[key]) !== JSON.stringify(formData.afterState[key])) {
            changedFields.push(key);
        }
    });

    // Combine standard reason text with 'other' reason text if applicable
    const finalReasonText = formData.revisionReason?.value === 'other' 
        ? `${formData.reasonText ? formData.reasonText + '\n' : ''}[Diğer]: ${formData.otherReasonText}`
        : formData.reasonText;

    const success = saveRevision({
        ...formData,
        reasonText: finalReasonText,
        changedFields,
        status: 'applied' // Auto apply for demo
    });

    if (success) {
        toast({ title: "Revizyon Başlatıldı", description: "Revizyon başarıyla uygulandı." });
        onSuccess && onSuccess();
    } else {
        toast({ title: "Hata", description: "Kayıt sırasında bir sorun oluştu.", variant: "destructive" });
    }
  };

  // --- STEPS RENDERING ---

  const renderStep1_Selection = () => {
    const isItemSelected = !!formData.itemId;

    if (isItemSelected) {
        return (
            <div className="space-y-6">
                <h3 className="text-lg font-semibold flex items-center gap-2"><Target className="w-5 h-5"/> Revizyon Yapılacak Öğe</h3>
                
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                        <Check className="w-8 h-8 text-blue-600" />
                    </div>
                    <div>
                        <div className="text-sm font-bold text-blue-800 uppercase tracking-wider mb-1">{formData.itemLevel}</div>
                        <div className="text-2xl font-bold text-gray-900 mb-1 font-mono">{formData.itemCode}</div>
                        <div className="text-lg text-gray-700">{formData.itemName}</div>
                    </div>
                    
                    <Button variant="outline" onClick={handleResetSelection} className="mt-4">
                        <RotateCcw className="w-4 h-4 mr-2" /> Seçimi Değiştir
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 h-full flex flex-col">
           <h3 className="text-lg font-semibold flex items-center gap-2"><Search className="w-5 h-5"/> Öğe Seçimi</h3>
           
           <div className="flex gap-4 items-center bg-gray-50 p-4 rounded-lg border border-gray-100">
               <div className="w-1/3">
                   <Label className="mb-1.5 block">Öğe Seviyesi</Label>
                   <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                       <SelectTrigger className="bg-white"><SelectValue /></SelectTrigger>
                       <SelectContent>
                           {ITEM_LEVELS.map(l => <SelectItem key={l} value={l}>{l}</SelectItem>)}
                       </SelectContent>
                   </Select>
               </div>
               <div className="w-2/3">
                   <Label className="mb-1.5 block">Ara (Kod veya Ad)</Label>
                   <Input 
                        placeholder="Aramak için yazınız..." 
                        value={searchTerm} 
                        onChange={(e) => setSearchTerm(e.target.value)} 
                        className="bg-white"
                   />
               </div>
           </div>

           <div className="flex-1 border rounded-md overflow-hidden bg-white">
               <Table>
                   <TableHeader className="bg-gray-50">
                       <TableRow>
                           <TableHead className="w-[120px]">Kod</TableHead>
                           <TableHead>Ad / Tanım</TableHead>
                           <TableHead className="w-[100px] text-right">Seç</TableHead>
                       </TableRow>
                   </TableHeader>
                   <TableBody>
                       {loadingItems ? (
                           <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-400">Yükleniyor...</TableCell></TableRow>
                       ) : filteredItems.length === 0 ? (
                           <TableRow><TableCell colSpan={3} className="text-center py-8 text-gray-400">Kayıt bulunamadı.</TableCell></TableRow>
                       ) : (
                           filteredItems.map(item => (
                               <TableRow key={item.id} className="hover:bg-blue-50/50 cursor-pointer" onClick={() => handleSelectItem(item)}>
                                   <TableCell className="font-mono font-medium text-blue-600">{item.code}</TableCell>
                                   <TableCell>{item.name}</TableCell>
                                   <TableCell className="text-right">
                                       <Button size="sm" variant="ghost" className="h-8 w-8 p-0"><ArrowRight className="w-4 h-4"/></Button>
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

  const renderStep2_TypeReason = () => {
    const isOtherReason = formData.revisionReason?.value === 'other';

    // Filter reasons based on item level
    const filteredReasons = REVISION_REASONS.filter(r => {
        if (r.value === 'budget_revision') {
            return formData.itemLevel === 'Faaliyet';
        }
        return true;
    });

    return (
        <div className="space-y-6">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Info className="w-5 h-5"/> Tür ve Gerekçe</h3>
        
        <div className="grid grid-cols-2 gap-6">
            <div className="space-y-3">
                <Label>Revizyon Türü <span className="text-red-500">*</span></Label>
                <Select 
                    value={formData.revisionType?.value || formData.revisionType} 
                    onValueChange={(val) => {
                        const selected = REVISION_TYPES.find(t => t.value === val);
                        handleFieldChange('revisionType', selected);
                    }}
                >
                <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                <SelectContent>
                    {REVISION_TYPES.map(t => <SelectItem key={t.id} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>

            <div className="space-y-3">
                <Label>Revizyon Nedeni <span className="text-red-500">*</span></Label>
                <Select 
                    value={formData.revisionReason?.value || formData.revisionReason} 
                    onValueChange={(val) => {
                        const selected = REVISION_REASONS.find(r => r.value === val);
                        handleFieldChange('revisionReason', selected);
                    }}
                >
                <SelectTrigger><SelectValue placeholder="Seçiniz..." /></SelectTrigger>
                <SelectContent>
                    {filteredReasons.map(r => <SelectItem key={r.id} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
                </Select>
            </div>
        </div>
        
        <AnimatePresence>
            {isOtherReason && (
                <motion.div 
                    initial={{ opacity: 0, height: 0 }} 
                    animate={{ opacity: 1, height: 'auto' }} 
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-3 overflow-hidden"
                >
                    <Label className="text-blue-600">Diğer nedeninizi yazınız <span className="text-red-500">*</span></Label>
                    <Input 
                        value={formData.otherReasonText} 
                        onChange={(e) => handleFieldChange('otherReasonText', e.target.value)} 
                        placeholder="Örn: Olağanüstü hal durumu..."
                        className="border-blue-200 bg-blue-50 focus:bg-white transition-colors"
                    />
                </motion.div>
            )}
        </AnimatePresence>

        <div className="space-y-3">
            <Label>Gerekçe Detayı & Analiz</Label>
            <Textarea 
                value={formData.reasonText} 
                onChange={(e) => handleFieldChange('reasonText', e.target.value)} 
                placeholder="Değişiklik nedenini detaylı açıklayınız..." 
                rows={4}
            />
        </div>
        </div>
    );
  };

  const renderStep3_Changes = () => {
     const isFaaliyet = formData.itemLevel === 'Faaliyet';

     return (
        <div className="space-y-4">
        <h3 className="text-lg font-semibold flex items-center gap-2"><Layout className="w-5 h-5"/> Değişiklik Önizleme</h3>
        <div className="grid grid-cols-2 gap-4">
            {/* BEFORE */}
            <div className="border border-red-200 bg-red-50/50 rounded-lg p-4">
                <h4 className="font-bold text-red-800 mb-4 border-b border-red-200 pb-2 flex justify-between">
                    <span>Mevcut Durum</span>
                    <Badge variant="outline" className="border-red-200 text-red-700 bg-white">Öncesi</Badge>
                </h4>
                <div className="space-y-4 opacity-80 pointer-events-none select-none">
                <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase">Ad / Tanım</Label>
                    <Input value={formData.beforeState.name || ''} readOnly className="bg-white mt-1" />
                </div>
                
                {/* Specific Fields */}
                {isFaaliyet && (
                     <div>
                        <Label className="text-xs font-semibold text-gray-500 uppercase">Önceki Bütçe</Label>
                        <Input value={formData.beforeState.plannedBudget || formData.beforeState.tahmini_butce || 0} readOnly className="bg-white mt-1" />
                     </div>
                )}

                <div>
                    <Label className="text-xs font-semibold text-gray-500 uppercase">Açıklama</Label>
                    <Textarea value={formData.beforeState.description || ''} readOnly className="bg-white mt-1" rows={3}/>
                </div>
                </div>
            </div>

            {/* AFTER */}
            <div className="border border-green-200 bg-green-50/50 rounded-lg p-4">
                <h4 className="font-bold text-green-800 mb-4 border-b border-green-200 pb-2 flex justify-between">
                    <span>Yeni Durum</span>
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-white">Sonrası</Badge>
                </h4>
                <div className="space-y-4">
                <div>
                    <Label className="text-xs font-semibold text-green-700 uppercase">Ad / Tanım</Label>
                    <Input 
                        value={formData.afterState.name || ''} 
                        onChange={(e) => handleFieldChange('name', e.target.value, true)}
                        className="bg-white border-green-300 focus:ring-green-500 mt-1" 
                    />
                </div>

                {/* Specific Fields Editable */}
                {isFaaliyet && (
                     <div>
                        <Label className="text-xs font-semibold text-green-700 uppercase">Yeni Bütçe</Label>
                        <Input 
                            type="number"
                            value={formData.afterState.plannedBudget !== undefined ? formData.afterState.plannedBudget : (formData.afterState.tahmini_butce || 0)} 
                            onChange={(e) => handleFieldChange('plannedBudget', e.target.value, true)}
                            className="bg-white border-green-300 focus:ring-green-500 mt-1" 
                        />
                     </div>
                )}

                <div>
                    <Label className="text-xs font-semibold text-green-700 uppercase">Açıklama</Label>
                    <Textarea 
                        value={formData.afterState.description || ''} 
                        onChange={(e) => handleFieldChange('description', e.target.value, true)}
                        className="bg-white border-green-300 focus:ring-green-500 mt-1" 
                        rows={3}
                    />
                </div>
                </div>
            </div>
        </div>
        </div>
     );
  };

  const renderStep4_Approval = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold flex items-center gap-2"><FileText className="w-5 h-5"/> Onay ve Karar</h3>
      <div className="bg-blue-50 p-6 rounded-lg border border-blue-100 shadow-sm">
         <div className="grid grid-cols-2 gap-6">
             <div className="space-y-2">
                 <Label>Yetkili Kurul / Makam</Label>
                 <Input defaultValue="Yönetim Kurulu" className="bg-white" />
             </div>
             <div className="space-y-2">
                 <Label>Talep Eden</Label>
                 <Input value={formData.proposedBy} readOnly className="bg-gray-100" />
             </div>
             <div className="space-y-2">
                 <Label>Karar No</Label>
                 <Input value={formData.decisionNo} onChange={(e) => handleFieldChange('decisionNo', e.target.value)} placeholder="Örn: 2024/15" className="bg-white" />
             </div>
             <div className="space-y-2">
                 <Label>Karar Tarihi</Label>
                 <Input type="date" value={formData.decisionDate} onChange={(e) => handleFieldChange('decisionDate', e.target.value)} className="bg-white" />
             </div>
             <div className="col-span-2 mt-2">
                 <div className="flex items-start gap-3 text-sm text-blue-800 bg-white p-4 rounded-lg border border-blue-100">
                    <AlertTriangle className="w-5 h-5 mt-0.5 shrink-0 text-blue-600" />
                    <div>
                        <strong className="block mb-1">Onay İşlemi Hakkında</strong>
                        <p>Bu revizyon onaylandığında, ilgili stratejik plan veya bütçe öğesi kalıcı olarak güncellenecek ve eski versiyon tarihçeye taşınacaktır. Bu işlem geri alınamaz.</p>
                    </div>
                 </div>
             </div>
         </div>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-full max-h-[85vh]">
      {/* Header */}
      <div className="px-6 py-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg shrink-0">
         <div>
            <h2 className="text-xl font-bold text-gray-900">Revizyon Sihirbazı</h2>
            <div className="flex items-center gap-2 text-sm text-gray-500 mt-1">
                <Badge variant={step >= 1 ? "default" : "outline"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center">1</Badge> Seçim
                <div className="w-4 border-t"></div>
                <Badge variant={step >= 2 ? "default" : "outline"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center">2</Badge> Gerekçe
                <div className="w-4 border-t"></div>
                <Badge variant={step >= 3 ? "default" : "outline"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center">3</Badge> Değişiklik
                <div className="w-4 border-t"></div>
                <Badge variant={step >= 4 ? "default" : "outline"} className="w-6 h-6 rounded-full p-0 flex items-center justify-center">4</Badge> Onay
            </div>
         </div>
         <Button variant="ghost" size="icon" onClick={onClose}><X className="w-5 h-5"/></Button>
      </div>

      {/* Body */}
      <div className="flex-1 p-6 overflow-y-auto bg-white">
         <AnimatePresence mode="wait">
            <motion.div
               key={step}
               initial={{ opacity: 0, x: 20 }}
               animate={{ opacity: 1, x: 0 }}
               exit={{ opacity: 0, x: -20 }}
               transition={{ duration: 0.2 }}
               className="h-full"
            >
               {step === 1 && renderStep1_Selection()}
               {step === 2 && renderStep2_TypeReason()}
               {step === 3 && renderStep3_Changes()}
               {step === 4 && renderStep4_Approval()}
            </motion.div>
         </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t bg-gray-50 flex justify-between rounded-b-lg shrink-0">
         <Button variant="outline" onClick={step === 1 ? onClose : handleBack} disabled={false}>
            {step === 1 ? 'İptal' : <><ArrowLeft className="w-4 h-4 mr-2"/> Geri</>}
         </Button>
         
         {step < 4 ? (
            <Button onClick={handleNext} className="bg-blue-600 hover:bg-blue-700 shadow-sm" disabled={step === 1 && !formData.itemId}>
               İleri <ArrowRight className="w-4 h-4 ml-2"/>
            </Button>
         ) : (
            <Button onClick={handleFinish} className="bg-green-600 hover:bg-green-700 text-white shadow-sm">
               <Save className="w-4 h-4 mr-2"/> Onayla ve Uygula
            </Button>
         )}
      </div>
    </div>
  );
};

export default RevisionWizard;