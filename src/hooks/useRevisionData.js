import { useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { useAuthContext } from './useAuthContext';
import { getCompanyData, insertCompanyData, updateCompanyData, deleteCompanyData } from '@/lib/supabase';

export const useRevisionData = () => {
  const { currentUser } = useAuthContext();
  const [revisions, setRevisions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    total: 0,
    byStatus: {},
    byType: {},
    byReason: {},
    byYear: {}
  });

  const loadRevisions = useCallback(async () => {
    try {
      setLoading(true);
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      if (!companyId || !userId) {
        console.warn('useRevisionData: Missing user/company info');
        setRevisions([]);
        setStats({ total: 0, byStatus: {}, byType: {}, byReason: {}, byYear: {} });
        setLoading(false);
        return;
      }

      // Load revisions from Supabase
      const revisionsRaw = await getCompanyData('revisions', userId, companyId, isAdmin);
      
      // Map Supabase format to frontend format
      const mappedRevisions = (revisionsRaw || []).map(rev => {
        const changes = rev.changes || {};
        return {
          revisionId: rev.id,
          itemId: rev.entity_id,
          itemLevel: rev.entity_type || '',
          itemCode: changes.item_code || '',
          itemName: changes.item_name || '',
          revisionType: rev.revision_type || '',
          revisionReason: rev.reason || '',
          reasonText: rev.reason || '',
          beforeState: changes.before || {},
          afterState: changes.after || {},
          changedFields: changes.changed_fields || [],
          status: rev.status || 'draft',
          decisionNo: changes.decision_no || '',
          decisionDate: changes.decision_date || rev.created_at?.split('T')[0] || '',
          proposedBy: changes.proposed_by || '',
          approvedBy: rev.approved_by || '',
          approvalDate: rev.approval_date || null,
          createdAt: rev.created_at || new Date().toISOString(),
          updatedAt: rev.updated_at || rev.created_at || new Date().toISOString(),
        };
      });

      setRevisions(mappedRevisions);
      calculateStats(mappedRevisions);
    } catch (error) {
      console.error("Failed to load revisions from Supabase:", error);
      setRevisions([]);
      setStats({ total: 0, byStatus: {}, byType: {}, byReason: {}, byYear: {} });
    } finally {
      setLoading(false);
    }
  }, [currentUser?.companyId, currentUser?.id, currentUser?.userId, currentUser?.roleId]);

  useEffect(() => {
    loadRevisions();
  }, [loadRevisions]);

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
      const typeLabel = rev.revisionType?.label || rev.revisionType || 'Bilinmeyen';
      newStats.byType[typeLabel] = (newStats.byType[typeLabel] || 0) + 1;

      // Reason
      const reasonLabel = rev.revisionReason?.label || rev.revisionReason || 'Bilinmeyen';
      newStats.byReason[reasonLabel] = (newStats.byReason[reasonLabel] || 0) + 1;

      // Year
      const year = new Date(rev.createdAt).getFullYear();
      newStats.byYear[year] = (newStats.byYear[year] || 0) + 1;
    });

    setStats(newStats);
  };

  const saveRevision = async (revisionData) => {
    try {
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;

      if (!companyId || !userId) {
        console.error('Missing user/company for saveRevision');
        throw new Error('Missing user/company for saveRevision');
      }

      const revisionId = revisionData.revisionId || `rev-${uuidv4()}`;
      const isUpdate = revisionData.revisionId && revisions.some(r => r.revisionId === revisionId);

      // Map frontend format to Supabase schema
      // Store extra fields in changes JSONB
      const payload = {
        id: revisionId,
        revision_type: revisionData.revisionType?.value || revisionData.revisionType || '',
        entity_type: revisionData.itemLevel || '',
        entity_id: revisionData.itemId || '',
        changes: {
          before: revisionData.beforeState || {},
          after: revisionData.afterState || {},
          changed_fields: revisionData.changedFields || [],
          item_code: revisionData.itemCode || '',
          item_name: revisionData.itemName || '',
          decision_no: revisionData.decisionNo || '',
          decision_date: revisionData.decisionDate || null,
          proposed_by: revisionData.proposedBy || null,
        },
        reason: revisionData.reasonText || revisionData.revisionReason?.label || revisionData.revisionReason || '',
        status: revisionData.status || 'draft',
        approved_by: revisionData.approvedBy || null,
        approval_date: revisionData.approvalDate || null,
      };

      console.log('💾 Saving revision to Supabase:', payload);

      if (isUpdate) {
        const { error } = await updateCompanyData('revisions', revisionId, payload, userId, companyId);
        if (error) {
          console.error('Error updating revision:', error);
          throw error;
        }
      } else {
        const { data: result, error } = await insertCompanyData('revisions', payload, userId, companyId);
        if (error) {
          console.error('Error inserting revision:', error);
          throw error;
        }
      }

      // Reload data
      await loadRevisions();

      // If approved/applied, trigger actual SP data update
      if (revisionData.status === 'applied') {
        await applyRevisionToSP(revisionData);
      }

      return true;
    } catch (error) {
      console.error("Failed to save revision:", error);
      return false;
    }
  };

  const applyRevisionToSP = async (revision) => {
    // Map item level to Supabase table names
    const tableMap = { 
      'Alan': 'strategic_areas', 
      'Amaç': 'strategic_objectives', 
      'Hedef': 'targets', 
      'Gösterge': 'indicators', 
      'Faaliyet': 'activities',
      'Bütçe & Fasıl': 'budget_chapters'
    };
    
    const table = tableMap[revision.itemLevel];
    if (!table) {
      console.warn(`No table mapping found for item level: ${revision.itemLevel}`);
      return;
    }

    try {
      const userId = currentUser?.id || currentUser?.userId;
      if (!userId) {
        console.error('Missing user for applyRevisionToSP');
        return;
      }

      // Prepare updates
      const updates = {};
      
      // If it's a cancellation, update status
      if (revision.revisionType?.value === 'cancellation' || revision.revisionType === 'cancellation') {
        updates.status = 'İptal Edildi';
      } else if (revision.afterState) {
        // Update fields from afterState
        Object.keys(revision.afterState).forEach(key => {
          updates[key] = revision.afterState[key];
        });
      }

      console.log('🔄 Applying revision to SP data:', table, revision.itemId, updates);

      const { error } = await updateCompanyData(table, revision.itemId, updates, userId, companyId);
      if (error) {
        console.error('Error applying revision to SP data:', error);
      } else {
        console.log('✅ Revision applied successfully');
      }
    } catch (e) {
      console.error("Failed to apply revision to SP data", e);
    }
  };

  const getRevisionsByItemId = (itemId) => {
    return revisions
      .filter(r => String(r.itemId) === String(itemId))
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  };

  return {
    revisions,
    stats,
    loading,
    saveRevision,
    getRevisionsByItemId,
    refresh: loadRevisions
  };
};
