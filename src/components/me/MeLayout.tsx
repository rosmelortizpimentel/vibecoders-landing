import { useState } from 'react';
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
import { Loader2, Eye, X, Smartphone } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export function MeLayout() {
  const location = useLocation();
  const { user, signOut } = useAuth();
  const profileEditor = useProfileEditor();
  const appsHook = useApps();
  const isMobile = useIsMobile();
  const [previewOpen, setPreviewOpen] = useState(false);

  const { profile, loading, isSaving, lastSaved, error } = profileEditor;

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname === '/me/apps') return 'apps';
    if (location.pathname === '/me/branding') return 'branding';
    return 'profile';
  };
  
  const activeTab = getActiveTab();

  return (
    <div className="min-h-screen bg-white">
      {/* Header - always rendered to avoid flash */}
      <MeHeader 
        profile={profile}
        isSaving={isSaving}
        lastSaved={lastSaved}
        error={error}
        onSignOut={signOut}
      />

      {loading ? (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-background">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="container px-3 sm:px-4 py-4 sm:py-6">
          <div className="flex gap-4 sm:gap-6">
            {/* Main content */}
            <div className={isMobile ? 'w-full' : 'w-[60%]'}>
              <MeTabs />
              
              <div className={`mt-4 sm:mt-6 ${isMobile ? 'pb-20' : ''}`}>
                {activeTab === 'profile' && (
                  <ProfileTab 
                    profile={profile} 
                    onUpdate={profileEditor.updateProfile}
                    onUploadAvatar={profileEditor.uploadAvatar}
                    onUploadBanner={profileEditor.uploadBanner}
                    onDeleteBanner={profileEditor.deleteBanner}
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

            {/* Preview sidebar - only on desktop */}
            {!isMobile && (
              <div className="w-[40%]">
                <div className="sticky top-20">
                  <ProfilePreview profile={profile} apps={appsHook.apps} />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Mobile: Fixed footer preview button + Sheet */}
      {isMobile && (
        <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
          <SheetTrigger asChild>
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 px-4 py-3">
              <Button
                size="lg"
                className="w-full bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white"
              >
                <Eye className="h-5 w-5 mr-2" />
                Vista Previa
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-full max-h-[100dvh] overflow-y-auto p-0 [&>button]:hidden rounded-none">
            {/* Header banner */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white border-b border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-[#3D5AFE]" />
                <span className="font-medium text-[#1c1c1c]">Vista Previa</span>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors"
              >
                <X className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            <SheetHeader className="sr-only">
              <SheetTitle>Vista previa del perfil</SheetTitle>
            </SheetHeader>
            <ProfilePreview profile={profile} apps={appsHook.apps} isMobileSheet />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
