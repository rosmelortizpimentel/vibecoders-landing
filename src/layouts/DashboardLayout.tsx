import { Outlet, Navigate } from 'react-router-dom';
import { AuthenticatedHeader } from '@/components/AuthenticatedHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

import { useState, useEffect } from 'react';

export function DashboardLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile } = useProfile();
  
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('sidebarCollapsed') === 'true';
  });

  useEffect(() => {
    const handleResize = (e: CustomEvent<{ isCollapsed: boolean }>) => {
      setIsCollapsed(e.detail.isCollapsed);
    };

    window.addEventListener('sidebar-resize', handleResize as EventListener);
    return () => window.removeEventListener('sidebar-resize', handleResize as EventListener);
  }, []);

  // Redirect if not authenticated (after loading)
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-card flex">
      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen bg-card transition-all duration-300",
          isCollapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        
        {/* Header - Handles Mobile Menu & Desktop Breadcrumbs */}
        <AuthenticatedHeader 
          profile={profile || null}
          onSignOut={signOut}
        />

        {/* Page Content - Full width on mobile, centered with max-width on desktop */}
        <main className="flex-1 w-full px-3 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 md:max-w-7xl md:mx-auto animate-in fade-in duration-500">
          {authLoading ? (
            <div className="h-full flex items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Outlet />
          )}
        </main>
      </div>
    </div>
  );
}

