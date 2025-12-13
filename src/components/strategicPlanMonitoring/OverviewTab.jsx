
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Layers, ChevronRight, Target, ListChecks, TrendingUp } from 'lucide-react';
import { useIndicatorCalculations } from '@/hooks/useIndicatorCalculations';

const OverviewTab = ({ areas, getAreaStats, onAreaClick }) => {
  const { calculateStrategicAreaCompletion, getProgressColor, getProgressBadgeColor } = useIndicatorCalculations();

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {areas.map(area => {
        const stats = getAreaStats(area.id);
        const completionRate = Math.round(calculateStrategicAreaCompletion(area.id));
        const colorClass = getProgressColor(completionRate);
        const badgeClass = getProgressBadgeColor(completionRate);

        return (
          <Card 
            key={area.id} 
            className="hover:shadow-md transition-shadow cursor-pointer border-l-4 border-l-blue-500"
            onClick={() => onAreaClick(area)}
          >
            <CardContent className="p-6 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                    {area.code}
                  </span>
                  <h3 className="font-bold text-gray-900 mt-2 line-clamp-2 min-h-[3rem]">
                    {area.name}
                  </h3>
                </div>
                <div className="flex flex-col items-end">
                   <span className={`text-sm font-bold px-2 py-1 rounded-full ${badgeClass}`}>
                     %{completionRate}
                   </span>
                   <span className="text-xs text-gray-500 mt-1">Tamamlanma</span>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                <div 
                  className={`h-full ${colorClass} transition-all duration-500`}
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{stats.objectivesCount}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <Target className="w-3 h-3" /> Amaç
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{stats.targetsCount}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <TrendingUp className="w-3 h-3" /> Hedef
                  </div>
                </div>
                <div className="text-center p-2 bg-gray-50 rounded">
                  <div className="text-lg font-bold text-gray-900">{stats.activitiesCount}</div>
                  <div className="text-xs text-gray-500 flex items-center justify-center gap-1">
                    <ListChecks className="w-3 h-3" /> Faaliyet
                  </div>
                </div>
              </div>

              <Button variant="ghost" className="w-full justify-between text-blue-600 hover:text-blue-700 hover:bg-blue-50">
                Detayları Gör <ChevronRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default OverviewTab;
