import React, { useState } from 'react';
import { Plus, Edit2, Trash2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ActionPlanSection = ({ risk, onAddAction, onUpdateAction, onDeleteAction }) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [formData, setFormData] = useState({
    actionName: '',
    description: '',
    responsible: '',
    startDate: '',
    endDate: '',
    status: 'Planlandı'
  });

  const actions = risk.actionPlans || [];
  
  const completedActions = actions.filter(a => a.status === 'Tamamlandı').length;
  const completionRate = actions.length > 0 ? Math.round((completedActions / actions.length) * 100) : 0;

  const openModal = (action = null) => {
    setEditingAction(action);
    if (action) {
      setFormData(action);
    } else {
      setFormData({
        actionName: '',
        description: '',
        responsible: '',
        startDate: '',
        endDate: '',
        status: 'Planlandı'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.actionName) return;

    if (editingAction) {
      onUpdateAction(risk.id, editingAction.id, formData);
    } else {
      onAddAction(risk.id, formData);
    }
    setIsModalOpen(false);
    toast({ title: "Başarılı", description: "Eylem planı kaydedildi." });
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu eylemi silmek istediğinize emin misiniz?')) {
      onDeleteAction(risk.id, id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="font-bold text-gray-900">Önlem Faaliyetleri & Aksiyonlar</h3>
           <div className="flex items-center gap-2 mt-1">
              <div className="w-32 h-2 bg-gray-200 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-600 transition-all duration-500" style={{ width: `${completionRate}%` }}></div>
              </div>
              <span className="text-xs text-gray-500">% {completionRate} Tamamlandı</span>
           </div>
        </div>
        <Button size="sm" variant="outline" onClick={() => openModal()}>
          <Plus className="w-4 h-4 mr-2" /> Eylem Ekle
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Eylem Adı</TableHead>
              <TableHead>Sorumlu</TableHead>
              <TableHead>Tarih</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlem</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {actions.length === 0 ? (
               <TableRow><TableCell colSpan={5} className="text-center text-gray-400 py-4">Kayıtlı eylem planı bulunmuyor.</TableCell></TableRow>
            ) : (
               actions.map(action => (
                 <TableRow key={action.id}>
                    <TableCell className="font-medium">{action.actionName}</TableCell>
                    <TableCell>{action.responsible}</TableCell>
                    <TableCell className="text-xs">{action.endDate}</TableCell>
                    <TableCell>
                       <Badge variant={action.status === 'Tamamlandı' ? 'success' : action.status === 'Devam Ediyor' ? 'warning' : 'outline'}>
                          {action.status}
                       </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                       <Button variant="ghost" size="sm" onClick={() => openModal(action)} className="h-7 w-7 p-0"><Edit2 className="w-3 h-3"/></Button>
                       <Button variant="ghost" size="sm" onClick={() => handleDelete(action.id)} className="h-7 w-7 p-0 text-red-600"><Trash2 className="w-3 h-3"/></Button>
                    </TableCell>
                 </TableRow>
               ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent>
            <DialogHeader><DialogTitle>{editingAction ? 'Eylem Düzenle' : 'Yeni Eylem'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid gap-2">
                  <Label>Eylem Adı</Label>
                  <Input value={formData.actionName} onChange={e => setFormData({...formData, actionName: e.target.value})} />
               </div>
               <div className="grid gap-2">
                  <Label>Açıklama</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
               </div>
               <div className="grid gap-2">
                  <Label>Sorumlu</Label>
                  <Input value={formData.responsible} onChange={e => setFormData({...formData, responsible: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2"><Label>Başlangıç</Label><Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} /></div>
                  <div className="grid gap-2"><Label>Bitiş</Label><Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} /></div>
               </div>
               <div className="grid gap-2">
                  <Label>Durum</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                     <option value="Planlandı">Planlandı</option>
                     <option value="Devam Ediyor">Devam Ediyor</option>
                     <option value="Tamamlandı">Tamamlandı</option>
                  </select>
               </div>
            </div>
            <DialogFooter>
               <Button variant="outline" onClick={() => setIsModalOpen(false)}>İptal</Button>
               <Button onClick={handleSave}>Kaydet</Button>
            </DialogFooter>
         </DialogContent>
      </Dialog>
    </div>
  );
};

export default ActionPlanSection;