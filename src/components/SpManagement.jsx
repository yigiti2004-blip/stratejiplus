import React, { useState, useEffect, useMemo } from 'react';
import { Layers, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { showSuccessToast, showErrorToast } from '@/lib/toast';
import EditItemModal from '@/components/EditItemModal';
import DetailPanel from '@/components/DetailPanel';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/hooks/useAuthContext';
import { CompanyBadge } from '@/components/CompanyBadge';

// Shared component for Management View
const SpManagement = ({ currentUser: propCurrentUser }) => {
  const { currentUser: authCurrentUser } = useAuthContext();
  const currentUser = propCurrentUser || authCurrentUser;
  const [activeTab, setActiveTab] = useState('areas');
  const [data, setData] = useState({
    areas: [], objectives: [], targets: [], indicators: [], activities: [], organizations: [] 
  });
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Detail Panel State
  const [selectedDetailItem, setSelectedDetailItem] = useState(null);
  const [detailPanelOpen, setDetailPanelOpen] = useState(false);

  useEffect(() => { refreshData(); }, [currentUser?.companyId, currentUser?.roleId]);

  const refreshData = () => {
    try {
      const companyId = currentUser?.companyId;
      const allAreas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
      const allObjectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
      const allTargets = JSON.parse(localStorage.getItem('targets') || '[]');
      const allIndicators = JSON.parse(localStorage.getItem('indicators') || '[]');
      const allActivities = JSON.parse(localStorage.getItem('activities') || '[]');
      const allOrganizations = JSON.parse(localStorage.getItem('organizations') || '[]');
      
      // Filter by company_id
      const filterByCompany = (arr) => {
        if (!companyId) return arr;
        return arr.filter(item => item.companyId === companyId);
      };
      
      setData({
        areas: filterByCompany(allAreas),
        objectives: filterByCompany(allObjectives),
        targets: filterByCompany(allTargets),
        indicators: filterByCompany(allIndicators),
        activities: filterByCompany(allActivities),
        organizations: filterByCompany(allOrganizations),
      });
    } catch (e) { console.error(e); }
  };

  const handleCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setIsModalOpen(true);
    setDetailPanelOpen(false); // Close detail panel when editing starts
  };

  const handleDelete = (item) => {
    if(!window.confirm("Bu kaydı silmek istediğinize emin misiniz? Alt kayıtlar da silinebilir.")) return;

    const map = { areas:'strategicAreas', objectives:'strategicObjectives', targets:'targets', indicators:'indicators', activities:'activities' };
    const listKey = map[activeTab];
    const currentList = data[activeTab] || [];
    const updatedList = currentList.filter(i => i.id !== item.id);
    
    localStorage.setItem(listKey, JSON.stringify(updatedList));
    showSuccessToast("Kayıt silindi.");
    refreshData();
    setDetailPanelOpen(false);
  };

  const handleSave = (formData) => {
    try {
        const map = { areas:'strategicAreas', objectives:'strategicObjectives', targets:'targets', indicators:'indicators', activities:'activities' };
        const key = map[activeTab];
        const companyId = currentUser?.companyId; // Get company ID from current user
        
        // Get ALL items from localStorage (not filtered)
        const allItems = JSON.parse(localStorage.getItem(key) || '[]');
        
        let updatedAllItems;
        if (editingItem) {
           // Update existing item in full list
           updatedAllItems = allItems.map(i => {
             if (i.id === editingItem.id) {
               return { 
                 ...i, 
                 ...formData, 
                 companyId: companyId || i.companyId, // Keep existing or set new
                 updatedAt: new Date().toISOString() 
               };
             }
             return i;
           });
        } else {
           // Create new item - add companyId
           const newItem = {
             ...formData,
             id: `${activeTab.slice(0,3)}-${Date.now()}`,
             companyId: companyId, // Add company ID to new items
             createdAt: new Date().toISOString()
           };
           updatedAllItems = [...allItems, newItem];
        }

        // Save to localStorage
        localStorage.setItem(key, JSON.stringify(updatedAllItems));
        
        // Refresh data (will filter by company)
        refreshData();
        // setIsModalOpen(false); // Handled by EditItemModal onClose
        showSuccessToast(editingItem ? "Güncelleme başarılı" : "Kayıt oluşturuldu");
        
        // Broadcast event for other components
        window.dispatchEvent(new Event('storage'));
    } catch (err) {
        console.error("Save error:", err);
        showErrorToast("Hata oluştu");
    }
  };

  const filteredList = useMemo(() => {
     return data[activeTab] || [];
  }, [activeTab, data]);

  // Determine parent for create mode (Only applicable if we were drilling down, but flat list create assumes root or manual selection in a real app. 
  // For this flat view, we don't strictly enforce parent selection in create, or we assume root. 
  // However, SpItemForm expects 'parentItem' for code generation of child items.
  // In a Flat Tab view, we might not have a context parent. The generator handles this gracefully or generates orphan codes if needed, 
  // but ideally SP Management should allow selecting parent. 
  // For now, preserving existing functionality which is mostly flat or context-less in tabs.)
  const contextParent = null; 

  return (
    <div className="h-[calc(100vh-100px)] bg-white rounded-xl shadow-sm border border-gray-200 flex flex-col overflow-hidden">
      <div className="p-4 border-b flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold text-gray-900">SP Yönetim Paneli</h2>
        </div>
        <Button onClick={handleCreate} className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
            <Plus className="w-4 h-4 mr-2" /> Yeni Ekle
        </Button>
      </div>

      <div className="flex-1 overflow-hidden flex">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="px-4 pt-4">
             <TabsList className="w-full justify-start bg-gray-100 p-1">
                <TabsTrigger value="areas">Alanlar</TabsTrigger>
                <TabsTrigger value="objectives">Amaçlar</TabsTrigger>
                <TabsTrigger value="targets">Hedefler</TabsTrigger>
                <TabsTrigger value="indicators">Göstergeler</TabsTrigger>
                <TabsTrigger value="activities">Faaliyetler</TabsTrigger>
             </TabsList>
          </div>
          
          <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-4">
             <div className="space-y-2">
                {/* Header Row */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-gray-50 text-xs font-bold text-gray-500 uppercase rounded-t-lg border-b">
                   <div className="col-span-2">Kod</div>
                   <div className={currentUser?.roleId === 'admin' ? "col-span-3" : "col-span-4"}>Ad</div>
                   <div className={currentUser?.roleId === 'admin' ? "col-span-3" : "col-span-4"}>Sorumlu</div>
                   {currentUser?.roleId === 'admin' && <div className="col-span-2">Şirket</div>}
                   <div className="col-span-2 text-center">Durum</div>
                </div>
                
                {filteredList.length === 0 && <div className="text-center py-8 text-gray-400">Kayıt bulunamadı.</div>}

                {filteredList.map(item => (
                   <div key={item.id} 
                        onClick={() => { setSelectedDetailItem(item); setDetailPanelOpen(true); }}
                        className="grid grid-cols-12 gap-4 px-4 py-3 border-b hover:bg-blue-50/50 cursor-pointer transition-colors items-center text-sm group"
                   >
                      <div className="col-span-2 font-mono font-bold text-blue-600">{item.code}</div>
                      <div className={cn(currentUser?.roleId === 'admin' ? "col-span-3" : "col-span-4", "font-medium text-gray-900 truncate")} title={item.name}>{item.name}</div>
                      <div className={cn(currentUser?.roleId === 'admin' ? "col-span-3" : "col-span-4", "text-gray-600 truncate")}>{item.responsibleUnit || '-'}</div>
                      {currentUser?.roleId === 'admin' && (
                        <div className="col-span-2">
                          <CompanyBadge companyId={item.companyId} size="sm" />
                        </div>
                      )}
                      <div className="col-span-2 text-center">
                         <span className={cn(
                             "px-2 py-0.5 rounded-full text-xs font-medium border",
                             item.status === 'Aktif' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-gray-50 text-gray-600 border-gray-200'
                         )}>
                            {item.status || 'Aktif'}
                         </span>
                      </div>
                   </div>
                ))}
             </div>
          </TabsContent>
        </Tabs>

        <DetailPanel 
            isOpen={detailPanelOpen} 
            onClose={() => setDetailPanelOpen(false)} 
            item={selectedDetailItem} 
            type={
                activeTab === 'areas' ? 'Alan' : 
                activeTab === 'objectives' ? 'Amaç' : 
                activeTab === 'targets' ? 'Hedef' : 
                activeTab === 'indicators' ? 'Gösterge' : 'Faaliyet'
            }
            onEdit={handleEdit}
            onDelete={handleDelete}
        />
      </div>

      <EditItemModal
         isOpen={isModalOpen}
         editingItem={editingItem}
         itemType={activeTab}
         allData={data}
         parentItem={contextParent}
         organizations={data.organizations}
         onSave={handleSave}
         onClose={() => setIsModalOpen(false)}
      />
    </div>
  );
};

export default SpManagement;