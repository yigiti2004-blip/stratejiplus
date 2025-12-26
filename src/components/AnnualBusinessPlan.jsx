
import React, { useState, useMemo } from 'react';
import { Plus, Filter, ChevronLeft, ChevronRight, LayoutList, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTimelineData } from '@/hooks/useTimelineData';
import { useAnnualWorkPlan } from '@/hooks/useAnnualWorkPlan';
import { useInstitutionalContinuity } from '@/hooks/useInstitutionalContinuity';
import TimelineView from '@/components/annualPlan/TimelineView';
import GanttChartView from '@/components/annualPlan/GanttChartView';
import WorkItemForm from '@/components/annualPlan/WorkItemForm';
import { useToast } from '@/components/ui/use-toast';

const AnnualBusinessPlan = ({ currentUser }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState("list"); // 'list' or 'gantt'
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  
  // Filters
  const [sourceFilter, setSourceFilter] = useState('all');
  const [unitFilter, setUnitFilter] = useState('all');

  const { toast } = useToast();
  
  // Hooks
  const timelineData = useTimelineData(selectedYear);
  const { addYearSpecificWork, updateYearSpecificWork, deleteYearSpecificWork } = useAnnualWorkPlan();
  const { addContinuityActivity, updateContinuityActivity, deleteContinuityActivity } = useInstitutionalContinuity();

  // Derived Filters
  const units = useMemo(() => {
    const uniqueUnits = new Set(timelineData.map(item => item.responsibleUnit).filter(Boolean));
    return Array.from(uniqueUnits).sort();
  }, [timelineData]);

  const filteredData = useMemo(() => {
    return timelineData.filter(item => {
      if (sourceFilter !== 'all' && item.sourceType !== sourceFilter) return false;
      if (unitFilter !== 'all' && item.responsibleUnit !== unitFilter) return false;
      return true;
    });
  }, [timelineData, sourceFilter, unitFilter]);

  // Handlers
  const handleSave = async (data) => {
    try {
      if (editingItem) {
        // Update existing
        if (editingItem.sourceType === 'kurumsal-süreklilik') {
          await updateContinuityActivity(editingItem.sourceId, data);
        } else if (editingItem.sourceType === 'yıla-özgü') {
          await updateYearSpecificWork(editingItem.id, data);
        }
        toast({ title: "Başarılı", description: "Kayıt güncellendi." });
      } else {
        // Create new - ensure workName is set
        const saveData = {
          ...data,
          workName: data.workName || data.description || 'İsimsiz İş',
          year: data.year || selectedYear,
        };
        if (data.sourceType === 'kurumsal-süreklilik') {
          await addContinuityActivity(saveData);
        } else {
          await addYearSpecificWork(saveData);
        }
        toast({ title: "Başarılı", description: "Yeni kayıt oluşturuldu." });
      }
      setIsFormOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error saving work item:', error);
      toast({ title: "Hata", description: error.message || "İşlem sırasında bir hata oluştu.", variant: "destructive" });
    }
  };

  const handleDelete = () => {
    if (!editingItem) return;
    if (window.confirm("Bu kaydı silmek istediğinize emin misiniz?")) {
      try {
        if (editingItem.sourceType === 'kurumsal-süreklilik') {
          deleteContinuityActivity(editingItem.sourceId);
        } else if (editingItem.sourceType === 'yıla-özgü') {
          deleteYearSpecificWork(editingItem.id);
        }
        toast({ title: "Başarılı", description: "Kayıt silindi." });
        setIsFormOpen(false);
        setEditingItem(null);
      } catch (error) {
        toast({ title: "Hata", description: "Silme işlemi başarısız.", variant: "destructive" });
      }
    }
  };

  const handleItemClick = (item) => {
    if (item.sourceType === 'stratejik-plan') {
      // In a real scenario, you might redirect using React Router
      // navigate(`/strategic-plan-monitoring/${item.sourceId}`);
      toast({ 
        title: "Stratejik Plan Faaliyeti", 
        description: "Bu kayıt Stratejik Plan Yönetimi modülünden gelmektedir. Detaylar için ilgili modüle gidiniz.",
        duration: 4000
      });
      return;
    }
    
    // For editable items, populate form data
    const formData = item.originalTemplate || item;
    setEditingItem({ ...item, ...formData });
    setIsFormOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <div>
           <h1 className="text-2xl font-bold text-gray-900">Yıllık İş Planı</h1>
           <p className="text-sm text-gray-500 mt-1">
             Stratejik plan, kurumsal süreklilik ve yıla özgü planlanan tüm işlerin zaman çizelgesi.
           </p>
        </div>
        
        <div className="flex items-center gap-3">
           <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1 text-gray-900">
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setSelectedYear(prev => prev - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="px-3 font-bold text-lg min-w-[80px] text-center text-gray-900">
                {selectedYear}
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                className="h-8 w-8" 
                onClick={() => setSelectedYear(prev => prev + 1)}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
           </div>
           
           <Button className="bg-blue-600 hover:bg-blue-700 shadow-sm" onClick={() => { setEditingItem(null); setIsFormOpen(true); }}>
              <Plus className="w-4 h-4 mr-2" /> Yeni İş Ekle
           </Button>
        </div>
      </div>

      {/* Tabs & Main Content */}
      <Tabs defaultValue="list" className="w-full" onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-gray-100">
            <TabsTrigger value="list" className="flex items-center gap-2">
              <LayoutList className="w-4 h-4" /> Liste Görünümü
            </TabsTrigger>
            <TabsTrigger value="gantt" className="flex items-center gap-2">
              <BarChart3 className="w-4 h-4" /> Gantt Görünümü
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="space-y-6">
          {/* Stats & Filter Bar (Only for List View) */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card className="md:col-span-4 border-gray-200 shadow-sm">
              <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center">
                  <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
                    <Filter className="w-4 h-4" /> Filtreler:
                  </div>
                  
                  <Select value={sourceFilter} onValueChange={setSourceFilter}>
                    <SelectTrigger className="w-[200px] h-9">
                      <SelectValue placeholder="Kaynak Türü" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Kaynaklar</SelectItem>
                      <SelectItem value="stratejik-plan">Stratejik Plan</SelectItem>
                      <SelectItem value="kurumsal-süreklilik">Kurumsal Süreklilik</SelectItem>
                      <SelectItem value="yıla-özgü">Yıla Özgü</SelectItem>
                    </SelectContent>
                  </Select>

                  <Select value={unitFilter} onValueChange={setUnitFilter}>
                    <SelectTrigger className="w-[200px] h-9">
                      <SelectValue placeholder="Sorumlu Birim" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tüm Birimler</SelectItem>
                      {units.map(u => (
                        <SelectItem key={u} value={u}>{u}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  <div className="ml-auto text-xs text-gray-500">
                    Toplam <strong>{filteredData.length}</strong> kayıt listeleniyor
                  </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Legend / Mini Stats */}
            <div className="space-y-4">
                <Card className="border-gray-200 shadow-sm">
                  <CardContent className="p-4 space-y-3">
                      <h3 className="font-bold text-gray-900 text-sm mb-2">Kaynak Türleri</h3>
                      
                      <div className="flex items-center gap-2 p-2 rounded bg-blue-50 border border-blue-100 cursor-pointer hover:bg-blue-100 transition-colors" onClick={() => setSourceFilter('stratejik-plan')}>
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-blue-900">Stratejik Plan</div>
                            <div className="text-[10px] text-blue-600">
                              {timelineData.filter(i => i.sourceType === 'stratejik-plan').length} Kayıt
                            </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded bg-purple-50 border border-purple-100 cursor-pointer hover:bg-purple-100 transition-colors" onClick={() => setSourceFilter('kurumsal-süreklilik')}>
                        <div className="w-3 h-3 rounded-full bg-purple-600"></div>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-purple-900">Kurumsal Süreklilik</div>
                            <div className="text-[10px] text-purple-600">
                              {timelineData.filter(i => i.sourceType === 'kurumsal-süreklilik').length} Kayıt
                            </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-2 rounded bg-emerald-50 border border-emerald-100 cursor-pointer hover:bg-emerald-100 transition-colors" onClick={() => setSourceFilter('yıla-özgü')}>
                        <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                        <div className="flex-1">
                            <div className="text-xs font-bold text-emerald-900">Yıla Özgü</div>
                            <div className="text-[10px] text-emerald-600">
                              {timelineData.filter(i => i.sourceType === 'yıla-özgü').length} Kayıt
                            </div>
                        </div>
                      </div>
                  </CardContent>
                </Card>
            </div>

            {/* Timeline */}
            <div className="lg:col-span-3">
                <TimelineView 
                  items={filteredData} 
                  onEdit={handleItemClick}
                  loading={false}
                />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="gantt">
          <GanttChartView 
            year={selectedYear} 
            setYear={setSelectedYear} 
            onItemClick={handleItemClick}
          />
        </TabsContent>
      </Tabs>

      {/* Form Modal */}
      {isFormOpen && (
        <WorkItemForm 
           onClose={() => { setIsFormOpen(false); setEditingItem(null); }}
           onSave={handleSave}
           onDelete={editingItem ? handleDelete : undefined}
           initialData={editingItem}
           selectedYear={selectedYear}
        />
      )}
    </div>
  );
};

export default AnnualBusinessPlan;
