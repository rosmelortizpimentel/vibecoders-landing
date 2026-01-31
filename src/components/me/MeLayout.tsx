import { useLocation } from 'react-router-dom';
import { useProfileEditor } from '@/hooks/useProfileEditor';
import { useApps } from '@/hooks/useApps';
import { MeTabs } from './MeTabs';
import { ProfileTab } from './ProfileTab';
import { AppsTab } from './AppsTab';
import { BrandingTab } from './BrandingTab';
import { ProfilePreview } from './ProfilePreview';
import { Loader2, Check, AlertCircle } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';

export function MeLayout() {
  const location = useLocation();
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
      {/* Header with save status */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="container flex h-14 items-center justify-between px-4">
          <a href="/" className="text-lg font-semibold text-[#1c1c1c] hover:text-[#3D5AFE] transition-colors">
            vibecoders
          </a>
          
          <div className="flex items-center gap-3">
            {/* Save status indicator */}
            <div className="flex items-center gap-2 text-sm">
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                  <span className="text-gray-500">Guardando...</span>
                </>
              ) : error ? (
                <>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                  <span className="text-red-500">Error</span>
                </>
              ) : lastSaved ? (
                <>
                  <Check className="h-4 w-4 text-green-500" />
                  <span className="text-gray-500 hidden sm:inline">Guardado</span>
                </>
              ) : null}
            </div>

            {/* Username badge */}
            {profile?.username && (
              <a 
                href={`/@${profile.username}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-[#3D5AFE] hover:underline"
              >
                @{profile.username}
              </a>
            )}
          </div>
        </div>
      </header>

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
