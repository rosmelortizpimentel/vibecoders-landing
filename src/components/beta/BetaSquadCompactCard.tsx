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
    <Card className="w-full border-border bg-card/50 hover:bg-card transition-colors">
      <CardContent className="p-3 flex flex-col gap-2">
        {/* App Info */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-lg border border-border shrink-0">
            {app.logo_url ? (
              <AvatarImage src={app.logo_url} alt={app.name || ''} className="object-cover" />
            ) : (
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                {app.name?.charAt(0) || '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-foreground truncate">
              {app.name}
            </h4>
            <p className="text-[10px] text-muted-foreground">
              {t('testerRole')}
            </p>
          </div>
        </div>

        {/* Status Badge */}
        <div className="flex">
          {status === 'accepted' ? (
            <Badge variant="default" className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20 gap-1 font-medium text-[10px] px-1.5 py-0">
              <CheckCircle2 className="w-3 h-3" />
              {t('squadActiveBadge')}
            </Badge>
          ) : status === 'pending' ? (
            <Badge variant="secondary" className="bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-yellow-500/20 gap-1 font-medium text-[10px] px-1.5 py-0">
              <Hourglass className="w-3 h-3" />
              {t('waitingBadge')}
            </Badge>
          ) : (
            <Badge variant="outline" className="text-muted-foreground gap-1 text-[10px] px-1.5 py-0">
              <XCircle className="w-3 h-3" />
              {t('statusRejected')}
            </Badge>
          )}
        </div>

        {/* Action Button */}
        {status === 'accepted' ? (
          <Button 
            size="sm" 
            className="w-full font-semibold h-7 text-xs"
            onClick={() => navigate(`/app/${app.id}`)}
          >
            {t('giveFeedback')}
          </Button>
        ) : (
          <Button 
            size="sm" 
            variant="ghost" 
            className="w-full text-muted-foreground hover:text-destructive hover:bg-destructive/10 h-7 text-xs"
            onClick={handleCancel}
            disabled={leaving}
          >
            <Trash2 className="w-3 h-3 mr-1.5" />
            {t('cancel')}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
