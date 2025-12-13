import { useState, useEffect } from 'react';

export const useFaaliyetler = () => {
  const [faaliyetler, setFaaliyetler] = useState([]);

  useEffect(() => {
    const storedActivities = localStorage.getItem('activities');
    if (storedActivities) {
      try {
        const parsed = JSON.parse(storedActivities);
        // Map SP activities (code, name) to expected format (faaliyet_kodu, faaliyet_adi)
        const mapped = parsed.map(item => ({
          faaliyet_kodu: item.code,
          faaliyet_adi: item.name,
          ...item
        }));
        setFaaliyetler(mapped);
      } catch (error) {
        console.error('Error loading activities:', error);
      }
    } else {
      // Default mock data if no SP data exists yet
      setFaaliyetler([
        { faaliyet_kodu: 'F.1.1.1', faaliyet_adi: 'Personel Eğitimlerinin Planlanması' },
        { faaliyet_kodu: 'F.1.2.1', faaliyet_adi: 'IT Altyapı İyileştirme Projesi' },
        { faaliyet_kodu: 'F.2.1.1', faaliyet_adi: 'Yeni Pazar Araştırması' },
        { faaliyet_kodu: 'F.3.1.1', faaliyet_adi: 'Müşteri Memnuniyeti Anketi' }
      ]);
    }
  }, []);

  return { faaliyetler, setFaaliyetler };
};