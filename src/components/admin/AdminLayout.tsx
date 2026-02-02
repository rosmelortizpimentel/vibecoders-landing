import { Outlet } from 'react-router-dom';
import { AdminSidebar } from './AdminSidebar';
import { MeHeader } from '@/components/me/MeHeader';

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
  // Create a minimal ProfileData-like object for MeHeader
  const headerProfile = profile ? {
    id: 'admin', // placeholder, not used by MeHeader display
    name: profile.name,
    username: profile.username,
    avatar_url: profile.avatar_url,
    // These are required by MeHeader but not used for display
    member_number: 0,
    is_pioneer: false,
    show_pioneer_badge: false,
    tagline: null,
    bio: null,
    location: null,
    website: null,
    twitter: null,
    github: null,
    linkedin: null,
    instagram: null,
    youtube: null,
    tiktok: null,
    lovable: null,
    email_public: null,
    font_family: null,
    primary_color: null,
    accent_color: null,
    card_style: null,
    banner_url: null,
    avatar_position: null,
    banner_position: null,
  } : null;

  return (
    <div className="min-h-screen bg-white">
      <MeHeader
        profile={headerProfile}
        isSaving={false}
        lastSaved={null}
        error={null}
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
