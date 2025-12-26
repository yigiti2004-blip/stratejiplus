import React, { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

/**
 * Form for adding a new Activity Realization Record
 * Immutable records - no edit/delete after creation
 */
const RealizationRecordForm = ({ activity, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    recordDate: new Date().toISOString().split('T')[0],
    completionPercentage: '',
    workPerformed: '',
    expenseFlag: 'No',
    detailedDescription: '',
    evidenceUrl: '',
    evidenceFileName: '',
    outcomeNote: '',
  });

  const [errors, setErrors] = useState({});

  const validate = () => {
    const newErrors = {};

    if (!formData.recordDate) {
      newErrors.recordDate = 'Tarih gereklidir';
    }

    if (!formData.completionPercentage || Number(formData.completionPercentage) < 0 || Number(formData.completionPercentage) > 100) {
      newErrors.completionPercentage = 'Tamamlanma yüzdesi 0-100 arasında olmalıdır';
    }

    if (!formData.workPerformed.trim()) {
      newErrors.workPerformed = 'Yapılan iş gereklidir';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validate()) {
      onSave(formData);
    }
  };

  return (
    <div className="p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        Yeni Gerçekleşme Kaydı
      </h2>
      <p className="text-sm text-gray-600 mb-6">
        {activity.code} - {activity.name}
      </p>

      {formData.expenseFlag === 'Yes' && (
        <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-yellow-800 mb-1">Harcama Uyarısı</p>
              <p className="text-sm text-yellow-700">
                Harcama işaretli kayıtlar için harcama bilgileri Bütçe Yönetimi modülünden girilmelidir.
              </p>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="recordDate" className="text-gray-900">
              Tarih <span className="text-red-500">*</span>
            </Label>
            <Input
              id="recordDate"
              type="date"
              value={formData.recordDate}
              onChange={(e) => setFormData({ ...formData, recordDate: e.target.value })}
              className="mt-1 bg-white text-gray-900 border-gray-300"
              required
            />
            {errors.recordDate && (
              <p className="text-xs text-red-600 mt-1">{errors.recordDate}</p>
            )}
          </div>

          <div>
            <Label htmlFor="completionPercentage" className="text-gray-900">
              Tamamlanma Yüzdesi (0-100) <span className="text-red-500">*</span>
            </Label>
            <Input
              id="completionPercentage"
              type="number"
              min="0"
              max="100"
              step="0.01"
              value={formData.completionPercentage}
              onChange={(e) => setFormData({ ...formData, completionPercentage: e.target.value })}
              className="mt-1 bg-white text-gray-900 border-gray-300"
              required
            />
            {errors.completionPercentage && (
              <p className="text-xs text-red-600 mt-1">{errors.completionPercentage}</p>
            )}
          </div>
        </div>

        <div>
          <Label htmlFor="workPerformed" className="text-gray-900">
            Yapılan İş <span className="text-red-500">*</span>
          </Label>
          <Input
            id="workPerformed"
            value={formData.workPerformed}
            onChange={(e) => setFormData({ ...formData, workPerformed: e.target.value })}
            className="mt-1 bg-white text-gray-900 border-gray-300"
            placeholder="Kısa açıklama"
            required
          />
          {errors.workPerformed && (
            <p className="text-xs text-red-600 mt-1">{errors.workPerformed}</p>
          )}
        </div>

        <div>
          <Label htmlFor="expenseFlag" className="text-gray-900">
            Harcama İşareti
          </Label>
          <Select
            value={formData.expenseFlag}
            onValueChange={(value) => setFormData({ ...formData, expenseFlag: value })}
          >
            <SelectTrigger className="mt-1 bg-white text-gray-900 border-gray-300">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="No" className="text-gray-900">Hayır</SelectItem>
              <SelectItem value="Yes" className="text-gray-900">Evet</SelectItem>
              <SelectItem value="No Budget Required" className="text-gray-900">Bütçe Gerekmez</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="detailedDescription" className="text-gray-900">
            Detaylı Açıklama
          </Label>
          <Textarea
            id="detailedDescription"
            value={formData.detailedDescription}
            onChange={(e) => setFormData({ ...formData, detailedDescription: e.target.value })}
            className="mt-1 bg-white text-gray-900 border-gray-300"
            rows={4}
            placeholder="Detaylı açıklama..."
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="evidenceUrl" className="text-gray-900">
              Kanıt URL
            </Label>
            <Input
              id="evidenceUrl"
              type="url"
              value={formData.evidenceUrl}
              onChange={(e) => setFormData({ ...formData, evidenceUrl: e.target.value })}
              className="mt-1 bg-white text-gray-900 border-gray-300"
              placeholder="https://..."
            />
          </div>

          <div>
            <Label htmlFor="evidenceFileName" className="text-gray-900">
              Kanıt Dosya Adı
            </Label>
            <Input
              id="evidenceFileName"
              value={formData.evidenceFileName}
              onChange={(e) => setFormData({ ...formData, evidenceFileName: e.target.value })}
              className="mt-1 bg-white text-gray-900 border-gray-300"
              placeholder="Dosya adı"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="outcomeNote" className="text-gray-900">
            Sonuç Notu
          </Label>
          <Textarea
            id="outcomeNote"
            value={formData.outcomeNote}
            onChange={(e) => setFormData({ ...formData, outcomeNote: e.target.value })}
            className="mt-1 bg-white text-gray-900 border-gray-300"
            rows={3}
            placeholder="Sonuç notu (isteğe bağlı)..."
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <Button type="button" variant="outline" onClick={onCancel} className="text-gray-900 border-gray-300">
            İptal
          </Button>
          <Button type="submit" className="bg-blue-600 hover:bg-blue-700 text-white">
            Kaydet
          </Button>
        </div>
      </form>
    </div>
  );
};

export default RealizationRecordForm;

