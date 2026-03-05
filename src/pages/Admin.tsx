import { useEffect, useState } from 'react';
import { useNavigate, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';
import { AdminLayout } from '@/components/admin/AdminLayout';
import { ShowcaseManager } from '@/components/admin/ShowcaseManager';
import { StackManager } from '@/components/admin/StackManager';
import { TechStackManager } from '@/components/admin/TechStackManager';
import { SettingsManager } from '@/components/admin/SettingsManager';
import { UsersManager } from '@/components/admin/UsersManager';
import { WaitlistManager } from '@/components/admin/WaitlistManager';
import { FeedbackManager } from '@/components/admin/FeedbackManager';
import { NotificationManager } from '@/components/admin/NotificationManager';
import { SurveyManager } from '@/components/admin/SurveyManager';
import { AppsMonitor } from '@/components/admin/AppsMonitor';
import { MenuManager } from '@/components/admin/MenuManager';
import { PlansFeaturesManager } from '@/components/admin/PlansFeaturesManager';
import { supabase } from '@/integrations/supabase/client';
import { Loader2 } from 'lucide-react';

const Admin = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const { isAdmin, loading: roleLoading } = useUserRole();
  const { profile } = useProfile();
  const [accessChecked, setAccessChecked] = useState(false);

  const loading = authLoading || roleLoading;

  useEffect(() => {
    // No hacer nada hasta que la carga termine
    if (loading) return;
    
    // Solo verificar acceso una vez
    if (accessChecked) return;
    
    setAccessChecked(true);
    
    if (!user) {
      navigate('/', { replace: true });
    } else if (!isAdmin) {
      console.warn('[Security] Non-admin user attempted to access /admin:', user.id);
      navigate('/me/profile', { replace: true });
    }
  }, [user, isAdmin, loading, accessChecked, navigate]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate('/');
  };

  // Mostrar loader mientras carga O mientras no hemos verificado acceso
  if (loading || !accessChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <Loader2 className="h-8 w-8 animate-spin text-[#3D5AFE]" />
      </div>
    );
  }

  // Doble verificación: si pasó el loader pero no tiene acceso
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
        <Route path="stack" element={<StackManager />} />
        <Route path="tech-stacks" element={<TechStackManager />} />
        <Route path="feedback" element={<FeedbackManager />} />
        <Route path="users" element={<UsersManager />} />
        <Route path="waitlist" element={<WaitlistManager />} />
        <Route path="settings" element={<SettingsManager />} />
        <Route path="notifications" element={<NotificationManager />} />
        <Route path="surveys" element={<SurveyManager />} />
        <Route path="apps" element={<AppsMonitor />} />
        <Route path="menu" element={<MenuManager />} />
        <Route path="plans-features" element={<PlansFeaturesManager />} />
      </Route>
    </Routes>
  );
};

export default Admin;
