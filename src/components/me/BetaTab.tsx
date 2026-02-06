import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FlaskConical } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { BetaManagement } from '@/components/beta/BetaManagement';
import { useApps, AppData } from '@/hooks/useApps';
import { useTranslation } from '@/hooks/useTranslation';

interface BetaTabProps {
  appsHook: ReturnType<typeof useApps>;
}

export function BetaTab({ appsHook }: BetaTabProps) {
  const navigate = useNavigate();
  const t = useTranslation('beta');
  const { apps, updateApp } = appsHook;
  
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);

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
    <div className="space-y-6">
      {/* App Selector */}
      <div className="space-y-2">
        <Select
          value={selectedAppId || ''}
          onValueChange={setSelectedAppId}
        >
          <SelectTrigger className="w-full max-w-md border-border bg-background">
            <SelectValue placeholder={t.selectApp} />
          </SelectTrigger>
          <SelectContent className="bg-background border-border">
            {apps.map(app => (
              <SelectItem key={app.id} value={app.id}>
                <span className="flex items-center gap-3">
                  {app.logo_url ? (
                    <img 
                      src={app.logo_url} 
                      alt={app.name || ''} 
                      className="w-5 h-5 rounded object-cover"
                    />
                  ) : (
                    <div className="w-5 h-5 rounded bg-muted flex items-center justify-center">
                      <FlaskConical className="h-3 w-3 text-muted-foreground" />
                    </div>
                  )}
                  <span>{app.name || app.url}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Beta Management Panel */}
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
  );
}
