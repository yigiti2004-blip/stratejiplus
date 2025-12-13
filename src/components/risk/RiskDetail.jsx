import React from 'react';
import { ArrowLeft, Edit2, AlertTriangle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { getRiskLevel } from '@/lib/calculations';
import { RISK_TYPES } from '@/data/riskTypes';
import ActionPlanSection from './ActionPlanSection';
import MonitoringLogSection from './MonitoringLogSection';

const RiskDetail = ({ risk, onBack, onEdit, projects, spData, riskActions }) => {
  const level = getRiskLevel(risk.score);
  const typeDef = RISK_TYPES.find(t => t.id === risk.riskType);

  // Helper to get relation text
  const getRelationText = () => {
     if (risk.riskType === 'sp') {
        const item = (spData[risk.relatedRecordType] || []).find(i => i.id === risk.relatedRecordId);
        return item ? `${risk.relatedRecordType}: ${item.code} - ${item.name}` : `${risk.relatedRecordType} (Bulunamadı)`;
     }
     if (risk.riskType === 'surec') return `Süreç: ${risk.processName} (${risk.processCategory})`;
     if (risk.riskType === 'proje') {
        const proj = projects.find(p => p.id === risk.projectId);
        return proj ? `Proje: ${proj.name}` : 'Proje (Bulunamadı)';
     }
     return 'Kurumsal (Genel)';
  };

  return (
    <div className="space-y-6 h-full flex flex-col">
       {/* Header */}
       <div className="flex items-center justify-between border-b pb-4">
          <div className="flex items-center gap-4">
             <Button variant="ghost" size="icon" onClick={onBack}><ArrowLeft className="w-5 h-5"/></Button>
             <div>
                <div className="flex items-center gap-2">
                   <Badge className={typeDef?.color}>{typeDef?.label}</Badge>
                   <span className="text-sm text-gray-500">{risk.status}</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mt-1">{risk.name}</h1>
             </div>
          </div>
          <Button variant="outline" onClick={() => onEdit(risk)}>
             <Edit2 className="w-4 h-4 mr-2"/> Düzenle
          </Button>
       </div>

       <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 overflow-y-auto pr-2">
          {/* LEFT COLUMN: INFO */}
          <div className="space-y-6">
             <div className="bg-white p-6 rounded-xl border shadow-sm space-y-4">
                <h3 className="font-bold text-gray-900 border-b pb-2">Risk Bilgileri</h3>
                
                <div className="grid grid-cols-2 gap-4 text-center py-2">
                   <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500 uppercase">Olasılık</div>
                      <div className="text-xl font-bold text-gray-900">{risk.probability}</div>
                   </div>
                   <div className="bg-gray-50 p-2 rounded">
                      <div className="text-xs text-gray-500 uppercase">Etki</div>
                      <div className="text-xl font-bold text-gray-900">{risk.impact}</div>
                   </div>
                   <div className={`col-span-2 p-3 rounded ${level.bg} ${level.text}`}>
                      <div className="text-xs uppercase opacity-70">Risk Skoru & Seviyesi</div>
                      <div className="text-2xl font-bold flex items-center justify-center gap-2">
                         {risk.score} <span className="text-lg font-normal">({level.label})</span>
                      </div>
                   </div>
                </div>

                <div className="space-y-3 text-sm">
                   <div>
                      <span className="block text-gray-500 text-xs">Açıklama</span>
                      <p className="text-gray-900">{risk.description || '-'}</p>
                   </div>
                   <div>
                      <span className="block text-gray-500 text-xs">İlişkili Kayıt</span>
                      <p className="font-medium text-blue-700">{getRelationText()}</p>
                   </div>
                   <div className="grid grid-cols-2 gap-4">
                      <div>
                         <span className="block text-gray-500 text-xs">Sorumlu</span>
                         <p>{risk.responsible || '-'}</p>
                      </div>
                      <div>
                         <span className="block text-gray-500 text-xs">İzleme Periyodu</span>
                         <p>{risk.monitoringPeriod}</p>
                      </div>
                   </div>
                </div>
             </div>
          </div>

          {/* MIDDLE & RIGHT: ACTIONS & LOGS */}
          <div className="lg:col-span-2 space-y-6">
             <ActionPlanSection 
                risk={risk} 
                onAddAction={riskActions.addActionPlan} 
                onUpdateAction={riskActions.updateActionPlan} 
                onDeleteAction={riskActions.deleteActionPlan} 
             />
             
             <div className="border-t pt-6"></div>
             
             <MonitoringLogSection 
                risk={risk}
                onAddLog={riskActions.addMonitoringLog}
             />
          </div>
       </div>
    </div>
  );
};

export default RiskDetail;