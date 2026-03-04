import { useNavigate, Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { BetaSquadApp } from '@/hooks/useBetaSquadsPublic';
import { CheckCircle2, AlertCircle, Clock, MessageSquare } from 'lucide-react';
import { useMyFeedback } from '@/hooks/useMyFeedback';
import { cn } from '@/lib/utils';

interface BetaSquadCompactCardProps {
  app: BetaSquadApp;
}

export function BetaSquadCompactCard({ app }: BetaSquadCompactCardProps) {
  const { t } = useTranslation('beta');
  const navigate = useNavigate();
  
  const { data: myFindings = [] } = useMyFeedback();
  const appFindings = myFindings.filter(f => f.app_id === app.id);
  
  const openCount = appFindings.filter(f => f.status === 'open').length;
  const inReviewCount = appFindings.filter(f => f.status === 'in_review').length;
  const resolvedCount = appFindings.filter(f => f.status === 'resolved' || f.status === 'closed').length;

  return (
    <Card 
      className="w-full border-border bg-card/50 hover:bg-card transition-all cursor-pointer group"
      onClick={() => navigate(`/app/${app.id}`)}
    >
      <CardContent className="p-3 flex flex-col gap-2">
        {/* App Info row */}
        <div className="flex items-center gap-2">
          <Avatar className="h-8 w-8 rounded-lg border border-border shrink-0">
            {app.logo_url ? (
              <AvatarImage src={app.logo_url} alt={app.name || ''} className="object-contain p-0.5" />
            ) : (
              <AvatarFallback className="rounded-lg bg-primary/10 text-primary text-[10px] font-bold">
                {app.name?.charAt(0) || '?'}
              </AvatarFallback>
            )}
          </Avatar>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs text-foreground truncate group-hover:text-primary transition-colors hover:underline">
              <Link to={`/app/${app.id}`} onClick={(e) => e.stopPropagation()}>
                {app.name}
              </Link>
            </h4>
            <p className="text-[10px] text-muted-foreground flex items-center gap-1 uppercase">
              <MessageSquare className="w-2.5 h-2.5" />
              {appFindings.length} {t('reportsCount', { defaultValue: 'reportes' })}
            </p>
          </div>
        </div>

        {/* Status Badges row */}
        <div className="flex flex-wrap gap-1 mt-1">
          {openCount > 0 && (
            <Badge variant="outline" className="bg-transparent border-[#FFD700]/50 text-[#D4A800] gap-1 font-medium text-[10px] px-2 py-0.5 rounded-2xl">
              <AlertCircle className="w-2.5 h-2.5" />
              {openCount} {t('statusOpen', { defaultValue: 'Abierto' })}
            </Badge>
          )}
          {inReviewCount > 0 && (
            <Badge variant="outline" className="bg-transparent border-blue-500/40 text-blue-500 gap-1 font-medium text-[10px] px-2 py-0.5 rounded-2xl">
              <Clock className="w-2.5 h-2.5" />
              {inReviewCount} {t('statusInReview', { defaultValue: 'En Revisión' })}
            </Badge>
          )}
          {resolvedCount > 0 && (
            <Badge variant="outline" className="bg-transparent border-[#68CFA2]/40 text-[#68CFA2] gap-1 font-medium text-[10px] px-2 py-0.5 rounded-2xl">
              <CheckCircle2 className="w-2.5 h-2.5" />
              {resolvedCount} {t('statusResolved', { defaultValue: 'Resuelto' })}
            </Badge>
          )}
          
          {appFindings.length === 0 && (
            <Badge variant="outline" className="bg-transparent border-border text-muted-foreground gap-1 font-medium text-[10px] px-2 py-0.5 rounded-2xl">
              {t('noReportsSent', { defaultValue: 'Sin reportes' })}
            </Badge>
          )}
        </div>

        {/* Action text row */}
        <p className="text-[10px] text-muted-foreground line-clamp-1 italic mt-1">
          "{t('clickToGiveFeedback', { defaultValue: 'Haz clic para explorar y dar feedback...' })}"
        </p>
      </CardContent>
    </Card>
  );
}
