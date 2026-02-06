import { Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import type { BetaSquadApp } from '@/hooks/useBetaSquadsPublic';

interface BetaSquadPublicCardProps {
  app: BetaSquadApp;
}

export function BetaSquadPublicCard({ app }: BetaSquadPublicCardProps) {
  const t = useTranslation('beta');
  
  const progressPercent = app.beta_limit > 0 
    ? ((app.beta_limit - app.spots_remaining) / app.beta_limit) * 100 
    : 0;
  
  const isUrgent = app.spots_remaining <= 3 && app.spots_remaining > 0;
  const isFull = app.spots_remaining <= 0;

  // Truncate instructions to ~100 chars
  const truncatedInstructions = app.beta_instructions 
    ? app.beta_instructions.length > 100 
      ? app.beta_instructions.slice(0, 100) + '...'
      : app.beta_instructions
    : null;

  return (
    <div className="group relative flex flex-col rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/50 hover:shadow-md">
      {/* Header: Logo + Name + Owner */}
      <div className="flex items-start gap-3 mb-4">
        <Avatar className="h-12 w-12 rounded-lg border border-border shrink-0">
          {app.logo_url ? (
            <AvatarImage src={app.logo_url} alt={app.name || 'App'} className="object-cover" />
          ) : (
            <AvatarFallback className="rounded-lg bg-primary/10 text-primary font-semibold text-lg">
              {app.name?.charAt(0) || '?'}
            </AvatarFallback>
          )}
        </Avatar>
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {app.name || 'Untitled App'}
          </h3>
          {app.owner.username && (
            <p className="text-sm text-muted-foreground truncate">
              @{app.owner.username}
            </p>
          )}
        </div>
      </div>

      {/* Body: Instructions Preview */}
      <div className="flex-1 mb-4">
        {truncatedInstructions ? (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {truncatedInstructions}
          </p>
        ) : app.tagline ? (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {app.tagline}
          </p>
        ) : (
          <p className="text-sm text-muted-foreground/60 italic">
            {t.missionPreview}
          </p>
        )}
      </div>

      {/* Footer: Progress + CTA */}
      <div className="space-y-3">
        {/* Progress Bar */}
        <div className="space-y-1.5">
          <Progress 
            value={progressPercent} 
            className={cn(
              "h-2",
              isUrgent && "[&>div]:bg-orange-500",
              isFull && "[&>div]:bg-muted-foreground"
            )}
          />
          <div className="flex justify-between items-center">
            <span className={cn(
              "text-sm font-medium",
              isUrgent ? "text-orange-500" : isFull ? "text-muted-foreground" : "text-foreground"
            )}>
              {isFull ? t.squadFull : `${app.spots_remaining}/${app.beta_limit}`}
            </span>
            {isUrgent && !isFull && (
              <span className="text-xs font-medium text-orange-500">
                {t.spotsLow}
              </span>
            )}
          </div>
        </div>

        {/* CTA Button */}
        <Button 
          asChild 
          className="w-full"
          variant={isFull ? "secondary" : "default"}
          disabled={isFull}
        >
          <Link to={`/app/${app.id}`}>
            {isFull ? t.squadFull : t.joinSquad}
          </Link>
        </Button>
      </div>
    </div>
  );
}
