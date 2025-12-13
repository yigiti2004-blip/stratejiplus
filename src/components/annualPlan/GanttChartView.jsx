
import React, { useState, useRef, useEffect } from 'react';
import { useGanttData } from '@/hooks/useGanttData';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import GanttBar from './GanttBar';
import GanttTooltip from './GanttTooltip';

const MONTHS = [
  'Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 
  'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'
];

const GanttChartView = ({ year, setYear, onItemClick }) => {
  const [selectedMonth, setSelectedMonth] = useState('all');
  const [hoveredItem, setHoveredItem] = useState(null);
  const [cursorPos, setCursorPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef(null);

  const items = useGanttData(year, selectedMonth);

  // Clear hover on scroll to prevent stuck tooltip
  useEffect(() => {
    const handleScroll = () => setHoveredItem(null);
    window.addEventListener('scroll', handleScroll, true);
    return () => window.removeEventListener('scroll', handleScroll, true);
  }, []);

  // Generate grid columns based on view (Year vs Month)
  const getGridColumns = () => {
    if (selectedMonth === 'all') {
      return MONTHS.map((m, i) => ({ label: m.substring(0, 3), key: i }));
    } else {
      // Weekly view for selected month
      // Simple 4-week approximation for visual grid
      return Array.from({ length: 4 }).map((_, i) => ({ label: `H${i+1}`, key: i }));
    }
  };

  const gridColumns = getGridColumns();

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      {/* Controls Header */}
      <Card className="border-gray-200 shadow-sm bg-white">
        <CardContent className="p-4 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-4 text-xs font-medium text-gray-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-500"></span>
              Stratejik Plan
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-purple-600"></span>
              Kurumsal Süreklilik
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-emerald-500"></span>
              Yıla Özgü / Proje
            </div>
          </div>

          {/* Time Controls */}
          <div className="flex items-center gap-3 ml-auto">
             <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1 h-9">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear(year - 1)}>
                  <ChevronLeft className="w-4 h-4" />
                </Button>
                <div className="px-2 font-bold text-sm min-w-[50px] text-center">{year}</div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => setYear(year + 1)}>
                  <ChevronRight className="w-4 h-4" />
                </Button>
             </div>

             <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Dönem Seç" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tüm Yıl</SelectItem>
                {MONTHS.map((m, i) => (
                  <SelectItem key={i} value={i.toString()}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Main Gantt Area */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden flex flex-col relative min-h-[400px]">
        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-400">
             <Calendar className="w-12 h-12 mb-3 opacity-20" />
             <p>Bu dönem için görüntülenecek kayıt bulunamadı.</p>
          </div>
        ) : (
          <div className="flex flex-1 overflow-x-auto custom-scrollbar" ref={containerRef}>
            {/* Left Sidebar (Task Names) - Sticky */}
            <div className="flex-shrink-0 w-64 bg-white border-r border-gray-200 z-10 sticky left-0 shadow-[4px_0_12px_-4px_rgba(0,0,0,0.1)]">
              <div className="h-10 bg-gray-50 border-b border-gray-200 flex items-center px-4 text-xs font-bold text-gray-500 uppercase tracking-wider">
                Faaliyet / İş Adı
              </div>
              <div className="py-2">
                {items.map(item => (
                  <div key={item.id} className="h-10 px-4 flex flex-col justify-center border-b border-gray-50 last:border-0 hover:bg-gray-50 transition-colors">
                    <div className="text-sm font-medium text-gray-900 truncate" title={item.workName}>
                      {item.workName}
                    </div>
                    <div className="text-[10px] text-gray-500 truncate">
                      {item.responsibleUnit || '-'}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Timeline Grid */}
            <div className="flex-1 min-w-[800px] relative bg-white">
              {/* Header Row (Months/Weeks) */}
              <div className="h-10 bg-gray-50 border-b border-gray-200 flex sticky top-0 z-10">
                {gridColumns.map(col => (
                  <div key={col.key} className="flex-1 border-r border-gray-200 last:border-0 flex items-center justify-center text-xs font-bold text-gray-500 uppercase">
                    {col.label}
                  </div>
                ))}
              </div>

              {/* Grid Lines Background */}
              <div className="absolute inset-0 top-10 pointer-events-none flex">
                {gridColumns.map(col => (
                  <div key={col.key} className="flex-1 border-r border-dashed border-gray-100 last:border-0 h-full"></div>
                ))}
              </div>
              
              {/* Bars Container */}
              <div className="py-2 relative z-0">
                {items.map(item => (
                  <div key={item.id} className="h-10 relative w-full flex items-center px-1 group hover:bg-gray-50/50">
                    <GanttBar 
                      item={item} 
                      onHover={(i, pos) => { setHoveredItem(i); setCursorPos(pos); }}
                      onLeave={() => setHoveredItem(null)}
                      onClick={onItemClick}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tooltip Portal */}
      {hoveredItem && (
        <GanttTooltip item={hoveredItem} position={cursorPos} />
      )}
    </div>
  );
};

export default GanttChartView;
