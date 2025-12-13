
import React from 'react';
import { 
  LayoutDashboard, 
  Target, 
  Settings, 
  Calendar, 
  LineChart, 
  FileText, 
  Wallet, 
  AlertTriangle, 
  History, 
  CheckCircle, 
  Users, 
  LogOut, 
  Menu, 
  ChevronLeft,
  BarChart3,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

export default function Navigation({ 
  currentUser, 
  currentView, 
  onViewChange, 
  onLogout, 
  isCollapsed, 
  toggleSidebar,
  isMobileOpen,
  toggleMobileSidebar
}) {
  
  // Define menu items based on App.jsx routes and common structure
  const menuItems = [
    {
      id: 'dashboard',
      label: 'Kontrol Paneli',
      icon: LayoutDashboard,
      roles: ['admin', 'unit-manager', 'user', 'view-only']
    },
    {
      id: 'strategic-planning',
      label: 'Stratejik Planlama',
      icon: Target,
      roles: ['admin', 'unit-manager', 'user']
    },
    {
      id: 'sp-management',
      label: 'SP Yönetimi',
      icon: Settings,
      roles: ['admin', 'unit-manager']
    },
    {
      id: 'annual-plan',
      label: 'Yıllık İş Planı',
      icon: Calendar,
      roles: ['admin', 'unit-manager', 'user', 'view-only']
    },
    {
      id: 'strategic-plan-monitoring',
      label: 'Plan İzleme',
      icon: LineChart,
      roles: ['admin', 'unit-manager', 'user', 'view-only']
    },
    {
      id: 'monitoring',
      label: 'İzleme Kayıtları',
      icon: FileText,
      roles: ['admin', 'unit-manager', 'user']
    },
    {
      id: 'target-completion',
      label: 'Hedef Tamamlama',
      icon: CheckCircle,
      roles: ['admin', 'unit-manager', 'user']
    },
    {
      id: 'budget',
      label: 'Bütçe Yönetimi',
      icon: Wallet,
      roles: ['admin', 'unit-manager', 'view-only']
    },
    {
      id: 'risks',
      label: 'Risk Yönetimi',
      icon: AlertTriangle,
      roles: ['admin', 'unit-manager', 'user', 'view-only']
    },
    {
      id: 'revisions',
      label: 'Revizyonlar',
      icon: History,
      roles: ['admin', 'unit-manager', 'view-only']
    },
    {
      id: 'reporting',
      label: 'Raporlar',
      icon: BarChart3,
      roles: ['admin', 'unit-manager', 'user', 'view-only']
    },
    {
      id: 'users',
      label: 'Kullanıcı Yönetimi',
      icon: Users,
      roles: ['admin']
    }
  ];

  // Filter items based on user role
  const filteredItems = menuItems.filter(item => 
    !item.roles || (currentUser && item.roles.includes(currentUser.roleId))
  );

  return (
    <>
      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-40 md:hidden backdrop-blur-sm transition-opacity"
          onClick={toggleMobileSidebar}
          aria-hidden="true"
        />
      )}

      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 bg-[#0B1121] border-r border-gray-800 transition-all duration-300 flex flex-col shadow-xl md:shadow-none",
          // Mobile Visibility: Hidden by default, shown when open
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
          // Desktop Visibility: Always visible
          "md:translate-x-0",
          // Width: Fixed on mobile (expanded), Dynamic on desktop
          "w-64", 
          isCollapsed ? "md:w-20" : "md:w-64"
        )}
      >
        {/* Header / Logo Area */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-800 bg-[#0B1121] shrink-0">
          {(!isCollapsed || isMobileOpen) && (
            <span className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent truncate">
              StratejiPlus
            </span>
          )}
          
          {/* Toggle Button */}
          <button 
            onClick={() => {
              if (window.innerWidth < 768) {
                toggleMobileSidebar();
              } else {
                toggleSidebar();
              }
            }}
            className="p-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white transition-colors ml-auto"
            aria-label="Toggle Menu"
          >
            {/* Desktop Icon */}
            <div className="hidden md:block">
              {isCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
            </div>
            {/* Mobile Icon */}
            <div className="md:hidden">
              <X size={20} />
            </div>
          </button>
        </div>

        {/* Navigation Items */}
        <div className="flex-1 overflow-y-auto py-4 scrollbar-thin scrollbar-thumb-gray-800">
          <nav className="space-y-1 px-2">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              
              return (
                <button
                  key={item.id}
                  onClick={() => onViewChange(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                    isActive 
                      ? "bg-blue-600/10 text-blue-400" 
                      : "text-gray-400 hover:bg-gray-800 hover:text-gray-100"
                  )}
                  title={(isCollapsed && !isMobileOpen) ? item.label : undefined}
                >
                  <Icon size={20} className={cn("shrink-0", isActive && "text-blue-400")} />
                  
                  {(!isCollapsed || isMobileOpen) && (
                    <span className="font-medium truncate">{item.label}</span>
                  )}
                  
                  {/* Active Indicator Strip */}
                  {isActive && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-blue-500 rounded-r-full" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Footer */}
        <div className="p-4 border-t border-gray-800 bg-[#0B1121] shrink-0">
          <div className={cn("flex items-center gap-3", (isCollapsed && !isMobileOpen) && "justify-center")}>
            <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm shrink-0">
              {currentUser?.fullName?.charAt(0) || 'U'}
            </div>
            
            {(!isCollapsed || isMobileOpen) && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  {currentUser?.fullName}
                </p>
                <p className="text-xs text-gray-500 truncate capitalize">
                  {currentUser?.roleId === 'unit-manager' ? 'Birim Yöneticisi' : 
                   currentUser?.roleId === 'admin' ? 'Yönetici' : 'Kullanıcı'}
                </p>
              </div>
            )}
            
            {(!isCollapsed || isMobileOpen) && (
              <button
                onClick={onLogout}
                className="p-1.5 rounded hover:bg-red-500/10 text-gray-500 hover:text-red-400 transition-colors"
                title="Çıkış Yap"
              >
                <LogOut size={18} />
              </button>
            )}
          </div>
        </div>
      </aside>
    </>
  );
}
