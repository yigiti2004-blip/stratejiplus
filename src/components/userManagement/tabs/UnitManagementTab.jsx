
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Network } from 'lucide-react';
import UnitForm from '../forms/UnitForm';
import { useToast } from '@/components/ui/use-toast';

const UnitManagementTab = ({ units, addUnit, updateUnit, deleteUnit }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingUnit, setEditingUnit] = useState(null);
  const { toast } = useToast();

  const handleSave = (data) => {
    try {
      if (editingUnit) {
        updateUnit(editingUnit.unitId, data);
        toast({ title: "Başarılı", description: "Birim güncellendi." });
      } else {
        addUnit(data);
        toast({ title: "Başarılı", description: "Yeni birim oluşturuldu." });
      }
      setIsFormOpen(false);
      setEditingUnit(null);
    } catch (error) {
      toast({ title: "Hata", description: "İşlem başarısız.", variant: "destructive" });
    }
  };

  const handleDelete = (unitId) => {
    if (window.confirm('Bu birimi pasife almak istediğinize emin misiniz?')) {
      deleteUnit(unitId);
      toast({ title: "Bilgi", description: "Birim pasife alındı." });
    }
  };

  const getParentName = (parentId) => {
    const parent = units.find(u => u.unitId === parentId);
    return parent ? parent.unitName : '-';
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div>
           <h3 className="text-lg font-semibold text-gray-800">Birim Listesi</h3>
           <p className="text-sm text-gray-500">Organizasyonel birimleri yönetin.</p>
        </div>
        <Button onClick={() => { setEditingUnit(null); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" /> Yeni Birim
        </Button>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Birim Kodu</TableHead>
              <TableHead>Birim Adı</TableHead>
              <TableHead>Üst Birim</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {units.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                    Kayıtlı birim bulunamadı.
                 </TableCell>
               </TableRow>
            ) : (
               units.map((unit) => (
                <TableRow key={unit.unitId}>
                  <TableCell className="font-mono text-xs">{unit.unitCode || '-'}</TableCell>
                  <TableCell className="font-medium">{unit.unitName}</TableCell>
                  <TableCell className="text-gray-500">{getParentName(unit.parentUnit)}</TableCell>
                  <TableCell>
                    <Badge variant={unit.status === 'aktif' ? 'default' : 'secondary'} className={unit.status === 'aktif' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-0' : 'bg-gray-100 text-gray-800 border-0'}>
                      {unit.status === 'aktif' ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingUnit(unit); setIsFormOpen(true); }}>
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(unit.unitId)} disabled={unit.status === 'pasif'}>
                        <Trash2 className={`w-4 h-4 ${unit.status === 'pasif' ? 'text-gray-300' : 'text-red-600'}`} />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {isFormOpen && (
        <UnitForm 
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          initialData={editingUnit}
          units={units}
        />
      )}
    </div>
  );
};

export default UnitManagementTab;
