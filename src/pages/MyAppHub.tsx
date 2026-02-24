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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter } from '@/components/ui/sheet';
import { Separator } from '@/components/ui/separator';
import { HexColorPicker } from 'react-colorful';
import { FontSelector } from '@/components/me/FontSelector';
import { ColorPicker } from '@/components/me/ColorPicker';
import { Loader2, ArrowLeft, ExternalLink, Info, Map, MessageSquare, Users, Paintbrush, Eye, Settings, User, Lock, Crown, Check, Upload, FlaskConical, X, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VerificationBadge } from '@/components/me/VerificationBadge';
import { DomainSettingsInput } from '@/components/me/DomainSettingsInput';
import { VerifyDomainModal } from '@/components/me/VerifyDomainModal';
import { getStatusColors } from '@/lib/appStatusColors';
import { toast } from 'sonner';
import { useSubscription } from '@/hooks/useSubscription';
import { ProBadge } from '@/components/ui/ProBadge';

import { AppEditor } from '@/components/me/AppEditor';
import RoadmapEditor from '@/pages/RoadmapEditor';
import { BetaManagement } from '@/components/beta/BetaManagement';
import { UnifiedFeedbackList } from '@/components/beta/UnifiedFeedbackList';
import { BannersTab } from '@/components/banners/BannersTab';

type TabId = 'info' | 'roadmap' | 'feedback' | 'squad' | 'banners';

export default function MyAppHub() {
  const { appId, bannerId } = useParams<{ appId: string, bannerId: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, loading: authLoading } = useAuth();
  const t = useTranslation('apps');
  const tR = useTranslation('roadmap');
  const appsHook = useApps();
  const { apps, loading: appsLoading, updateApp, uploadAppLogo, verifyApp } = appsHook;

  const app = apps.find(a => a.id === appId);
  const roadmap = useRoadmap(appId);
  const { isFounder, isPro } = useSubscription();
  const [ownerUsername, setOwnerUsername] = useState<string | null>(null);
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);

  // Settings form for the sheet
  const [settingsAuthMode, setSettingsAuthMode] = useState<'anonymous' | 'authenticated'>('anonymous');
  const [settingsIsPublic, setSettingsIsPublic] = useState(true);
  const [settingsIsFeedbackPublic, setSettingsIsFeedbackPublic] = useState(false);
  const [settingsCustomDomain, setSettingsCustomDomain] = useState<string | null>(null);
  const [settingsCustomTitle, setSettingsCustomTitle] = useState<string | null>(null);

  const [faviconUploading, setFaviconUploading] = useState(false);
  const [showBrandingSheet, setShowBrandingSheet] = useState(false);
  const [brandingForm, setBrandingForm] = useState({
    default_language: 'es',
    font_family: '',
    favicon_url: '',
    primary_color: '#3D5AFE',
    primary_button_color: '#3D5AFE',
    primary_button_text_color: '#FFFFFF',
  });

  // Sync settings sheet form when opening
  useEffect(() => {
    if (showSettingsDialog && roadmap.settings) {
      setSettingsAuthMode(roadmap.settings.feedback_auth_mode || 'anonymous');
      setSettingsIsPublic(roadmap.settings.is_public);
      setSettingsIsFeedbackPublic(roadmap.settings.is_feedback_public);
      setSettingsCustomDomain(roadmap.settings.custom_domain);
      setSettingsCustomTitle(roadmap.settings.custom_title);
    }
  }, [showSettingsDialog, roadmap.settings]);

  // Sync branding form when roadmap settings change
  useEffect(() => {
    if (roadmap.settings) {
      setBrandingForm({
        default_language: roadmap.settings?.default_language || 'es',
        font_family: roadmap.settings?.font_family || '',
        favicon_url: roadmap.settings?.favicon_url || '',
        primary_color: roadmap.settings?.primary_color || '#3D5AFE',
        primary_button_color: roadmap.settings?.primary_button_color || roadmap.settings?.primary_color || '#3D5AFE',
        primary_button_text_color: roadmap.settings?.primary_button_text_color || '#FFFFFF',
      });
    }
  }, [roadmap.settings]);

  // Fetch owner username for public URL
  useEffect(() => {
    if (!app?.user_id) return;
    (async () => {
      const { data } = await supabase.from('profiles').select('username').eq('id', app.user_id).maybeSingle();
      if (data?.username) setOwnerUsername(data.username);
    })();
  }, [app?.user_id]);

  const appSlug = (app?.name || 'app').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const getBaseUrl = () => {
    const isProd = window.location.hostname.endsWith('vibecoders.la');
    if (isProd) return `https://${appSlug}.vibecoders.la`;
    
    // Use ownerUsername or a generic but non-placeholder fallback
    const handle = ownerUsername || 'username';
    return `/@${handle}/${appSlug}`;
  };

  const publicBasePath = getBaseUrl();
  const publicRoadmapPath = `${publicBasePath}/roadmap`;
  const publicFeedbackPath = `${publicBasePath}/feedback`;

  const activeTab: TabId = useMemo(() => {
    if (location.pathname.includes('/banners')) return 'banners';
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
    { id: 'squad', label: "Open for Testing", icon: FlaskConical, path: `/apps/${appId}/squad` },
    { id: 'banners', label: "Banners", icon: Paintbrush, path: `/apps/${appId}/banners` },
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
        custom_domain: settingsCustomDomain,
        custom_title: settingsCustomTitle,
      });
      setShowSettingsDialog(false);
      toast.success('Settings saved');
    } catch { toast.error('Error saving settings'); }
  };

  const handleSaveBranding = async () => {
    try {
      await roadmap.updateSettings(brandingForm);
      setShowBrandingSheet(false);
      toast.success('Branding saved');
    } catch { toast.error('Error saving branding'); }
  };

  const handleFaviconUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !appId) return;
    const allowedTypes = ['image/png', 'image/svg+xml', 'image/webp', 'image/x-icon', 'image/vnd.microsoft.icon'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Only .ico, .png, .svg, .webp files');
      return;
    }
    setFaviconUploading(true);
    try {
      const ext = file.name.split('.').pop();
      const path = `favicons/${appId}-${Date.now()}.${ext}`;
      const { error: upErr } = await supabase.storage.from('roadmap-attachments').upload(path, file, { upsert: true });
      if (upErr) throw upErr;
      const { data: urlData } = supabase.storage.from('roadmap-attachments').getPublicUrl(path);
      setBrandingForm(prev => ({ ...prev, favicon_url: urlData.publicUrl }));
      toast.success('Favicon uploaded');
    } catch { toast.error('Error uploading favicon'); }
    finally { setFaviconUploading(false); }
  };

  const { statuses } = useStatuses();
  const status = app ? statuses.find(s => s.id === app.status_id) : undefined;
  const { setHeaderContent } = usePageHeader();

  // Set header content with app detail and secondary navigation
  useEffect(() => {
    if (!app) {
      setHeaderContent(null);
      return;
    }
    const colors = getStatusColors(status?.slug);
    
    // Header Info Bar
    const headerElement = (
      <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
        <Button variant="ghost" size="icon" onClick={() => navigate('/apps')} className="text-muted-foreground hover:text-foreground shrink-0 h-8 w-8 -ml-1">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        {app.logo_url ? (
          <img src={app.logo_url} alt={app.name || ''} className="w-7 h-7 rounded-lg object-cover shrink-0" />
        ) : (
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-xs font-bold shrink-0">
            {(app.name || 'A').charAt(0)}
          </div>
        )}
        <span className="text-sm font-bold text-foreground truncate max-w-[120px] xs:max-w-[180px] sm:max-w-none">{app.name || app.url}</span>
        {status && (
          <span className={cn('hidden xs:inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-tight border shrink-0', colors.bg, colors.text, colors.border)}>
            <span className={cn('w-1.5 h-1.5 rounded-full', colors.dot)} />
            {status.name}
          </span>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
          {(activeTab === 'roadmap' || activeTab === 'feedback') && (
            <>
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 w-8 sm:w-auto sm:px-3 text-xs text-muted-foreground hover:text-foreground px-0"
                onClick={() => setShowBrandingSheet(true)}
                title="Branding"
              >
                <Paintbrush className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline-flex lg:inline">Branding</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 h-8 w-8 sm:w-auto sm:px-3 text-xs text-muted-foreground hover:text-foreground px-0"
                onClick={() => setShowSettingsDialog(true)}
                title={tR.t('editor.settings')}
              >
                <Settings className="w-4 h-4 sm:w-3.5 sm:h-3.5" />
                <span className="hidden sm:inline-flex lg:inline">{tR.t('editor.settings')}</span>
              </Button>
              <Separator orientation="vertical" className="h-4 mx-0.5 sm:mx-1 opacity-50" />
            </>
          )}
        </div>
      </div>
    );

    const secondaryNav = (
      <div className="flex items-center w-full gap-2 px-1 sm:px-0">
        <div className="flex gap-1 p-1 bg-muted/30 rounded-xl w-full sm:w-auto overflow-hidden">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button 
                key={tab.id} 
                onClick={() => navigate(tab.path)} 
                className={cn(
                  'flex items-center justify-center gap-2 px-2 sm:px-4 py-2 rounded-lg text-xs transition-all duration-200 flex-1 sm:flex-none min-w-0',
                  isActive ? 'bg-background text-foreground shadow-sm font-bold' : 'text-muted-foreground/80 hover:text-foreground hover:bg-background/20'
                )}
              >
                <Icon className={cn("h-4 w-4 sm:h-3.5 sm:w-3.5 shrink-0", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("hidden sm:inline-flex", isActive && "font-bold")}>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    );

    setHeaderContent(headerElement, secondaryNav);
    return () => setHeaderContent(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [app?.id, app?.name, app?.logo_url, app?.url, app?.is_verified, app?.status_id, status?.slug, status?.name, activeTab]);

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

  // Shared toolbar to accommodate bug reporting button and others
  const renderToolbar = () => {
    if (!roadmap.settings) return null;
    if (activeTab !== 'roadmap' && activeTab !== 'feedback') return null;

    return null; // All buttons moved to header or locally managed
  };

  return (
    <div className={cn(
      "flex-1 mx-auto transition-all duration-300",
      activeTab === 'banners' 
        ? "max-w-full p-0" 
        : cn("container px-3 sm:px-4 py-2 sm:py-4", activeTab === 'roadmap' ? "max-w-full" : "max-w-5xl"),
      (activeTab === 'info' || activeTab === 'feedback') && "bg-[#f0f0f0] dark:bg-muted/5 rounded-2xl"
    )}>

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
         {activeTab === 'banners' && <BannersTab appId={appId!} appName={app?.name} appUrl={app?.url} bannerId={bannerId} />}
      </div>

      {/* Settings Sheet */}
      <Sheet open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-[400px] h-full flex flex-col p-0 gap-0 [&_button.absolute]:!hidden">
          <SheetHeader className="p-6 pb-4 shrink-0 border-b bg-background z-10 flex flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2">
              <Settings className="w-4 h-4" />
              {tR.t('editor.settings')}
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full hover:bg-muted shrink-0 text-muted-foreground hover:text-foreground" 
              onClick={() => setShowSettingsDialog(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>

          <div className="flex-1 overflow-y-auto min-h-0">
            <div className="p-6 space-y-8">
              {/* Visibility Section */}
              <div className="space-y-3">
                <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
                  {tR.t('editor.visibility') || 'Visibility'}
                </Label>
                <div className="space-y-3">
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold">{tR.t('editor.roadmapPublic') || 'Public Roadmap'}</span>
                        <p className="text-xs text-muted-foreground/80">{tR.t('editor.publicOnHint')}</p>
                      </div>
                      <Switch
                        checked={settingsIsPublic}
                        onCheckedChange={setSettingsIsPublic}
                      />
                    </div>
                    {settingsIsPublic && (
                      <div className="pt-2 border-t border-border/40 space-y-2">
                        {publicRoadmapPath && (
                          <a href={publicRoadmapPath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                            <ExternalLink className="w-3 h-3" />
                            {tR.t('editor.viewPublicRoadmap') || 'Ver Roadmap Público'}
                          </a>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <span className="text-sm font-semibold">{tR.t('editor.feedbackPublicLabel') || 'Public Feedback'}</span>
                        <p className="text-xs text-muted-foreground/80">{tR.t('editor.feedbackPublicOnHint')}</p>
                      </div>
                      <Switch
                        checked={settingsIsFeedbackPublic}
                        onCheckedChange={setSettingsIsFeedbackPublic}
                      />
                    </div>
                    {settingsIsFeedbackPublic && (
                      <div className="pt-2 border-t border-border/40 space-y-2">
                        {publicFeedbackPath && (
                          <a href={publicFeedbackPath} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-xs text-primary font-medium hover:underline">
                            <ExternalLink className="w-3 h-3" />
                            {tR.t('editor.viewPublicFeedback') || 'Ver Feedback Público'}
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* General Settings Section */}
              <div className="space-y-4 pt-2">
                <div className="flex items-center gap-2">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
                    {tR.t('editor.customDomain') || 'Dominio Personalizado'}
                  </Label>
                  {(isFounder || isPro) ? (
                    <ProBadge />
                  ) : (
                    <div className="flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/20">
                      <Crown className="w-2.5 h-2.5 text-amber-600" />
                      <span className="text-[8px] font-bold text-amber-700 uppercase">Pro</span>
                    </div>
                  )}
                </div>
                
                <DomainSettingsInput 
                  appId={appId || ''}
                  appName={app?.name || ''}
                  initialDomain={settingsCustomDomain}
                  baseDomain={app?.url ? app.url.replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '') : (window.location.hostname.endsWith('vibecoders.la') ? 'vibecoders.la' : undefined)}
                  onDomainChange={async (d) => {
                    setSettingsCustomDomain(d);
                    try {
                      await roadmap.updateSettings({ custom_domain: d });
                      console.log('[MyAppHub] Domain auto-saved:', d);
                    } catch (err) {
                      console.error('[MyAppHub] Error auto-saving domain:', err);
                      toast.error('Error saving domain to database');
                    }
                  }}
                  onRefetch={roadmap.refetch}
                  disabled={!settingsIsPublic && !settingsIsFeedbackPublic}
                />
              </div>

              {/* Participation Mode - only if feedback public */}
              {settingsIsFeedbackPublic && (
                <div className="space-y-4 pt-2 animate-in fade-in slide-in-from-top-2 duration-300">
                  <Label className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/70">
                    {tR.t('editor.participationMode')}
                  </Label>
                  <div className="grid grid-cols-1 gap-3">
                    <button
                      onClick={() => setSettingsAuthMode('anonymous')}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all group",
                        settingsAuthMode === 'anonymous' ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30 bg-muted/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", settingsAuthMode === 'anonymous' ? "border-primary bg-primary" : "border-muted-foreground/40")}>
                          {settingsAuthMode === 'anonymous' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <User className={cn("w-4 h-4", settingsAuthMode === 'anonymous' ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-sm font-bold">{tR.t('editor.anonymous')}</span>
                          </div>
                          <p className="text-xs text-muted-foreground/80 mt-1">{tR.t('editor.anonymousDesc')}</p>
                        </div>
                      </div>
                    </button>
                    <button
                      onClick={() => setSettingsAuthMode('authenticated')}
                      className={cn(
                        "w-full text-left p-4 rounded-xl border-2 transition-all group",
                        settingsAuthMode === 'authenticated' ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/30 bg-muted/10"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <div className={cn("w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors", settingsAuthMode === 'authenticated' ? "border-primary bg-primary" : "border-muted-foreground/40")}>
                          {settingsAuthMode === 'authenticated' && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Lock className={cn("w-4 h-4", settingsAuthMode === 'authenticated' ? "text-primary" : "text-muted-foreground")} />
                            <span className="text-sm font-bold">{tR.t('editor.authenticated')}</span>
                          </div>
                          <p className="text-xs text-muted-foreground/80 mt-1">{tR.t('editor.authenticatedDesc')}</p>
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          <SheetFooter className="p-6 pt-4 border-t bg-background shrink-0">
            <div className="flex gap-3 w-full">
              <Button variant="ghost" className="flex-1 font-semibold text-muted-foreground hover:text-foreground" onClick={() => setShowSettingsDialog(false)}>
                {tR.t('editor.cancel')}
              </Button>
              <Button className="flex-1 font-bold shadow-lg shadow-primary/20" onClick={handleSaveSettings}>
                {tR.t('editor.save')}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Branding Sheet */}
      <Sheet open={showBrandingSheet} onOpenChange={setShowBrandingSheet}>
        <SheetContent side="right" className="w-full sm:w-[400px] sm:max-w-[400px] flex flex-col p-0 [&_button.absolute]:!hidden">
          <SheetHeader className="p-6 pb-4 shrink-0 bg-background z-10 flex flex-row items-center justify-between border-b mb-0">
            <SheetTitle className="flex items-center gap-2">
              <Paintbrush className="w-4 h-4" />
              {tR.t('editor.branding')}
            </SheetTitle>
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-9 w-9 rounded-full hover:bg-muted shrink-0 text-muted-foreground hover:text-foreground" 
              onClick={() => setShowBrandingSheet(false)}
            >
              <X className="h-5 w-5" />
            </Button>
          </SheetHeader>
          <div className="px-6 py-6 space-y-6 flex-1 overflow-y-auto">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">{tR.t('editor.defaultLanguage')}</Label>
                <Select value={brandingForm.default_language} onValueChange={v => setBrandingForm(prev => ({ ...prev, default_language: v }))}>
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="pt">Português</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">{tR.t('editor.fontFamily')}</Label>
                <FontSelector value={brandingForm.font_family} onChange={v => setBrandingForm(prev => ({ ...prev, font_family: v }))} />
              </div>
              <div className="space-y-2">
                <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">Favicon</Label>
                <div className="flex items-center gap-3">
                  {brandingForm.favicon_url && (
                    <img src={brandingForm.favicon_url} alt="Favicon" className="w-8 h-8 rounded object-contain border" />
                  )}
                  <label className="flex items-center gap-2 px-3 py-2 border border-dashed rounded-md cursor-pointer hover:border-primary transition-colors text-sm text-muted-foreground">
                    {faviconUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {faviconUploading ? 'Uploading...' : 'Upload favicon'}
                    <input type="file" className="hidden" accept=".ico,.png,.svg,.webp" onChange={handleFaviconUpload} disabled={faviconUploading} />
                  </label>
                </div>
              </div>

              <div className="pt-2">
                <div className="p-4 rounded-xl bg-muted/20 border border-border/50">
                  <div className="flex items-center mb-6">
                    <div 
                      className="px-5 py-2.5 rounded-full text-sm font-medium shadow-sm flex items-center gap-2"
                      style={{ 
                        backgroundColor: brandingForm.primary_button_color,
                        color: brandingForm.primary_button_text_color 
                      }}
                    >
                      <Send className="w-4 h-4" />
                      {tR.t('public.submitFeedback') || 'Enviar Sugerencia'}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Fondo</Label>
                      <ColorPicker 
                        compact 
                        value={brandingForm.primary_button_color} 
                        onChange={v => setBrandingForm(prev => ({ ...prev, primary_button_color: v, primary_color: v }))} 
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Texto</Label>
                      <ColorPicker 
                        compact 
                        value={brandingForm.primary_button_text_color} 
                        onChange={v => setBrandingForm(prev => ({ ...prev, primary_button_text_color: v }))} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <Separator />
            <div className="space-y-3">
              <Label className="text-xs uppercase tracking-wider font-medium text-muted-foreground">{tR.t('editor.columnColors')}</Label>
              <div className="space-y-3">
                {roadmap.lanes.map(lane => (
                  <div key={lane.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 border border-border/50">
                    <span className="text-sm font-medium">{lane.name}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded border shadow-sm" style={{ backgroundColor: lane.color }} />
                      <span className="text-xs font-mono text-muted-foreground">{lane.color}</span>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-muted-foreground italic">
                {tR.t('editor.editColorsInRoadmap') || 'Edita los colores directamente en las columnas del Roadmap.'}
              </p>
            </div>
          </div>

          <SheetFooter className="shrink-0 p-6 bg-background border-t">
            <div className="flex gap-3 w-full">
              <Button variant="ghost" className="flex-1 font-semibold text-muted-foreground" onClick={() => setShowBrandingSheet(false)}>
                {tR.t('editor.cancel')}
              </Button>
              <Button className="flex-1 font-bold shadow-lg" onClick={handleSaveBranding}>
                {tR.t('editor.save')}
              </Button>
            </div>
          </SheetFooter>
        </SheetContent>
      </Sheet>

      {/* Verification Modal */}
      <VerifyDomainModal 
        open={showVerifyModal} 
        onOpenChange={setShowVerifyModal}
        appName={app.name || ''}
        appUrl={app.url}
        verificationToken={app.verification_token}
        onVerify={handleVerify}
        onSuccess={() => setShowVerifyModal(false)}
      />
    </div>
  );
}
