import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { AuthenticatedHeader } from '@/components/AuthenticatedHeader';

interface AdminProfile {
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface AdminLayoutProps {
  profile: AdminProfile | null;
  onSignOut: () => void;
}

export function AdminLayout({ profile, onSignOut }: AdminLayoutProps) {
  return (
    <div className="min-h-screen bg-white">
      <AuthenticatedHeader
        profile={profile}
        onSignOut={onSignOut}
      />
      <div className="flex">
        <AdminSidebar />
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
