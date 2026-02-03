import { Outlet, Navigate } from 'react-router-dom';
import { AuthenticatedHeader } from '@/components/AuthenticatedHeader';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Loader2 } from 'lucide-react';

export function AuthenticatedLayout() {
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile } = useProfile();

  // Redirect if not authenticated (after loading)
  if (!authLoading && !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header always visible - never remounts */}
      <AuthenticatedHeader 
        profile={profile || null}
        onSignOut={signOut}
      />

      {/* Content area: loader or page content */}
      {authLoading ? (
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      ) : (
        <Outlet />
      )}

      {/* Footer always visible - never remounts */}
      <Footer />
    </div>
  );
}
