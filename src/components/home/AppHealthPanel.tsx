import { Stethoscope, Bug, Lightbulb, Loader2, Rocket } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useTranslation } from '@/hooks/useTranslation';
import { useNavigate } from 'react-router-dom';

interface AppHealthItem {
  id: string;
  name: string;
  logoUrl?: string;
  bugCount: number;
  featureCount: number;
}

interface AppHealthPanelProps {
  apps: AppHealthItem[];
  isLoading?: boolean;
}

export function AppHealthPanel({ apps, isLoading }: AppHealthPanelProps) {
  const { t } = useTranslation('home');
  const navigate = useNavigate();

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const handleAppClick = (appId: string) => {
    navigate(`/beta-testing/${appId}`);
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 h-full w-full min-w-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 bg-muted rounded-lg">
          <Stethoscope className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
        </div>
        <h3 className="font-semibold text-foreground text-sm">
          {t('actionCenter.appHealth') || 'App Status'}
        </h3>
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </div>
      ) : apps.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-8 text-center space-y-3">
          <p className="text-muted-foreground text-sm">
            {t('actionCenter.noApps') || 'No apps yet'}
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => navigate('/apps')}
            className="h-8 text-xs font-medium border-primary/20 hover:bg-primary/5 text-primary"
          >
            {t('actionCenter.viewMyApps') || 'Ver todas mis apps'}
            <Rocket className="ml-2 w-3 h-3" />
          </Button>
        </div>
      ) : (
        <div className="space-y-2">
          {apps.map((app) => (
            <div
              key={app.id}
              onClick={() => handleAppClick(app.id)}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
            >
              <Avatar className="h-8 w-8 rounded-lg">
                <AvatarImage src={app.logoUrl || undefined} className="rounded-lg" />
                <AvatarFallback className="text-xs bg-muted text-muted-foreground rounded-lg">
                  {getInitials(app.name)}
                </AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {app.name}
                </p>
              </div>

              <div className="flex items-center gap-2">
                {app.bugCount > 0 && (
                  <Badge variant="outline" className="gap-1 text-xs h-6 px-2 text-muted-foreground border-muted-foreground/30">
                    <Bug className="w-3 h-3" />
                    {app.bugCount}
                  </Badge>
                )}
                {app.featureCount > 0 && (
                  <Badge variant="outline" className="gap-1 text-xs h-6 px-2 text-muted-foreground border-muted-foreground/30">
                    <Lightbulb className="w-3 h-3" />
                    {app.featureCount}
                  </Badge>
                )}
                {app.bugCount === 0 && app.featureCount === 0 && (
                  <span className="text-xs text-muted-foreground">—</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
