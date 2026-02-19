import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApps } from '@/hooks/useApps';
import { useTranslation } from '@/hooks/useTranslation';
import { useStatuses } from '@/hooks/useStatuses';
import { useRoadmap } from '@/hooks/useRoadmap';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Loader2, ArrowLeft, ExternalLink, Info, Map, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VerificationBadge } from '@/components/me/VerificationBadge';
import { getStatusColors } from '@/lib/appStatusColors';

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
  const appsHook = useApps();
  const { apps, loading: appsLoading, updateApp, uploadAppLogo, verifyApp } = appsHook;

  const app = apps.find(a => a.id === appId);
  const roadmap = useRoadmap(appId);

  const activeTab: TabId = useMemo(() => {
    if (location.pathname.endsWith('/roadmap')) return 'roadmap';
    if (location.pathname.endsWith('/feedback')) return 'feedback';
    if (location.pathname.endsWith('/squad')) return 'squad';
    return 'info';
  }, [location.pathname]);

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

  const { statuses } = useStatuses();
  const status = app ? statuses.find(s => s.id === app.status_id) : undefined;
  const statusColors = getStatusColors(status?.slug);
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

  return (
    <div className="container px-3 sm:px-4 py-4 sm:py-6 flex-1 max-w-4xl mx-auto">

      {/* Tabs */}
      <div className="flex items-center w-full max-w-[90%] mx-auto gap-2 mb-6">
        <div className="flex overflow-x-auto gap-1 p-1.5 bg-muted/50 rounded-full scrollbar-hide flex-1">
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
        {activeTab === 'roadmap' && roadmap.settings && (
          <div className="flex items-center gap-1.5 shrink-0">
            <Switch
              checked={roadmap.settings.is_public}
              onCheckedChange={async (v) => {
                try { await roadmap.updateSettings({ is_public: v }); } catch {}
              }}
              className="h-5 w-9 [&>span]:h-4 [&>span]:w-4"
            />
            <span className={cn("text-xs font-medium hidden sm:inline", roadmap.settings.is_public ? "text-primary" : "text-muted-foreground")}>
              {roadmap.settings.is_public ? 'Público' : 'Privado'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div>
        {activeTab === 'info' && (
          <AppEditor app={app} onUpdate={updateApp} onUploadLogo={uploadAppLogo} onUploadScreenshot={appsHook.uploadAppScreenshot} onDelete={async () => { await appsHook.deleteApp(app.id); navigate('/apps'); }} onVerify={handleVerify} />
        )}
        {activeTab === 'roadmap' && <RoadmapEditor />}
        {activeTab === 'feedback' && <UnifiedFeedbackList appId={appId!} />}
        {activeTab === 'squad' && <BetaManagement appId={appId!} config={betaConfig} onConfigChange={handleBetaConfigChange} />}
      </div>
    </div>
  );
}
