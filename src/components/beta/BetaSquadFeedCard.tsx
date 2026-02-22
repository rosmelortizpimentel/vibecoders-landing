import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS, fr, pt } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/hooks/useAuth';
import { parseMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { TesterListDialog } from './TesterListDialog';
import { JoinConfirmDialog } from './JoinConfirmDialog';
import type { BetaSquadApp } from '@/hooks/useBetaSquadsPublic';
import { Users, Clock, CheckCircle2, Hourglass, XCircle } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';

interface BetaSquadFeedCardProps {
  app: BetaSquadApp;
}

export function BetaSquadFeedCard({ app }: BetaSquadFeedCardProps) {
  const { t } = useTranslation('beta');
  const { language } = useLanguage();
  const { user } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [showTesters, setShowTesters] = useState(false);
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  
  const progressPercent = app.beta_limit > 0 
    ? (app.testers_count / app.beta_limit) * 100 
    : 0;
  
  const isUrgent = app.spots_remaining <= 3 && app.spots_remaining > 0;
  const isFull = app.spots_remaining <= 0;
  const isOwner = user?.id === app.owner.id;
  const userStatus = app.user_tester_status?.status;

  const getDateLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'fr': return fr;
      case 'pt': return pt;
      default: return es;
    }
  };

  const timeAgo = formatDistanceToNow(new Date(app.updated_at), { 
    addSuffix: true,
    locale: getDateLocale()
  });

  const handleJoinClick = () => {
    if (!user) {
      navigate('/auth');
      return;
    }
    setShowJoinDialog(true);
  };

  const handleJoinSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ['beta-squads-public'] });
    queryClient.invalidateQueries({ queryKey: ['my-beta-squads'] });
  };

  // Render CTA button based on user status
  const renderCTAButton = () => {
    if (isOwner) {
      return (
        <Button asChild variant="outline" className="rounded-lg hover:shadow-sm hover:-translate-y-0.5 transition-all" size="sm">
          <Link to={`/app/${app.id}`}>{t('viewApp')}</Link>
        </Button>
      );
    }

    if (userStatus === 'accepted') {
      return (
        <Button asChild className="rounded-lg bg-emerald-500 hover:bg-emerald-600 outline-none border-none text-white shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all" size="sm">
          <Link to={`/app/${app.id}`}>
            <CheckCircle2 className="w-4 h-4 mr-1.5" />
            {t('accessMission')}
          </Link>
        </Button>
      );
    }

    if (userStatus === 'pending') {
      return (
        <Badge variant="secondary" className="justify-center py-1.5 px-3 text-xs bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <Hourglass className="w-3.5 h-3.5 mr-1.5" />
          {t('statusPending')}
        </Badge>
      );
    }

    if (userStatus === 'rejected') {
      return (
        <Badge variant="outline" className="justify-center py-1.5 px-3 text-xs text-muted-foreground">
          <XCircle className="w-3.5 h-3.5 mr-1.5" />
          {t('statusRejected')}
        </Badge>
      );
    }

    // No status - show join button
    return (
      <Button 
        onClick={handleJoinClick}
        className={cn(
          "rounded-lg transition-all",
          !isFull && "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm hover:shadow-md hover:-translate-y-0.5"
        )}
        variant={isFull ? "secondary" : "default"}
        size="sm"
        disabled={isFull}
      >
        {!user ? t('loginToJoin') : isFull ? t('squadFull') : t('joinSquad')}
      </Button>
    );
  };

  return (
    <>
      <article className="bg-white dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Post Header - Author Info */}
        <div className="p-4 pb-2">
          <div className="flex items-center justify-between gap-3 mb-2">
            <Link 
              to={app.owner.username ? `/@${app.owner.username}` : '#'}
              className="flex items-center gap-2 group min-w-0"
            >
              <Avatar className="h-6 w-6 border border-border rounded-full shrink-0">
                {app.owner.avatar_url ? (
                  <AvatarImage src={app.owner.avatar_url} alt={app.owner.name || ''} />
                ) : (
                  <AvatarFallback className="bg-muted text-muted-foreground text-[10px] font-medium">
                    {app.owner.name?.charAt(0) || '?'}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex items-center gap-1.5 flex-1 min-w-0 text-xs text-slate-500">
                <span className="truncate hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
                  {app.owner.name || 'Usuario'}
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="flex items-center gap-1 shrink-0">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
              </div>
            </Link>
          </div>
          <p className="text-sm font-medium text-slate-800 dark:text-slate-200">
            {t('lookingFor').replace('{count}', String(app.beta_limit))}
          </p>
        </div>

        {/* Embedded App Card */}
        <div className="px-4 pb-4">
          <div className="bg-slate-50/50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800 rounded-xl p-4">
              {/* App Header */}
              <div className="flex items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-700 shrink-0 bg-white dark:bg-slate-800">
                    {app.logo_url ? (
                      <AvatarImage src={app.logo_url} alt={app.name || 'App'} className="object-contain p-1 rounded-lg" />
                    ) : (
                      <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-bold text-lg">
                        {app.name?.charAt(0) || '?'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="min-w-0">
                    <h3 className="font-bold text-base text-slate-900 dark:text-slate-100 truncate">
                      {app.name || 'Untitled App'}
                    </h3>
                  </div>
                </div>
                <div className="shrink-0">
                  {renderCTAButton()}
                </div>
              </div>

              {/* Instructions (formatted markdown) */}
              {app.beta_instructions && (
                <div className="mb-4">
                  <div 
                    className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 prose prose-sm max-w-none dark:prose-invert prose-strong:text-slate-800 dark:prose-strong:text-slate-200 prose-em:text-slate-700 [&>p]:mb-2 last:[&>p]:mb-0"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(app.beta_instructions) }}
                  />
                </div>
              )}

              {/* Progress & Testers Count */}
              <div className="space-y-1.5 mt-2">
                <Progress 
                  value={progressPercent} 
                  className={cn(
                    "h-1.5 bg-slate-100 dark:bg-slate-800",
                    isUrgent ? "[&>div]:bg-destructive" : isFull ? "[&>div]:bg-slate-400" : "[&>div]:bg-emerald-500"
                  )}
                />
                <div className="flex justify-end items-center">
                  <button
                    onClick={() => setShowTesters(true)}
                    className={cn(
                      "text-xs font-semibold hover:underline transition-colors flex items-center gap-1",
                      isUrgent ? "text-destructive" : isFull ? "text-slate-400" : "text-slate-600 dark:text-slate-400"
                    )}
                    disabled={app.testers.length === 0}
                  >
                    {!isFull && !isUrgent && <Users className="h-3.5 w-3.5 text-emerald-500" />}
                    {app.testers_count}/{app.beta_limit} {t('enrolled')}
                  </button>
                  {isUrgent && !isFull && (
                    <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full ml-2">
                      {t('spotsLow')}
                    </span>
                  )}
                </div>
              </div>
            </div>
        </div>
      </article>

      <TesterListDialog
        isOpen={showTesters}
        onClose={() => setShowTesters(false)}
        testers={app.testers}
        appName={app.name}
      />

      <JoinConfirmDialog
        open={showJoinDialog}
        onOpenChange={setShowJoinDialog}
        appId={app.id}
        appName={app.name}
        appLogo={app.logo_url}
        betaInstructions={app.beta_instructions}
        onSuccess={handleJoinSuccess}
      />
    </>
  );
}
