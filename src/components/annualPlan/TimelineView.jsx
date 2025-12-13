
import React from 'react';
import { Calendar, User, Info, ArrowRight } from 'lucide-react';
import { formatDate } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

const TimelineView = ({ items, onEdit, loading }) => {
  if (loading) {
    return <div className="p-12 text-center text-gray-500">Yükleniyor...</div>;
  }

  if (!items || items.length === 0) {
    return (
      <div className="p-12 text-center bg-gray-50 rounded-lg border border-dashed border-gray-200">
        <Calendar className="w-10 h-10 mx-auto text-gray-300 mb-2" />
        <h3 className="text-lg font-medium text-gray-900">Kayıt Bulunamadı</h3>
        <p className="text-gray-500">Seçilen kriterlere uygun planlanmış iş bulunmamaktadır.</p>
      </div>
    );
  }

  const getSourceStyle = (type) => {
    switch (type) {
      case 'stratejik-plan':
        return {
          bar: 'bg-blue-500 hover:bg-blue-600',
          bg: 'bg-blue-50',
          border: 'border-blue-100',
          text: 'text-blue-700',
          label: 'Stratejik Plan'
        };
      case 'kurumsal-süreklilik':
        return {
          bar: 'bg-purple-600 hover:bg-purple-700',
          bg: 'bg-purple-50',
          border: 'border-purple-100',
          text: 'text-purple-700',
          label: 'Kurumsal Süreklilik'
        };
      case 'yıla-özgü':
        return {
          bar: 'bg-emerald-500 hover:bg-emerald-600',
          bg: 'bg-emerald-50',
          border: 'border-emerald-100',
          text: 'text-emerald-700',
          label: 'Yıla Özgü'
        };
      default:
        return {
          bar: 'bg-gray-500',
          bg: 'bg-gray-50',
          border: 'border-gray-100',
          text: 'text-gray-700',
          label: 'Diğer'
        };
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3">
        {items.map((item) => {
          const style = getSourceStyle(item.sourceType);
          const start = new Date(item.startDate);
          const end = new Date(item.endDate);
          // Calculate duration in days for display info
          const duration = Math.ceil((end - start) / (1000 * 60 * 60 * 24)) + 1;

          return (
            <div 
              key={item.id} 
              className={`group relative flex items-stretch bg-white rounded-lg border transition-all hover:shadow-md cursor-pointer ${style.border}`}
              onClick={() => onEdit(item)}
            >
              {/* Left Color Bar */}
              <div className={`w-2 rounded-l-lg ${style.bar} flex-shrink-0`}></div>

              {/* Content */}
              <div className="flex-1 p-4 flex flex-col md:flex-row md:items-center gap-4">
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="outline" className={`text-xs font-bold border ${style.bg} ${style.text}`}>
                      {style.label}
                    </Badge>
                    <span className="text-xs text-gray-400 font-mono">
                      #{item.sourceType === 'stratejik-plan' ? 'SP' : item.sourceType === 'kurumsal-süreklilik' ? 'KS' : 'YP'}
                    </span>
                  </div>
                  <h4 className="font-bold text-gray-900 truncate pr-2">{item.workName}</h4>
                  <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                    <div className="flex items-center gap-1.5">
                       <Calendar className="w-3.5 h-3.5" />
                       <span>{formatDate(item.startDate)}</span>
                       <ArrowRight className="w-3 h-3 text-gray-300" />
                       <span>{formatDate(item.endDate)}</span>
                       <span className="text-xs bg-gray-100 px-1.5 rounded ml-1 text-gray-600">{duration} gün</span>
                    </div>
                  </div>
                </div>

                <div className="md:w-48 flex items-center gap-2 text-sm text-gray-600 border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                   <User className="w-4 h-4 text-gray-400" />
                   <span className="truncate" title={item.responsibleUnit}>{item.responsibleUnit || 'Birim belirtilmedi'}</span>
                </div>

                {/* Edit hint */}
                <div className="hidden group-hover:flex absolute right-4 top-4 bg-white shadow-sm border border-gray-200 p-1.5 rounded-full text-gray-400">
                  <Info className="w-4 h-4" />
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineView;
