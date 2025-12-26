import React, { useState, useMemo } from 'react';
import { ChevronRight, ChevronDown, Target, TrendingUp, AlertTriangle, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Read-only Strategic Plan Tree View
 * Displays realization rates, budget summary, risks, and revision history
 */
const ActivityRealizationTree = ({
  hierarchyData,
  activities,
  realizationRecords,
  selectedItem,
  onSelectItem,
  calculateActivityCompletion,
  calculateIndicatorCompletion,
  calculateTargetCompletion,
  calculateObjectiveCompletion,
  calculateAreaCompletion,
}) => {
  const [expandedNodes, setExpandedNodes] = useState(new Set());

  // Build hierarchy with calculated completion rates
  const treeData = useMemo(() => {
    const { areas, objectives, targets, indicators } = hierarchyData;

    return (areas || []).map(area => {
      const areaObjectives = (objectives || []).filter(o =>
        o.strategic_area_id === area.id || o.strategicAreaId === area.id
      );

      return {
        ...area,
        type: 'Alan',
        completion: calculateAreaCompletion ? calculateAreaCompletion(area.id, areaObjectives) : 0,
        children: areaObjectives.map(obj => {
          const objTargets = (targets || []).filter(t =>
            t.objective_id === obj.id || t.objectiveId === obj.id
          );

          return {
            ...obj,
            type: 'Amaç',
            completion: calculateObjectiveCompletion ? calculateObjectiveCompletion(obj.id, objTargets) : 0,
            children: objTargets.map(target => {
              const targetIndicators = (indicators || []).filter(i =>
                i.target_id === target.id || i.targetId === target.id
              );
              const targetActivities = (activities || []).filter(a =>
                (a.target_id === target.id || a.targetId === target.id) &&
                (!a.indicator_id && !a.indicatorId)
              );

              return {
                ...target,
                type: 'Hedef',
                completion: calculateTargetCompletion ? calculateTargetCompletion(target.id, targetIndicators, targetActivities) : 0,
                children: [
                  ...targetIndicators.map(ind => {
                    const indActivities = (activities || []).filter(a =>
                      a.indicator_id === ind.id || a.indicatorId === ind.id
                    );
                    return {
                      ...ind,
                      type: 'Gösterge',
                      completion: calculateIndicatorCompletion ? calculateIndicatorCompletion(ind.id, indActivities) : 0,
                    };
                  }),
                  ...targetActivities.map(act => ({
                    ...act,
                    type: 'Faaliyet',
                    completion: calculateActivityCompletion ? calculateActivityCompletion(act.id) : 0,
                  })),
                ],
              };
            }),
          };
        }),
      };
    });
  }, [hierarchyData, activities, calculateActivityCompletion, calculateIndicatorCompletion, calculateTargetCompletion, calculateObjectiveCompletion, calculateAreaCompletion]);

  const toggleNode = (nodeId) => {
    setExpandedNodes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(nodeId)) {
        newSet.delete(nodeId);
      } else {
        newSet.add(nodeId);
      }
      return newSet;
    });
  };

  const renderNode = (node, level = 0) => {
    const hasChildren = node.children && node.children.length > 0;
    const isExpanded = expandedNodes.has(node.id);
    const isSelected = selectedItem?.id === node.id;

    return (
      <div key={node.id}>
        <div
          className={cn(
            'flex items-center gap-2 px-4 py-2 cursor-pointer hover:bg-gray-50 transition-colors',
            isSelected && 'bg-blue-50 border-l-4 border-blue-600'
          )}
          style={{ paddingLeft: `${level * 20 + 16}px` }}
          onClick={() => onSelectItem(node)}
        >
          {hasChildren && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleNode(node.id);
              }}
              className="p-1 hover:bg-gray-200 rounded"
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-600" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-600" />
              )}
            </button>
          )}
          {!hasChildren && <div className="w-6" />}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-blue-600 font-medium">{node.code}</span>
              <span className="text-sm text-gray-900 truncate">{node.name}</span>
            </div>
            <div className="flex items-center gap-4 mt-1">
              <span className="text-xs text-gray-600">
                Gerçekleşme: <span className="font-semibold text-gray-900">{node.completion?.toFixed(1) || '0.0'}%</span>
              </span>
            </div>
          </div>
        </div>

        {hasChildren && isExpanded && (
          <div>
            {node.children.map(child => renderNode(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="h-full">
      <div className="p-4 border-b border-gray-200 bg-gray-50">
        <h2 className="text-lg font-semibold text-gray-900">Stratejik Plan Ağacı</h2>
        <p className="text-xs text-gray-600 mt-1">Salt okunur görünüm</p>
      </div>
      <div className="py-2">
        {treeData.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            Veri bulunamadı
          </div>
        ) : (
          treeData.map(area => renderNode(area))
        )}
      </div>
    </div>
  );
};

export default ActivityRealizationTree;

