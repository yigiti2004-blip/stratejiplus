
import React from 'react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const GanttTooltip = ({ item, position }) => {
  if (!item) return null;

  const style = {
    top: `${position.y + 10}px`,
    left: `${position.x + 10}px`,
  };

  const getSourceLabel = (type) => {
    switch(type) {
      case 'stratejik-plan': return 'Stratejik Plan';
      case 'kurumsal-süreklilik': return 'Kurumsal Süreklilik';
      case 'yıla-özgü': return 'Yıla Özgü / Proje';
      default: return 'Diğer';
    }
  };

  return (
    <div 
      className="fixed z-50 bg-white border border-gray-200 shadow-xl rounded-lg p-3 w-72 pointer-events-none animate-in fade-in zoom-in-95 duration-150"
      style={style}
    >
      <div className="flex items-center gap-2 mb-2">
        <div className={`w-2 h-2 rounded-full ${
          item.sourceType === 'stratejik-plan' ? 'bg-blue-500' :
          item.sourceType === 'kurumsal-süreklilik' ? 'bg-purple-600' :
          'bg-emerald-500'
        }`} />
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {getSourceLabel(item.sourceType)}
        </span>
      </div>
      
      <h4 className="font-bold text-gray-900 text-sm mb-1 leading-tight">{item.workName}</h4>
      
      {item.responsibleUnit && (
        <div className="text-xs text-gray-600 mb-2 font-medium bg-gray-50 px-2 py-1 rounded inline-block">
          {item.responsibleUnit}
        </div>
      )}

      <div className="border-t border-gray-100 pt-2 mt-1">
        <div className="flex justify-between text-xs text-gray-500">
          <span>Başlangıç:</span>
          <span className="font-mono font-medium text-gray-700">{formatDate(item.startDate)}</span>
        </div>
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Bitiş:</span>
          <span className="font-mono font-medium text-gray-700">{formatDate(item.endDate)}</span>
        </div>
      </div>
      
      {item.isReadOnly && (
        <div className="mt-2 text-[10px] text-blue-600 italic text-right">
          *SP Modülünden otomatik çekilmiştir
        </div>
      )}
    </div>
  );
};

export default GanttTooltip;
