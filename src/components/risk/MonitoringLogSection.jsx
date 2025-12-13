import React, { useState } from 'react';
import { Plus, History } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { getRiskLevel } from '@/lib/calculations';
import { useToast } from '@/components/ui/use-toast';

const MonitoringLogSection = ({ risk, onAddLog }) => {
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    monitoringDate: new Date().toISOString().split('T')[0],
    probability: risk.probability,
    impact: risk.impact,
    evaluationNote: '',
    decision: 'Aynen Devam'
  });

  const logs = risk.monitoringLogs || [];

  const handleSave = () => {
    if (!formData.evaluationNote) {
       toast({ title: "Eksik Bilgi", description: "Değerlendirme notu giriniz.", variant: "destructive" });
       return;
    }

    onAddLog(risk.id, {
       ...formData,
       score: formData.probability * formData.impact
    });
    setIsModalOpen(false);
    toast({ title: "Başarılı", description: "İzleme kaydı eklendi." });
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div>
           <h3 className="font-bold text-gray-900">Risk İzleme Kayıtları</h3>
           <p className="text-xs text-gray-500">İzleme Sıklığı: {risk.monitoringPeriod || 'Belirtilmemiş'}</p>
        </div>
        <Button size="sm" variant="outline" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Kayıt Ekle
        </Button>
      </div>

      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50">
            <TableRow>
              <TableHead>Tarih</TableHead>
              <TableHead>Olasılık</TableHead>
              <TableHead>Etki</TableHead>
              <TableHead>Skor</TableHead>
              <TableHead>Değerlendirme</TableHead>
              <TableHead>Karar</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
               <TableRow><TableCell colSpan={6} className="text-center text-gray-400 py-4">Henüz izleme kaydı girilmemiş.</TableCell></TableRow>
            ) : (
               logs.sort((a,b) => new Date(b.monitoringDate) - new Date(a.monitoringDate)).map(log => {
                 const level = getRiskLevel(log.score);
                 const isImproved = log.score < risk.score; // compare to current or previous? Using current for now

                 return (
                   <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.monitoringDate}</TableCell>
                      <TableCell>{log.probability}</TableCell>
                      <TableCell>{log.impact}</TableCell>
                      <TableCell>
                         <Badge className={`${level.bg} ${level.text} border-transparent`}>{level.label} ({log.score})</Badge>
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate" title={log.evaluationNote}>{log.evaluationNote}</TableCell>
                      <TableCell>{log.decision}</TableCell>
                   </TableRow>
                 );
               })
            )}
          </TableBody>
        </Table>
      </div>

      {/* Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
         <DialogContent>
            <DialogHeader><DialogTitle>Risk İzleme / Gözden Geçirme</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
               <div className="grid gap-2">
                  <Label>İzleme Tarihi</Label>
                  <Input type="date" value={formData.monitoringDate} onChange={e => setFormData({...formData, monitoringDate: e.target.value})} />
               </div>
               <div className="grid grid-cols-2 gap-4">
                  <div className="grid gap-2">
                     <Label>Güncel Olasılık</Label>
                     <Input type="number" min="1" max="5" value={formData.probability} onChange={e => setFormData({...formData, probability: e.target.value})} />
                  </div>
                  <div className="grid gap-2">
                     <Label>Güncel Etki</Label>
                     <Input type="number" min="1" max="5" value={formData.impact} onChange={e => setFormData({...formData, impact: e.target.value})} />
                  </div>
               </div>
               <div className="grid gap-2">
                  <Label>Değerlendirme Notu</Label>
                  <Textarea value={formData.evaluationNote} onChange={e => setFormData({...formData, evaluationNote: e.target.value})} placeholder="Riskteki değişimleri açıklayınız..." />
               </div>
               <div className="grid gap-2">
                  <Label>Karar</Label>
                  <select className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm" value={formData.decision} onChange={e => setFormData({...formData, decision: e.target.value})}>
                     <option value="Aynen Devam">Aynen Devam</option>
                     <option value="İyileştirme Gerekli">İyileştirme Gerekli</option>
                     <option value="Risk Azaldı">Risk Azaldı</option>
                     <option value="Risk Sonlandı">Risk Sonlandı</option>
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

export default MonitoringLogSection;