export const REVISION_TYPES = [
  { id: 1, label: 'Metin/ifade güncellemesi', value: 'text_update' },
  { id: 2, label: 'Ölçüt/hedef değer değişikliği', value: 'target_value_update' },
  { id: 3, label: 'Termin/bitiş tarihi değişikliği', value: 'deadline_update' },
  { id: 4, label: 'Yapısal değişiklik', value: 'structural_change' },
  { id: 5, label: 'Tam iptal / kapsamdan çıkarma', value: 'cancellation' },
  { id: 6, label: 'Birleştirme', value: 'merge' }
];

export const REVISION_STATUSES = [
  { id: 'draft', label: 'Taslak', color: 'bg-gray-100 text-gray-800' },
  { id: 'review', label: 'İncelemede', color: 'bg-yellow-100 text-yellow-800' },
  { id: 'approved', label: 'Onaylandı', color: 'bg-green-100 text-green-800' },
  { id: 'rejected', label: 'Reddedildi', color: 'bg-red-100 text-red-800' },
  { id: 'applied', label: 'Uygulandı', color: 'bg-blue-100 text-blue-800' }
];