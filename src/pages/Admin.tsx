import { useEffect } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ShowcaseManager } from '@/components/admin/ShowcaseManager';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { profile } = useProfile();

  const loading = authLoading || roleLoading;

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate('/');
      } else if (!isAdmin) {
        navigate('/me/profile');
      }
    }
  }, [user, isAdmin, loading, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#3D5AFE]" />
      </div>
    );
  }

  if (!user || !isAdmin) {
    return null;
  }

  // Map Profile to the shape AdminLayout expects
  const profileData = profile ? {
    name: profile.name,
    username: profile.username,
    avatar_url: profile.avatar_url,
  } : null;

  return (
    <Routes>
      <Route element={<AdminLayout profile={profileData} onSignOut={handleSignOut} />}>
        <Route index element={<Navigate to="/admin/showcase" replace />} />
        <Route path="showcase" element={<ShowcaseManager />} />
      </Route>
    </Routes>
  );
};

export default Admin;
