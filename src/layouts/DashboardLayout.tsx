import { Outlet, Navigate } from 'react-router-dom';
import { AuthenticatedHeader } from '@/components/AuthenticatedHeader';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSubscription } from '@/hooks/useSubscription';
import { FounderWelcome } from '@/components/home/FounderWelcome';
import { useQueryClient } from '@tanstack/react-query';
import { PageHeaderProvider } from '@/contexts/PageHeaderContext';
import { useFounderStatus } from '@/hooks/useFounderStatus';

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function DashboardLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile } = useProfile();
  const { isFounder, founderNumber, founderWelcomeSeen } = useSubscription();
  const queryClient = useQueryClient();
  const { isLoading: founderStatusLoading } = useFounderStatus();
  
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

  // Clean up stale Stripe redirect flag (only relevant during initial OAuth callback)
  useEffect(() => {
    localStorage.removeItem('pendingStripeRedirect');
  }, []);

  // Redirect if not authenticated (after loading)
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  if (authLoading || founderStatusLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-card">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <PageHeaderProvider>
    <div className="min-h-screen bg-card flex">
      {/* Founder Welcome Popup - shows on any page */}
      {isFounder && founderNumber && (
        <FounderWelcome
          founderNumber={founderNumber}
          open={!founderWelcomeSeen}
          onDismiss={() => queryClient.invalidateQueries({ queryKey: ['subscription'] })}
        />
      )}

      {/* Sidebar - Desktop Only */}
      <Sidebar />

      {/* Main Content Area */}
      <div 
        className={cn(
          "flex-1 flex flex-col min-h-screen bg-card transition-all duration-300 min-w-0",
          isCollapsed ? "md:pl-20" : "md:pl-64"
        )}
      >
        
        {/* Header - Handles Mobile Menu & Desktop Breadcrumbs */}
        <AuthenticatedHeader 
          profile={profile || null}
          onSignOut={signOut}
        />

        {/* Page Content - Full width on mobile, centered with max-width on desktop */}
        <main className="flex-1 w-full min-w-0 max-w-full px-3 py-3 sm:px-4 sm:py-4 md:px-8 md:py-6 md:max-w-7xl md:mx-auto animate-in fade-in duration-500">
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
    </PageHeaderProvider>
  );
}
