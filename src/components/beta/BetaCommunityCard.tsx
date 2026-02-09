import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users, Shield } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Link } from 'react-router-dom';

interface Tester {
  id: string;
  user_id: string;
  profile: {
    id: string;
    username: string | null;
    name: string | null;
    avatar_url: string | null;
  };
}

interface BetaCommunityCardProps {
  testers: Tester[] | undefined;
  totalCount: number;
}

export function BetaCommunityCard({ testers, totalCount }: BetaCommunityCardProps) {
  const { t } = useTranslation('beta');

  // Filter valid testers and limit for display
  const validTesters = testers?.filter(t => t.profile).slice(0, 5) || [];
  const displayCount = Math.min(validTesters.length, 5);
  const remainingcount = Math.max(0, totalCount - displayCount);

  return (
    <Card className="h-full border-primary/20 flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base font-semibold">
          <Shield className="w-4 h-4 text-primary" />
          Squad
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {validTesters.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            {t('noTesters')}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <TooltipProvider>
              <div className="flex -space-x-2 overflow-hidden">
                {validTesters.map((tester) => (
                  <Tooltip key={tester.user_id}>
                    <TooltipTrigger asChild>
                      <Link 
                        to={`/@${tester.profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-block transition-transform hover:-translate-y-1"
                      >
                        <Avatar className="border-2 border-background w-8 h-8 cursor-pointer">
                          <AvatarImage src={tester.profile.avatar_url || undefined} />
                          <AvatarFallback>
                            {(tester.profile.name || 'T').charAt(0).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent className="flex flex-col gap-0.5 p-2">
                      <p className="text-sm font-semibold">{tester.profile.name || 'Tester'}</p>
                      <p className="text-xs text-muted-foreground">@{tester.profile.username}</p>
                    </TooltipContent>
                  </Tooltip>
                ))}
              </div>
            </TooltipProvider>
            {remainingcount > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                +{remainingcount}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
