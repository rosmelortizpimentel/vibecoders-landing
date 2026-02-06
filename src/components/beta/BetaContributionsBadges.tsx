import { Link } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { useBetaContributions, BetaContribution } from '@/hooks/useBetaContributions';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Globe } from 'lucide-react';

interface BetaContributionsBadgesProps {
  userId: string;
}

export function BetaContributionsBadges({ userId }: BetaContributionsBadgesProps) {
  const { t } = useTranslation('beta');
  const { contributions, loading } = useBetaContributions(userId);

  if (loading || contributions.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border px-4 md:px-6 py-4 bg-muted/30">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
        <FlaskConical className="w-3.5 h-3.5" />
        {t('contributions')}
      </p>
      <div className="flex flex-wrap gap-2">
        {contributions.map((contribution) => (
          <Link 
            key={contribution.id}
            to={`/app/${contribution.app_id}`}
            className="group"
          >
            <Badge 
              variant="secondary" 
              className="gap-2 py-1.5 px-3 hover:bg-secondary/80 transition-colors"
            >
              {contribution.app?.logo_url ? (
                <img 
                  src={contribution.app.logo_url} 
                  alt={contribution.app.name || 'App'}
                  className="w-4 h-4 rounded object-cover"
                />
              ) : (
                <Globe className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="font-medium">
                {contribution.app?.name || 'App'}
              </span>
              <span className="text-xs text-muted-foreground">
                {t('testerBadge')}
              </span>
            </Badge>
          </Link>
        ))}
      </div>
    </div>
  );
}