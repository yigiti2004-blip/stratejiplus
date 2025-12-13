
import { useMemo } from 'react';

// STANDARDIZED ROLE DEFINITIONS
export const ROLES = [
  {
    id: 'admin',
    label: 'Sistem Sorumlusu',
    description: 'Sistem üzerindeki tüm modüllere ve ayarlara tam erişim.',
    permissions: ['all']
  },
  {
    id: 'unit-manager',
    label: 'Birim Yöneticisi',
    description: 'Birim bazlı veri girişi, onayı ve personel yönetimi.',
    permissions: ['manage-unit', 'view-all', 'approve']
  },
  {
    id: 'user',
    label: 'Kullanıcı',
    description: 'Standart veri girişi ve kendi birimini görüntüleme.',
    permissions: ['view-own', 'edit-own']
  },
  {
    id: 'view-only',
    label: 'Sadece Görüntüleme',
    description: 'Verileri sadece görüntüleme yetkisi, değişiklik yapamaz.',
    permissions: ['view-all']
  }
];

export const useRoleManagement = () => {
  const getRoles = () => ROLES;

  const getRoleById = (roleId) => {
    return ROLES.find(r => r.id === roleId);
  };

  const getRoleLabel = (roleId) => {
    const role = getRoleById(roleId);
    return role ? role.label : roleId; // Fallback to ID if not found
  };

  const hasPermission = (roleId, permission) => {
    const role = getRoleById(roleId);
    if (!role) return false;
    return role.permissions.includes('all') || role.permissions.includes(permission);
  };

  return {
    getRoles,
    getRoleById,
    getRoleLabel,
    hasPermission
  };
};
