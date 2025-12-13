import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RISK_TYPES, RISK_STATUSES, MONITORING_PERIODS, SP_RECORD_TYPES } from '@/data/riskTypes';
import { PROCESS_CATEGORIES } from '@/data/processCategories';

const RiskForm = ({ isOpen, onClose, onSave, editingRisk, projects, spData }) => {
  const [formData, setFormData] = useState({
    riskType: 'sp',
    name: '',
    description: '',
    probability: 3,
    impact: 3,
    responsible: '',
    status: 'Aktif',
    monitoringPeriod: '6 Aylık',
    
    // Dynamic fields
    relatedRecordType: 'Stratejik Alan',
    relatedRecordId: '',
    processName: '',
    processCategory: '',
    projectId: ''
  });

  useEffect(() => {
    if (editingRisk) {
      setFormData(editingRisk);
    } else {
      setFormData({
        riskType: 'sp',
        name: '',
        description: '',
        probability: 3,
        impact: 3,
        responsible: '',
        status: 'Aktif',
        monitoringPeriod: '6 Aylık',
        relatedRecordType: 'Stratejik Alan',
        relatedRecordId: '',
        processName: '',
        processCategory: '',
        projectId: ''
      });
    }
  }, [editingRisk, isOpen]);

  const handleSave = () => {
    if (!formData.name) return;
    onSave(formData);
    onClose();
  };

  // --- Dynamic Content Renderers ---
  const renderSPFields = () => (
    <div className="grid grid-cols-2 gap-4 border-l-2 border-blue-200 pl-4 py-2 bg-blue-50/50 rounded-r-md">
       <div className="space-y-2">
         <Label>İlişkili Kayıt Türü</Label>
         <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={formData.relatedRecordType}
            onChange={e => setFormData({...formData, relatedRecordType: e.target.value, relatedRecordId: ''})}
         >
            {SP_RECORD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
         </select>
       </div>
       <div className="space-y-2">
         <Label>İlişkili Kayıt</Label>
         <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={formData.relatedRecordId}
            onChange={e => setFormData({...formData, relatedRecordId: e.target.value})}
         >
            <option value="">Seçiniz...</option>
            {/* Logic to filter SP data based on type */}
            {(spData[formData.relatedRecordType] || []).map(item => (
                <option key={item.id} value={item.id}>{item.code} - {item.name}</option>
            ))}
         </select>
       </div>
    </div>
  );

  const renderProcessFields = () => (
    <div className="grid grid-cols-2 gap-4 border-l-2 border-purple-200 pl-4 py-2 bg-purple-50/50 rounded-r-md">
       <div className="space-y-2">
         <Label>Süreç Adı</Label>
         <Input value={formData.processName} onChange={e => setFormData({...formData, processName: e.target.value})} placeholder="Örn: Satınalma süreci" />
       </div>
       <div className="space-y-2">
         <Label>Süreç Kategorisi</Label>
         <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={formData.processCategory}
            onChange={e => setFormData({...formData, processCategory: e.target.value})}
         >
            <option value="">Seçiniz...</option>
            {PROCESS_CATEGORIES.map(c => <option key={c.id} value={c.value}>{c.label}</option>)}
         </select>
       </div>
    </div>
  );

  const renderProjectFields = () => (
    <div className="border-l-2 border-orange-200 pl-4 py-2 bg-orange-50/50 rounded-r-md">
       <div className="space-y-2">
         <Label>İlişkili Proje</Label>
         <select 
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={formData.projectId}
            onChange={e => setFormData({...formData, projectId: e.target.value})}
         >
            <option value="">Seçiniz...</option>
            {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
         </select>
       </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editingRisk ? 'Riski Düzenle' : 'Yeni Risk Tanımla'}</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
           {/* Risk Type Selection */}
           <div className="space-y-2">
             <Label>Risk Türü</Label>
             <div className="flex gap-2">
                {RISK_TYPES.map(type => (
                   <button
                     key={type.id}
                     onClick={() => setFormData({...formData, riskType: type.id})}
                     className={`flex-1 py-2 rounded-md text-sm font-medium border transition-colors ${
                        formData.riskType === type.id 
                           ? type.color + ' border-current ring-1 ring-offset-1' 
                           : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                     }`}
                   >
                      {type.label}
                   </button>
                ))}
             </div>
           </div>

           {/* Dynamic Section Based on Type */}
           {formData.riskType === 'sp' && renderSPFields()}
           {formData.riskType === 'surec' && renderProcessFields()}
           {formData.riskType === 'proje' && renderProjectFields()}

           {/* Common Fields */}
           <div className="space-y-2">
             <Label>Risk Adı</Label>
             <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
           </div>
           
           <div className="space-y-2">
             <Label>Açıklama</Label>
             <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} rows={3} />
           </div>

           <div className="grid grid-cols-2 gap-4">
             <div className="space-y-2">
                <Label>Olasılık (1-5)</Label>
                <Input type="number" min="1" max="5" value={formData.probability} onChange={e => setFormData({...formData, probability: e.target.value})} />
             </div>
             <div className="space-y-2">
                <Label>Etki (1-5)</Label>
                <Input type="number" min="1" max="5" value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})} />
             </div>
           </div>

           <div className="grid grid-cols-3 gap-4">
             <div className="space-y-2">
                <Label>Sorumlu</Label>
                <Input value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} />
             </div>
             <div className="space-y-2">
                <Label>Durum</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                   {RISK_STATUSES.map(s => <option key={s.id} value={s.value}>{s.label}</option>)}
                </select>
             </div>
             <div className="space-y-2">
                <Label>İzleme Periyodu</Label>
                <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.monitoringPeriod} onChange={e => setFormData({...formData, monitoringPeriod: e.target.value})}>
                   {MONITORING_PERIODS.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
             </div>
           </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>İptal</Button>
          <Button onClick={handleSave} className="bg-blue-600 text-white">Kaydet</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RiskForm;