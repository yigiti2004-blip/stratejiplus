
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Plus, Edit2, Trash2, Key, Search } from 'lucide-react';
import UserForm from '../forms/UserForm';
import PasswordResetModal from '../modals/PasswordResetModal';
import { useToast } from '@/components/ui/use-toast';
import { formatDate } from '@/lib/utils';

const UserManagementTab = ({ users, units, roles, addUser, updateUser, deleteUser, resetUserPassword }) => {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isResetOpen, setIsResetOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [selectedUserForReset, setSelectedUserForReset] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const handleSave = (data) => {
    try {
      if (editingUser) {
        updateUser(editingUser.userId, data);
        toast({ title: "Başarılı", description: "Kullanıcı güncellendi." });
      } else {
        addUser({
          ...data,
          passwordHash: data.password ? btoa(data.password) : btoa('temp1234')
        });
        toast({ title: "Başarılı", description: "Yeni kullanıcı oluşturuldu." });
      }
      setIsFormOpen(false);
      setEditingUser(null);
    } catch (error) {
      toast({ title: "Hata", description: error.message || "İşlem başarısız.", variant: "destructive" });
    }
  };

  const handleDelete = (userId) => {
    if (window.confirm('Bu kullanıcıyı pasife almak istediğinize emin misiniz?')) {
      deleteUser(userId);
      toast({ title: "Bilgi", description: "Kullanıcı pasife alındı." });
    }
  };

  const handlePasswordReset = (newPassword) => {
     if (selectedUserForReset) {
        resetUserPassword(selectedUserForReset.userId, newPassword);
        toast({ title: "Başarılı", description: "Şifre sıfırlandı." });
        setIsResetOpen(false);
        setSelectedUserForReset(null);
     }
  };

  const getUnitName = (id) => {
    const unit = units.find(u => u.unitId === id);
    return unit ? unit.unitName : '-';
  };

  const getRoleLabel = (id) => {
    const role = roles.find(r => r.id === id);
    return role ? role.label : id;
  };

  // FIX: Added safety checks for undefined fullName or email to prevent crash during filter
  const filteredUsers = users.filter(u => {
    const name = u.fullName || ""; 
    const email = u.email || "";
    const term = searchTerm.toLowerCase();
    
    return name.toLowerCase().includes(term) || email.toLowerCase().includes(term);
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
        <div>
           <h3 className="text-lg font-semibold text-gray-800">Kullanıcı Listesi</h3>
           <p className="text-sm text-gray-500">Sistem kullanıcılarını yönetin.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
           <div className="relative flex-1 md:w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input 
                placeholder="Ara..." 
                className="pl-9" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <Button onClick={() => { setEditingUser(null); setIsFormOpen(true); }} className="bg-blue-600 hover:bg-blue-700">
             <Plus className="w-4 h-4 mr-2" /> Yeni Kullanıcı
           </Button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white shadow-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-gray-50">
              <TableHead>Ad Soyad</TableHead>
              <TableHead>E-posta (Kullanıcı Adı)</TableHead>
              <TableHead>Birim</TableHead>
              <TableHead>Rol</TableHead>
              <TableHead>Son Giriş</TableHead>
              <TableHead>Durum</TableHead>
              <TableHead className="text-right">İşlemler</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.length === 0 ? (
               <TableRow>
                 <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    Kayıt bulunamadı.
                 </TableCell>
               </TableRow>
            ) : (
              filteredUsers.map((user) => (
                <TableRow key={user.userId}>
                  <TableCell className="font-medium">{user.fullName || "İsimsiz Kullanıcı"}</TableCell>
                  <TableCell className="text-gray-500 text-sm">{user.email || "-"}</TableCell>
                  <TableCell>{getUnitName(user.unitId)}</TableCell>
                  <TableCell>
                     <Badge variant="outline" className="font-normal bg-gray-50">{getRoleLabel(user.roleId)}</Badge>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                     {user.lastLoginDate ? formatDate(user.lastLoginDate) : 'Hiç girmedi'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === 'aktif' ? 'default' : 'secondary'} className={user.status === 'aktif' ? 'bg-green-100 text-green-800 hover:bg-green-200 border-0' : 'bg-gray-100 text-gray-800 border-0'}>
                      {user.status === 'aktif' ? 'Aktif' : 'Pasif'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" title="Şifre Sıfırla" onClick={() => { setSelectedUserForReset(user); setIsResetOpen(true); }}>
                        <Key className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => { setEditingUser(user); setIsFormOpen(true); }}>
                        <Edit2 className="w-4 h-4 text-gray-600" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDelete(user.userId)} disabled={user.status === 'pasif'}>
                        <Trash2 className={`w-4 h-4 ${user.status === 'pasif' ? 'text-gray-300' : 'text-red-600'}`} />
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
        <UserForm 
          onClose={() => setIsFormOpen(false)}
          onSave={handleSave}
          initialData={editingUser}
          units={units}
          roles={roles}
        />
      )}

      {isResetOpen && selectedUserForReset && (
         <PasswordResetModal 
            onClose={() => { setIsResetOpen(false); setSelectedUserForReset(null); }}
            onConfirm={handlePasswordReset}
            user={selectedUserForReset}
         />
      )}
    </div>
  );
};

export default UserManagementTab;
