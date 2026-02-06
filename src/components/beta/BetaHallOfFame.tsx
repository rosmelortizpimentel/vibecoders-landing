import { useTranslation } from '@/hooks/useTranslation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Award } from 'lucide-react';
import { Link } from 'react-router-dom';

interface Tester {
  id: string;
  user_id: string;
  joined_at: string;
  feedback_count: number;
  profile: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
}

interface BetaHallOfFameProps {
  testers: Tester[];
  totalCount: number;
}

export function BetaHallOfFame({ testers, totalCount }: BetaHallOfFameProps) {
  const { t } = useTranslation('beta');

  if (testers.length === 0) {
    return (
      <div className="text-center py-4 text-muted-foreground text-sm">
        {t('noTesters')}
      </div>
    );
  }

  const displayedTesters = testers.slice(0, 8);
  const remainingCount = totalCount - displayedTesters.length;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Award className="w-4 h-4 text-primary" />
        <h4 className="font-medium text-sm">{t('hallOfFame')}</h4>
      </div>
      
      <div className="flex items-center gap-1 flex-wrap">
        {displayedTesters.map((tester) => (
          <Tooltip key={tester.id}>
            <TooltipTrigger asChild>
              <Link 
                to={tester.profile.username ? `/@${tester.profile.username}` : '#'}
                className="transition-transform hover:scale-110"
              >
                <Avatar className="w-8 h-8 border-2 border-background">
                  <AvatarImage 
                    src={tester.profile.avatar_url || undefined} 
                    alt={tester.profile.name || 'Tester'} 
                  />
                  <AvatarFallback className="text-xs">
                    {(tester.profile.name || 'T').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </Link>
            </TooltipTrigger>
            <TooltipContent>
              <p className="font-medium">{tester.profile.name || tester.profile.username || 'Tester'}</p>
              {tester.feedback_count > 0 && (
                <p className="text-xs text-muted-foreground">
                  {t('feedbackCount').replace('{count}', String(tester.feedback_count))}
                </p>
              )}
            </TooltipContent>
          </Tooltip>
        ))}
        
        {remainingCount > 0 && (
          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
            +{remainingCount}
          </div>
        )}
      </div>
    </div>
  );
}