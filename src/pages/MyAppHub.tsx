import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useApps } from '@/hooks/useApps';
import { useTranslation } from '@/hooks/useTranslation';
import { useIsMobile } from '@/hooks/use-mobile';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, ArrowLeft, ExternalLink, Info, Map, MessageSquare, Users } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const activeTab: TabId = useMemo(() => {
    if (location.pathname.endsWith('/roadmap')) return 'roadmap';
    if (location.pathname.endsWith('/feedback')) return 'feedback';
    if (location.pathname.endsWith('/squad')) return 'squad';
    return 'info';
  }, [location.pathname]);

  const tabs: { id: TabId; label: string; icon: typeof Info; path: string }[] = [
    { id: 'info', label: t.t('hub.info'), icon: Info, path: `/my-apps/${appId}` },
    { id: 'roadmap', label: t.t('hub.roadmap'), icon: Map, path: `/my-apps/${appId}/roadmap` },
    { id: 'feedback', label: t.t('hub.feedback'), icon: MessageSquare, path: `/my-apps/${appId}/feedback` },
    { id: 'squad', label: t.t('hub.squad'), icon: Users, path: `/my-apps/${appId}/squad` },
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

  const [statusInfo, setStatusInfo] = useState<{ name: string; color: string } | null>(null);
  useEffect(() => {
    if (!app?.status_id) return;
    supabase.from('app_statuses').select('name, color').eq('id', app.status_id).single()
      .then(({ data }) => { if (data) setStatusInfo(data); });
  }, [app?.status_id]);

  if (authLoading || appsLoading) {
    return <div className="flex items-center justify-center min-h-[60vh]"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
  }

  if (!app) {
    return (
      <div className="text-center py-20">
        <p className="text-muted-foreground">App not found</p>
        <Button variant="ghost" onClick={() => navigate('/my-apps')} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" /> {t.t('hub.backToApps')}
        </Button>
      </div>
    );
  }

  return (
    <div className="container px-3 sm:px-4 py-4 sm:py-6 flex-1 max-w-4xl mx-auto">
      {/* Back + Header */}
      <div className="mb-4">
        <Button variant="ghost" size="sm" onClick={() => navigate('/my-apps')} className="text-muted-foreground hover:text-foreground -ml-2 mb-3">
          <ArrowLeft className="w-4 h-4 mr-1" /> {t.t('hub.backToApps')}
        </Button>

        <div className="flex items-center gap-3">
          {app.logo_url ? (
            <img src={app.logo_url} alt={app.name || ''} className="w-10 h-10 rounded-lg object-cover border" />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground text-lg font-bold">
              {(app.name || 'A').charAt(0)}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground truncate">{app.name || app.url}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              {statusInfo && (
                <Badge variant="outline" className="text-xs" style={{ borderColor: statusInfo.color, color: statusInfo.color }}>{statusInfo.name}</Badge>
              )}
              {app.is_verified && <Badge variant="secondary" className="text-xs">{t.verified}</Badge>}
            </div>
          </div>
          <a href={app.url} target="_blank" rel="noopener noreferrer">
            <Button variant="outline" size="sm" className="gap-1.5">
              <ExternalLink className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{t.t('hub.viewPage')}</span>
            </Button>
          </a>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex w-full overflow-x-auto gap-1 p-1.5 bg-muted/50 rounded-full scrollbar-hide mb-6">
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

      {/* Content */}
      <div>
        {activeTab === 'info' && (
          <AppEditor app={app} onUpdate={updateApp} onUploadLogo={uploadAppLogo} onUploadScreenshot={appsHook.uploadAppScreenshot} onDelete={() => navigate('/my-apps')} onCollapse={() => navigate('/my-apps')} onVerify={handleVerify} />
        )}
        {activeTab === 'roadmap' && <RoadmapEditor />}
        {activeTab === 'feedback' && <UnifiedFeedbackList appId={appId!} />}
        {activeTab === 'squad' && <BetaManagement appId={appId!} config={betaConfig} onConfigChange={handleBetaConfigChange} />}
      </div>
    </div>
  );
}
