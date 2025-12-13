
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, Upload, FileText, Trash2, Hash, AlertTriangle } from 'lucide-react';
import { useBudgetData } from '@/hooks/useBudgetData';

const STATUS_OPTIONS = [
  { value: 'Başlamadı', label: 'Başlamadı', color: 'bg-gray-100 text-gray-700' },
  { value: 'Başladı', label: 'Başladı', color: 'bg-blue-100 text-blue-700' },
  { value: 'Devam ediyor', label: 'Devam ediyor', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'Tamamlandı', label: 'Tamamlandı', color: 'bg-green-100 text-green-700' },
  { value: 'Askıya alındı', label: 'Askıya alındı', color: 'bg-orange-100 text-orange-700' },
  { value: 'İptal edildi', label: 'İptal edildi', color: 'bg-red-100 text-red-700' }
];

const BUDGET_STATUS_OPTIONS = [
  "Henüz harcama girişi yapılmadı",
  "Harcama girişi Bütçe Yönetimi'nde yapıldı",
  "Bu faaliyet bütçe gerektirmiyor"
];

const MonitoringRecordForm = ({ 
  activityId, 
  activityCode, // Added prop
  relatedIndicators = [], 
  onSave, 
  onCancel, 
  currentUser 
}) => {
  const { checkExpenseRecords } = useBudgetData();
  
  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().split('T')[0],
    status: '',
    description: '',
    completionPercentage: '',
    selectedIndicators: [],
    indicatorValues: {},
    evidenceFiles: [],
    budgetStatus: "Henüz harcama girişi yapılmadı"
  });

  const [errors, setErrors] = useState({});
  const [showBudgetWarning, setShowBudgetWarning] = useState(false);

  // Check budget status warnings when changed
  useEffect(() => {
    if (formData.budgetStatus === "Harcama girişi Bütçe Yönetimi'nde yapıldı" && activityCode) {
      const hasExpenses = checkExpenseRecords(activityCode);
      setShowBudgetWarning(!hasExpenses);
    } else {
      setShowBudgetWarning(false);
    }
  }, [formData.budgetStatus, activityCode, checkExpenseRecords]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => ({ ...prev, [field]: null }));
  };

  const handleIndicatorToggle = (indicatorId) => {
    setFormData(prev => {
      const current = prev.selectedIndicators;
      let newSelected = [];
      let newValues = { ...prev.indicatorValues };

      if (current.includes(indicatorId)) {
        // Deselecting
        newSelected = current.filter(id => id !== indicatorId);
        delete newValues[indicatorId];
      } else {
        // Selecting
        newSelected = [...current, indicatorId];
        newValues[indicatorId] = ''; // Initialize with empty string
      }
      return { ...prev, selectedIndicators: newSelected, indicatorValues: newValues };
    });
  };

  const handleIndicatorValueChange = (indicatorId, value) => {
    setFormData(prev => ({
      ...prev,
      indicatorValues: {
        ...prev.indicatorValues,
        [indicatorId]: value
      }
    }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newFile = {
          id: Math.random().toString(36).substr(2, 9),
          name: file.name,
          type: file.type,
          size: file.size,
          data: reader.result,
          uploadedAt: new Date().toISOString()
        };
        setFormData(prev => ({ ...prev, evidenceFiles: [...prev.evidenceFiles, newFile] }));
      };
      reader.readAsDataURL(file);
    });
  };

  const removeFile = (fileId) => {
    setFormData(prev => ({
      ...prev,
      evidenceFiles: prev.evidenceFiles.filter(f => f.id !== fileId)
    }));
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.status) newErrors.status = 'Durum seçimi zorunludur.';
    if (!formData.description.trim()) newErrors.description = 'Açıklama zorunludur.';
    
    const percentage = Number(formData.completionPercentage);
    if (formData.completionPercentage && (percentage < 0 || percentage > 100)) {
      newErrors.completionPercentage = '0-100 arası bir değer giriniz.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    onSave({
      ...formData,
      recordedBy: currentUser?.name || 'Sistem'
    });
  };

  return (
    <div className="bg-gray-50 p-6 rounded-lg border border-gray-200 shadow-inner mb-6 animate-in slide-in-from-top-4 fade-in">
      <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-4">
        <h3 className="text-lg font-bold text-gray-900">Yeni İzleme Kaydı</h3>
        <Button variant="ghost" size="sm" onClick={onCancel}><X className="w-4 h-4" /></Button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-gray-700">Kayıt Tarihi <span className="text-red-500">*</span></Label>
            <Input 
              type="date" 
              value={formData.recordDate} 
              onChange={(e) => handleInputChange('recordDate', e.target.value)}
              required
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Durum / Aşama <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.status} 
              onValueChange={(val) => handleInputChange('status', val)}
            >
              <SelectTrigger className={errors.status ? "border-red-500" : ""}>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${opt.color.split(' ')[0]}`}></span>
                      {opt.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.status && <p className="text-xs text-red-500">{errors.status}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700">Gerçekleşme Açıklaması <span className="text-red-500">*</span></Label>
          <Textarea 
            placeholder="Faaliyet kapsamında yapılan çalışmaları detaylı açıklayınız..." 
            className={`min-h-[100px] ${errors.description ? "border-red-500" : ""}`}
            value={formData.description}
            onChange={(e) => handleInputChange('description', e.target.value)}
          />
          {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
        </div>

        <div className="space-y-2">
          <Label className="text-gray-700">Gerçekleşme Yüzdesi (%)</Label>
          <Input 
            type="number" 
            min="0" 
            max="100" 
            placeholder="0-100"
            className={`w-32 ${errors.completionPercentage ? "border-red-500" : ""}`}
            value={formData.completionPercentage}
            onChange={(e) => handleInputChange('completionPercentage', e.target.value)}
          />
          {errors.completionPercentage && <p className="text-xs text-red-500">{errors.completionPercentage}</p>}
        </div>

        {relatedIndicators.length > 0 && (
          <div className="space-y-3 p-4 bg-white rounded-md border border-gray-200">
            <Label className="text-gray-700">İlgili Göstergeler</Label>
            <div className="space-y-3">
              <div className="max-h-40 overflow-y-auto pr-2 custom-scrollbar border-b border-gray-100 pb-3">
                {relatedIndicators.map(ind => (
                  <div key={ind.id} className="flex items-start space-x-2 mb-2">
                    <Checkbox 
                      id={`ind-${ind.id}`} 
                      checked={formData.selectedIndicators.includes(ind.id)}
                      onCheckedChange={() => handleIndicatorToggle(ind.id)}
                    />
                    <label 
                      htmlFor={`ind-${ind.id}`} 
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer pt-0.5"
                    >
                      <span className="font-bold text-gray-500 mr-1">{ind.code}</span>
                      {ind.name}
                    </label>
                  </div>
                ))}
              </div>

              {/* Dynamic Inputs for Selected Indicators */}
              {formData.selectedIndicators.length > 0 && (
                <div className="space-y-3 pt-2 bg-blue-50/50 p-3 rounded-md animate-in slide-in-from-top-2">
                   <Label className="text-xs font-bold text-blue-700 uppercase tracking-wide">Gösterge Değerleri Girişi</Label>
                   {formData.selectedIndicators.map(indId => {
                     const ind = relatedIndicators.find(i => i.id === indId);
                     if (!ind) return null;
                     return (
                       <div key={indId} className="flex items-center gap-3">
                          <div className="flex-1 text-sm text-gray-700 truncate" title={ind.name}>
                             <span className="font-bold mr-1">{ind.code}</span> {ind.name}
                          </div>
                          <div className="w-32">
                             <div className="relative">
                               <Hash className="absolute left-2.5 top-2.5 h-3 w-3 text-gray-400" />
                               <Input 
                                  type="number"
                                  placeholder="0"
                                  className="pl-8 h-8 text-sm"
                                  value={formData.indicatorValues[indId] || ''}
                                  onChange={(e) => handleIndicatorValueChange(indId, e.target.value)}
                               />
                             </div>
                          </div>
                       </div>
                     );
                   })}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="space-y-2">
          <Label className="text-gray-700">Kanıt Dosyaları</Label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 hover:bg-gray-50 transition-colors text-center cursor-pointer relative">
            <input 
              type="file" 
              multiple 
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={handleFileChange}
            />
            <Upload className="mx-auto h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-600 font-medium">Dosyaları buraya sürükleyin veya tıklayın</p>
            <p className="text-xs text-gray-400 mt-1">PDF, Görsel, Excel, Word (Max 5MB)</p>
          </div>

          {formData.evidenceFiles.length > 0 && (
            <div className="space-y-2 mt-3">
              {formData.evidenceFiles.map(file => (
                <div key={file.id} className="flex items-center justify-between p-2 bg-white border border-gray-200 rounded text-sm">
                  <div className="flex items-center gap-2 overflow-hidden">
                    <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />
                    <span className="truncate">{file.name}</span>
                    <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(0)} KB)</span>
                  </div>
                  <Button type="button" variant="ghost" size="sm" onClick={() => removeFile(file.id)} className="text-red-500 h-6 w-6 p-0 hover:bg-red-50">
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Budget Status Field */}
        <div className="space-y-2">
          <Label className="text-gray-700">Bütçe Durumu</Label>
          <Select 
            value={formData.budgetStatus} 
            onValueChange={(val) => handleInputChange('budgetStatus', val)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Bütçe Durumu Seçiniz" />
            </SelectTrigger>
            <SelectContent>
              {BUDGET_STATUS_OPTIONS.map((option, idx) => (
                <SelectItem key={idx} value={option}>{option}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {showBudgetWarning && (
            <div className="flex items-start gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-md text-sm text-yellow-800 animate-in fade-in slide-in-from-top-1">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Dikkat</p>
                <p>Bu faaliyet için Bütçe Yönetimi modülünde kayıtlı bir harcama bulunamadı. Gerekliyse önce ilgili harcamayı Bütçe Yönetimi'nden giriniz.</p>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-gray-200 mt-6">
           <div className="text-xs text-gray-500">
              Kaydeden: <span className="font-medium text-gray-700">{currentUser?.name || 'Sistem'}</span>
           </div>
           <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={onCancel}>İptal</Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Kaydet</Button>
           </div>
        </div>

      </form>
    </div>
  );
};

export default MonitoringRecordForm;
