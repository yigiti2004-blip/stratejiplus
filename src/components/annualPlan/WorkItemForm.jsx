
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X, Trash2 } from 'lucide-react';

const WorkItemForm = ({ onClose, onSave, onDelete, initialData, selectedYear }) => {
  const [formData, setFormData] = useState({
    workName: '',
    sourceType: 'yıla-özgü',
    responsibleUnit: '',
    startDate: `${selectedYear}-01-01`,
    endDate: `${selectedYear}-12-31`,
    description: '',
    period: 'her-yıl',
    isActive: true
  });

  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        startDate: initialData.startDate?.split('T')[0] || prev.startDate,
        endDate: initialData.endDate?.split('T')[0] || prev.endDate
      }));
    }
  }, [initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = {
      ...formData,
      year: selectedYear
    };
    onSave(submitData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-gray-50/50">
          <h3 className="font-bold text-gray-900 text-lg">
            {initialData ? 'İş Düzenle' : 'Yeni İş Ekle'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          
          <div className="space-y-2">
            <Label className="text-gray-700">İş Adı <span className="text-red-500">*</span></Label>
            <Input 
              required
              value={formData.workName}
              onChange={(e) => handleChange('workName', e.target.value)}
              placeholder="Yapılacak işin adı..."
            />
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Kaynak Türü <span className="text-red-500">*</span></Label>
            <Select 
              value={formData.sourceType} 
              onValueChange={(val) => handleChange('sourceType', val)}
              disabled={!!initialData} 
            >
              <SelectTrigger className="bg-white text-gray-900">
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent className="bg-white text-gray-900">
                <SelectItem value="yıla-özgü">Yıla Özgü Planlı İş</SelectItem>
                <SelectItem value="kurumsal-süreklilik">Kurumsal Süreklilik Faaliyeti</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.sourceType === 'kurumsal-süreklilik' && (
            <div className="p-4 bg-purple-50 rounded-lg space-y-4 border border-purple-100">
               <div className="space-y-2">
                  <Label className="text-purple-900">Tekrar Periyodu <span className="text-red-500">*</span></Label>
                  <Select 
                    value={formData.period} 
                    onValueChange={(val) => handleChange('period', val)}
                  >
                  <SelectTrigger className="bg-white border-purple-200 text-gray-900">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white text-gray-900">
                      <SelectItem value="her-yıl">Her Yıl</SelectItem>
                      <SelectItem value="3-ayda-bir">3 Ayda Bir</SelectItem>
                      <SelectItem value="6-ayda-bir">6 Ayda Bir</SelectItem>
                      <SelectItem value="belirli-ay">Belirli Ay</SelectItem>
                    </SelectContent>
                  </Select>
               </div>

               <div className="flex items-center justify-between">
                  <Label className="text-purple-900 cursor-pointer" htmlFor="is-active">Aktif Durum</Label>
                  <div className="flex items-center gap-2">
                     <span className="text-xs text-purple-600">{formData.isActive ? 'Aktif' : 'Pasif'}</span>
                     <input 
                       id="is-active"
                       type="checkbox"
                       className="w-5 h-5 accent-purple-600 cursor-pointer"
                       checked={formData.isActive}
                       onChange={(e) => handleChange('isActive', e.target.checked)}
                     />
                  </div>
               </div>
            </div>
          )}

          <div className="space-y-2">
            <Label className="text-gray-700">Sorumlu Birim <span className="text-red-500">*</span></Label>
            <Input 
              required
              value={formData.responsibleUnit}
              onChange={(e) => handleChange('responsibleUnit', e.target.value)}
              className="text-gray-900"
              placeholder="Örn: İnsan Kaynakları"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Başlangıç <span className="text-red-500">*</span></Label>
              <Input 
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => handleChange('startDate', e.target.value)}
                className="text-gray-900"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-gray-700">Bitiş <span className="text-red-500">*</span></Label>
              <Input 
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => handleChange('endDate', e.target.value)}
                className="text-gray-900"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-gray-700">Açıklama / Notlar</Label>
            <Textarea 
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Detaylı bilgi..."
              className="min-h-[100px]"
            />
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-gray-100 mt-4">
            <div>
               {initialData && onDelete && (
                  <Button type="button" variant="ghost" onClick={onDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                     <Trash2 className="w-4 h-4 mr-2" /> Sil
                  </Button>
               )}
            </div>
            <div className="flex gap-3">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
              >
                İptal
              </Button>
              <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
                Kaydet
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WorkItemForm;
