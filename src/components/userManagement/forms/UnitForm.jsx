
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';

const UnitForm = ({ onClose, onSave, initialData, units }) => {
  const [formData, setFormData] = useState({
    unitName: '',
    unitCode: '',
    parentUnit: 'none',
    status: 'aktif'
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        parentUnit: initialData.parentUnit || 'none'
      });
    }
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      ...formData,
      parentUnit: formData.parentUnit === 'none' ? null : formData.parentUnit
    });
  };

  // Filter out self from parent options to avoid circular reference
  const parentOptions = units.filter(u => !initialData || u.unitId !== initialData.unitId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">
            {initialData ? 'Birim Düzenle' : 'Yeni Birim Ekle'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Birim Adı <span className="text-red-500">*</span></Label>
            <Input 
              required
              value={formData.unitName}
              onChange={(e) => setFormData({...formData, unitName: e.target.value})}
              placeholder="Örn: İnsan Kaynakları Daire Bşk."
            />
          </div>

          <div className="space-y-2">
            <Label>Birim Kodu</Label>
            <Input 
              value={formData.unitCode}
              onChange={(e) => setFormData({...formData, unitCode: e.target.value})}
              placeholder="Örn: IK-01"
            />
          </div>

          <div className="space-y-2">
            <Label>Üst Birim</Label>
            <Select 
              value={formData.parentUnit} 
              onValueChange={(val) => setFormData({...formData, parentUnit: val})}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seçiniz" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">-- Yok (Ana Birim) --</SelectItem>
                {parentOptions.map(u => (
                  <SelectItem key={u.unitId} value={u.unitId}>
                    {u.unitCode ? `[${u.unitCode}] ` : ''}{u.unitName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
             <Label>Durum</Label>
             <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="status-active" 
                    name="status" 
                    value="aktif"
                    checked={formData.status === 'aktif'}
                    onChange={() => setFormData({...formData, status: 'aktif'})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="status-active" className="font-normal cursor-pointer">Aktif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="status-passive" 
                    name="status" 
                    value="pasif"
                    checked={formData.status === 'pasif'}
                    onChange={() => setFormData({...formData, status: 'pasif'})}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="status-passive" className="font-normal cursor-pointer">Pasif</Label>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Kaydet</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UnitForm;
