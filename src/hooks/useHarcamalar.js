import { useState } from 'react';

export const useHarcamalar = () => {
  const [harcamalar, setHarcamalar] = useState([]);

  return { harcamalar, setHarcamalar };
};