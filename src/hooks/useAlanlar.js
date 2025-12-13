import { useState, useEffect } from 'react';

export const useAlanlar = () => {
  const [alanlar, setAlanlar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAlanlar = async () => {
      try {
        const stored = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
        const formatted = stored.map(item => ({
            alan_kodu: item.id, // Using ID for FK reference
            display_code: item.code,
            alan_adi: item.name
        }));
        setAlanlar(formatted);
      } catch (err) {
        setError(err);
        setAlanlar([]);
      } finally {
        setLoading(false);
      }
    };

    fetchAlanlar();
  }, []);

  return { alanlar, loading, error };
};