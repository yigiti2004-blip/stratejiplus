import { useState, useEffect } from 'react';
import { supabase, setUserContext } from '@/lib/supabase';

export const useAuthContext = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    const loadUser = () => {
      try {
        const storedUser = localStorage.getItem('currentUser');
        if (storedUser) {
          const parsed = JSON.parse(storedUser);
          setCurrentUser(parsed);
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

  const login = async (email, password) => {
    console.log("--- LOGIN ATTEMPT STARTED ---");
    console.log("Email Input:", email);
    
    // Check if Supabase is configured
    if (!supabase) {
      console.error("Supabase not configured - cannot login");
      return { success: false, message: 'Sistem yapılandırılmamış. Lütfen yöneticinizle iletişime geçiniz.' };
    }

    try {
      // Normalize email
      const normalizedEmail = email.toLowerCase().trim();
      
      // Fetch user from Supabase
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('email', normalizedEmail)
        .single();

      if (userError || !userData) {
        console.warn("LOGIN FAILED: User not found for email:", normalizedEmail);
        return { success: false, message: 'Kullanıcı bulunamadı.' };
      }

      console.log("Found User Object:", userData);
      console.log("🔍 User company_id from database:", userData.company_id);
      
      // CRITICAL: Verify company_id exists in user record
      if (!userData.company_id) {
        console.error("❌ CRITICAL: User record has NULL company_id in database!");
        console.error("User:", userData.email, userData.full_name);
        return { success: false, message: 'Kullanıcı kaydında şirket bilgisi bulunamadı. Lütfen yöneticinizle iletişime geçiniz.' };
      }
      
      // Check if user status is active
      if (userData.status !== 'aktif') {
        console.warn("LOGIN FAILED: User status is not active:", userData.status);
        return { success: false, message: 'Hesabınız pasif durumdadır. Lütfen yöneticinizle iletişime geçiniz.' };
      }
      
      // Check password (compare plain text for now - password_hash or password column)
      const storedPassword = userData.password_hash || userData.password || '';
      
      // For plain text passwords (development/testing)
      if (storedPassword !== password) {
        console.warn("LOGIN FAILED: Password mismatch");
        return { success: false, message: 'Hatalı şifre.' };
      }

      // Login success - map Supabase fields to frontend format
      console.log("LOGIN SUCCESS: Credentials valid, creating session...");
      
      const sessionUser = {
        // Map Supabase fields to frontend format
        userId: userData.user_id,
        id: userData.user_id, // Also include 'id' for compatibility
        fullName: userData.full_name,
        email: userData.email,
        roleId: userData.role_id,
        unitId: userData.unit_id,
        companyId: userData.company_id, // CRITICAL: Include company_id
        status: userData.status,
        mustChangePassword: userData.must_change_password || false,
        lastLoginDate: userData.last_login_date,
        createdAt: userData.created_at,
        updatedAt: userData.updated_at,
        // Keep original Supabase data for reference
        _supabase: userData
      };

      // Update last login date in Supabase
      try {
        await supabase
          .from('users')
          .update({ last_login_date: new Date().toISOString() })
          .eq('user_id', userData.user_id);
      } catch (updateError) {
        console.warn("Failed to update last login date:", updateError);
        // Don't fail login if this update fails
      }

      // CRITICAL: Verify company_id before proceeding
      if (!sessionUser.companyId) {
        console.error("❌ CRITICAL ERROR: User logged in but company_id is NULL or missing!");
        console.error("User data from Supabase:", userData);
        console.error("Session user object:", sessionUser);
        return { success: false, message: 'Kullanıcı şirket bilgisi bulunamadı. Lütfen yöneticinizle iletişime geçiniz.' };
      }

      // Store in localStorage for session persistence
      localStorage.setItem('currentUser', JSON.stringify(sessionUser));
      setCurrentUser(sessionUser);
      
      // Set user context for RLS
      await setUserContext(sessionUser.userId || sessionUser.id);
      
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('user-login', { detail: sessionUser }));
      
      console.log("--- LOGIN COMPLETE ---");
      console.log("Current User:", sessionUser);
      console.log("✅ COMPANY ID VERIFIED:", sessionUser.companyId);
      console.log("✅ User ID:", sessionUser.userId || sessionUser.id);
      console.log("✅ Email:", sessionUser.email);
      return { success: true, user: sessionUser };
    } catch (error) {
      console.error("LOGIN ERROR:", error);
      return { success: false, message: 'Giriş sırasında bir hata oluştu: ' + (error.message || 'Bilinmeyen hata') };
    }
  };

  const logout = () => {
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
  };

  const updatePassword = async (userId, oldPassword, newPassword) => {
    if (!supabase) {
      return false;
    }
    
    try {
      // Get current user
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('password_hash, password')
        .eq('user_id', userId)
        .single();

      if (userError || !userData) {
        return false;
      }

      // Check old password
      const storedPassword = userData.password_hash || userData.password || '';
      if (storedPassword !== oldPassword) {
        return false;
      }

      // Update password (plain text for now - should be hashed in production)
      const { error: updateError } = await supabase
        .from('users')
        .update({ 
          password: newPassword, // Plain text - should hash in production
          must_change_password: false,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (updateError) {
        console.error("Failed to update password:", updateError);
        return false;
      }
      
      // Update current session if it matches
      if (currentUser && (currentUser.userId === userId || currentUser.id === userId)) {
        const updatedSession = { ...currentUser, mustChangePassword: false };
        localStorage.setItem('currentUser', JSON.stringify(updatedSession));
        setCurrentUser(updatedSession);
      }
      
      return true;
    } catch (error) {
      console.error("Error updating password:", error);
      return false;
    }
  };

  return {
    currentUser,
    login,
    logout,
    updatePassword,
    isAuthenticated: !!currentUser
  };
};
