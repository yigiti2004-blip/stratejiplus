import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useBirimler } from '@/hooks/useBirimler';
import { useKullanicilar } from '@/hooks/useKullanicilar';
import { useAlanlar } from '@/hooks/useAlanlar';
import { useAmaclar } from '@/hooks/useAmaclar';
import { useHedefler } from '@/hooks/useHedefler';
import { CodeGenerator } from '@/lib/code-generator';

export const SpItemForm = ({
  editingItem,
  itemType, // 'areas', 'objectives', 'targets', 'indicators', 'activities'
  allData, // Needed for code generation in create mode
  parentItem, // Legacy prop, we will try to infer if not present or let user select
  onSave,
  onCancel
}) => {
  // Normalize itemType to match hooks logic ('areas' vs 'alan')
  const typeMap = {
    'areas': 'alan',
    'objectives': 'amac',
    'targets': 'hedef',
    'indicators': 'gosterge',
    'activities': 'faaliyet'
  };
  const normalizedType = typeMap[itemType] || 'alan';

  // Load Hooks
  const { birimler } = useBirimler();
  const { kullanicilar } = useKullanicilar();
  const { alanlar } = useAlanlar();
  
  // State for form
  const isCreateMode = !editingItem || !editingItem.id;
  
  const getInitialFormData = () => {
    // Determine initial parents if editing
    // We map internal camelCase DB fields to local form state which uses User's requested conventions where possible
    // or we map back to camelCase to save to DB.
    // For simplicity, we use the DB's camelCase keys for state to avoid mapping hell on Save.
    
    if (isCreateMode) {
        return {
            code: '', // Will be generated
            name: '',
            shortName: '', // kisa_ad
            description: '',
            responsibleUnit: '', // sorumlu_birim
            responsiblePersons: [], // sorumlu_kisi (array)
            status: 'Aktif',
            
            // Parent FKs
            strategicAreaId: '', // alan_kodu
            objectiveId: '', // amac_kodu
            targetId: '', // hedef_kodu
            
            // Specifics
            targetValue: '',
            unit: '', // olcum_birimi
            measurementPeriod: '', // olcum_periyodu
            plannedBudget: '',
            plannedStartDate: '',
            plannedEndDate: ''
        };
    }
    
    return {
        id: editingItem.id,
        code: editingItem.code || '',
        name: editingItem.name || '',
        shortName: editingItem.shortName || '',
        description: editingItem.description || '',
        responsibleUnit: editingItem.responsibleUnit || '',
        responsiblePersons: Array.isArray(editingItem.responsiblePersons) ? editingItem.responsiblePersons : [],
        status: editingItem.status || 'Aktif',
        
        strategicAreaId: editingItem.strategicAreaId || '',
        objectiveId: editingItem.objectiveId || '',
        targetId: editingItem.targetId || '',
        
        targetValue: editingItem.targetValue || '',
        unit: editingItem.unit || '',
        measurementPeriod: editingItem.measurementPeriod || '',
        plannedBudget: editingItem.plannedBudget || '',
        plannedStartDate: editingItem.plannedStartDate || '',
        plannedEndDate: editingItem.plannedEndDate || ''
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [errors, setErrors] = useState({});

  // Cascading Hooks
  const { amaclar } = useAmaclar(formData.strategicAreaId);
  const { hedefler } = useHedefler(formData.objectiveId);

  // Re-init on edit item change
  useEffect(() => {
    setFormData(getInitialFormData());
    setErrors({});
  }, [editingItem?.id, itemType]);
  
  // Generate Code on parent change or init
  useEffect(() => {
     if (isCreateMode && allData) {
        let newCode = '';
        if (normalizedType === 'alan') {
            newCode = CodeGenerator.generateAreaCode(allData.areas);
        } else if (normalizedType === 'amac' && formData.strategicAreaId) {
            // Find parent Area Code
            const parentArea = allData.areas.find(a => a.id === formData.strategicAreaId);
            if (parentArea) newCode = CodeGenerator.generateObjectiveCode(parentArea.code, allData.objectives);
        } else if (normalizedType === 'hedef' && formData.objectiveId) {
            const parentObj = allData.objectives.find(o => o.id === formData.objectiveId);
            if (parentObj) newCode = CodeGenerator.generateTargetCode(parentObj.code, allData.targets);
        } else if ((normalizedType === 'gosterge' || normalizedType === 'faaliyet') && formData.targetId) {
            const parentTarget = allData.targets.find(t => t.id === formData.targetId);
            if (parentTarget) {
                if (normalizedType === 'gosterge') newCode = CodeGenerator.generateIndicatorCode(parentTarget.code, allData.indicators);
                else newCode = CodeGenerator.generateActivityCode(parentTarget.code, allData.activities);
            }
        }
        
        if (newCode) {
            setFormData(prev => ({ ...prev, code: newCode }));
        }
     }
  }, [formData.strategicAreaId, formData.objectiveId, formData.targetId, isCreateMode, normalizedType, allData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMultiSelectChange = (e) => {
    const { options } = e.target;
    const selectedValues = Array.from(options)
      .filter(option => option.selected)
      .map(option => option.value);
    
    setFormData(prev => ({ ...prev, responsiblePersons: selectedValues }));
  };
  
  // Parent Selection Handlers
  const handleAlanChange = (e) => {
      const { value } = e.target;
      setFormData(prev => ({
          ...prev,
          strategicAreaId: value,
          objectiveId: '', // Reset cascading
          targetId: ''
      }));
  };

  const handleAmacChange = (e) => {
      const { value } = e.target;
      setFormData(prev => ({
          ...prev,
          objectiveId: value,
          targetId: ''
      }));
  };

  const validateForm = () => {
    const newErrors = {};

    // Common
    if (!formData.name?.trim()) newErrors.name = 'Bu alan gereklidir';
    if (!formData.responsibleUnit) newErrors.responsibleUnit = 'Sorumlu birim seçilmelidir';
    
    // Structure Validation
    if (['amac', 'hedef', 'gosterge', 'faaliyet'].includes(normalizedType)) {
        if (!formData.strategicAreaId) newErrors.strategicAreaId = 'Alan seçimi zorunludur';
    }
    if (['hedef', 'gosterge', 'faaliyet'].includes(normalizedType)) {
        if (!formData.objectiveId) newErrors.objectiveId = 'Amaç seçimi zorunludur';
    }
    if (['gosterge', 'faaliyet'].includes(normalizedType)) {
        if (!formData.targetId) newErrors.targetId = 'Hedef seçimi zorunludur';
    }
    
    if (normalizedType === 'gosterge' && !formData.targetValue) newErrors.targetValue = 'Hedef değer gereklidir';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    onSave(formData);
  };
  
  const getLabels = () => {
      switch (normalizedType) {
          case 'alan': return { name: 'Alan Adı', type: 'Alan' };
          case 'amac': return { name: 'Amaç Adı', type: 'Amaç' };
          case 'hedef': return { name: 'Hedef Adı', type: 'Hedef' };
          case 'gosterge': return { name: 'Gösterge Adı', type: 'Gösterge' };
          case 'faaliyet': return { name: 'Faaliyet Adı', type: 'Faaliyet' };
          default: return { name: 'Ad', type: 'Öğe' };
      }
  };
  
  const labels = getLabels();

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="sp-item-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 10 }}
      transition={{ duration: 0.2 }}
    >
      {/* Code (Read Only) */}
      <div className="form-group">
        <label className="form-label">Kod</label>
        <div className="flex items-center gap-2">
             <input type="text" value={formData.code} disabled className="form-input form-input-disabled flex-1 font-mono font-bold text-blue-600" />
             {isCreateMode && <span className="text-xs text-blue-600">Otomatik</span>}
        </div>
      </div>
      
      {/* PARENT SELECTION */}
      
      {/* Area Selection (For Objective, Target, Indicator, Activity) */}
      {(['amac', 'hedef', 'gosterge', 'faaliyet'].includes(normalizedType)) && (
          <div className="form-group">
              <label className="form-label">Bağlı Olduğu Alan <span className="required">*</span></label>
              <select name="strategicAreaId" value={formData.strategicAreaId} onChange={handleAlanChange} className={`form-input ${errors.strategicAreaId ? 'form-input-error' : ''}`}>
                  <option value="">-- Alan Seçin --</option>
                  {alanlar.map(a => (
                      <option key={a.alan_kodu} value={a.alan_kodu}>{a.display_code} - {a.alan_adi}</option>
                  ))}
              </select>
              {errors.strategicAreaId && <span className="form-error">{errors.strategicAreaId}</span>}
          </div>
      )}

      {/* Objective Selection (For Target, Indicator, Activity) */}
      {(['hedef', 'gosterge', 'faaliyet'].includes(normalizedType)) && (
          <div className="form-group">
              <label className="form-label">Bağlı Olduğu Amaç <span className="required">*</span></label>
              <select name="objectiveId" value={formData.objectiveId} onChange={handleAmacChange} className={`form-input ${errors.objectiveId ? 'form-input-error' : ''}`} disabled={!formData.strategicAreaId}>
                  <option value="">-- Amaç Seçin --</option>
                  {amaclar.map(a => (
                      <option key={a.amac_kodu} value={a.amac_kodu}>{a.display_code} - {a.amac_adi}</option>
                  ))}
              </select>
              {errors.objectiveId && <span className="form-error">{errors.objectiveId}</span>}
          </div>
      )}
      
      {/* Target Selection (For Indicator, Activity) */}
      {(['gosterge', 'faaliyet'].includes(normalizedType)) && (
          <div className="form-group">
              <label className="form-label">Bağlı Olduğu Hedef <span className="required">*</span></label>
              <select name="targetId" value={formData.targetId} onChange={handleChange} className={`form-input ${errors.targetId ? 'form-input-error' : ''}`} disabled={!formData.objectiveId}>
                  <option value="">-- Hedef Seçin --</option>
                  {hedefler.map(h => (
                      <option key={h.hedef_kodu} value={h.hedef_kodu}>{h.display_code} - {h.hedef_adi}</option>
                  ))}
              </select>
              {errors.targetId && <span className="form-error">{errors.targetId}</span>}
          </div>
      )}

      {/* Basic Info */}
      <div className="form-group">
        <label className="form-label">{labels.name} <span className="required">*</span></label>
        <input type="text" name="name" value={formData.name} onChange={handleChange} className={`form-input ${errors.name ? 'form-input-error' : ''}`} placeholder={labels.name} />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-group">
        <label className="form-label">Kısa Ad / Etiket</label>
        <input type="text" name="shortName" value={formData.shortName} onChange={handleChange} className="form-input" placeholder="Örn: Dijital Dönüşüm" />
      </div>
      
      {/* Responsibility */}
      <div className="form-group">
          <label className="form-label">Sorumlu Birim <span className="required">*</span></label>
          <select name="responsibleUnit" value={formData.responsibleUnit} onChange={handleChange} className={`form-input ${errors.responsibleUnit ? 'form-input-error' : ''}`}>
              <option value="">-- Birim Seçin --</option>
              {birimler.map(b => (
                  <option key={b.birim_id} value={b.birim_adi}>{b.birim_adi}</option> 
                  // Keeping Name as value for now to match legacy data which stores strings, but ideally store ID. 
                  // If we change to ID here, we must migrate existing data or handle both. 
                  // For this task, sticking to name as 'value' ensures compatibility with existing list views that show name directly.
                  // Wait, DetailPanel and Lists show responsibleUnit string directly. So storing Name is safer for this 'min-change' constraint.
              ))}
          </select>
          {errors.responsibleUnit && <span className="form-error">{errors.responsibleUnit}</span>}
      </div>
      
      <div className="form-group">
          <label className="form-label">Sorumlu Kişi(ler)</label>
          <select name="responsiblePersons" value={formData.responsiblePersons} onChange={handleMultiSelectChange} multiple className="form-input form-input-multiselect">
              {kullanicilar.map(k => (
                  <option key={k.kullanici_id} value={k.kullanici_id}>{k.kullanici_adi}</option>
              ))}
          </select>
          <small className="form-hint">Ctrl (Windows) veya Cmd (Mac) tuşuna basılı tutarak birden fazla kişi seçebilirsiniz.</small>
      </div>

      <div className="form-group">
        <label className="form-label">Açıklama</label>
        <textarea name="description" value={formData.description} onChange={handleChange} className="form-textarea" rows="3" />
      </div>

      {/* Type Specific Fields */}
      {normalizedType === 'gosterge' && (
         <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
                <label className="form-label">Hedef Değer <span className="required">*</span></label>
                <input type="number" name="targetValue" value={formData.targetValue} onChange={handleChange} className={`form-input ${errors.targetValue ? 'form-input-error' : ''}`} />
                 {errors.targetValue && <span className="form-error">{errors.targetValue}</span>}
            </div>
            <div className="form-group">
                <label className="form-label">Ölçüm Birimi</label>
                <input type="text" name="unit" value={formData.unit} onChange={handleChange} className="form-input" placeholder="Adet, % vb." />
            </div>
            <div className="form-group col-span-2">
                <label className="form-label">Ölçüm Periyodu</label>
                <input type="text" name="measurementPeriod" value={formData.measurementPeriod} onChange={handleChange} className="form-input" placeholder="Aylık, Yıllık vb." />
            </div>
         </div>
      )}
      
      {normalizedType === 'faaliyet' && (
         <div className="form-group">
            <label className="form-label">Planlanan Bütçe</label>
            <input type="number" name="plannedBudget" value={formData.plannedBudget} onChange={handleChange} className="form-input" />
         </div>
      )}
      
      {(['hedef', 'faaliyet'].includes(normalizedType)) && (
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
                <label className="form-label">Başlangıç Tarihi</label>
                <input type="date" name="plannedStartDate" value={formData.plannedStartDate} onChange={handleChange} className="form-input" />
            </div>
            <div className="form-group">
                <label className="form-label">Bitiş Tarihi</label>
                <input type="date" name="plannedEndDate" value={formData.plannedEndDate} onChange={handleChange} className="form-input" />
            </div>
          </div>
      )}
      
      <div className="form-group">
           <label className="form-label">Durum</label>
           <select name="status" value={formData.status} onChange={handleChange} className="form-input">
             <option value="Aktif">Aktif</option>
             <option value="Pasif">Pasif</option>
             <option value="Tamamlandı">Tamamlandı</option>
             <option value="İptal">İptal</option>
           </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary">Kaydet</button>
        <button type="button" onClick={onCancel} className="btn btn-secondary">İptal</button>
      </div>
    </motion.form>
  );
};

export default SpItemForm;