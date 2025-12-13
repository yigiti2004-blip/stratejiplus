
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { useActivityMonitoring } from '@/hooks/useActivityMonitoring';
import MonitoringRecordForm from './MonitoringRecordForm';
import MonitoringRecordList from './MonitoringRecordList';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { FileText, Download, Trash2, Calendar, User, CheckCircle2, TrendingUp, Wallet } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

const STATUS_BADGES = {
  'Başlamadı': 'bg-gray-100 text-gray-700 border-gray-200',
  'Başladı': 'bg-blue-100 text-blue-700 border-blue-200',
  'Devam ediyor': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Tamamlandı': 'bg-green-100 text-green-700 border-green-200',
  'Askıya alındı': 'bg-orange-100 text-orange-700 border-orange-200',
  'İptal edildi': 'bg-red-100 text-red-700 border-red-200'
};

const ActivityMonitoringTab = ({ activity, indicators, currentUser }) => {
  const { records, loading, addRecord, updateRecord, deleteRecord } = useActivityMonitoring(activity.id);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState(null);
  const { toast } = useToast();

  const handleSave = (data) => {
    try {
      addRecord(data);
      setIsFormOpen(false);
      toast({
        title: "Başarılı",
        description: "İzleme kaydı başarıyla eklendi.",
      });
    } catch (error) {
       toast({
        title: "Hata",
        description: "Kayıt eklenirken bir hata oluştu.",
        variant: "destructive"
      });
    }
  };
  
  const handleDelete = (id) => {
    if(window.confirm('Bu kaydı silmek istediğinize emin misiniz?')) {
       deleteRecord(id);
       setSelectedRecord(null);
       toast({
        title: "Silindi",
        description: "İzleme kaydı silindi.",
      });
    }
  };

  // Find related indicators for this activity's target
  const relatedIndicators = indicators.filter(ind => ind.targetId === activity.targetId);

  return (
    <div className="space-y-6">
      
      {!isFormOpen && (
        <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg border border-gray-200">
          <div>
            <h3 className="font-bold text-gray-900">Faaliyet İzleme Geçmişi</h3>
            <p className="text-sm text-gray-500">Bu faaliyete ait tüm gelişmeler ve kanıtlar.</p>
          </div>
          <Button onClick={() => setIsFormOpen(true)} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Yeni İzleme Kaydı
          </Button>
        </div>
      )}

      {isFormOpen && (
        <MonitoringRecordForm 
          activityId={activity.id}
          activityCode={activity.code}
          relatedIndicators={relatedIndicators}
          onSave={handleSave}
          onCancel={() => setIsFormOpen(false)}
          currentUser={currentUser}
        />
      )}

      <MonitoringRecordList records={records} onRecordClick={setSelectedRecord} />

      {/* Detail Dialog */}
      <Dialog open={!!selectedRecord} onOpenChange={(open) => !open && setSelectedRecord(null)}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-gray-100 bg-gray-50/50">
             <div className="flex justify-between items-start pr-8">
               <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Badge className={`${STATUS_BADGES[selectedRecord?.status]} border px-3 py-1`}>
                      {selectedRecord?.status}
                    </Badge>
                    <span className="text-sm text-gray-500 font-mono flex items-center gap-1">
                       <Calendar className="w-3.5 h-3.5"/> {formatDate(selectedRecord?.recordDate)}
                    </span>
                  </div>
                  <DialogTitle className="text-xl">İzleme Kaydı Detayı</DialogTitle>
               </div>
               {selectedRecord?.completionPercentage && (
                 <div className="text-right">
                    <div className="text-xs text-gray-500 uppercase font-bold">Tamamlanma</div>
                    <div className="text-2xl font-bold text-green-600">%{selectedRecord.completionPercentage}</div>
                 </div>
               )}
             </div>
          </DialogHeader>
          
          <ScrollArea className="flex-1 p-6">
            <div className="space-y-6">
              
              <div className="space-y-2">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide">Açıklama</h4>
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 text-gray-700 text-sm whitespace-pre-line leading-relaxed">
                  {selectedRecord?.description}
                </div>
              </div>

              {/* Indicator Values Section */}
              {selectedRecord?.indicatorValues && Object.keys(selectedRecord.indicatorValues).length > 0 && (
                 <div className="space-y-2">
                   <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                      <TrendingUp className="w-4 h-4"/> Gösterge Değerleri
                   </h4>
                   <div className="bg-indigo-50 rounded-lg border border-indigo-100 p-3 space-y-2">
                      {Object.entries(selectedRecord.indicatorValues).map(([indId, value]) => {
                         const ind = relatedIndicators.find(i => i.id === indId);
                         return ind ? (
                           <div key={indId} className="flex justify-between items-center text-sm border-b border-indigo-100 last:border-0 pb-1 last:pb-0">
                             <div className="flex-1 truncate pr-4 text-indigo-900">
                               <span className="font-bold mr-1">{ind.code}</span> {ind.name}
                             </div>
                             <div className="font-bold font-mono text-indigo-700 bg-white px-2 py-0.5 rounded border border-indigo-200">
                               {value} <span className="text-xs text-gray-400 font-normal">/ {ind.targetValue || '-'}</span>
                             </div>
                           </div>
                         ) : null;
                      })}
                   </div>
                 </div>
              )}

              {/* Budget Status Section */}
              <div className="space-y-2">
                 <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                    <Wallet className="w-4 h-4"/> Bütçe Durumu
                 </h4>
                 <div className="p-3 bg-white border border-gray-200 rounded-lg text-sm text-gray-700 font-medium">
                    {selectedRecord?.budgetStatus || "Bilgi yok"}
                 </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide flex items-center gap-2">
                  <FileText className="w-4 h-4"/> Kanıt Dosyaları ({selectedRecord?.evidenceFiles?.length || 0})
                </h4>
                
                {selectedRecord?.evidenceFiles?.length > 0 ? (
                  <div className="grid grid-cols-1 gap-2">
                    {selectedRecord.evidenceFiles.map((file, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:border-blue-300 transition-colors group">
                         <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 rounded bg-blue-50 flex items-center justify-center text-blue-600 font-bold text-xs uppercase flex-shrink-0">
                               {file.name.split('.').pop()}
                            </div>
                            <div className="min-w-0">
                               <div className="text-sm font-medium text-gray-900 truncate">{file.name}</div>
                               <div className="text-xs text-gray-500">{(file.size / 1024).toFixed(0)} KB • {formatDate(file.uploadedAt)}</div>
                            </div>
                         </div>
                         <a href={file.data} download={file.name} className="p-2 text-gray-400 hover:text-blue-600 transition-colors" title="İndir">
                            <Download className="w-4 h-4" />
                         </a>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-sm text-gray-500 italic">Kanıt dosyası yüklenmemiş.</div>
                )}
              </div>

              <div className="border-t border-gray-100 pt-4 flex justify-between items-center">
                 <div className="flex items-center gap-2 text-xs text-gray-500">
                    <User className="w-3.5 h-3.5" />
                    Kaydeden: <span className="font-medium text-gray-900">{selectedRecord?.recordedBy}</span>
                 </div>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   className="text-red-600 hover:text-red-700 hover:bg-red-50"
                   onClick={() => handleDelete(selectedRecord.id)}
                 >
                    <Trash2 className="w-4 h-4 mr-2" /> Kaydı Sil
                 </Button>
              </div>

            </div>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityMonitoringTab;
