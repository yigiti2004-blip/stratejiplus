import React from 'react';
import { useRevisionData } from '@/hooks/useRevisionData';
import { Clock, CheckCircle, ArrowRight } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

const RevisionHistory = ({ itemId }) => {
  const { getRevisionsByItemId } = useRevisionData();
  const revisions = itemId ? getRevisionsByItemId(itemId) : [];

  if (!itemId) return <div className="text-center py-10 text-gray-400">Bir öğe seçiniz.</div>;
  if (revisions.length === 0) return <div className="text-center py-10 text-gray-400">Bu öğe için revizyon geçmişi bulunmamaktadır.</div>;

  return (
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
  );
};

export default RevisionHistory;