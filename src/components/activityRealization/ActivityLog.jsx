import React from 'react';
import { Calendar, User, FileText } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

/**
 * Activity Log Section
 * Chronological timeline of immutable realization records (like bank statement)
 */
const ActivityLog = ({ activity, realizationRecords }) => {
  // Records are already sorted chronologically by the hook

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        Faaliyet Günlüğü
      </h3>

      {realizationRecords.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          Henüz gerçekleşme kaydı bulunmamaktadır.
        </div>
      ) : (
        <ScrollArea className="h-[400px]">
          <div className="space-y-4">
            {realizationRecords.map((record, index) => (
              <div
                key={record.id}
                className="border-l-4 border-blue-500 pl-4 py-3 bg-gray-50 rounded-r-lg"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900">
                      {new Date(record.record_date || record.created_at).toLocaleDateString('tr-TR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-gray-600" />
                    <span className="text-xs text-gray-600">
                      {record.created_by || 'Sistem'}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-4">
                    <span className="text-sm text-gray-700">Tamamlanma:</span>
                    <span className="text-sm font-semibold text-gray-900">
                      {Number(record.completion_percentage).toFixed(1)}%
                    </span>
                  </div>

                  <div>
                    <span className="text-sm text-gray-700">Yapılan İş:</span>
                    <p className="text-sm text-gray-900 mt-1">{record.work_performed}</p>
                  </div>

                  {record.expense_flag === 'Yes' && (
                    <div className="flex items-center gap-2 text-yellow-700 bg-yellow-50 px-2 py-1 rounded text-xs">
                      <span className="text-xs font-bold">₺</span>
                      Harcama işaretli
                    </div>
                  )}

                  {record.detailed_description && (
                    <div>
                      <span className="text-sm text-gray-700">Açıklama:</span>
                      <p className="text-sm text-gray-900 mt-1">{record.detailed_description}</p>
                    </div>
                  )}

                  {record.evidence_url && (
                    <div>
                      <a
                        href={record.evidence_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-600 hover:underline flex items-center gap-1"
                      >
                        <FileText className="w-3 h-3" />
                        Kanıt: {record.evidence_file_name || 'Dosya'}
                      </a>
                    </div>
                  )}

                  {record.outcome_note && (
                    <div>
                      <span className="text-sm text-gray-700">Sonuç Notu:</span>
                      <p className="text-sm text-gray-900 mt-1 italic">{record.outcome_note}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
};

export default ActivityLog;

