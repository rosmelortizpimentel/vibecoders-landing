import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  onToggleBeta: (checked: boolean) => void;
}

function AppListItem({ app, isSelected, onSelect, onToggleBeta }: AppListItemProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all",
        isSelected 
          ? "bg-primary/10 border border-primary/30" 
          : "bg-background border border-border hover:border-primary/30"
      )}
      onClick={onSelect}
    >
      {/* Logo */}
      <div className="flex-shrink-0">
        {app.logo_url ? (
          <img 
            src={app.logo_url} 
            alt={app.name || ''} 
            className="w-10 h-10 rounded-lg object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center">
            <Globe className="w-5 h-5 text-muted-foreground" />
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
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
        {app.tagline && (
          <p className="text-xs text-muted-foreground truncate">{app.tagline}</p>
        )}
      </div>

      {/* Beta Toggle */}
      <div 
        className="flex-shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <Switch
          checked={app.beta_active ?? false}
          onCheckedChange={onToggleBeta}
        />
      </div>
    </div>
  );
}

export function BetaTab({ appsHook }: BetaTabProps) {
  const navigate = useNavigate();
  const t = useTranslation('beta');
  const { apps, updateApp } = appsHook;
  
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  // Auto-select first app when apps load
  useEffect(() => {
    if (apps.length > 0 && !selectedAppId) {
      setSelectedAppId(apps[0].id);
    }
  }, [apps, selectedAppId]);

  const selectedApp = apps.find(app => app.id === selectedAppId);

  const handleConfigChange = async (updates: Partial<AppData>) => {
    if (selectedAppId) {
      await updateApp(selectedAppId, updates);
    }
  };

  const handleSelectApp = (appId: string) => {
    setSelectedAppId(appId);
    setShowDetail(true);
  };

  const handleToggleBeta = async (appId: string, checked: boolean) => {
    await updateApp(appId, { beta_active: checked });
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
                onToggleBeta={(checked) => handleToggleBeta(app.id, checked)}
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
                  beta_mode: selectedApp.beta_mode ?? 'open',
                  beta_limit: selectedApp.beta_limit ?? 10,
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
                  onSelect={() => setSelectedAppId(app.id)}
                  onToggleBeta={(checked) => handleToggleBeta(app.id, checked)}
                />
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Right Column: Config Panel */}
        <div className="col-span-8 lg:col-span-9">
          <ScrollArea className="h-[calc(100vh-300px)]">
            {selectedApp ? (
              <BetaManagement
                appId={selectedApp.id}
                config={{
                  beta_active: selectedApp.beta_active ?? false,
                  beta_mode: selectedApp.beta_mode ?? 'open',
                  beta_limit: selectedApp.beta_limit ?? 10,
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
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
