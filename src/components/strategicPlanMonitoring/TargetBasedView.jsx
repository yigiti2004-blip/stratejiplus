
import React, { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, ArrowRight } from 'lucide-react';
import { useIndicatorCalculations } from '@/hooks/useIndicatorCalculations';

const TargetBasedView = ({ areas, objectives, targets, activities, indicators }) => {
  const { calculateTargetCompletion, getProgressColor } = useIndicatorCalculations();
  
  const enrichedTargets = useMemo(() => {
    return targets.map(target => {
      const objective = objectives.find(o => o.id === target.objectiveId);
      const area = objective ? areas.find(a => a.id === objective.strategicAreaId) : null;
      const relatedActivities = activities.filter(a => a.targetId === target.id);
      const relatedIndicators = indicators.filter(i => i.targetId === target.id);
      
      return {
        ...target,
        objectiveCode: objective?.code,
        objectiveName: objective?.name,
        areaCode: area?.code,
        areaName: area?.name,
        activityCount: relatedActivities.length,
        indicatorCount: relatedIndicators.length
      };
    });
  }, [targets, objectives, areas, activities, indicators]);

  return (
    <div className="space-y-4">
      {enrichedTargets.map(target => {
        const completion = Math.round(calculateTargetCompletion(target.id));
        const color = getProgressColor(completion);

        return (
          <Card key={target.id} className="border-gray-200 hover:border-blue-200 transition-colors">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-3">
                  <div className="flex flex-wrap gap-2 items-center">
                    <Badge variant="outline" className="font-mono bg-emerald-50 text-emerald-700 border-emerald-200">
                      {target.code}
                    </Badge>
                    {target.objectiveCode && (
                       <span className="text-xs text-gray-400 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" /> {target.objectiveCode}
                       </span>
                    )}
                    {target.areaCode && (
                       <span className="text-xs text-gray-400 flex items-center gap-1">
                          <ArrowRight className="w-3 h-3" /> {target.areaCode}
                       </span>
                    )}
                  </div>
                  
                  <h3 className="text-lg font-bold text-gray-900">{target.name}</h3>
                  
                  <div className="flex items-center gap-4 pt-2">
                     <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <span className="font-bold text-gray-900 mr-1">{target.activityCount}</span> Faaliyet
                     </div>
                     <div className="text-sm text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-100">
                        <span className="font-bold text-gray-900 mr-1">{target.indicatorCount}</span> Gösterge
                     </div>
                  </div>
                </div>

                {/* Progress Circle */}
                <div className="flex flex-col items-center justify-center p-4 bg-gray-50 rounded-lg min-w-[140px]">
                   <Target className={`w-8 h-8 mb-2 ${color.replace('bg-', 'text-')}`} />
                   <span className="text-sm font-medium text-gray-600">Performans</span>
                   <div className="text-2xl font-bold text-gray-900">%{completion}</div>
                   <div className="w-full h-1.5 bg-gray-200 rounded-full mt-2">
                      <div className={`h-full rounded-full ${color}`} style={{width: `${completion}%`}}></div>
                   </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
      
      {enrichedTargets.length === 0 && (
         <div className="text-center py-12 text-gray-500">
            Hedef kaydı bulunamadı.
         </div>
      )}
    </div>
  );
};

export default TargetBasedView;
