import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Edit, Save, X, AlertCircle, Target, Layers, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { calculateCompletion } from '@/lib/calculations';

const MonitoringRecords = ({ currentUser }) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedInd, setSelectedInd] = useState(null);
  const [inputValue, setInputValue] = useState('');

  // Data Loading
  const strategicAreas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
  const strategicObjectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
  const targets = JSON.parse(localStorage.getItem('targets') || '[]');
  const indicators = JSON.parse(localStorage.getItem('indicators') || '[]');
  const history = JSON.parse(localStorage.getItem('monitoringHistory') || '[]');

  // Hiyerarşik Data Hazırlama
  const recordsTree = strategicAreas.filter(sa => sa.organizationId === currentUser.organizationId).map(area => {
    const areaObjs = strategicObjectives.filter(o => o.strategicAreaId === area.id);
    return {
      ...area,
      objectives: areaObjs.map(obj => {
        const objTargets = targets.filter(t => t.objectiveId === obj.id);
        return {
          ...obj,
          targets: objTargets.map(target => {
             const targetInds = indicators.filter(i => i.targetId === target.id);
             return { ...target, indicators: targetInds };
          })
        };
      })
    };
  });

  const handleOpenUpdate = (indicator) => {
    setSelectedInd(indicator);
    setInputValue(indicator.actualValue);
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!selectedInd) return;

    // 1. Göstergeyi güncelle
    const updatedIndicators = indicators.map(i => 
      i.id === selectedInd.id ? { ...i, actualValue: Number(inputValue) } : i
    );
    localStorage.setItem('indicators', JSON.stringify(updatedIndicators));

    // 2. Tarihçeye ekle (Frekans takibi için)
    const newHistoryItem = {
      id: Date.now().toString(),
      indicatorId: selectedInd.id,
      date: new Date().toISOString(),
      value: Number(inputValue),
      userId: currentUser.id
    };
    localStorage.setItem('monitoringHistory', JSON.stringify([...history, newHistoryItem]));

    toast({ title: "Başarılı", description: "Gösterge değeri güncellendi." });
    setIsModalOpen(false);
    window.location.reload();
  };

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <h1 className="text-2xl font-bold text-gray-900">İzleme Kayıtları</h1>
        <p className="text-sm text-gray-600">Her stratejik alan ve alt kırılımları için performans takibi.</p>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {recordsTree.map(area => (
          <div key={area.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
            {/* Stratejik Alan Başlığı */}
            <div className="bg-[#1A1F3A] p-4 flex items-center gap-3">
               <Layers className="text-[#E91E63] w-6 h-6" />
               <h2 className="text-white font-bold text-lg">{area.code} - {area.name}</h2>
            </div>

            <div className="p-6 space-y-8">
              {area.objectives.map(obj => (
                <div key={obj.id} className="relative pl-4 border-l-2 border-gray-200">
                   <h3 className="text-gray-800 font-bold text-md mb-4 flex items-center">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      {obj.code} - {obj.name}
                   </h3>

                   <div className="space-y-6">
                     {obj.targets.map(target => (
                       <div key={target.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                          <div className="flex items-center gap-2 mb-3 pb-2 border-b border-gray-200">
                             <Target className="w-4 h-4 text-purple-600" />
                             <span className="font-semibold text-gray-900 text-sm">{target.code} - {target.name}</span>
                          </div>

                          <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                              <thead className="text-xs text-gray-500 uppercase bg-gray-100">
                                <tr>
                                  <th className="px-4 py-2">Gösterge Adı</th>
                                  <th className="px-4 py-2">Birim</th>
                                  <th className="px-4 py-2 text-center">Hedef</th>
                                  <th className="px-4 py-2 text-center">Gerçekleşen</th>
                                  <th className="px-4 py-2 text-center">İlerleme</th>
                                  <th className="px-4 py-2 text-right">İşlem</th>
                                </tr>
                              </thead>
                              <tbody>
                                {target.indicators.map(ind => {
                                  const completion = calculateCompletion(ind.actualValue, ind.targetValue);
                                  return (
                                    <tr key={ind.id} className="border-b last:border-0 bg-white hover:bg-gray-50">
                                      <td className="px-4 py-3 font-medium text-gray-900">{ind.name}</td>
                                      <td className="px-4 py-3 text-gray-600">{ind.unit}</td>
                                      <td className="px-4 py-3 text-center font-bold">{ind.targetValue}</td>
                                      <td className="px-4 py-3 text-center font-bold text-blue-600">{ind.actualValue}</td>
                                      <td className="px-4 py-3 text-center">
                                        <div className="flex items-center justify-center gap-2">
                                          <div className="w-16 h-1.5 bg-gray-200 rounded-full overflow-hidden">
                                             <div 
                                               className={`h-full rounded-full ${completion >= 100 ? 'bg-green-500' : 'bg-[#E91E63]'}`} 
                                               style={{ width: `${Math.min(completion, 100)}%` }} 
                                             />
                                          </div>
                                          <span className="text-xs font-bold">%{completion.toFixed(0)}</span>
                                        </div>
                                      </td>
                                      <td className="px-4 py-3 text-right">
                                        <Button size="sm" variant="outline" onClick={() => handleOpenUpdate(ind)}>
                                          <Edit className="w-3 h-3 mr-1" /> Veri Gir
                                        </Button>
                                      </td>
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                       </div>
                     ))}
                   </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Update Modal */}
      {isModalOpen && selectedInd && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div initial={{opacity:0, scale:0.95}} animate={{opacity:1, scale:1}} className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-bold text-lg">Veri Girişi</h3>
               <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5 text-gray-500"/></button>
             </div>
             
             <div className="bg-blue-50 p-3 rounded-lg mb-4 border border-blue-100">
                <p className="text-sm font-medium text-blue-900">{selectedInd.name}</p>
                <div className="flex justify-between mt-2 text-xs text-blue-700">
                   <span>Hedef: <b>{selectedInd.targetValue} {selectedInd.unit}</b></span>
                   <span>Mevcut: <b>{selectedInd.actualValue} {selectedInd.unit}</b></span>
                </div>
             </div>

             <div className="mb-6">
               <label className="block text-sm font-bold text-gray-700 mb-2">Yeni Değer ({selectedInd.unit})</label>
               <input 
                 type="number" 
                 value={inputValue} 
                 onChange={(e) => setInputValue(e.target.value)}
                 className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-[#E91E63] focus:ring-0 text-lg font-bold"
                 autoFocus
               />
             </div>

             <div className="flex justify-end gap-3">
                <Button variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
                <Button onClick={handleSave} className="bg-[#E91E63] hover:bg-[#D81B60]">Kaydet</Button>
             </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default MonitoringRecords;