
import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const useUnitManagement = () => {
  const [units, setUnits] = useState([]);

  useEffect(() => {
    const storedUnits = localStorage.getItem('units');
    if (storedUnits) {
      setUnits(JSON.parse(storedUnits));
    } else {
      initializeDefaultUnits();
    }
  }, []);

  const initializeDefaultUnits = () => {
    const defaultUnits = [
      { unitId: 'unit-001', unitName: 'Genel Müdürlük', unitCode: 'GM', parentUnit: null, status: 'aktif', createdAt: new Date().toISOString() },
      { unitId: 'unit-002', unitName: 'İnsan Kaynakları', unitCode: 'IK', parentUnit: 'unit-001', status: 'aktif', createdAt: new Date().toISOString() },
      { unitId: 'unit-003', unitName: 'Bilgi İşlem', unitCode: 'IT', parentUnit: 'unit-001', status: 'aktif', createdAt: new Date().toISOString() },
    ];
    localStorage.setItem('units', JSON.stringify(defaultUnits));
    setUnits(defaultUnits);
    return defaultUnits;
  };

  const saveUnits = (newUnits) => {
    localStorage.setItem('units', JSON.stringify(newUnits));
    setUnits(newUnits);
    window.dispatchEvent(new Event('units-update'));
  };

  const addUnit = (unitData) => {
    const newUnit = {
      unitId: uuidv4(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      status: 'aktif',
      ...unitData
    };
    saveUnits([...units, newUnit]);
    return newUnit;
  };

  const updateUnit = (unitId, unitData) => {
    const updatedUnits = units.map(u => 
      u.unitId === unitId ? { ...u, ...unitData, updatedAt: new Date().toISOString() } : u
    );
    saveUnits(updatedUnits);
  };

  const deleteUnit = (unitId) => {
    // Soft delete
    const updatedUnits = units.map(u => 
      u.unitId === unitId ? { ...u, status: 'pasif', updatedAt: new Date().toISOString() } : u
    );
    saveUnits(updatedUnits);
  };

  const getUnits = useCallback(() => units, [units]);
  
  const getActiveUnits = useCallback(() => units.filter(u => u.status === 'aktif'), [units]);
  
  const getUnitById = useCallback((unitId) => units.find(u => u.unitId === unitId), [units]);

  const getUnitHierarchy = useCallback(() => {
    const buildTree = (parentId = null) => {
      return units
        .filter(u => u.parentUnit === parentId)
        .map(u => ({
          ...u,
          children: buildTree(u.unitId)
        }));
    };
    return buildTree(null);
  }, [units]);

  return {
    units,
    getUnits,
    getActiveUnits,
    getUnitById,
    getUnitHierarchy,
    addUnit,
    updateUnit,
    deleteUnit
  };
};
