
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import { Helmet } from 'react-helmet';
import { Toaster } from '@/components/ui/toaster';
import { useLocation, useNavigate } from 'react-router-dom';
import Login from '@/components/Login';
import Dashboard from '@/components/Dashboard';
import StrategicPlanning from '@/components/StrategicPlanning';
import StrategicSnapshot from '@/components/StrategicSnapshot';
import SpManagement from '@/components/SpManagement';
import AnnualBusinessPlan from '@/components/AnnualBusinessPlan';
import UserManagementModule from '@/components/userManagement/UserManagementModule';
import BudgetManagement from '@/components/budget/BudgetManagement';
import RevisionManagement from '@/components/RevisionManagement';
import RiskManagement from '@/components/RiskManagement';
import StrategicPlanMonitoringModule from '@/components/strategicPlanMonitoring/StrategicPlanMonitoringModule';
import ReportingModule from '@/components/reporting/ReportingModule';
import ActivityRealizationModule from '@/components/activityRealization/ActivityRealizationModule';
import Navigation from '@/components/Navigation';
import { initializeData } from '@/lib/data-initializer';
import { useAuthContext } from '@/hooks/useAuthContext';
import { ROLES } from '@/hooks/useRoleManagement';
import { Menu } from 'lucide-react';

// Error Boundary for graceful crash handling
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 text-gray-900 p-4">
          <h1 className="text-2xl font-bold text-red-600 mb-2">Bir hata oluştu</h1>
          <p className="text-gray-600 mb-4">Uygulama yüklenirken beklenmedik bir sorunla karşılaşıldı.</p>
          <pre className="bg-gray-100 p-4 rounded text-xs overflow-auto max-w-2xl w-full mb-4 border border-gray-200">
            {this.state.error?.toString()}
          </pre>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Sayfayı Yenile
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Function to standardized roles and migrate users
const performStandardizationAndMigration = () => {
  try {
    localStorage.setItem("roles", JSON.stringify(ROLES));
    const storedUsersStr = localStorage.getItem("users");
    let users = [];
    if (storedUsersStr) {
      try {
        users = JSON.parse(storedUsersStr);
      } catch (e) {
        users = [];
      }
    }

    let hasChanges = false;
    const VALID_IDS = ['admin', 'unit-manager', 'user', 'view-only'];

    const migratedUsers = users.map(u => {
      let updatedUser = { ...u };
      let userChanged = false;

      if (updatedUser.roleId === 'manager') {
        updatedUser.roleId = 'unit-manager';
        userChanged = true;
      } else if (updatedUser.roleId === 'viewer') {
        updatedUser.roleId = 'view-only';
        userChanged = true;
      } else if (!VALID_IDS.includes(updatedUser.roleId)) {
        updatedUser.roleId = 'user';
        userChanged = true;
      }

      if (!updatedUser.fullName || updatedUser.fullName.trim() === '') {
         updatedUser.fullName = 'İsimsiz Kullanıcı';
         userChanged = true;
      }

      if (userChanged) hasChanges = true;
      return updatedUser;
    });

    const adminIndex = migratedUsers.findIndex(u => u.email === 'admin@stratejiplus.com');
    if (adminIndex === -1) {
      migratedUsers.push({
        userId: "admin-001",
        fullName: "Sistem Yöneticisi",
        email: "admin@stratejiplus.com",
        unitId: "unit-001",
        roleId: "admin",
        status: "aktif",
        password: "admin123",
        mustChangePassword: false,
        lastLoginDate: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });
      hasChanges = true;
    } else {
      const adminUser = migratedUsers[adminIndex];
      let adminChanged = false;
      if (adminUser.roleId !== 'admin') { adminUser.roleId = 'admin'; adminChanged = true; }
      if (adminUser.status !== 'aktif') { adminUser.status = 'aktif'; adminChanged = true; }
      if (!adminUser.fullName || adminUser.fullName.trim() === '') { adminUser.fullName = 'Sistem Yöneticisi'; adminChanged = true; }
      if (adminChanged) { migratedUsers[adminIndex] = adminUser; hasChanges = true; }
    }

    if (hasChanges) {
      localStorage.setItem("users", JSON.stringify(migratedUsers));
    }
    
    if (!localStorage.getItem('units')) {
       const defaultUnits = [{ 
         unitId: "unit-001", unitName: "Genel Müdürlük", unitCode: "GM", 
         status: "aktif", createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() 
       }];
       localStorage.setItem('units', JSON.stringify(defaultUnits));
    }

  } catch (err) {
    console.error("MIGRATION FAILED:", err);
  }
};

// One-time cleanup for legacy localStorage data when using Supabase backend
const clearLegacyLocalStorageForSupabase = () => {
  try {
    const hasSupabase =
      !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;
    if (!hasSupabase) return;

    const legacyKeys = [
      'strategicAreas',
      'strategicObjectives',
      'targets',
      'indicators',
      'activities',
      'units',
      'organizations',
      'monitoringHistory',
      // Keep budgetChapters and expenses for Budget Management local storage
      // 'budgetChapters',
      // 'expenses',
      'risks',
      'revisions',
    ];

    legacyKeys.forEach((key) => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // ignore per-key errors
      }
    });
  } catch (e) {
    console.warn('Failed to clear legacy localStorage data:', e);
  }
};

function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  
  const { currentUser, login, logout, isAuthenticated } = useAuthContext();
  const location = useLocation();
  const navigate = useNavigate();

  // Sync URL with currentView
  useEffect(() => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/') setCurrentView('dashboard');
    else if (path === '/strategic-planning') setCurrentView('strategic-planning');
    else if (path === '/sp-management') setCurrentView('sp-management');
    else if (path === '/budget') setCurrentView('budget');
    else if (path === '/plan-izleme') setCurrentView('strategic-plan-monitoring');
    else if (path === '/revisions') setCurrentView('revisions');
    else if (path === '/risks') setCurrentView('risks');
    else if (path === '/reporting') setCurrentView('reporting');
    else if (path === '/annual-plan') setCurrentView('annual-plan');
    else if (path === '/users') setCurrentView('users');
  }, [location]);

  useEffect(() => {
    const initApp = async () => {
      try {
        const hasSupabase =
          !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY;

        if (hasSupabase) {
          // Using Supabase: clear old localStorage seed so UI doesn't flash legacy data
          clearLegacyLocalStorageForSupabase();
        } else {
          // Local-only mode (no Supabase): seed demo data + migration as before
          initializeData();
          performStandardizationAndMigration();
          initializeData();
        }
      } catch (error) {
        console.error("Initialization error:", error);
      } finally {
        setIsInitializing(false);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    if (currentView === 'users' && currentUser) {
      if (currentUser.roleId !== 'admin') {
        navigate('/dashboard');
      }
    }
  }, [currentView, currentUser, navigate]);

  const handleLogout = useCallback(() => {
    logout();
    navigate('/dashboard');
    setIsMobileMenuOpen(false);
  }, [logout, navigate]);

  const toggleSidebar = useCallback(() => {
    setIsSidebarCollapsed(prev => !prev);
  }, []);

  const toggleMobileSidebar = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const handleViewChange = useCallback((view) => {
    let path = '/dashboard';
    if (view === 'strategic-planning') path = '/strategic-planning';
    else if (view === 'sp-management') path = '/sp-management';
    else if (view === 'budget') path = '/budget';
    else if (view === 'strategic-plan-monitoring') path = '/plan-izleme';
    else if (view === 'revisions') path = '/revisions';
    else if (view === 'risks') path = '/risks';
    else if (view === 'reporting') path = '/reporting';
    else if (view === 'annual-plan') path = '/annual-plan';
    else if (view === 'users') path = '/users';
    
    navigate(path);
    setIsMobileMenuOpen(false);
  }, [navigate]);

  if (isInitializing) {
    return <div className="min-h-screen bg-[#111827] flex items-center justify-center text-white">Yükleniyor...</div>;
  }

  if (!isAuthenticated) {
    return (
      <ErrorBoundary>
        <Helmet>
           <title>StratejiPlus - Giriş</title>
        </Helmet>
        <Login /> 
        <Toaster />
      </ErrorBoundary>
    );
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-[#111827] font-sans text-gray-100 flex selection:bg-blue-500/30">
        <Helmet>
          <title>StratejiPlus - Kurumsal Performans Yönetimi</title>
        </Helmet>
        
        <Navigation 
          currentUser={currentUser}
          currentView={currentView}
          onViewChange={handleViewChange}
          onLogout={handleLogout}
          isCollapsed={isSidebarCollapsed}
          toggleSidebar={toggleSidebar}
          isMobileOpen={isMobileMenuOpen}
          toggleMobileSidebar={toggleMobileSidebar}
        />

        <main 
          className={`transition-all duration-300 flex-1 flex flex-col ${
            isSidebarCollapsed ? 'md:ml-20' : 'md:ml-64'
          }`}
        >
          {/* Mobile Header with Hamburger Menu */}
          <div className="md:hidden h-16 bg-[#0B1121] border-b border-gray-800 flex items-center justify-between px-4 sticky top-0 z-30">
            <div className="flex items-center gap-3">
              <button 
                onClick={toggleMobileSidebar}
                className="p-2 -ml-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
                aria-label="Open Menu"
              >
                <Menu size={24} />
              </button>
              <span className="font-bold text-white text-lg bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">
                StratejiPlus
              </span>
            </div>
            {/* User Avatar - optional for mobile header */}
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
          </div>

          <div className="flex-1 p-4 md:p-8 lg:p-10 pb-24 md:pb-10 max-w-[1600px] mx-auto w-full">
            <Suspense fallback={<div className="text-white p-4">Yükleniyor...</div>}>
              {currentView === 'dashboard' && <Dashboard currentUser={currentUser} />}
              {currentView === 'strategic-planning' && <StrategicSnapshot />}
              {currentView === 'sp-management' && <SpManagement currentUser={currentUser} />}
              {currentView === 'budget' && <BudgetManagement currentUser={currentUser} />}
              {currentView === 'strategic-plan-monitoring' && <StrategicPlanMonitoringModule currentUser={currentUser} />}
              {currentView === 'revisions' && <RevisionManagement currentUser={currentUser} />}
              {currentView === 'risks' && <RiskManagement currentUser={currentUser} />}
              {currentView === 'reporting' && <ReportingModule currentUser={currentUser} />} 
              {currentView === 'annual-plan' && <AnnualBusinessPlan currentUser={currentUser} />}
              {currentView === 'activity-realization' && <ActivityRealizationModule />}
              {currentView === 'users' && <UserManagementModule />}
            </Suspense>
          </div>
        </main>

        <Toaster />
      </div>
    </ErrorBoundary>
  );
}

export default React.memo(App);
