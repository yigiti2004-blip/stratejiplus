import { useState, useEffect } from 'react';

export const useAmaclar = (alanId = null) => {
  const [amaclar, setAmaclar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAmaclar = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
        let filtered = stored;
        
        if (alanId) {
            filtered = stored.filter(item => item.strategicAreaId === alanId);
        }

        const formatted = filtered.map(item => ({
            amac_kodu: item.id, // Using ID for FK
            display_code: item.code,
            amac_adi: item.name,
            alan_kodu: item.strategicAreaId
        }));
        setAmaclar(formatted);
      } catch (err) {
        setError(err);
        setAmaclar([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAmaclar();
  }, [alanId]);

  return { amaclar, loading, error };
};