import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useHarcamalar = () => {
  const [harcamalar, setHarcamalar] = useState(() => {
    try {
      const stored = localStorage.getItem('harcamalar');
      return stored ? JSON.parse(stored) : [];
    } catch (e) {
      console.error('Failed to parse harcamalar from localStorage', e);
      return [];
    }
  });

  // Persist to localStorage whenever harcamalar changes
  useEffect(() => {
    try {
      localStorage.setItem('harcamalar', JSON.stringify(harcamalar));
    } catch (e) {
      console.error('Failed to save harcamalar to localStorage', e);
    }
  }, [harcamalar]);

  const addHarcama = (formData) => {
    const newItem = {
      ...formData,
      harcama_id: formData.harcama_id || uuidv4(),
    };
    setHarcamalar((prev) => [...prev, newItem]);
  };

  const updateHarcama = (id, formData) => {
    setHarcamalar((prev) =>
      prev.map((h) => (h.harcama_id === id ? { ...formData, harcama_id: id } : h)),
    );
  };

  const deleteHarcama = (id) => {
    setHarcamalar((prev) => prev.filter((h) => h.harcama_id !== id));
  };

  return { harcamalar, addHarcama, updateHarcama, deleteHarcama };
};