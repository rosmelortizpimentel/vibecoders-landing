import { useTranslation } from '@/hooks/useTranslation';
import { useBetaContributions, BetaContribution } from '@/hooks/useBetaContributions';
import { Badge } from '@/components/ui/badge';
import { FlaskConical, Globe } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

import { PublicApp } from '@/hooks/usePublicProfile';

interface BetaContributionsBadgesProps {
  userId: string;
  onAppClick?: (app: PublicApp) => void;
}

export function BetaContributionsBadges({ userId, onAppClick }: BetaContributionsBadgesProps) {
  const { t } = useTranslation('beta');
  const { contributions, loading } = useBetaContributions(userId);

  if (loading || contributions.length === 0) {
    return null;
  }

  return (
    <div className="border-t border-border px-4 md:px-6 py-4 bg-muted/30">
      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-3 flex items-center gap-2">
        {t('contributions')}
      </p>
      <div className="flex flex-wrap gap-2">
        {contributions.map((contribution) => (
          <div 
            key={contribution.id}
            onClick={(e) => {
              if (onAppClick) {
                e.preventDefault();
                onAppClick(contribution.app);
              }
            }}
            className="group cursor-pointer"
          >
            <TooltipProvider>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <div 
                    className="flex items-center gap-2 py-1 px-3 rounded-full bg-[#FFD700] border border-border transition-colors hover:bg-[#FFD700]/90"
                  >
                    <FlaskConical className="w-3.5 h-3.5 text-black" />
                    <span className="font-semibold text-xs text-black">
                      {contribution.app?.name || 'App'}
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{t('testerBadge')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        ))}
      </div>
    </div>
  );
}