import { useLocation } from 'react-router-dom';
import { useProfileEditor } from '@/hooks/useProfileEditor';
import { useApps } from '@/hooks/useApps';
import { useAuth } from '@/hooks/useAuth';
import { MeTabs } from './MeTabs';
import { ProfileTab } from './ProfileTab';
import { AppsTab } from './AppsTab';
import { BrandingTab } from './BrandingTab';
import { ProfilePreview } from './ProfilePreview';
import { MeHeader } from './MeHeader';
import { Loader2 } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function MeLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const profileEditor = useProfileEditor();
  const appsHook = useApps();
  const isMobile = useIsMobile();

  const { profile, loading, isSaving, lastSaved, error } = profileEditor;

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname === '/me/apps') return 'apps';
    if (location.pathname === '/me/branding') return 'branding';
    return 'profile';
  };
  
  const activeTab = getActiveTab();

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <MeHeader 
        profile={profile}
        isSaving={isSaving}
        lastSaved={lastSaved}
        error={error}
        onSignOut={signOut}
      />

      <div className="container px-4 py-6">
        <div className={`flex gap-6 ${isMobile ? 'flex-col' : ''}`}>
          {/* Main content */}
          <div className={isMobile ? 'w-full' : 'w-[60%]'}>
            <MeTabs />
            
            <div className="mt-6">
              {activeTab === 'profile' && (
                <ProfileTab 
                  profile={profile} 
                  onUpdate={profileEditor.updateProfile}
                  onUploadAvatar={profileEditor.uploadAvatar}
                />
              )}
              {activeTab === 'apps' && (
                <AppsTab appsHook={appsHook} />
              )}
              {activeTab === 'branding' && (
                <BrandingTab 
                  profile={profile} 
                  onUpdate={profileEditor.updateProfile} 
                />
              )}
            </div>
          </div>

          {/* Preview sidebar - on desktop: sticky sidebar, on mobile: below content */}
          <div className={isMobile ? 'w-full mt-8' : 'w-[40%]'}>
            <div className={isMobile ? '' : 'sticky top-20'}>
              {isMobile && (
                <h3 className="text-sm font-medium text-gray-500 mb-4 uppercase tracking-wide">
                  Vista previa
                </h3>
              )}
              <ProfilePreview profile={profile} apps={appsHook.apps} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
