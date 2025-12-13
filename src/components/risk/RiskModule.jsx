import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Plus, ShieldAlert } from 'lucide-react';
import { useRiskData } from '@/hooks/useRiskData';

// Sub Components
import RiskDashboard from './RiskDashboard';
import RiskList from './RiskList';
import RiskDetail from './RiskDetail';
import ProjectDefinitions from './ProjectDefinitions';
import RiskForm from './RiskForm';

const RiskModule = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedRisk, setSelectedRisk] = useState(null); // For detail view
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingRisk, setEditingRisk] = useState(null);

  // Hook for all data operations
  const { 
    risks, projects, 
    addRisk, updateRisk, deleteRisk, 
    addProject, updateProject, deleteProject,
    addActionPlan, updateActionPlan, deleteActionPlan,
    addMonitoringLog
  } = useRiskData();

  // Load SP Data for relationships (Read-Only)
  const spData = {
     'Stratejik Alan': JSON.parse(localStorage.getItem('strategicAreas') || '[]'),
     'Amaç': JSON.parse(localStorage.getItem('strategicObjectives') || '[]'),
     'Hedef': JSON.parse(localStorage.getItem('targets') || '[]'),
     'Gösterge': JSON.parse(localStorage.getItem('indicators') || '[]'),
     'Faaliyet': JSON.parse(localStorage.getItem('activities') || '[]')
  };

  // --- Handlers ---
  const handleOpenForm = (risk = null) => {
    setEditingRisk(risk);
    setIsFormOpen(true);
  };

  const handleSaveRisk = (data) => {
    if (editingRisk) {
       updateRisk(editingRisk.id, data);
       // Also update selected risk if viewing details
       if (selectedRisk && selectedRisk.id === editingRisk.id) {
          setSelectedRisk({ ...selectedRisk, ...data });
       }
    } else {
       addRisk(data);
    }
  };

  const handleDeleteRisk = (id) => {
    if (window.confirm('Bu riski silmek istediğinize emin misiniz?')) {
       deleteRisk(id);
       if (selectedRisk?.id === id) setSelectedRisk(null);
    }
  };

  const handleViewRisk = (risk) => {
    setSelectedRisk(risk);
    // Switch to detail view mode (could be a tab or overlay)
    // Here we will render detail conditionally
  };

  // --- Render ---
  if (selectedRisk) {
     return (
        <RiskDetail 
           risk={selectedRisk} 
           onBack={() => setSelectedRisk(null)}
           onEdit={handleOpenForm}
           projects={projects}
           spData={spData}
           riskActions={{ addActionPlan, updateActionPlan, deleteActionPlan, addMonitoringLog }}
        />
     );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ShieldAlert className="text-red-600 w-8 h-8"/> 
            Kurumsal Risk Yönetimi
          </h1>
          <p className="text-sm text-gray-600 mt-1">Stratejik, süreç ve proje risklerini bütünleşik olarak yönetin.</p>
        </div>
        <Button onClick={() => handleOpenForm(null)} className="bg-red-600 hover:bg-red-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2"/> Yeni Risk Tanımla
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
         <TabsList className="bg-white border p-1 rounded-lg">
            <TabsTrigger value="dashboard">Dashboard & Matris</TabsTrigger>
            <TabsTrigger value="list">Risk Listesi</TabsTrigger>
            <TabsTrigger value="projects">Projeler</TabsTrigger>
         </TabsList>

         <div className="mt-6">
            <TabsContent value="dashboard">
               <RiskDashboard 
                 risks={risks} 
                 onViewRisk={handleViewRisk}
               />
            </TabsContent>
            
            <TabsContent value="list">
               <RiskList 
                  risks={risks} 
                  onView={handleViewRisk} 
                  onEdit={handleOpenForm} 
                  onDelete={handleDeleteRisk} 
               />
            </TabsContent>
            
            <TabsContent value="projects">
               <ProjectDefinitions 
                  projects={projects}
                  onAdd={addProject}
                  onUpdate={updateProject}
                  onDelete={deleteProject}
               />
            </TabsContent>
         </div>
      </Tabs>

      <RiskForm 
         isOpen={isFormOpen} 
         onClose={() => setIsFormOpen(false)} 
         onSave={handleSaveRisk}
         editingRisk={editingRisk}
         projects={projects}
         spData={spData}
      />
    </div>
  );
};

export default RiskModule;