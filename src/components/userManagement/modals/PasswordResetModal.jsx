
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { X, Key, Copy } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';

const PasswordResetModal = ({ onClose, onConfirm, user }) => {
  const [newPassword, setNewPassword] = useState('');
  const { toast } = useToast();

  const generatePassword = () => {
    const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
    let pass = "";
    for(let i=0; i<10; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(pass);
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(newPassword);
    toast({ title: "Kopyalandı", description: "Şifre panoya kopyalandı." });
  };

  const handleConfirm = () => {
    onConfirm(newPassword);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 bg-red-50 rounded-t-lg">
          <h3 className="font-bold text-red-900 text-lg flex items-center gap-2">
            <Key className="w-5 h-5" /> Şifre Sıfırla
          </h3>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-red-100 text-red-900">
            <X className="w-4 h-4" />
          </Button>
        </div>

        <div className="p-6 space-y-4">
          <p className="text-sm text-gray-600">
             <strong>{user.fullName}</strong> kullanıcısı için yeni bir şifre oluşturulacak. 
             Lütfen yeni şifreyi kullanıcı ile paylaşmayı unutmayın.
          </p>

          <div className="flex gap-2 items-end">
            <div className="flex-1 space-y-1">
               <Label>Yeni Şifre</Label>
               <Input value={newPassword} readOnly className="font-mono bg-gray-50" placeholder="Oluştur'a tıklayın" />
            </div>
            <Button onClick={generatePassword} variant="outline" className="mb-[1px]">Oluştur</Button>
            {newPassword && (
              <Button onClick={copyToClipboard} variant="ghost" size="icon" className="mb-[1px]">
                <Copy className="w-4 h-4" />
              </Button>
            )}
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 mt-4">
            <Button type="button" variant="outline" onClick={onClose}>İptal</Button>
            <Button 
              onClick={handleConfirm} 
              disabled={!newPassword}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Şifreyi Sıfırla
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PasswordResetModal;
