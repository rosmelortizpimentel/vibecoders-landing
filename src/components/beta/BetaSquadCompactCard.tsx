import { useNavigate } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useBetaSquad } from '@/hooks/useBetaSquad';
import { useQueryClient } from '@tanstack/react-query';
import { BetaSquadApp } from '@/hooks/useBetaSquadsPublic';
import { CheckCircle2, Hourglass, XCircle, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface BetaSquadCompactCardProps {
  app: BetaSquadApp;
}

export function BetaSquadCompactCard({ app }: BetaSquadCompactCardProps) {
  const { t } = useTranslation('beta');
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { leaveBeta, leaving } = useBetaSquad(app.id);
  
  const status = app.user_tester_status?.status;

  const handleAction = () => {
    if (status === 'accepted') {
      navigate(`/app/${app.id}`);
    } else {
      handleCancel();
    }
  };

  const handleCancel = async () => {
    const result = await leaveBeta();
    if (result.success) {
      toast.success(t('leftBeta'));
      queryClient.invalidateQueries({ queryKey: ['my-beta-squads'] });
      queryClient.invalidateQueries({ queryKey: ['beta-squads-public'] });
    }
  };

  return (
    <Card className="min-w-[240px] max-w-[280px] shrink-0 border-border bg-card/50 hover:bg-card transition-colors">
      <CardContent className="p-4 flex flex-col gap-4">
        {/* App Info */}
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 rounded-lg border border-border">
            {app.logo_url ? (
              <AvatarImage src={app.logo_url} alt={app.name || ''} className="object-cover" />
            ) : (
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-xs font-bold">
                {app.name?.charAt(0) || '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-sm text-foreground truncate">
              {app.name}
            </h4>
            <p className="text-xs text-muted-foreground">
              {t('testerRole')}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex">
          {status === 'accepted' ? (
            <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              {t('squadActiveBadge')}
            </Badge>
          ) : status === 'pending' ? (
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20 gap-1.5 font-medium">
              <Hourglass className="w-3.5 h-3.5" />
              {t('waitingBadge')}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1.5">
              <XCircle className="w-3.5 h-3.5" />
              {t('statusRejected')}
            </Badge>
          )}
        </div>

        {/* Action Button */}
        <div className="flex gap-2">
          {status === 'accepted' ? (
            <Button 
              size="sm" 
              className="w-full font-semibold"
              onClick={() => navigate(`/app/${app.id}`)}
            >
              {t('giveFeedback')}
            </Button>
          ) : (
            <Button 
              size="sm" 
              variant="ghost" 
              className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              onClick={handleCancel}
              disabled={leaving}
            >
              <Trash2 className="w-3.5 h-3.5 mr-2" />
              {t('cancel')}
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
