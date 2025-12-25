import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import RevisionDashboard from './RevisionDashboard';
import RevisionList from './RevisionList';
import RevisionWizard from './RevisionWizard';
import RevisionHistory from './RevisionHistory';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { RefreshCcw, List, History, PlusCircle, LayoutDashboard } from 'lucide-react';

const RevisionModule = ({ currentUser }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [wizardOpen, setWizardOpen] = useState(false);
  const [selectedItemForWizard, setSelectedItemForWizard] = useState(null);
  const [selectedRevisionDetail, setSelectedRevisionDetail] = useState(null);
  const [selectedItemForHistory, setSelectedItemForHistory] = useState(null);

  const handleStartWizard = (item = null) => {
    setSelectedItemForWizard(item);
    setWizardOpen(true);
  };

  const handleViewDetail = (revision) => {
    // For now, view detail could just open wizard in read-only or history
    // Let's switch to history tab and select item if possible, or just log
    console.log("View detail", revision);
    // Alternatively, open a detail modal
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <RefreshCcw className="text-purple-600 w-8 h-8"/> Revizyon Yönetim Modülü
          </h1>
          <p className="text-sm text-gray-600">Stratejik plan değişiklik, iptal ve güncellemelerinin yönetimi.</p>
        </div>
        <button 
           onClick={() => handleStartWizard()} 
           className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow-sm transition-colors"
        >
           <PlusCircle className="w-5 h-5"/> Yeni Revizyon Talebi
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 min-h-[600px] flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <div className="border-b px-4 bg-gray-50/50">
            <TabsList className="bg-transparent h-12">
              <TabsTrigger value="dashboard" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><LayoutDashboard className="w-4 h-4 mr-2"/> Pano</TabsTrigger>
              <TabsTrigger value="list" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><List className="w-4 h-4 mr-2"/> Revizyon Listesi</TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-white data-[state=active]:shadow-sm"><History className="w-4 h-4 mr-2"/> Geçmiş & Zaman Çizelgesi</TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6 flex-1 bg-gray-50/30">
            <TabsContent value="dashboard" className="mt-0 h-full">
              <RevisionDashboard />
            </TabsContent>
            
            <TabsContent value="list" className="mt-0 h-full">
              <RevisionList onViewDetail={handleViewDetail} />
            </TabsContent>
            
            <TabsContent value="history" className="mt-0 h-full">
               <RevisionHistory 
                 itemId={selectedItemForHistory?.id || null}
                 onSelectItem={() => handleStartWizard(null)}
               /> 
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* Wizard Modal */}
      <Dialog open={wizardOpen} onOpenChange={setWizardOpen}>
         <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white">
            <RevisionWizard 
               initialItem={selectedItemForWizard} 
               onClose={() => setWizardOpen(false)}
               onSuccess={() => {
                  setWizardOpen(false);
                  setActiveTab('list');
               }}
            />
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default RevisionModule;