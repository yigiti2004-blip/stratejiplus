
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { LayoutDashboard, Target, ListChecks, BarChart3 } from 'lucide-react';
import OverviewTab from './OverviewTab';
import TargetBasedView from './TargetBasedView';
import ActivityBasedView from './ActivityBasedView';
import StrategicAreaDetail from './StrategicAreaDetail';
import { useStrategicPlanMonitoring } from '@/hooks/useStrategicPlanMonitoring';

const StrategicPlanMonitoringModule = () => {
  const { 
    areas, objectives, targets, indicators, activities, 
    loading, getAreaStats 
  } = useStrategicPlanMonitoring();

  const [activeTab, setActiveTab] = useState('overview');
  const [selectedArea, setSelectedArea] = useState(null);

  const handleAreaClick = (area) => {
    setSelectedArea(area);
  };

  const handleBackToOverview = () => {
    setSelectedArea(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-500">Veriler yükleniyor...</p>
        </div>
      </div>
    );
  }

  // If a detail page is active, show that instead of tabs
  if (selectedArea) {
    return (
      <StrategicAreaDetail 
        area={selectedArea}
        objectives={objectives}
        targets={targets}
        indicators={indicators}
        activities={activities}
        onBack={handleBackToOverview}
      />
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Module Header */}
      <div className="flex items-center gap-3 pb-6 border-b border-white/10">
        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/30">
          <BarChart3 className="w-6 h-6 text-blue-300" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Stratejik Plan İzleme</h1>
          <p className="text-sm text-gray-300">
            Stratejik plan hedeflerinin ve faaliyetlerinin merkezi izleme paneli.
          </p>
        </div>
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="bg-gray-100 p-1 rounded-lg mb-6 inline-flex">
          <TabsTrigger value="overview" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <LayoutDashboard className="w-4 h-4" /> Genel Özet
          </TabsTrigger>
          <TabsTrigger value="targets" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <Target className="w-4 h-4" /> Hedef Bazlı Görünüm
          </TabsTrigger>
          <TabsTrigger value="activities" className="gap-2 data-[state=active]:bg-white data-[state=active]:shadow-sm">
            <ListChecks className="w-4 h-4" /> Faaliyet Bazlı Görünüm
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <OverviewTab 
            areas={areas} 
            getAreaStats={getAreaStats}
            onAreaClick={handleAreaClick}
          />
        </TabsContent>

        <TabsContent value="targets">
          <TargetBasedView 
            areas={areas}
            objectives={objectives}
            targets={targets}
            activities={activities}
            indicators={indicators}
          />
        </TabsContent>

        <TabsContent value="activities">
          <ActivityBasedView 
            areas={areas}
            objectives={objectives}
            targets={targets}
            activities={activities}
            indicators={indicators}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StrategicPlanMonitoringModule;
