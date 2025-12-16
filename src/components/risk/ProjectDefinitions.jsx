import React, { useState } from 'react';
import { Plus, Edit2, Trash2, Save, X, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';

const ProjectDefinitions = ({ projects, onAdd, onUpdate, onDelete }) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    manager: '',
    startDate: '',
    endDate: '',
    description: '',
    status: 'Aktif'
  });

  const openModal = (project = null) => {
    setEditingItem(project);
    if (project) {
      setFormData(project);
    } else {
      setFormData({
        name: '',
        manager: '',
        startDate: '',
        endDate: '',
        description: '',
        status: 'Aktif'
      });
    }
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) {
      toast({ title: "Hata", description: "Proje Adı zorunludur.", variant: "destructive" });
      return;
    }

    if (editingItem) {
      onUpdate(editingItem.id, formData);
      toast({ title: "Başarılı", description: "Proje güncellendi." });
    } else {
      onAdd(formData);
      toast({ title: "Başarılı", description: "Yeni proje eklendi." });
    }
    setIsModalOpen(false);
  };

  const handleDelete = (id) => {
    if (window.confirm('Bu projeyi silmek istediğinize emin misiniz?')) {
      onDelete(id);
      toast({ title: "Silindi", description: "Proje silindi.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-white">Proje Tanımları</h2>
          <p className="text-sm text-gray-300">Risk yönetimi ile ilişkilendirilecek projeleri buradan yönetebilirsiniz.</p>
        </div>
        <Button onClick={() => openModal()} className="bg-blue-600 text-white">
          <Plus className="w-4 h-4 mr-2" /> Yeni Proje
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Proje Adı</TableHead>
              <TableHead>Yönetici</TableHead>
              <TableHead>Tarih Aralığı</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-400">Henüz proje tanımlanmamış.</TableCell>
              </TableRow>
            ) : (
              projects.map(project => (
                <TableRow key={project.id}>
                  <TableCell className="font-medium">{project.name}</TableCell>
                  <TableCell>{project.manager || '-'}</TableCell>
                  <TableCell className="text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3"/> {project.startDate || '?'} - {project.endDate || '?'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={project.status === 'Aktif' ? 'default' : 'secondary'}>{project.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => openModal(project)} className="h-8 w-8 p-0 text-blue-600"><Edit2 className="w-4 h-4"/></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(project.id)} className="h-8 w-8 p-0 text-red-600"><Trash2 className="w-4 h-4"/></Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Projeyi Düzenle' : 'Yeni Proje'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label>Proje Adı</Label>
              <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
            </div>
            <div className="grid gap-2">
              <Label>Proje Yöneticisi</Label>
              <Input value={formData.manager} onChange={e => setFormData({...formData, manager: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Başlangıç Tarihi</Label>
                <Input type="date" value={formData.startDate} onChange={e => setFormData({...formData, startDate: e.target.value})} />
              </div>
              <div className="grid gap-2">
                <Label>Bitiş Tarihi</Label>
                <Input type="date" value={formData.endDate} onChange={e => setFormData({...formData, endDate: e.target.value})} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label>Durum</Label>
              <select 
                className="flex h-10 w-full rounded-md border border-gray-300 bg-white text-gray-900 px-3 py-2 text-sm"
                value={formData.status} 
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="Aktif">Aktif</option>
                <option value="Tamamlandı">Tamamlandı</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Açıklama</Label>
              <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
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

export default ProjectDefinitions;