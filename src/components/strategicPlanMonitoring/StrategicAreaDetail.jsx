
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Target, Layers } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useIndicatorCalculations } from '@/hooks/useIndicatorCalculations';

const StrategicAreaDetail = ({ area, objectives, targets, activities, onBack }) => {
  const { calculateObjectiveCompletion, calculateTargetCompletion, getProgressColor } = useIndicatorCalculations();

  // Filter for this area
  const areaObjectives = objectives.filter(o => o.strategicAreaId === area.id);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-blue-600 border-blue-200 bg-blue-50">
              {area.code}
            </Badge>
            <span className="text-sm font-medium text-gray-500">Stratejik Alan Detayı</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900">{area.name}</h2>
        </div>
      </div>

      <div className="grid gap-6">
        {areaObjectives.map(objective => {
          const objectiveTargets = targets.filter(t => t.objectiveId === objective.id);
          const objCompletion = Math.round(calculateObjectiveCompletion(objective.id));
          const objColor = getProgressColor(objCompletion);

          return (
            <Card key={objective.id} className="border-l-4 border-l-indigo-500 shadow-sm">
              <CardHeader className="pb-3 border-b border-gray-100 bg-gray-50/50">
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    <Target className="w-5 h-5 text-indigo-600" />
                  </div>
                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                       <div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                            {objective.code}
                          </span>
                          <CardTitle className="text-lg mt-1">{objective.name}</CardTitle>
                       </div>
                       <div className="text-right">
                          <span className="text-sm font-bold text-gray-700">%{objCompletion}</span>
                          <div className="w-24 h-1.5 bg-gray-200 rounded-full mt-1">
                             <div className={`h-full rounded-full ${objColor}`} style={{width: `${objCompletion}%`}}></div>
                          </div>
                       </div>
                    </div>
                    <p className="text-sm text-gray-500 mt-1 font-normal">{objective.description}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 uppercase tracking-wider">Hedefler</h4>
                <div className="space-y-3">
                  {objectiveTargets.map(target => {
                    const targetActivities = activities.filter(a => a.targetId === target.id);
                    const targetCompletion = Math.round(calculateTargetCompletion(target.id));
                    const targetColor = getProgressColor(targetCompletion);

                    return (
                      <div key={target.id} className="flex items-start gap-3 p-3 bg-white border border-gray-200 rounded-lg hover:border-indigo-200 transition-colors">
                        <Badge variant="outline" className="mt-0.5 font-mono">
                          {target.code}
                        </Badge>
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                             <div className="font-medium text-gray-900 pr-4">{target.name}</div>
                             <div className="text-right min-w-[60px]">
                                <span className="text-xs font-bold text-gray-700">%{targetCompletion}</span>
                                <div className="w-16 h-1 bg-gray-100 rounded-full mt-1 ml-auto">
                                   <div className={`h-full rounded-full ${targetColor}`} style={{width: `${targetCompletion}%`}}></div>
                                </div>
                             </div>
                          </div>
                          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                             <span>{targetActivities.length} Faaliyet</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  {objectiveTargets.length === 0 && (
                    <div className="text-sm text-gray-400 italic">Bu amaç için henüz hedef tanımlanmamış.</div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
        {areaObjectives.length === 0 && (
          <div className="text-center py-12 text-gray-500 bg-gray-50 rounded-lg border border-dashed border-gray-200">
            Bu alana bağlı amaç bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
};

export default StrategicAreaDetail;
