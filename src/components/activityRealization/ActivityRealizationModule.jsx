import React, { useState, useMemo } from 'react';
import { useActivityRealization } from '@/hooks/useActivityRealization';
import { useAuthContext } from '@/hooks/useAuthContext';
import { getCompanyData } from '@/lib/supabase';
import ActivityRealizationTree from './ActivityRealizationTree';
import ActivityDetailView from './ActivityDetailView';
import RealizationRecordForm from './RealizationRecordForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { CheckCircle } from 'lucide-react';

/**
 * Activity Realization Module
 * - Data entry ONLY at Activity level
 * - Upper levels calculate automatically as averages
 * - Read-only tree view with realization rates, budget, risks, revisions
 */
const ActivityRealizationModule = () => {
  const { currentUser } = useAuthContext();
  const {
    realizationRecords,
    activities,
    loading,
    addRealizationRecord,
    getRecordsForActivity,
    calculateActivityCompletion,
    calculateIndicatorCompletion,
    calculateTargetCompletion,
    calculateObjectiveCompletion,
    calculateAreaCompletion,
    canAddRealization,
  } = useActivityRealization();

  const [selectedItem, setSelectedItem] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);

  // Load full hierarchy for tree view
  const [hierarchyData, setHierarchyData] = useState({
    areas: [],
    objectives: [],
    targets: [],
    indicators: [],
  });

  React.useEffect(() => {
    const loadHierarchy = async () => {
      try {
        const companyId = currentUser?.companyId;
        const userId = currentUser?.id || currentUser?.userId;
        const isAdmin = currentUser?.roleId === 'admin';

        if (!companyId || !userId) return;

        const [areas, objectives, targets, indicators] = await Promise.all([
          getCompanyData('strategic_areas', userId, companyId, isAdmin),
          getCompanyData('strategic_objectives', userId, companyId, isAdmin),
          getCompanyData('targets', userId, companyId, isAdmin),
          getCompanyData('indicators', userId, companyId, isAdmin),
        ]);

        setHierarchyData({
          areas: areas || [],
          objectives: objectives || [],
          targets: targets || [],
          indicators: indicators || [],
        });
      } catch (error) {
        console.error('Error loading hierarchy:', error);
      }
    };

    loadHierarchy();
  }, [currentUser]);

  const handleSelectItem = (item) => {
    setSelectedItem(item);
    if (item.type === 'Faaliyet') {
      const activity = activities.find(a => a.id === item.id);
      setSelectedActivity(activity);
    } else {
      setSelectedActivity(null);
    }
  };

  const handleAddRecord = (activity) => {
    if (!canAddRealization(activity)) {
      alert('Bu faaliyet için gerçekleşme kaydı ekleme yetkiniz bulunmamaktadır.');
      return;
    }
    setSelectedActivity(activity);
    setIsFormOpen(true);
  };

  const handleSaveRecord = async (recordData) => {
    try {
      await addRealizationRecord(selectedActivity.id, recordData);
      setIsFormOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error saving record:', error);
      alert('Kayıt eklenirken bir hata oluştu: ' + (error.message || 'Bilinmeyen hata'));
    }
  };

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CheckCircle className="w-6 h-6 text-blue-600" />
              Faaliyet Gerçekleşme Yönetimi
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Faaliyet seviyesinde gerçekleşme kayıtları ve otomatik hesaplanan üst seviye göstergeleri
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Read-only Tree View */}
        <div className="w-1/3 border-r border-gray-200 bg-white overflow-y-auto">
          <ActivityRealizationTree
            hierarchyData={hierarchyData}
            activities={activities}
            realizationRecords={realizationRecords}
            selectedItem={selectedItem}
            onSelectItem={handleSelectItem}
            calculateActivityCompletion={calculateActivityCompletion}
            calculateIndicatorCompletion={calculateIndicatorCompletion}
            calculateTargetCompletion={calculateTargetCompletion}
            calculateObjectiveCompletion={calculateObjectiveCompletion}
            calculateAreaCompletion={calculateAreaCompletion}
          />
        </div>

        {/* Right: Detail View */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          {selectedItem ? (
            selectedItem.type === 'Faaliyet' && selectedActivity ? (
              <ActivityDetailView
                activity={selectedActivity}
                realizationRecords={getRecordsForActivity(selectedActivity.id)}
                canAddRecord={canAddRealization(selectedActivity)}
                onAddRecord={() => handleAddRecord(selectedActivity)}
                currentUser={currentUser}
              />
            ) : (
              <div className="p-6">
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-4">
                    {selectedItem.code} - {selectedItem.name}
                  </h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Gerçekleşme Oranı</h3>
                      <p className="text-2xl font-bold text-gray-900">
                        {selectedItem.type === 'Faaliyet'
                          ? calculateActivityCompletion(selectedItem.id).toFixed(1)
                          : '0.0'}%
                      </p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-700 mb-2">Not</h3>
                      <p className="text-sm text-gray-600">
                        Bu seviyede veri girişi yapılamaz. Gerçekleşme oranı alt seviyelerden otomatik hesaplanır.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              Bir öğe seçiniz
            </div>
          )}
        </div>
      </div>

      {/* Add Record Modal */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedActivity && (
            <RealizationRecordForm
              activity={selectedActivity}
              onSave={handleSaveRecord}
              onCancel={() => {
                setIsFormOpen(false);
                setSelectedActivity(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActivityRealizationModule;

