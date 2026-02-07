import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { FlaskConical, ChevronLeft, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { BetaManagement } from '@/components/beta/BetaManagement';
import { useApps, AppData } from '@/hooks/useApps';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';

interface BetaTabProps {
  appsHook: ReturnType<typeof useApps>;
}

interface AppListItemProps {
  app: AppData;
  isSelected: boolean;
  onSelect: () => void;
}

function AppListItem({ app, isSelected, onSelect }: AppListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all relative group",
        isSelected 
          ? "bg-primary text-primary-foreground shadow-md" 
          : "bg-background border border-border hover:bg-accent/50"
      )}
      onClick={onSelect}
    >
      {/* Logo */}
      <div className="flex-shrink-0 relative">
        {app.logo_url ? (
          <img 
            src={app.logo_url} 
            alt={app.name || ''} 
            className="w-10 h-10 rounded-lg object-cover bg-background"
          />
        ) : (
          <div className={cn(
            "w-10 h-10 rounded-lg flex items-center justify-center",
            isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"
          )}>
            <Globe className="w-5 h-5" />
          </div>
        )}
        
        {/* Mobile Beta Indicator (overlay on logo) */}
        {app.beta_active && (
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-background md:hidden" />
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-medium truncate">
            {app.name || (() => { 
              try { 
                const normalized = app.url.trim();
                const urlWithProtocol = normalized.startsWith('http://') || normalized.startsWith('https://') 
                  ? normalized 
                  : `https://${normalized}`;
                return new URL(urlWithProtocol).hostname; 
              } catch { 
                return 'App'; 
              } 
            })()}
          </h4>
          
          {/* Desktop Beta Indicator (label) */}
          {app.beta_active && (
            <div className={cn(
              "hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded-full border",
              isSelected 
                ? "bg-white/20 border-white/30 text-white" 
                : "bg-green-500/10 border-green-500/20"
            )}>
              <span className={cn(
                "w-1.5 h-1.5 rounded-full animate-pulse",
                isSelected ? "bg-white" : "bg-green-500"
              )} />
              <span className={cn(
                "text-[10px] font-medium",
                isSelected ? "text-white" : "text-green-700 dark:text-green-400"
              )}>Beta</span>
            </div>
          )}
        </div>
        <p className={cn(
          "text-xs line-clamp-1 break-all",
          isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
        )}>{app.url}</p>
      </div>
    </div>
  );
}

export function BetaTab({ appsHook }: BetaTabProps) {
  const navigate = useNavigate();
  const { appId } = useParams();
  const t = useTranslation('beta');
  const { apps, updateApp } = appsHook;
  
  // Use URL param as source of truth, or fall back to first app
  const selectedAppId = appId || (apps.length > 0 ? apps[0].id : null);
  const [showDetail, setShowDetail] = useState(false);

  // Effect to update URL if no appId is present but we have apps (redirect to first app)
  useEffect(() => {
    if (apps.length > 0 && !appId) {
      navigate(`/beta-testing/${apps[0].id}`, { replace: true });
    }
  }, [apps, appId, navigate]);

  const selectedApp = apps.find(app => app.id === selectedAppId);

  const handleConfigChange = async (updates: Partial<AppData>) => {
    if (selectedAppId) {
      if (updates.beta_active) {
         const app = apps.find(a => a.id === selectedAppId);
         if (app && !app.beta_mode) updates.beta_mode = 'closed';
         if (app && !app.beta_limit) updates.beta_limit = 1;
      }
      await updateApp(selectedAppId, updates);
    }
  };

  const handleSelectApp = (id: string) => {
    navigate(`/beta-testing/${id}`);
    setShowDetail(true);
  };

  // Empty state: no apps
  if (apps.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-6">
          <FlaskConical className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {t.noAppsTitle}
        </h3>
        <p className="text-muted-foreground mb-6 max-w-sm">
          {t.noAppsMessage}
        </p>
        <Button onClick={() => navigate('/me/apps')}>
          {t.goToApps}
        </Button>
      </div>
    );
  }

  return (
    <div className="h-full">
      {/* Mobile: Show list or detail */}
      <div className="md:hidden">
        {!showDetail ? (
          <div className="space-y-2">
            {apps.map(app => (
              <AppListItem
                key={app.id}
                app={app}
                isSelected={selectedAppId === app.id}
                onSelect={() => handleSelectApp(app.id)}
              />
            ))}
          </div>
        ) : (
          <div className="space-y-4">
            {/* Back Button */}
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setShowDetail(false)}
              className="gap-2 -ml-2"
            >
              <ChevronLeft className="w-4 h-4" />
              {t.backToList || 'Volver'}
            </Button>

            {/* Detail View */}
            {selectedApp && (
              <BetaManagement
                appId={selectedApp.id}
                config={{
                  beta_active: selectedApp.beta_active ?? false,
                  beta_mode: selectedApp.beta_mode ?? 'closed',
                  beta_limit: selectedApp.beta_limit ?? 1,
                  beta_link: selectedApp.beta_link ?? null,
                  beta_instructions: selectedApp.beta_instructions ?? null,
                }}
                onConfigChange={handleConfigChange}
              />
            )}
          </div>
        )}
      </div>

      {/* Desktop: Side by side */}
      <div className="hidden md:grid md:grid-cols-12 md:gap-6 h-full">
        {/* Left Column: App List */}
        <div className="col-span-4 lg:col-span-3">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="space-y-2 pr-2">
              {apps.map(app => (
                <AppListItem
                  key={app.id}
                  app={app}
                  isSelected={selectedAppId === app.id}
                  onSelect={() => handleSelectApp(app.id)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column: Config Panel */}
        <div className="col-span-8 lg:col-span-9">
          <ScrollArea className="h-[calc(100vh-300px)]">
            <div className="pr-6 pl-1 py-1">
              {selectedApp ? (
                <BetaManagement
                  appId={selectedApp.id}
                  config={{
                    beta_active: selectedApp.beta_active ?? false,
                    beta_mode: selectedApp.beta_mode ?? 'closed',
                    beta_limit: selectedApp.beta_limit ?? 1,
                    beta_link: selectedApp.beta_link ?? null,
                    beta_instructions: selectedApp.beta_instructions ?? null,
                  }}
                  onConfigChange={handleConfigChange}
                />
              ) : (
                <div className="flex items-center justify-center h-64 text-muted-foreground">
                  {t.selectApp || 'Selecciona una app'}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
