import { useState, useEffect } from 'react';

const DEFAULT_FASILLER = [
  {
    fasil_id: 1,
    fasil_kodu: 'F01',
    fasil_adi: 'Personel Giderleri',
    fasil_aciklama: 'Maaş ve ücretler',
    yillik_toplam_limit: 500000,
    yillik_tahsis_limit: 450000,
    mali_yil: 2024,
    sorumlu_birim: 'İK Müdürlüğü',
    sorumlu_kisi: 'Ahmet Yılmaz',
    durum: 'Aktif'
  },
  {
    fasil_id: 2,
    fasil_kodu: 'F02',
    fasil_adi: 'Hizmet Alımları',
    fasil_aciklama: 'Dış kaynak hizmetleri',
    yillik_toplam_limit: 300000,
    yillik_tahsis_limit: 280000,
    mali_yil: 2024,
    sorumlu_birim: 'Operasyon Müdürlüğü',
    sorumlu_kisi: 'Mehmet Demir',
    durum: 'Aktif'
  },
  {
    fasil_id: 3,
    fasil_kodu: 'F03',
    fasil_adi: 'Yatırım Giderleri',
    fasil_aciklama: 'Sabit kıymet alımları',
    yillik_toplam_limit: 200000,
    yillik_tahsis_limit: 200000,
    mali_yil: 2024,
    sorumlu_birim: 'Teknoloji Müdürlüğü',
    sorumlu_kisi: 'Can Öztürk',
    durum: 'Aktif'
  }
];

export const useFasiller = () => {
  const [fasiller, setFasiller] = useState(() => {
    try {
      const stored = localStorage.getItem('fasiller');
      return stored ? JSON.parse(stored) : DEFAULT_FASILLER;
    } catch (e) {
      console.error("Failed to parse fasiller from localStorage", e);
      return DEFAULT_FASILLER;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('fasiller', JSON.stringify(fasiller));
      // Dispatch storage event so other tabs/components can react
      window.dispatchEvent(new Event('storage'));
    } catch (e) {
      console.error("Failed to save fasiller to localStorage", e);
    }
  }, [fasiller]);

  return { fasiller, setFasiller };
};