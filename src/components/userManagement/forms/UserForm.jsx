
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { X, RefreshCw } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const UserForm = ({ onClose, onSave, initialData, units, roles }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    unitId: '',
    roleId: '',
    status: 'aktif',
    password: '',
    mustChangePassword: true
  });
  const [autoPassword, setAutoPassword] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...initialData,
        password: '', // Password not editable directly
      });
      setAutoPassword(false);
    }
  }, [initialData]);

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for(let i=0; i<8; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, password: pass }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // FIX: Explicit manual validation for fullName
    if (!formData.fullName || formData.fullName.trim() === '') {
       toast({
         title: "Hata",
         description: "Lütfen Ad Soyad alanını doldurunuz.",
         variant: "destructive"
       });
       return;
    }

    if (!formData.email) {
       toast({
         title: "Hata",
         description: "Lütfen e-posta alanını doldurunuz.",
         variant: "destructive"
       });
       return;
    }

    onSave({
      ...formData,
      // If editing, don't send password unless specifically implemented logic for reset here
      // But for Add, we send it.
      password: initialData ? undefined : (autoPassword && !formData.password ? 'temp1234' : formData.password)
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="font-bold text-gray-900 text-lg">
            {initialData ? 'Kullanıcı Düzenle' : 'Yeni Kullanıcı Ekle'}
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label>Ad Soyad <span className="text-red-500">*</span></Label>
            <Input 
              required
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              placeholder="Ad ve Soyad giriniz"
            />
          </div>

          <div className="space-y-2">
            <Label>E-posta (Kullanıcı Adı) <span className="text-red-500">*</span></Label>
            <Input 
              type="email"
              required
              disabled={!!initialData} // Email cannot be changed
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="kurumsal@eposta.com"
              className={initialData ? 'bg-gray-100 cursor-not-allowed' : ''}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
                <Label>Birim <span className="text-red-500">*</span></Label>
                <Select 
                  required
                  value={formData.unitId} 
                  onValueChange={(val) => setFormData({...formData, unitId: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {units.filter(u => u.status === 'aktif' || u.unitId === formData.unitId).map(u => (
                      <SelectItem key={u.unitId} value={u.unitId}>
                        {u.unitName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <Label>Rol <span className="text-red-500">*</span></Label>
                <Select 
                  required
                  value={formData.roleId} 
                  onValueChange={(val) => setFormData({...formData, roleId: val})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seçiniz" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles.map(r => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
            </div>
          </div>

          {!initialData && (
             <div className="space-y-3 p-4 bg-gray-50 rounded border border-gray-100">
                <div className="flex justify-between items-center">
                   <Label className="text-gray-700">Başlangıç Şifresi</Label>
                   <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={generatePassword}
                      className="h-8 text-xs text-blue-600 hover:text-blue-700"
                   >
                      <RefreshCw className="w-3 h-3 mr-1" /> Oluştur
                   </Button>
                </div>
                <div className="flex gap-2">
                   <Input 
                      value={formData.password}
                      onChange={(e) => setFormData({...formData, password: e.target.value})}
                      placeholder="Şifre giriniz veya oluşturunuz"
                   />
                </div>
                <div className="flex items-center space-x-2">
                   <Checkbox 
                      id="mustChange" 
                      checked={formData.mustChangePassword}
                      onCheckedChange={(checked) => setFormData({...formData, mustChangePassword: checked})}
                   />
                   <Label htmlFor="mustChange" className="font-normal text-sm cursor-pointer">
                      İlk girişte şifre değiştirmek zorunlu
                   </Label>
                </div>
             </div>
          )}

          <div className="space-y-2">
             <Label>Durum</Label>
             <div className="flex items-center gap-4">
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="user-active" 
                    name="userStatus" 
                    value="aktif"
                    checked={formData.status === 'aktif'}
                    onChange={() => setFormData({...formData, status: 'aktif'})}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Label htmlFor="user-active" className="font-normal cursor-pointer">Aktif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <input 
                    type="radio" 
                    id="user-passive" 
                    name="userStatus" 
                    value="pasif"
                    checked={formData.status === 'pasif'}
                    onChange={() => setFormData({...formData, status: 'pasif'})}
                    className="w-4 h-4 text-red-600 focus:ring-red-500"
                  />
                  <Label htmlFor="user-passive" className="font-normal cursor-pointer">Pasif</Label>
                </div>
             </div>
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button type="submit" className="bg-blue-600 hover:bg-blue-700">Kaydet</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UserForm;
