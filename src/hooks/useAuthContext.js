
import { useState, useEffect } from 'react';

export const useAuthContext = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          setCurrentUser(JSON.parse(storedUser));
        } else {
          setCurrentUser(null);
        }
      } catch (e) {
        console.error("Error loading session:", e);
        localStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    };
    
    // Load user on mount
    loadUser();
    
    // Listen for storage changes (when login happens in same window)
    const handleStorageChange = () => {
      loadUser();
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    // Also listen for custom login event
    window.addEventListener('user-login', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('user-login', handleStorageChange);
    };
  }, []);

  const login = (email, password) => {
    console.log("--- LOGIN ATTEMPT STARTED ---");
    console.log("Email Input:", email);
    
    // 1. Fetch users from localStorage
    let storedUsersStr = localStorage.getItem('users');
    
    // If no users exist, initialize data
    if (!storedUsersStr) {
       console.warn("No users found, initializing data...");
       // Import and call initializeData
       import('@/lib/data-initializer').then(({ initializeData }) => {
         initializeData();
       });
       storedUsersStr = localStorage.getItem('users');
    }

    if (!storedUsersStr) {
       console.error("LOGIN ERROR: No 'users' key in localStorage after initialization");
       // Create default admin user as fallback
       const defaultAdmin = {
         userId: "admin-001",
         fullName: "Sistem Yöneticisi",
         email: "admin@stratejiplus.com",
         unitId: "org-1",
         roleId: "admin",
         status: "aktif",
         password: "admin123",
         mustChangePassword: false,
         lastLoginDate: null,
         createdAt: new Date().toISOString(),
         updatedAt: new Date().toISOString()
       };
       localStorage.setItem('users', JSON.stringify([defaultAdmin]));
       storedUsersStr = JSON.stringify([defaultAdmin]);
    }

    let users = [];
    try {
      users = JSON.parse(storedUsersStr) || [];
    } catch (e) {
      console.error("LOGIN ERROR: Failed to parse users JSON", e);
      return { success: false, message: 'Kullanıcı verisi bozuk.' };
    }
    
    // 2. Find user by email (case-insensitive)
    const normalizedEmail = email.toLowerCase().trim();
    let user = users.find(u => u.email && u.email.toLowerCase() === normalizedEmail);
    console.log("Found User Object:", user);
    
    // 3. If user not found, create admin user as fallback (bypass for development)
    if (!user && normalizedEmail === 'admin@stratejiplus.com') {
      console.warn("Admin user not found, creating default admin...");
      const defaultAdmin = {
        userId: "admin-001",
        fullName: "Sistem Yöneticisi",
        email: "admin@stratejiplus.com",
        unitId: "org-1",
        roleId: "admin",
        status: "aktif",
        password: "admin123",
        mustChangePassword: false,
        lastLoginDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      users.push(defaultAdmin);
      localStorage.setItem('users', JSON.stringify(users));
      user = defaultAdmin;
    }
    
    if (!user) {
      console.warn("LOGIN FAILED: User not found for email:", normalizedEmail);
      console.log("Available users:", users.map(u => u.email));
      return { success: false, message: 'Kullanıcı bulunamadı.' };
    }
    
    // 3. Check if user.status === "aktif"
    if (user.status !== 'aktif') {
      console.warn("LOGIN FAILED: User status is not active:", user.status);
      return { success: false, message: 'Hesabınız pasif durumdadır. Lütfen yöneticinizle iletişime geçiniz.' };
    }
    
    // 4. Compare password (PLAIN TEXT CHECK)
    // NOTE: In a real production app, use proper hashing (bcrypt, argon2, etc) on backend
    // For this debug session, we are comparing plain text.
    console.log("Checking password...");
    
    if (user.password !== password) {
      console.warn("LOGIN FAILED: Password mismatch");
      return { success: false, message: 'Hatalı şifre.' };
    }

    // 5. Login success
    console.log("LOGIN SUCCESS: Credentials valid, creating session...");
    const sessionUser = {
      ...user,
      lastLoginDate: new Date().toISOString()
    };

    localStorage.setItem('currentUser', JSON.stringify(sessionUser));
    setCurrentUser(sessionUser);
    
    // Update last login date in users storage
    const updatedUsers = users.map(u => 
      u.userId === user.userId ? { ...u, lastLoginDate: new Date().toISOString() } : u
    );
    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('user-login', { detail: sessionUser }));
    
    console.log("--- LOGIN COMPLETE ---");
    return { success: true, user: sessionUser };
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const updatePassword = (userId, oldPassword, newPassword) => {
     const storedUsersStr = localStorage.getItem('users');
     if (!storedUsersStr) return false;
     
     const users = JSON.parse(storedUsersStr);
     const user = users.find(u => u.userId === userId);
     
     if (!user) return false;
     
     // Simple check
     if (user.password !== oldPassword) return false;
     
     const updatedUsers = users.map(u => 
        u.userId === userId ? { 
           ...u, 
           password: newPassword, // Update plain text password
           mustChangePassword: false, 
           updatedAt: new Date().toISOString() 
        } : u
     );
     localStorage.setItem('users', JSON.stringify(updatedUsers));
     
     // Update current session if it matches
     if (currentUser && currentUser.userId === userId) {
        const updatedSession = { ...currentUser, mustChangePassword: false };
        localStorage.setItem('currentUser', JSON.stringify(updatedSession));
        setCurrentUser(updatedSession);
     }
     
     return true;
  };

  return {
    currentUser,
    login,
    logout,
    updatePassword,
    isAuthenticated: !!currentUser
  };
};
