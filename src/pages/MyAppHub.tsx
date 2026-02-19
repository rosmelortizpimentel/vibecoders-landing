import { useState, useEffect, useMemo, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApps } from '@/hooks/useApps';
import { useTranslation } from '@/hooks/useTranslation';
import { useStatuses } from '@/hooks/useStatuses';
import { useRoadmap } from '@/hooks/useRoadmap';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { Loader2, ArrowLeft, ExternalLink, Info, Map, MessageSquare, Users, Paintbrush, Eye, Settings, User, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VerificationBadge } from '@/components/me/VerificationBadge';
import { getStatusColors } from '@/lib/appStatusColors';
import { toast } from 'sonner';

import { AppEditor } from '@/components/me/AppEditor';
import RoadmapEditor from '@/pages/RoadmapEditor';
import { BetaManagement } from '@/components/beta/BetaManagement';
import { UnifiedFeedbackList } from '@/components/beta/UnifiedFeedbackList';

type TabId = 'info' | 'roadmap' | 'feedback' | 'squad';

export default function MyAppHub() {
  const { appId } = useParams<{ appId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslation('apps');
  const tR = useTranslation('roadmap');
  const appsHook = useApps();
  const { apps, loading: appsLoading, updateApp, uploadAppLogo, verifyApp } = appsHook;

  const app = apps.find(a => a.id === appId);
  const roadmap = useRoadmap(appId);
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  // Settings form for the sheet
  const [settingsAuthMode, setSettingsAuthMode] = useState<'anonymous' | 'authenticated'>('anonymous');
  const [settingsIsPublic, setSettingsIsPublic] = useState(true);
  const [settingsIsFeedbackPublic, setSettingsIsFeedbackPublic] = useState(false);

  // Sync settings sheet form when opening
  useEffect(() => {
    if (showSettingsDialog && roadmap.settings) {
      setSettingsAuthMode((roadmap.settings as any).feedback_auth_mode || 'anonymous');
      setSettingsIsPublic(roadmap.settings.is_public);
      setSettingsIsFeedbackPublic(roadmap.settings.is_feedback_public);
    }
  }, [showSettingsDialog, roadmap.settings]);

  // Fetch owner username for public URL
  useEffect(() => {
    if (!app?.user_id) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('username').eq('id', app.user_id).maybeSingle();
      if (data?.username) setOwnerUsername(data.username);
    })();
  }, [app?.user_id]);

  const appSlug = (app?.name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const isProduction = window.location.hostname.endsWith('vibecoders.la');
  const publicBasePath = isProduction
    ? `https://${appSlug}.vibecoders.la`
    : (ownerUsername ? `/@${ownerUsername}/${appSlug}` : null);
  const publicRoadmapPath = roadmap.settings?.is_public && publicBasePath ? `${publicBasePath}/roadmap` : null;
  const publicFeedbackPath = roadmap.settings?.is_feedback_public && publicBasePath ? `${publicBasePath}/feedback` : null;

  const activeTab: TabId = useMemo(() => {
    if (location.pathname.endsWith('/roadmap')) return 'roadmap';
    if (location.pathname.endsWith('/feedback')) return 'feedback';
    if (location.pathname.endsWith('/squad')) return 'squad';
    return 'info';
  }, [location.pathname]);

  // Auto-collapse sidebar when entering roadmap, restore on leave
  const prevTabRef = useRef<TabId>(activeTab);

  useEffect(() => {
    const prev = prevTabRef.current;
    prevTabRef.current = activeTab;

    if (activeTab === 'roadmap' && prev !== 'roadmap') {
      localStorage.setItem('sidebarCollapsed', 'true');
      window.dispatchEvent(new CustomEvent('sidebar-collapse', { detail: { isCollapsed: true, external: true } }));
    }
  }, [activeTab]);

  const tabs: { id: TabId; label: string; icon: typeof Info; path: string }[] = [
    { id: 'info', label: t.t('hub.info'), icon: Info, path: `/apps/${appId}` },
    { id: 'roadmap', label: t.t('hub.roadmap'), icon: Map, path: `/apps/${appId}/roadmap` },
    { id: 'feedback', label: t.t('hub.feedback'), icon: MessageSquare, path: `/apps/${appId}/feedback` },
    { id: 'squad', label: t.t('hub.squad'), icon: Users, path: `/apps/${appId}/squad` },
  ];

  const [betaConfig, setBetaConfig] = useState({
    beta_active: false,
    beta_mode: 'open',
    beta_limit: 10,
    beta_link: null as string | null,
    beta_instructions: null as string | null,
  });

  useEffect(() => {
    if (app) {
      setBetaConfig({
        beta_active: app.beta_active,
        beta_mode: app.beta_mode,
        beta_limit: app.beta_limit,
        beta_link: app.beta_link,
        beta_instructions: app.beta_instructions,
      });
    }
  }, [app]);

  const handleBetaConfigChange = async (updates: Partial<typeof betaConfig>) => {
    if (!appId) return;
    setBetaConfig(prev => ({ ...prev, ...updates }));
    await updateApp(appId, updates);
  };

  const handleVerify = async () => {
    if (!appId) return { success: false, error: 'No app ID' };
    return await verifyApp(appId);
  };

  const handleSaveSettings = async () => {
    try {
      await roadmap.updateSettings({
        feedback_auth_mode: settingsAuthMode,
        is_public: settingsIsPublic,
        is_feedback_public: settingsIsFeedbackPublic,
      } as any);
      setShowSettingsDialog(false);
      toast.success('Settings saved');
    } catch { toast.error('Error saving settings'); }
  };

  const { statuses } = useStatuses();
  const status = app ? statuses.find(s => s.id === app.status_id) : undefined;
  const { setHeaderContent } = usePageHeader();

  // Set header content with app detail
  useEffect(() => {
    if (!app) {
      setHeaderContent(null);
      return;
    }
    const colors = getStatusColors(status?.slug);
    setHeaderContent(
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Button variant="ghost" size="icon" onClick={() => navigate('/apps')} className="text-muted-foreground hover:text-foreground shrink-0 h-7 w-7">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        {app.logo_url ? (
          <img src={app.logo_url} alt={app.name || ''} className="w-7 h-7 rounded-lg object-cover border shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">
            {(app.name || 'A').charAt(0)}
          </div>
        )}
        <span className="text-sm sm:text-base font-bold text-foreground truncate">{app.name || app.url}</span>
        {status && (
          <span className={cn('hidden sm:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-tight border shrink-0', colors.bg, colors.text, colors.border)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
            {status.name}
          </span>
        )}
        <span className="hidden sm:inline-flex shrink-0">
          <VerificationBadge isVerified={app.is_verified} />
        </span>
        <div className="flex-1" />
        <a href={app.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
          <Button variant="outline" size="sm" className="gap-1.5 h-7 text-xs">
            <ExternalLink className="w-3 h-3" />
            <span className="hidden sm:inline">{t.t('hub.viewPage')}</span>
          </Button>
        </a>
      </div>
    );
    return () => setHeaderContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id, app?.name, app?.logo_url, app?.url, app?.is_verified, app?.status_id, status?.slug, status?.name]);

  if (authLoading || appsLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">App not found</p>
        <Button variant="ghost" onClick={() => navigate('/apps')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t.t('hub.backToApps')}
        </Button>
      </div>
    );
  }

  // Shared toolbar for roadmap & feedback tabs
  const renderToolbar = () => {
    if (!roadmap.settings) return null;
    const isRoadmapTab = activeTab === 'roadmap';
    const isFeedbackTab = activeTab === 'feedback';
    if (!isRoadmapTab && !isFeedbackTab) return null;

    return (
      <div className="flex items-center justify-end w-full md:max-w-[90%] mx-auto mb-4 px-1 gap-2">
          {isRoadmapTab && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 h-8 text-xs"
              onClick={() => window.dispatchEvent(new CustomEvent('roadmap-open-branding'))}
            >
              <Paintbrush className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Branding</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="gap-1.5 h-8 text-xs"
            onClick={() => setShowSettingsDialog(true)}
          >
            <Settings className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{tR.t('editor.settings')}</span>
          </Button>

          {/* Context-aware preview link */}
          {isRoadmapTab && publicRoadmapPath && (
            <a href={publicRoadmapPath} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground">
                <Map className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Roadmap</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          )}
          {isFeedbackTab && publicFeedbackPath && (
            <a href={publicFeedbackPath} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-1.5 h-8 text-xs text-muted-foreground hover:text-foreground">
                <MessageSquare className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Feedback</span>
                <ExternalLink className="w-3 h-3" />
              </Button>
            </a>
          )}
      </div>
    );
  };

  return (
    <div className={cn(
      "container px-3 sm:px-4 py-4 sm:py-6 flex-1 mx-auto transition-all",
      activeTab === 'roadmap' ? "max-w-full" : "max-w-5xl"
    )}>

      {/* Tabs */}
      <div className="flex items-center w-full md:max-w-[90%] mx-auto gap-2 mb-4">
        <div className="flex overflow-x-auto gap-1 p-1 sm:p-1.5 bg-muted/50 rounded-full scrollbar-hide flex-1">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => navigate(tab.path)} className={cn(
                'flex items-center justify-center gap-2 px-3 sm:px-5 py-2 rounded-full text-sm transition-all duration-200 flex-1 sm:flex-none whitespace-nowrap',
                isActive ? 'bg-background text-foreground shadow-sm font-medium' : 'text-muted-foreground hover:text-foreground'
              )}>
                <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className="hidden min-[420px]:inline">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Unified Toolbar */}
      {renderToolbar()}

      {/* Content */}
      <div>
        {activeTab === 'info' && (
          <AppEditor app={app} onUpdate={updateApp} onUploadLogo={uploadAppLogo} onUploadScreenshot={appsHook.uploadAppScreenshot} onDelete={async () => { await appsHook.deleteApp(app.id); navigate('/apps'); }} onVerify={handleVerify} />
        )}
        {activeTab === 'roadmap' && <RoadmapEditor />}
        {activeTab === 'feedback' && <UnifiedFeedbackList appId={appId!} />}
        {activeTab === 'squad' && <BetaManagement appId={appId!} config={betaConfig} onConfigChange={handleBetaConfigChange} />}
      </div>

      {/* Settings Sheet */}
      <Sheet open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-[400px] overflow-y-auto">
          <SheetHeader className="pb-4">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {tR.t('editor.settings')}
            </SheetTitle>
          </SheetHeader>

          <div className="space-y-6 pb-24">
            {/* Visibility Section */}
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                {tR.t('editor.visibility') || 'Visibility'}
              </Label>
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium">{tR.t('editor.roadmapPublic') || 'Public Roadmap'}</span>
                    <p className="text-xs text-muted-foreground">{tR.t('editor.publicOnHint')}</p>
                  </div>
                  <Switch
                    checked={settingsIsPublic}
                    onCheckedChange={setSettingsIsPublic}
                  />
                </div>
                <div className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                  <div className="space-y-0.5">
                    <span className="text-sm font-medium">{tR.t('editor.feedbackPublicLabel') || 'Public Feedback'}</span>
                    <p className="text-xs text-muted-foreground">{tR.t('editor.feedbackPublicOnHint')}</p>
                  </div>
                  <Switch
                    checked={settingsIsFeedbackPublic}
                    onCheckedChange={setSettingsIsFeedbackPublic}
                  />
                </div>
              </div>
            </div>

            {/* Participation Mode - only if feedback public */}
            {settingsIsFeedbackPublic && (
              <>
                <Separator />
                <div className="space-y-3">
                  <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">
                    {tR.t('editor.participationMode')}
                  </Label>
                  <div className="space-y-2">
                    <button
                      onClick={() => setSettingsAuthMode('anonymous')}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border-2 transition-all",
                        settingsAuthMode === 'anonymous' ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", settingsAuthMode === 'anonymous' ? "border-primary" : "border-muted-foreground/40")}>
                          {settingsAuthMode === 'anonymous' && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <User className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tR.t('editor.anonymous')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">{tR.t('editor.anonymousDesc')}</p>
                    </button>
                    <button
                      onClick={() => setSettingsAuthMode('authenticated')}
                      className={cn(
                        "w-full text-left p-3 rounded-lg border-2 transition-all",
                        settingsAuthMode === 'authenticated' ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <div className={cn("w-4 h-4 rounded-full border-2 flex items-center justify-center", settingsAuthMode === 'authenticated' ? "border-primary" : "border-muted-foreground/40")}>
                          {settingsAuthMode === 'authenticated' && <div className="w-2 h-2 rounded-full bg-primary" />}
                        </div>
                        <Lock className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">{tR.t('editor.authenticated')}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 ml-6">{tR.t('editor.authenticatedDesc')}</p>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          <SheetFooter className="absolute bottom-0 left-0 right-0 p-4 bg-background border-t">
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1" onClick={() => setShowSettingsDialog(false)}>{tR.t('editor.cancel')}</Button>
              <Button className="flex-1" onClick={handleSaveSettings}>{tR.t('editor.save')}</Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
