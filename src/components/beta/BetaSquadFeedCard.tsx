import { useState } from 'react';
import { Link } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { parseMarkdown } from '@/lib/markdown';
import { cn } from '@/lib/utils';
import { TesterListDialog } from './TesterListDialog';
import type { BetaSquadApp } from '@/hooks/useBetaSquadsPublic';
import { Users, Clock } from 'lucide-react';

interface BetaSquadFeedCardProps {
  app: BetaSquadApp;
}

export function BetaSquadFeedCard({ app }: BetaSquadFeedCardProps) {
  const t = useTranslation('beta');
  const { language } = useLanguage();
  const [showTesters, setShowTesters] = useState(false);
  
  const progressPercent = app.beta_limit > 0 
    ? (app.testers_count / app.beta_limit) * 100 
    : 0;
  
  const isUrgent = app.spots_remaining <= 3 && app.spots_remaining > 0;
  const isFull = app.spots_remaining <= 0;

  const timeAgo = formatDistanceToNow(new Date(app.updated_at), { 
    addSuffix: true,
    locale: language === 'es' ? es : enUS 
  });

  return (
    <>
      <article className="bg-card border border-border rounded-xl overflow-hidden">
        {/* Post Header - Author Info */}
        <div className="p-4 pb-3">
          <Link 
            to={app.owner.username ? `/@${app.owner.username}` : '#'}
            className="flex items-center gap-3 group"
          >
            <Avatar className="h-12 w-12 border border-border">
              {app.owner.avatar_url ? (
                <AvatarImage src={app.owner.avatar_url} alt={app.owner.name || ''} />
              ) : (
                <AvatarFallback className="bg-muted text-muted-foreground font-medium">
                  {app.owner.name?.charAt(0) || '?'}
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {app.owner.name || 'Usuario'}
              </p>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>@{app.owner.username || 'user'}</span>
                <span className="text-muted-foreground/50">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {timeAgo}
                </span>
              </div>
            </div>
          </Link>
        </div>

        {/* Post Intro Text */}
        <div className="px-4 pb-3">
          <p className="text-foreground">
            {t.lookingFor?.replace('{count}', String(app.beta_limit)) || `Buscando ${app.beta_limit} testers`}
          </p>
        </div>

        {/* Embedded App Card */}
        <div className="px-4 pb-4">
          <Card className="bg-muted/30 border-border">
            <CardContent className="p-4">
              {/* App Header */}
              <div className="flex items-start gap-3 mb-4">
                <Avatar className="h-14 w-14 rounded-xl border border-border shrink-0">
                  {app.logo_url ? (
                    <AvatarImage src={app.logo_url} alt={app.name || 'App'} className="object-cover rounded-xl" />
                  ) : (
                    <AvatarFallback className="rounded-xl bg-primary/10 text-primary font-bold text-xl">
                      {app.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-lg text-foreground truncate">
                    {app.name || 'Untitled App'}
                  </h3>
                  {app.tagline && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {app.tagline}
                    </p>
                  )}
                </div>
              </div>

              {/* Instructions (formatted markdown) */}
              {app.beta_instructions && (
                <div className="mb-4">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                    {t.instructions}
                  </p>
                  <div 
                    className="text-sm text-foreground prose prose-sm max-w-none dark:prose-invert prose-strong:text-foreground prose-em:text-foreground"
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(app.beta_instructions) }}
                  />
                </div>
              )}

              {/* Progress & Testers Count */}
              <div className="space-y-2">
                <Progress 
                  value={progressPercent} 
                  className={cn(
                    "h-2",
                    isUrgent && "[&>div]:bg-destructive",
                    isFull && "[&>div]:bg-muted-foreground"
                  )}
                />
                <div className="flex justify-between items-center">
                  <button
                    onClick={() => setShowTesters(true)}
                    className={cn(
                      "flex items-center gap-1.5 text-sm font-medium hover:underline transition-colors",
                      isUrgent ? "text-destructive" : isFull ? "text-muted-foreground" : "text-foreground"
                    )}
                    disabled={app.testers.length === 0}
                  >
                    <Users className="h-4 w-4" />
                    {t.enrolledClickable?.replace('{current}', String(app.testers_count)).replace('{limit}', String(app.beta_limit)) 
                      || `${app.testers_count}/${app.beta_limit} inscritos`}
                  </button>
                  {isUrgent && !isFull && (
                    <span className="text-xs font-medium text-destructive bg-destructive/10 px-2 py-0.5 rounded-full">
                      {t.spotsLow}
                    </span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* CTA Footer */}
        <div className="px-4 pb-4">
          <Button 
            asChild 
            className="w-full"
            variant={isFull ? "secondary" : "default"}
            size="lg"
          >
            <Link to={`/app/${app.id}`}>
              {isFull ? t.squadFull : t.joinSquad}
            </Link>
          </Button>
        </div>
      </article>

      <TesterListDialog
        isOpen={showTesters}
        onClose={() => setShowTesters(false)}
        testers={app.testers}
        appName={app.name}
      />
    </>
  );
}
