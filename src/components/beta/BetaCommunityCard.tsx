import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Users } from 'lucide-react';

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
          <Users className="w-4 h-4 text-primary" />
          Squad 🛡️
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1">
        {validTesters.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">
            {t('noTesters')}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2 overflow-hidden">
              {validTesters.map((tester) => (
                <Avatar key={tester.user_id} className="inline-block border-2 border-background w-8 h-8">
                  <AvatarImage src={tester.profile.avatar_url || undefined} />
                  <AvatarFallback>
                    {(tester.profile.name || 'T').charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              ))}
            </div>
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
