import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { FollowerCard } from '@/components/profile/FollowerCard';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import type { BetaTester } from '@/hooks/useBetaSquadsPublic';
import { FlaskConical } from 'lucide-react';

interface TesterListDialogProps {
  isOpen: boolean;
  onClose: () => void;
  testers: BetaTester[];
  appName: string | null;
}

export function TesterListDialog({ isOpen, onClose, testers, appName }: TesterListDialogProps) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const t = useTranslation('beta');
  const tFollowers = useTranslation('followers');

  const handleFollow = async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: userId });
      
      return !error;
    } catch {
      return false;
    }
  };

  const handleUnfollow = async (userId: string): Promise<boolean> => {
    if (!user) return false;
    
    try {
      const { error } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', userId);
      
      return !error;
    } catch {
      return false;
    }
  };

  const handleNavigateToProfile = (username: string) => {
    onClose();
    navigate(`/@${username}`);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-md max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FlaskConical className="h-5 w-5 text-primary" />
            {t.hallOfFame}
          </DialogTitle>
          {appName && (
            <p className="text-sm text-muted-foreground">{appName}</p>
          )}
        </DialogHeader>

        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {testers.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              {t.noTesters}
            </div>
          ) : (
            testers.map((tester) => (
              <FollowerCard
                key={tester.id}
                id={tester.id}
                username={tester.username}
                name={tester.name}
                avatar_url={tester.avatar_url}
                tagline={tester.tagline}
                isFollowing={false} // We'd need to check this, but keeping simple for now
                onFollow={handleFollow}
                onUnfollow={handleUnfollow}
                onNavigateToProfile={handleNavigateToProfile}
              />
            ))
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
