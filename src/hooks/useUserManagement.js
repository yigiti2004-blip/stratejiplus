
import { useState, useEffect } from 'react';

export const useUserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load users from localStorage
  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = () => {
    try {
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        setUsers(JSON.parse(storedUsers));
      }
    } catch (error) {
      console.error("Error loading users:", error);
    } finally {
      setLoading(false);
    }
  };

  const VALID_ROLES = ['admin', 'unit-manager', 'user', 'view-only'];

  const validateUser = (userData) => {
    if (!userData.email || !userData.fullName || !userData.roleId || !userData.unitId) {
      throw new Error("Tüm zorunlu alanları doldurunuz.");
    }
    if (!VALID_ROLES.includes(userData.roleId)) {
      throw new Error("Geçersiz rol seçimi.");
    }
  };

  const addUser = (userData) => {
    validateUser(userData);

    // Check email uniqueness
    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    if (storedUsers.some(u => u.email.toLowerCase() === userData.email.toLowerCase())) {
      throw new Error("Bu e-posta adresi ile kayıtlı bir kullanıcı zaten var.");
    }

    const newUser = {
      userId: `user-${Date.now()}`,
      ...userData,
      status: userData.status || 'aktif',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedUsers = [...storedUsers, newUser];
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    setUsers(updatedUsers);
    return newUser;
  };

  const updateUser = (userId, updates) => {
    if (updates.roleId && !VALID_ROLES.includes(updates.roleId)) {
       throw new Error("Geçersiz rol seçimi.");
    }

    const storedUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const index = storedUsers.findIndex(u => u.userId === userId);
    
    if (index === -1) {
      throw new Error("Kullanıcı bulunamadı.");
    }

    const updatedUser = {
      ...storedUsers[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };

    storedUsers[index] = updatedUser;
    localStorage.setItem('users', JSON.stringify(storedUsers));
    setUsers(storedUsers);
    return updatedUser;
  };

  const deleteUser = (userId) => {
    // Instead of hard delete, we often set status to passive, but here we can do soft delete logic if requested.
    // However, the prompt implies "deleting" usually means removing or setting passive.
    // The previous implementation set status to passive. Let's support both or stick to status update.
    // Actually, let's allow status update via updateUser.
    // This function will strictly be "set to passive" for safety, or we can remove if it's a hard delete requirement.
    // Let's implement status toggle to 'pasif'.
    return updateUser(userId, { status: 'pasif' });
  };

  const resetUserPassword = (userId, newPassword) => {
    // In this plain-text debug mode, we store password directly. 
    // In production this would be a hash.
    return updateUser(userId, { 
      password: newPassword,
      mustChangePassword: true 
    });
  };

  return {
    users,
    loading,
    addUser,
    updateUser,
    deleteUser,
    resetUserPassword,
    refreshUsers: loadUsers
  };
};
