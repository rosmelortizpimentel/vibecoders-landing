import { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useProfileEditor } from '@/hooks/useProfileEditor';
import { useApps } from '@/hooks/useApps';
import { useTranslation } from '@/hooks/useTranslation';
import { MeTabs } from '@/components/me/MeTabs';
import { ProfileTab } from '@/components/me/ProfileTab';
import { AppsTab } from '@/components/me/AppsTab';
import { BrandingTab } from '@/components/me/BrandingTab';
import { BetaTab } from '@/components/me/BetaTab';
import { ProfilePreview } from '@/components/me/ProfilePreview';
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

const Me = () => {
  const location = useLocation();
  const profileEditor = useProfileEditor();
  const appsHook = useApps();
  const isMobile = useIsMobile();
  const t = useTranslation('profile');
  const [previewOpen, setPreviewOpen] = useState(false);

  const { profile, loading } = profileEditor;

  // Determine active tab from URL
  const getActiveTab = () => {
    if (location.pathname === '/me/apps') return 'apps';
    if (location.pathname === '/me/branding') return 'branding';
    if (location.pathname === '/me/beta') return 'beta';
    return 'profile';
  };
  
  const activeTab = getActiveTab();

  if (loading) {
    return (
      <main className="flex-1 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </main>
    );
  }

  // Beta tab has full-width layout (no preview)
  const showPreview = !isMobile && activeTab !== 'beta';
  const showMobilePreview = isMobile && activeTab !== 'beta';

  return (
    <>
      <div className="container px-3 sm:px-4 py-4 sm:py-6 flex-1">
        <div className="flex gap-4 sm:gap-6">
          {/* Main content */}
          <div className={showPreview ? 'w-[60%]' : 'w-full'}>
            <MeTabs />
            
            <div className={`mt-4 sm:mt-6 ${showMobilePreview ? 'pb-20' : ''}`}>
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
                  onUploadOgImage={profileEditor.uploadOgImage}
                  onDeleteOgImage={profileEditor.deleteOgImage}
                />
              )}
              {activeTab === 'beta' && (
                <BetaTab appsHook={appsHook} />
              )}
            </div>
          </div>

          {/* Preview sidebar - only on desktop and NOT on beta tab */}
          {showPreview && (
            <div className="w-[40%]">
              <div className="sticky top-20">
                <ProfilePreview profile={profile} apps={appsHook.apps} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile: Fixed footer preview button + Sheet (hidden on beta tab) */}
      {showMobilePreview && (
        <Sheet open={previewOpen} onOpenChange={setPreviewOpen}>
          <SheetTrigger asChild>
            <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border px-4 py-3">
              <Button
                size="lg"
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Eye className="h-5 w-5 mr-2" />
                {t.preview}
              </Button>
            </div>
          </SheetTrigger>
          <SheetContent side="bottom" className="h-full max-h-[100dvh] overflow-y-auto p-0 [&>button]:hidden rounded-none">
            {/* Header banner */}
            <div className="sticky top-0 z-10 flex items-center justify-between bg-background border-b border-border px-4 py-3">
              <div className="flex items-center gap-2">
                <Smartphone className="h-5 w-5 text-primary" />
                <span className="font-medium text-foreground">{t.preview}</span>
              </div>
              <button
                onClick={() => setPreviewOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted transition-colors"
              >
                <X className="h-5 w-5 text-muted-foreground" />
              </button>
            </div>
            <SheetHeader className="sr-only">
              <SheetTitle>{t.preview}</SheetTitle>
            </SheetHeader>
            <ProfilePreview profile={profile} apps={appsHook.apps} isMobileSheet />
          </SheetContent>
        </Sheet>
      )}
    </>
  );
};

export default Me;
