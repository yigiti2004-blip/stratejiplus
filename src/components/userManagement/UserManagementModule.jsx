
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users, Building2, Shield } from 'lucide-react';
import { useUnitManagement } from '@/hooks/useUnitManagement';
import { useUserManagement } from '@/hooks/useUserManagement';
import { useRoleManagement } from '@/hooks/useRoleManagement';

import UnitManagementTab from './tabs/UnitManagementTab';
import UserManagementTab from './tabs/UserManagementTab';
import RoleManagementTab from './tabs/RoleManagementTab';

const UserManagementModule = () => {
  const [activeTab, setActiveTab] = useState('units');

  const { units, addUnit, updateUnit, deleteUnit } = useUnitManagement();
  const { users, addUser, updateUser, deleteUser, resetUserPassword } = useUserManagement();
  const { getRoles } = useRoleManagement();

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">Kullanıcı Yönetimi ve Ayarlar</h1>
        <p className="text-sm text-gray-500 mt-1">
          Birim, kullanıcı ve rol tanımlamalarını bu ekrandan yönetebilirsiniz.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden min-h-[600px]">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="border-b border-gray-200 bg-gray-50 px-6 pt-2">
            <TabsList className="bg-transparent space-x-2">
              <TabsTrigger 
                value="units" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-gray-200 border border-transparent"
              >
                <Building2 className="w-4 h-4 mr-2" /> Birim Yönetimi
              </TabsTrigger>
              <TabsTrigger 
                value="users" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-gray-200 border border-transparent"
              >
                <Users className="w-4 h-4 mr-2" /> Kullanıcı Yönetimi
              </TabsTrigger>
              <TabsTrigger 
                value="roles" 
                className="data-[state=active]:bg-white data-[state=active]:shadow-sm data-[state=active]:border-gray-200 border border-transparent"
              >
                <Shield className="w-4 h-4 mr-2" /> Rol & Yetkiler
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="p-6">
            <TabsContent value="units" className="mt-0">
               <UnitManagementTab 
                  units={units}
                  addUnit={addUnit}
                  updateUnit={updateUnit}
                  deleteUnit={deleteUnit}
               />
            </TabsContent>

            <TabsContent value="users" className="mt-0">
               <UserManagementTab 
                  users={users}
                  units={units}
                  roles={getRoles()}
                  addUser={addUser}
                  updateUser={updateUser}
                  deleteUser={deleteUser}
                  resetUserPassword={resetUserPassword}
               />
            </TabsContent>

            <TabsContent value="roles" className="mt-0">
               <RoleManagementTab roles={getRoles()} />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default UserManagementModule;
