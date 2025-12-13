
import React from 'react';
import { Calendar, CheckCircle2, FileText, ChevronRight, User, TrendingUp, Wallet } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDate } from '@/lib/utils';

const STATUS_BADGES = {
  'Başlamadı': 'bg-gray-100 text-gray-700 border-gray-200',
  'Başladı': 'bg-blue-100 text-blue-700 border-blue-200',
  'Devam ediyor': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Tamamlandı': 'bg-green-100 text-green-700 border-green-200',
  'Askıya alındı': 'bg-orange-100 text-orange-700 border-orange-200',
  'İptal edildi': 'bg-red-100 text-red-700 border-red-200'
};

const MonitoringRecordList = ({ records, onRecordClick }) => {
  if (!records || records.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg border border-dashed border-gray-300">
        <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="w-6 h-6 text-gray-400" />
        </div>
        <h3 className="text-gray-900 font-medium">İzleme kaydı bulunamadı</h3>
        <p className="text-sm text-gray-500 mt-1">Henüz bu faaliyet için bir izleme kaydı girilmemiş.</p>
      </div>
    );
  }

  return (
    <div className="relative border-l-2 border-gray-200 ml-4 space-y-8 py-4">
      {records.map((record) => {
        // Format indicator values for display
        const indicatorUpdates = record.indicatorValues ? Object.entries(record.indicatorValues).length : 0;
        
        return (
          <div 
            key={record.id} 
            className="relative pl-8 group cursor-pointer"
            onClick={() => onRecordClick(record)}
          >
            {/* Timeline Node */}
            <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-white border-2 border-blue-500 group-hover:bg-blue-50 transition-colors"></div>

            {/* Content Card */}
            <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 hover:shadow-md transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-sm font-bold text-gray-900">{formatDate(record.recordDate)}</span>
                  <Badge className={`${STATUS_BADGES[record.status] || 'bg-gray-100'} border`}>
                    {record.status}
                  </Badge>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500" />
              </div>

              <p className="text-sm text-gray-600 line-clamp-2 mb-3">
                {record.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-gray-500 border-t border-gray-50 pt-3">
                {record.completionPercentage && (
                  <div className="flex items-center gap-1 font-medium text-gray-700">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />
                    %{record.completionPercentage} Tamamlandı
                  </div>
                )}

                {indicatorUpdates > 0 && (
                   <div className="flex items-center gap-1 font-medium text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                      <TrendingUp className="w-3.5 h-3.5" />
                      {indicatorUpdates} Gösterge Güncellendi
                   </div>
                )}

                {record.budgetStatus && record.budgetStatus !== "Henüz harcama girişi yapılmadı" && (
                   <div className="flex items-center gap-1 text-emerald-600" title={record.budgetStatus}>
                      <Wallet className="w-3.5 h-3.5" />
                      Bütçe Durumu Girildi
                   </div>
                )}
                
                {record.evidenceFiles?.length > 0 && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-3.5 h-3.5 text-blue-600" />
                    {record.evidenceFiles.length} Kanıt Dosyası
                  </div>
                )}

                <div className="flex items-center gap-1 ml-auto">
                  <User className="w-3.5 h-3.5" />
                  {record.recordedBy || 'Sistem'}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default MonitoringRecordList;
