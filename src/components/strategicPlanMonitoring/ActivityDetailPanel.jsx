
import React, { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { X, Activity, FileText } from 'lucide-react';
import ActivitySummaryTab from './ActivitySummaryTab';
import ActivityMonitoringTab from './ActivityMonitoringTab';
import { Badge } from '@/components/ui/badge';

const ActivityDetailPanel = ({ activity, hierarchy, isOpen, onClose, indicators }) => {
  const [activeTab, setActiveTab] = useState('summary');

  if (!isOpen || !activity) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity" 
        onClick={onClose}
      />

      {/* Slide-over Panel */}
      <div className="fixed inset-y-0 right-0 z-50 w-full max-w-2xl bg-white shadow-2xl transform transition-transform duration-300 ease-in-out border-l border-gray-200 flex flex-col animate-in slide-in-from-right">
        
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div>
             <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="bg-white border-gray-300 text-gray-600 font-mono">
                   {activity.code}
                </Badge>
                <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-wider">
                   Faaliyet Detayı
                </span>
             </div>
             <h2 className="text-xl font-bold text-gray-900 leading-tight">
                {activity.name}
             </h2>
          </div>
          <button 
             onClick={onClose}
             className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          >
             <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs Navigation */}
        <div className="px-6 pt-4 border-b border-gray-100">
           <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="bg-transparent border-b border-transparent w-full justify-start p-0 h-auto space-x-6">
                 <TabsTrigger 
                   value="summary" 
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 pb-3 bg-transparent font-semibold text-gray-500 hover:text-gray-700"
                 >
                    <Activity className="w-4 h-4 mr-2" /> Genel Özet
                 </TabsTrigger>
                 <TabsTrigger 
                   value="monitoring" 
                   className="rounded-none border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:text-blue-600 data-[state=active]:shadow-none px-0 pb-3 bg-transparent font-semibold text-gray-500 hover:text-gray-700"
                 >
                    <FileText className="w-4 h-4 mr-2" /> İzleme & Kanıtlar
                 </TabsTrigger>
              </TabsList>
           </Tabs>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-white p-6 custom-scrollbar">
           {activeTab === 'summary' && (
              <ActivitySummaryTab activity={activity} hierarchy={hierarchy} />
           )}
           
           {activeTab === 'monitoring' && (
              <ActivityMonitoringTab 
                 activity={activity} 
                 indicators={indicators} 
                 currentUser={JSON.parse(localStorage.getItem('currentUser'))}
              />
           )}
        </div>

      </div>
    </>
  );
};

export default ActivityDetailPanel;
