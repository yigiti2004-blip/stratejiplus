import React, { useState } from 'react';
import { X, Calendar, User, Activity, FileText, ArrowDown, Edit2, Trash2, Clock, Users, AlertTriangle, ChevronRight, RefreshCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn, formatDate, getDelayStatus, getStatusColor } from '@/lib/utils';
import { useKullanicilar } from '@/hooks/useKullanicilar';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import RevisionWizard from '@/components/revision/RevisionWizard';

const DetailPanel = ({ 
  isOpen, 
  onClose, 
  item, 
  type, 
  onEdit, // Legacy, will be replaced/intercepted
  onDelete // Legacy
}) => {
  const { kullanicilar } = useKullanicilar();
  const [revisionWizardOpen, setRevisionWizardOpen] = useState(false);
  
  if (!item) return null;

  const config = {
    'Alan': { color: 'bg-red-500', headerBg: 'bg-red-50', borderColor: 'border-l-red-500' },
    'Amaç': { color: 'bg-purple-500', headerBg: 'bg-purple-50', borderColor: 'border-l-purple-500' },
    'Hedef': { color: 'bg-blue-500', headerBg: 'bg-blue-50', borderColor: 'border-l-blue-500' },
    'Gösterge': { color: 'bg-green-500', headerBg: 'bg-green-50', borderColor: 'border-l-green-500' },
    'Faaliyet': { color: 'bg-orange-500', headerBg: 'bg-orange-50', borderColor: 'border-l-orange-500' },
  }[type] || { color: 'bg-gray-500', headerBg: 'bg-gray-50', borderColor: 'border-l-gray-500' };

  // Helper to find employee name
  const getEmpName = (id) => {
    if (!kullanicilar || kullanicilar.length === 0) return id;
    const found = kullanicilar.find(e => e.kullanici_id === id);
    return found ? found.kullanici_adi : id;
  };

  // Determine parent info
  const getParentInfo = () => {
       if (item.strategicAreaId && !item.objectiveId) return { type: 'Alan', code: 'SA...' }; 
       if (item.objectiveId && !item.targetId) return { type: 'Amaç', code: 'A...' };
       if (item.targetId) return { type: 'Hedef', code: 'H...' };
       return null;
  };
  const parentInfo = getParentInfo();

  // Time & Delay Calculation
  const hasTime = ['Hedef', 'Faaliyet'].includes(type) || (item.plannedStartDate && item.plannedEndDate);
  const delayStatus = hasTime ? getDelayStatus(item.plannedEndDate, item.actualEndDate) : null;
  const delayColor = delayStatus ? getStatusColor(delayStatus) : '';
  const delayText = {
     'delayed': 'Gecikme Var',
     'early': 'Erken Tamamlandı',
     'ontime': 'Zamanında',
     'pending': 'Devam Ediyor',
     'unknown': '-'
  }[delayStatus] || '-';

  // Handling Revision
  const handleStartRevision = () => {
     setRevisionWizardOpen(true);
  };

  return (
    <>
    <AnimatePresence>
      {isOpen && (
        <motion.div 
            initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="absolute top-0 right-0 bottom-0 w-full md:w-[350px] bg-white shadow-[-2px_0_8px_rgba(0,0,0,0.1)] z-40 flex flex-col border-l border-gray-100"
        >
            {/* HEADER */}
            <div className={cn("relative p-4 border-b flex items-start gap-3 shrink-0", config.headerBg, config.borderColor, "border-l-[4px]")}>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                     <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-white/60 text-gray-700">{item.code}</span>
                     {item.status && <span className="text-[10px] font-bold uppercase tracking-wider text-gray-600">{item.status}</span>}
                  </div>
                  <h2 className="text-sm font-bold text-gray-900 leading-tight">{item.name}</h2>
                  {item.shortName && <div className="mt-1 text-xs text-gray-500 font-medium">{item.shortName}</div>}
               </div>
               <button onClick={onClose} className="p-1.5 hover:bg-black/5 rounded-full"><X className="w-4 h-4 text-gray-500" /></button>
            </div>

            {/* CONTENT */}
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              
              {/* Revision Notice */}
              <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-3">
                 <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                 <div>
                    <h4 className="text-xs font-bold text-amber-800 mb-1">Düzenleme Kısıtlı</h4>
                    <p className="text-[11px] text-amber-700 leading-tight">Bu kayıt sistem tarafından yönetilmektedir. Doğrudan düzenleme yapılamaz. Değişiklikler için revizyon başlatınız.</p>
                 </div>
              </div>

              {/* Parent Info */}
              {parentInfo && (
                   <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded flex items-center gap-1">
                       <span className="font-semibold">Bağlı Olduğu {parentInfo.type} Mevcut</span>
                   </div>
              )}

              {/* Responsibility Info */}
              <section>
                <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Users className="w-3 h-3" /> Sorumluluk</h3>
                <div className="bg-gray-50 rounded p-3 border border-gray-100 space-y-2">
                    <div className="text-xs">
                        <span className="text-gray-700 block mb-0.5">Sorumlu Birim:</span> 
                        <span className="font-medium text-gray-900">{item.responsibleUnit || '-'}</span>
                    </div>
                    {item.responsiblePersons && item.responsiblePersons.length > 0 && (
                        <div className="text-xs">
                            <span className="text-gray-700 block mb-1">Sorumlu Kişiler:</span> 
                            <div className="flex flex-wrap gap-1">
                                {item.responsiblePersons.map(pid => (
                                <span key={pid} className="bg-white border border-gray-200 px-1.5 py-0.5 rounded text-gray-700">{getEmpName(pid)}</span>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
              </section>

              {/* Time Info */}
              {hasTime && (
                 <section>
                    <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Zamanlama</h3>
                    <div className="bg-white rounded p-3 border border-gray-200 space-y-3 shadow-sm">
                       <div className="grid grid-cols-2 gap-2 text-xs">
                          <div><span className="text-gray-700 block">Başlangıç</span><span className="font-medium text-gray-900">{formatDate(item.plannedStartDate)}</span></div>
                          <div><span className="text-gray-700 block">Planlanan Bitiş</span><span className="font-medium text-red-600">{formatDate(item.plannedEndDate)}</span></div>
                       </div>
                       
                       <div className="pt-2 border-t border-gray-100">
                          <div className="flex justify-between items-center text-xs mb-1">
                             <span className="text-gray-700">Durum:</span>
                             <span className={cn("font-bold px-2 py-0.5 rounded-full border text-[10px]", delayColor)}>{delayText}</span>
                          </div>
                       </div>
                    </div>
                 </section>
              )}
              
              {/* Type Specifics */}
              {item.targetValue && (
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Activity className="w-3 h-3" /> Hedef Verisi</h3>
                    <div className="grid grid-cols-2 gap-2 text-xs bg-gray-50 p-3 rounded border border-gray-100">
                        <div><span className="block text-gray-500">Hedef</span> <span className="font-bold text-gray-900 text-sm">{item.targetValue} {item.unit}</span></div>
                        {item.measurementPeriod && <div><span className="block text-gray-500">Periyot</span> <span>{item.measurementPeriod}</span></div>}
                    </div>
                  </section>
              )}
              
              {item.plannedBudget && (
                  <section>
                    <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2">Bütçe</h3>
                    <div className="text-sm font-mono font-medium text-green-700 bg-green-50 p-2 rounded border border-green-100">
                        {new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY' }).format(item.plannedBudget)}
                    </div>
                  </section>
              )}

              {/* Description */}
              <section>
                <h3 className="text-[11px] font-bold text-gray-700 uppercase tracking-wider mb-2 flex items-center gap-1.5"><FileText className="w-3 h-3" /> Açıklama</h3>
                <div className="p-3 bg-gray-50 rounded text-[13px] text-gray-500 leading-relaxed border border-gray-100 min-h-[60px]">
                  {item.description || "Açıklama bulunmamaktadır."}
                </div>
              </section>
            </div>

            {/* ACTIONS (REPLACED) */}
            <div className="p-4 border-t bg-gray-50 flex gap-2 shrink-0 flex-col">
              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
                onClick={handleStartRevision}
              >
                <RefreshCcw className="w-4 h-4 mr-2" /> Revizyon Başlat
              </Button>
              {/* Keeping delete for admins or specific cases, but could hide it too */}
              <div className="flex justify-center mt-2">
                 <button onClick={() => onDelete(item)} className="text-xs text-red-400 hover:text-red-600 underline">
                    Kaydı Sil (Sadece Yönetici)
                 </button>
              </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>

    {/* Integrated Wizard */}
    <Dialog open={revisionWizardOpen} onOpenChange={setRevisionWizardOpen}>
       <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white">
          <RevisionWizard 
             initialItem={{...item, level: type}} // Passing type as level
             onClose={() => setRevisionWizardOpen(false)}
             onSuccess={() => {
                setRevisionWizardOpen(false);
                onClose(); // Close detail panel too
             }}
          />
       </DialogContent>
    </Dialog>
    </>
  );
};

export default DetailPanel;