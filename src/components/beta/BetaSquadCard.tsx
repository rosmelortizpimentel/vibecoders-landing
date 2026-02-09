import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { useBetaSquad } from '@/hooks/useBetaSquad';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { FlaskConical, Lock, Check, Clock, Users } from 'lucide-react';
import { toast } from 'sonner';
import { parseMarkdown } from '@/lib/markdown';

interface BetaSquadCardProps {
  appId: string;
  betaLimit: number;
  testersCount: number;
  userTesterStatus: { status: string; id: string } | null;
  isOwner: boolean;
  betaInstructions?: string | null;
  onJoined: () => void;
  onAccessMission: () => void;
}

export function BetaSquadCard({
  appId,
  betaLimit,
  testersCount,
  userTesterStatus,
  isOwner,
  betaInstructions,
  onJoined,
  onAccessMission,
}: BetaSquadCardProps) {
  const { t } = useTranslation('beta');
  const { user } = useAuth();
  const { joinBeta, joining } = useBetaSquad(appId);

  const spotsRemaining = Math.max(0, betaLimit - testersCount);
  const isFull = spotsRemaining === 0;
  const progressPercent = Math.min(100, (testersCount / betaLimit) * 100);

  const handleJoin = async () => {
    if (!user) {
      toast.error(t('loginToJoin'));
      return;
    }

    const result = await joinBeta();
    
    if (result.success) {
      if (result.status === 'accepted') {
        toast.success(t('joined'));
      } else {
        toast.success(t('pendingApproval'));
      }
      onJoined();
    } else {
      if (result.error === 'Cannot join your own beta') {
        toast.error(t('ownerCantJoin'));
      } else {
        toast.error(result.error || 'Error');
      }
    }
  };

  const renderButton = () => {
    // Owner sees nothing (they manage from editor)
    if (isOwner) {
      return null;
    }

    // Not logged in
    if (!user) {
      return (
        <Button 
          variant="outline" 
          className="w-full"
          onClick={() => toast.info(t('loginToJoin'))}
        >
          <Lock className="w-4 h-4 mr-2" />
          {t('loginToJoin')}
        </Button>
      );
    }

    // Already a tester
    if (userTesterStatus) {
      if (userTesterStatus.status === 'accepted') {
        return (
          <Button 
            className="w-full"
            onClick={onAccessMission}
          >
            <Check className="w-4 h-4 mr-2" />
            {t('accessMission')}
          </Button>
        );
      }
      
      if (userTesterStatus.status === 'pending') {
        return (
          <Button variant="secondary" className="w-full" disabled>
            <Clock className="w-4 h-4 mr-2" />
            {t('requestSent')}
          </Button>
        );
      }

      // Rejected - don't show button
      return null;
    }

    // Not a tester yet
    if (isFull) {
      return (
        <Button variant="secondary" className="w-full" disabled>
          <Users className="w-4 h-4 mr-2" />
          {t('squadFull')}
        </Button>
      );
    }

    return (
      <Button 
        className="w-full"
        onClick={handleJoin}
        disabled={joining}
      >
        <FlaskConical className="w-4 h-4 mr-2" />
        {joining ? '...' : t('joinButton')}
      </Button>
    );
  };

  return (
    <Card className="border-primary/20 bg-primary/5 overflow-hidden">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <FlaskConical className="w-5 h-5 text-primary" />
          {t('title')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Mission Description */}
        {!userTesterStatus && !isOwner && !isFull && betaInstructions && (
          <div className="space-y-3">
            <div 
              className="text-xs text-gray-600 leading-relaxed prose prose-sm max-w-none dark:prose-invert"
              dangerouslySetInnerHTML={{ __html: parseMarkdown(betaInstructions) }}
            />
          </div>
        )}

        <div className="space-y-2">
          <div className="flex justify-between text-[11px] uppercase font-bold tracking-wider text-gray-400">
            <span>
              {t('spotsTotal').replace('{current}', String(testersCount)).replace('{total}', String(betaLimit))}
            </span>
            <span className="text-primary/70">
              {t('spotsRemaining').replace('{count}', String(spotsRemaining))}
            </span>
          </div>
          <Progress value={progressPercent} className="h-1.5 bg-primary/10" />
        </div>
        
        {renderButton()}
      </CardContent>
    </Card>
  );
}