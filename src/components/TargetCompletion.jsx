import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Target, Calendar, Edit, Save, X, Upload, FileText, Download, Trash2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const TargetCompletion = ({ currentUser }) => {
  const { toast } = useToast();
  const [targets, setTargets] = useState([]);
  const [objectives, setObjectives] = useState([]);
  const [selectedTarget, setSelectedTarget] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [files, setFiles] = useState([]);

  // Form state
  const [formData, setFormData] = useState({
    status: 'Planlandı',
    completion: 0,
    description: '',
    files: []
  });

  useEffect(() => {
    const storedTargets = JSON.parse(localStorage.getItem('targets') || '[]');
    const storedObjectives = JSON.parse(localStorage.getItem('strategicObjectives') || '[]');
    const storedAreas = JSON.parse(localStorage.getItem('strategicAreas') || '[]');
    
    // Filter for organization
    const orgAreas = storedAreas.filter(a => a.organizationId === currentUser.organizationId);
    const orgObjectives = storedObjectives.filter(o => orgAreas.some(a => a.id === o.strategicAreaId));
    const orgTargets = storedTargets.filter(t => orgObjectives.some(o => o.id === t.objectiveId));

    setObjectives(orgObjectives);
    setTargets(orgTargets);
  }, [currentUser]);

  const handleOpenEdit = (target) => {
    // Get previous records for this target
    const records = JSON.parse(localStorage.getItem('targetUpdates') || '[]');
    const lastRecord = records
      .filter(r => r.targetId === target.id)
      .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))[0];

    setSelectedTarget(target);
    setFormData({
      status: lastRecord?.status || target.status || 'Planlandı',
      completion: lastRecord?.completion || target.completion || 0,
      description: lastRecord?.description || '',
      files: lastRecord?.files || [] // existing files
    });
    setFiles(lastRecord?.files || []);
    setIsModalOpen(true);
  };

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files);
    const maxSizeBytes = 5 * 1024 * 1024; // 5MB

    selectedFiles.forEach(file => {
      if (file.size > maxSizeBytes) {
        toast({
          title: "Hata",
          description: `${file.name} boyutu 5MB'dan büyük olamaz.`,
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const newFile = {
          id: Date.now() + Math.random().toString(),
          name: file.name,
          type: file.type,
          size: (file.size / 1024).toFixed(1) + ' KB',
          data: event.target.result,
          date: new Date().toISOString()
        };
        setFiles(prev => [...prev, newFile]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDeleteFile = (fileId) => {
    setFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleSubmit = () => {
    if (!selectedTarget) return;

    // 1. Create a history record
    const newRecord = {
      id: 'rec-' + Date.now(),
      targetId: selectedTarget.id,
      userId: currentUser.id,
      userName: currentUser.name,
      timestamp: new Date().toISOString(),
      ...formData,
      files: files // Updated files list
    };

    const allRecords = JSON.parse(localStorage.getItem('targetUpdates') || '[]');
    localStorage.setItem('targetUpdates', JSON.stringify([...allRecords, newRecord]));

    // 2. Update the target object itself for quick access
    const allTargets = JSON.parse(localStorage.getItem('targets') || '[]');
    const updatedTargets = allTargets.map(t => {
      if (t.id === selectedTarget.id) {
        return { 
          ...t, 
          status: formData.status, 
          completion: Number(formData.completion),
          lastUpdated: new Date().toISOString()
        };
      }
      return t;
    });
    localStorage.setItem('targets', JSON.stringify(updatedTargets));
    
    // Update local state
    setTargets(prev => prev.map(t => t.id === selectedTarget.id ? { ...t, status: formData.status, completion: Number(formData.completion) } : t));

    toast({
      title: "Başarılı",
      description: "Hedef durumu güncellendi ve kaydedildi.",
    });
    setIsModalOpen(false);
  };

  const statusColors = {
    'Planlandı': 'bg-blue-100 text-blue-800 border-blue-300',
    'Devam Ediyor': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    'Tamamlandı': 'bg-green-100 text-green-800 border-green-300',
    'Gecikmiş': 'bg-red-100 text-red-800 border-red-300',
    'Gecikti': 'bg-red-100 text-red-800 border-red-300' // Handle legacy data
  };

  return (
    <div className="space-y-6 relative">
      <div className="bg-white rounded-xl p-6 shadow-md border border-gray-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hedef Tamamlama</h1>
            <p className="text-sm text-gray-600 mt-1">Organizasyon hedeflerinin durumunu güncelle ve kanıt yükle</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {targets.map(target => {
          const objective = objectives.find(o => o.id === target.objectiveId);
          const currentStatus = target.status || 'Planlandı';
          const completion = target.completion || 0;

          return (
            <motion.div
              key={target.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-lg p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all cursor-pointer"
              onClick={() => handleOpenEdit(target)}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-xs font-bold text-gray-500">{target.code}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${statusColors[currentStatus] || statusColors['Planlandı']}`}>
                      {currentStatus}
                    </span>
                    <span className="text-xs text-gray-400">| Bitiş: {target.endYear}</span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{target.name}</h3>
                  <p className="text-sm text-gray-600">{objective?.name}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right min-w-[100px]">
                    <p className="text-sm text-gray-500 mb-1">Tamamlanma</p>
                    <div className="flex items-center justify-end space-x-2">
                      <span className="text-xl font-bold text-gray-900">%{completion}</span>
                      <div className="w-20 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-full rounded-full ${completion >= 100 ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ width: `${completion}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    <Edit className="w-4 h-4 mr-2" />
                    Güncelle
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Modal Overlay */}
      {isModalOpen && selectedTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
              <h2 className="text-xl font-bold text-gray-900">Hedef Güncelleme</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-full">
                <X className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm font-bold text-gray-700">{selectedTarget.code}</p>
                <p className="text-base text-gray-900 mt-1">{selectedTarget.name}</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Planlandı">Planlandı</option>
                    <option value="Devam Ediyor">Devam Ediyor</option>
                    <option value="Tamamlandı">Tamamlandı</option>
                    <option value="Gecikmiş">Gecikmiş</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Tamamlanma Oranı (%)</label>
                  <div className="flex items-center space-x-4">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={formData.completion}
                      onChange={(e) => setFormData({...formData, completion: e.target.value})}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                    />
                    <span className="font-bold text-gray-900 w-12 text-right">%{formData.completion}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama / Notlar</label>
                <textarea
                  rows="4"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="İlerleme hakkında detaylı bilgi giriniz..."
                />
              </div>

              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-sm font-medium text-gray-700">Kanıt Dokümanları</label>
                  <div className="relative">
                    <input
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                    />
                    <Button variant="outline" size="sm" className="pointer-events-none">
                      <Upload className="w-4 h-4 mr-2" />
                      Dosya Seç (Max 5MB)
                    </Button>
                  </div>
                </div>

                {files.length === 0 && (
                  <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg bg-gray-50">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Henüz dosya yüklenmedi</p>
                  </div>
                )}

                <div className="space-y-2">
                  {files.map(file => (
                    <div key={file.id} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
                      <div className="flex items-center space-x-3 overflow-hidden">
                        <div className="bg-blue-100 p-2 rounded">
                          <FileText className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="truncate">
                          <p className="text-sm font-medium text-gray-900 truncate">{file.name}</p>
                          <p className="text-xs text-gray-500">{file.size} • {new Date(file.date).toLocaleDateString('tr-TR')}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <a 
                          href={file.data} 
                          download={file.name}
                          className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                          title="İndir"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button 
                          onClick={() => handleDeleteFile(file.id)}
                          className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                          title="Sil"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 rounded-b-xl flex justify-end space-x-3">
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
              <Button onClick={handleSubmit} className="bg-blue-600 hover:bg-blue-700">
                <Save className="w-4 h-4 mr-2" />
                Kaydet ve Tamamla
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default TargetCompletion;