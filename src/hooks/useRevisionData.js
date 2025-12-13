import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid'; // Assuming we use a simple ID generator or just Math.random for now if uuid not available

export const useRevisionData = () => {
  const [revisions, setRevisions] = useState([]);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byType: {},
    byReason: {},
    byYear: {}
  });

  useEffect(() => {
    loadRevisions();
    // Listen for storage events to sync across tabs/components
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const handleStorageChange = (e) => {
    if (e.key === 'sp_revisions') {
      loadRevisions();
    }
  };

  const loadRevisions = () => {
    try {
      const stored = localStorage.getItem('sp_revisions');
      const parsedRevisions = stored ? JSON.parse(stored) : [];
      setRevisions(parsedRevisions);
      calculateStats(parsedRevisions);
    } catch (error) {
      console.error("Failed to load revisions:", error);
      setRevisions([]);
    }
  };

  const calculateStats = (data) => {
    const newStats = {
      total: data.length,
      byStatus: {},
      byType: {},
      byReason: {},
      byYear: {}
    };

    data.forEach(rev => {
      // Status
      newStats.byStatus[rev.status] = (newStats.byStatus[rev.status] || 0) + 1;
      
      // Type
      const typeLabel = rev.revisionType?.label || rev.revisionType;
      newStats.byType[typeLabel] = (newStats.byType[typeLabel] || 0) + 1;

      // Reason
      const reasonLabel = rev.revisionReason?.label || rev.revisionReason;
      newStats.byReason[reasonLabel] = (newStats.byReason[reasonLabel] || 0) + 1;

      // Year
      const year = new Date(rev.createdAt).getFullYear();
      newStats.byYear[year] = (newStats.byYear[year] || 0) + 1;
    });

    setStats(newStats);
  };

  const saveRevision = (revisionData) => {
    try {
      const stored = localStorage.getItem('sp_revisions');
      const currentRevisions = stored ? JSON.parse(stored) : [];
      
      let updatedRevisions;
      const existingIndex = currentRevisions.findIndex(r => r.revisionId === revisionData.revisionId);
      
      if (existingIndex >= 0) {
        updatedRevisions = [...currentRevisions];
        updatedRevisions[existingIndex] = { ...updatedRevisions[existingIndex], ...revisionData, updatedAt: new Date().toISOString() };
      } else {
        const newRevision = {
          ...revisionData,
          revisionId: revisionData.revisionId || `rev-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          status: revisionData.status || 'draft'
        };
        updatedRevisions = [newRevision, ...currentRevisions];
      }

      localStorage.setItem('sp_revisions', JSON.stringify(updatedRevisions));
      setRevisions(updatedRevisions);
      calculateStats(updatedRevisions);
      
      // If approved/applied, trigger actual SP data update
      if (revisionData.status === 'applied') {
        applyRevisionToSP(revisionData);
      }

      // Dispatch event for other components
      window.dispatchEvent(new Event('storage'));
      return true;
    } catch (error) {
      console.error("Failed to save revision:", error);
      return false;
    }
  };

  const applyRevisionToSP = (revision) => {
    // Logic to update the actual items in localStorage based on itemLevel
    const map = { 
        'Alan': 'strategicAreas', 
        'Amaç': 'strategicObjectives', 
        'Hedef': 'targets', 
        'Gösterge': 'indicators', 
        'Faaliyet': 'activities',
        'Bütçe & Fasıl': 'fasiller'
    };
    
    const storageKey = map[revision.itemLevel];
    if (!storageKey) {
        console.warn(`No storage key mapping found for item level: ${revision.itemLevel}`);
        return;
    }

    try {
        const currentList = JSON.parse(localStorage.getItem(storageKey) || '[]');
        const updatedList = currentList.map(item => {
            // Check for ID match. Some use 'id', fasiller use 'fasil_id'
            const itemId = item.id || item.fasil_id;
            
            if (String(itemId) === String(revision.itemId)) {
                // Merge changed fields
                const changes = {};
                // If it's a cancellation, we might update status, otherwise we update fields
                if (revision.revisionType?.value === 'cancellation') {
                    changes.status = 'İptal Edildi';
                } else if (revision.afterState) {
                   // Ensure we only update fields that exist in afterState
                   Object.keys(revision.afterState).forEach(key => {
                       // Skip metadata keys if any
                       changes[key] = revision.afterState[key];
                   });
                }
                
                // Add metadata about the update
                return { 
                  ...item, 
                  ...changes, 
                  lastRevisionId: revision.revisionId, 
                  updatedAt: new Date().toISOString() 
                };
            }
            return item;
        });
        localStorage.setItem(storageKey, JSON.stringify(updatedList));
        
        // Trigger storage event manually to ensure other components pick up changes immediately
        window.dispatchEvent(new Event('storage'));
        
    } catch (e) {
        console.error("Failed to apply revision to SP data", e);
    }
  };

  const getRevisionsByItemId = (itemId) => {
    return revisions.filter(r => String(r.itemId) === String(itemId)).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  return {
    revisions,
    stats,
    saveRevision,
    getRevisionsByItemId,
    refresh: loadRevisions
  };
};