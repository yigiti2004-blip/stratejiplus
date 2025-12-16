import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { LayoutList, Expand, Expand as Collapse } from 'lucide-react';
import DetailPanel from '@/components/DetailPanel';
import EditItemModal from '@/components/EditItemModal';
import { TreeNode } from '@/components/sp/TreeNode';
import { showSuccessToast } from '@/lib/toast';
import { useAuthContext } from '@/hooks/useAuthContext';
import { getCompanyData, updateCompanyData } from '@/lib/supabase';

const StrategicPlanning = ({ currentUser: propCurrentUser }) => {
  const { currentUser: authCurrentUser } = useAuthContext();
  const currentUser = propCurrentUser || authCurrentUser;
  const [treeData, setTreeData] = useState([]);
  const [rawData, setRawData] = useState({}); // Keep raw data for updates
  const [expandedItems, setExpandedItems] = useState(new Set());
  const [selectedItem, setSelectedItem] = useState(null);
  
  // Edit State
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Helper to build hierarchy
  const buildHierarchy = (data) => {
    const { areas, objectives, targets, indicators, activities } = data;
    if (!areas) return [];

    return areas.map(area => ({
      ...area,
      type: 'Alan',
      children: objectives
        .filter(o => o.strategicAreaId === area.id)
        .map(obj => ({
          ...obj,
          type: 'Amaç',
          children: targets
            .filter(t => t.objectiveId === obj.id)
            .map(target => ({
              ...target,
              type: 'Hedef',
              children: [
                ...indicators.filter(i => i.targetId === target.id).map(i => ({...i, type: 'Gösterge'})),
                ...activities.filter(a => a.targetId === target.id).map(a => ({...a, type: 'Faaliyet'}))
              ]
            }))
        }))
    }));
  };

  const loadData = async () => {
    try {
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      // Load from Supabase (with localStorage fallback)
      const [areasRaw, objectivesRaw, targetsRaw, indicatorsRaw, activitiesRaw, organizationsRaw] = await Promise.all([
        getCompanyData('strategic_areas', userId, companyId, isAdmin),
        getCompanyData('strategic_objectives', userId, companyId, isAdmin),
        getCompanyData('targets', userId, companyId, isAdmin),
        getCompanyData('indicators', userId, companyId, isAdmin),
        getCompanyData('activities', userId, companyId, isAdmin),
        getCompanyData('units', userId, companyId, isAdmin),
      ]);

      // Map Supabase snake_case to camelCase
      const mapData = (items) => items.map(item => ({
        ...item,
        companyId: item.company_id || item.companyId,
        organizationId: item.organization_id || item.organizationId,
        strategicAreaId: item.strategic_area_id || item.strategicAreaId,
        objectiveId: item.objective_id || item.objectiveId,
        targetId: item.target_id || item.targetId,
        indicatorId: item.indicator_id || item.indicatorId,
      }));

      const areas = mapData(areasRaw);
      const objectives = mapData(objectivesRaw);
      const targets = mapData(targetsRaw);
      const indicators = mapData(indicatorsRaw);
      const activities = mapData(activitiesRaw);
      const organizations = mapData(organizationsRaw);

      const allData = { areas, objectives, targets, indicators, activities, organizations };
      
      // Debug: log what we received from Supabase for this tenant
      console.log('🔎 StrategicPlanning loadData: companyId =', companyId, 'userId =', userId, 'isAdmin =', isAdmin);
      console.log('  areas:', areas.length, 'objectives:', objectives.length, 'targets:', targets.length, 'indicators:', indicators.length, 'activities:', activities.length);
      if (areas.length) {
        console.log('  sample area:', areas[0]);
      }
      if (objectives.length) {
        console.log('  sample objective:', objectives[0]);
      }
      if (targets.length) {
        console.log('  sample target:', targets[0]);
      }
      if (indicators.length) {
        console.log('  sample indicator:', indicators[0]);
      }
      if (activities.length) {
        console.log('  sample activity:', activities[0]);
      }

      setRawData(allData);
      
      const hierarchy = buildHierarchy(allData);
      setTreeData(hierarchy);
    } catch (error) {
      console.error("Error loading tree data:", error);
    }
  };

  useEffect(() => {
    loadData();
    window.addEventListener('storage', loadData);
    return () => window.removeEventListener('storage', loadData);
  }, [currentUser?.companyId]);

  const toggleExpand = (itemId) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleEditClick = (item) => {
    setEditingItem(item);
    setIsEditModalOpen(true);
  };

  const handleEditSave = async (formData) => {
    const typeMap = { 'Alan': 'strategic_areas', 'Amaç': 'strategic_objectives', 'Hedef': 'targets', 'Gösterge': 'indicators', 'Faaliyet': 'activities' };
    const table = typeMap[editingItem.type];
    
    if (!table) return;

    const userId = currentUser?.id || currentUser?.userId;
    
    const { error } = await updateCompanyData(table, editingItem.id, formData, userId);
    
    if (error) {
      console.error("Update error:", error);
      return;
    }
    
    showSuccessToast("Kayıt güncellendi");
    setEditingItem(null);
    setSelectedItem(null); 
    loadData();
    window.dispatchEvent(new Event('storage'));
  };

  const expandAll = () => {
    const allIds = new Set();
    const traverse = (nodes) => {
      nodes.forEach(node => {
        if (node.children && node.children.length > 0) {
          allIds.add(node.id);
          traverse(node.children);
        }
      });
    };
    traverse(treeData);
    setExpandedItems(allIds);
  };

  const collapseAll = () => {
    setExpandedItems(new Set());
  };

  const getTypeForModal = (item) => {
      if(!item) return 'areas';
      if(item.type === 'Alan') return 'areas';
      if(item.type === 'Amaç') return 'objectives';
      if(item.type === 'Hedef') return 'targets';
      if(item.type === 'Gösterge') return 'indicators';
      if(item.type === 'Faaliyet') return 'activities';
      return 'areas';
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col gap-4 bg-transparent">
      
      {/* View Header */}
      <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 flex justify-between items-center">
        <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 rounded-lg text-blue-600">
               <LayoutList className="w-5 h-5" />
            </div>
            <div>
               <h1 className="text-lg font-bold text-gray-900 leading-none">Stratejik Plan Hiyerarşisi</h1>
               <p className="text-sm text-gray-500 mt-1">Tüm hedefleri ağaç yapısında görüntüleyin</p>
            </div>
        </div>
        <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={expandAll} title="Tümünü Genişlet">
                <Expand className="w-4 h-4 mr-2" /> Tümünü Aç
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll} title="Tümünü Daralt">
                <Collapse className="w-4 h-4 mr-2" /> Tümünü Kapat
            </Button>
        </div>
      </div>

      <div className="strategic-planning-tree flex-1 overflow-hidden text-gray-900">
        {/* Tree Container */}
        <div className="tree-container shadow-sm bg-white rounded-xl border border-gray-200 overflow-auto">
          {treeData.length === 0 ? (
             <div className="flex flex-col items-center justify-center h-full text-gray-400">
                 <p>Görüntülenecek veri bulunamadı.</p>
                 <p className="text-sm mt-2">Lütfen SP Yönetim panelinden veri girişi yapınız.</p>
             </div>
          ) : (
             treeData.map(area => (
                <TreeNode
                  key={area.id}
                  item={area}
                  level={0}
                  expandedItems={expandedItems}
                  selectedItem={selectedItem}
                  onToggleExpand={toggleExpand}
                  onSelectItem={setSelectedItem}
                  onEdit={handleEditClick}
                  onDelete={() => {}}
                  children={area.children}
                />
             ))
          )}
        </div>

        {/* Detail Panel */}
        <DetailPanel 
           isOpen={!!selectedItem}
           onClose={() => setSelectedItem(null)}
           item={selectedItem}
           type={selectedItem?.type}
           onEdit={handleEditClick}
           onDelete={() => {}}
        />
      </div>

      {/* Edit Modal */}
      <EditItemModal
         isOpen={isEditModalOpen}
         editingItem={editingItem}
         itemType={getTypeForModal(editingItem)}
         allData={rawData}
         parentItem={null} // Context parent not needed for edit mode usually
         organizations={rawData.organizations}
         onSave={handleEditSave}
         onClose={() => setIsEditModalOpen(false)}
      />
    </div>
  );
};

export default StrategicPlanning;