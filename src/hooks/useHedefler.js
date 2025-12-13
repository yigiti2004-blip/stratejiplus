import { useState, useEffect } from 'react';

export const useHedefler = (amacId = null) => {
  const [hedefler, setHedefler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHedefler = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('targets') || '[]');
        let filtered = stored;
        
        if (amacId) {
            filtered = stored.filter(item => item.objectiveId === amacId);
        }

        const formatted = filtered.map(item => ({
            hedef_kodu: item.id, // Using ID for FK
            display_code: item.code,
            hedef_adi: item.name,
            amac_kodu: item.objectiveId
        }));
        setHedefler(formatted);
      } catch (err) {
        setError(err);
        setHedefler([]);
      } finally {
        setLoading(false);
      }
    };

    fetchHedefler();
  }, [amacId]);

  return { hedefler, loading, error };
};