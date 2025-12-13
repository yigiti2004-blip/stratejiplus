import { useState, useEffect } from 'react';

export const useBirimler = () => {
  const [birimler, setBirimler] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchBirimler = async () => {
      try {
        // Simulating API call with localStorage
        // Try 'units' first (new format), fallback to 'organizations' (old format)
        const storedUnits = JSON.parse(localStorage.getItem('units') || '[]');
        const storedOrgs = storedUnits.length > 0 ? storedUnits : JSON.parse(localStorage.getItem('organizations') || '[]');
        // Map to expected structure - support both old and new formats
        const formatted = storedOrgs.map(org => ({
          birim_id: org.unitId || org.id,
          birim_adi: org.unitName || org.name,
          birim_kodu: org.unitCode || org.type || org.code
        }));
        setBirimler(formatted);
      } catch (err) {
        setError(err);
        setBirimler([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBirimler();
  }, []);

  return { birimler, loading, error };
};