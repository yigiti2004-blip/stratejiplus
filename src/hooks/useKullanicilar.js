import { useState, useEffect } from 'react';

export const useKullanicilar = () => {
  const [kullanicilar, setKullanicilar] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchKullanicilar = async () => {
      try {
        const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
        const formatted = storedUsers.map(user => ({
          kullanici_id: user.userId || user.id,
          kullanici_adi: user.fullName || user.name,
          email: user.email,
          birim_id: user.unitId || user.organizationId
        }));
        setKullanicilar(formatted);
      } catch (err) {
        setError(err);
        setKullanicilar([]);
      } finally {
        setLoading(false);
      }
    };

    fetchKullanicilar();
  }, []);

  return { kullanicilar, loading, error };
};