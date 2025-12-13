
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShieldCheck, Eye, Edit3, Settings } from 'lucide-react';

const RoleManagementTab = ({ roles }) => {
  
  const getIcon = (roleId) => {
    switch(roleId) {
      case 'admin': return <Settings className="w-5 h-5 text-purple-600" />;
      case 'manager': return <ShieldCheck className="w-5 h-5 text-blue-600" />;
      case 'user': return <Edit3 className="w-5 h-5 text-emerald-600" />;
      default: return <Eye className="w-5 h-5 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="mb-4">
         <h3 className="text-lg font-semibold text-gray-800">Rol ve Yetki Tanımları</h3>
         <p className="text-sm text-gray-500">Sistemdeki sabit rol tanımları ve yetki seviyeleri.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {roles.map((role) => (
          <Card key={role.id} className="border-gray-200 hover:border-gray-300 transition-colors">
            <CardHeader className="pb-2 flex flex-row items-center gap-3">
              <div className="p-2 bg-gray-50 rounded-lg">
                 {getIcon(role.id)}
              </div>
              <div>
                 <CardTitle className="text-lg font-bold text-gray-900">{role.label}</CardTitle>
                 <div className="text-xs text-gray-500 font-mono mt-0.5">{role.name}</div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-600 mb-4 h-10">
                {role.description}
              </p>
              
              <div className="space-y-2">
                 <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Yetkiler</div>
                 <div className="flex flex-wrap gap-2">
                    {role.permissions.map(perm => (
                       <Badge key={perm} variant="secondary" className="bg-gray-100 text-gray-600 hover:bg-gray-200">
                          {perm === 'all' ? 'Tüm Yetkiler' : perm}
                       </Badge>
                    ))}
                 </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default RoleManagementTab;
