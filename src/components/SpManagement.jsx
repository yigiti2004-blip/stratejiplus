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
import { getCompanyData, insertCompanyData, updateCompanyData, deleteCompanyData } from '@/lib/supabase';
import { LoadingState } from '@/components/ui/LoadingSpinner';

// Shared component for Management View
const SpManagement = ({ currentUser: propCurrentUser }) => {
  const { currentUser: authCurrentUser } = useAuthContext();
  const currentUser = propCurrentUser || authCurrentUser;
  const [activeTab, setActiveTab] = useState('areas');
  const [loading, setLoading] = useState(true);
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

  const refreshData = async () => {
    try {
      setLoading(true);
      const companyId = currentUser?.companyId;
      const userId = currentUser?.id || currentUser?.userId;
      const isAdmin = currentUser?.roleId === 'admin';

      // Load from Supabase (with localStorage fallback)
      const [areas, objectives, targets, indicators, activities, organizations] = await Promise.all([
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
        responsibleUnit: item.responsible_unit || item.responsibleUnit,
      }));

      setData({
        areas: mapData(areas),
        objectives: mapData(objectives),
        targets: mapData(targets),
        indicators: mapData(indicators),
        activities: mapData(activities),
        organizations: mapData(organizations),
      });
    } catch (e) { 
      console.error(e); 
    } finally {
      setLoading(false);
    }
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

  const handleDelete = async (item) => {
    if(!window.confirm("Bu kaydı silmek istediğinize emin misiniz? Alt kayıtlar da silinebilir.")) return;

    const tableMap = { areas:'strategic_areas', objectives:'strategic_objectives', targets:'targets', indicators:'indicators', activities:'activities' };
    const table = tableMap[activeTab];
    const userId = currentUser?.id || currentUser?.userId;
    
    const { error } = await deleteCompanyData(table, item.id, userId);
    
    if (error) {
      showErrorToast("Silme işlemi başarısız");
      return;
    }
    
    showSuccessToast("Kayıt silindi.");
    refreshData();
    setDetailPanelOpen(false);
  };

  const handleSave = async (formData) => {
    try {
        const tableMap = { areas:'strategic_areas', objectives:'strategic_objectives', targets:'targets', indicators:'indicators', activities:'activities' };
        const table = tableMap[activeTab];
        const companyId = currentUser?.companyId;
        const userId = currentUser?.id || currentUser?.userId;
        
        if (editingItem) {
           // Update existing item
           const { error } = await updateCompanyData(table, editingItem.id, formData, userId);
           if (error) {
             showErrorToast("Güncelleme başarısız");
             return;
           }
        } else {
           // Create new item
           const newItem = {
             ...formData,
             id: `${activeTab.slice(0,3)}-${Date.now()}`,
           };
           const { data: insertedData, error } = await insertCompanyData(table, newItem, userId, companyId);
           if (error) {
             console.error('Insert error details:', error);
             const errorMessage = error.message || error.details || 'Kayıt oluşturulamadı';
             showErrorToast(`Kayıt oluşturulamadı: ${errorMessage}`);
             return;
           }
           console.log('Successfully inserted:', insertedData);
        }
        
        // Refresh data
        refreshData();
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
                
                {loading ? (
                  <LoadingState text="Veriler yükleniyor..." />
                ) : filteredList.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">Kayıt bulunamadı.</div>
                ) : null}

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