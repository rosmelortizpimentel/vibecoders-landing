import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FollowerCard } from '@/components/profile/FollowerCard';
import { Skeleton } from '@/components/ui/skeleton';
import { Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  tagline: string | null;
}

interface AuthorFollowDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  authorId: string;
  authorName: string | null;
  initialTab?: 'followers' | 'following';
  followersCount: number;
  followingCount: number;
}

export function AuthorFollowDialog({
  open,
  onOpenChange,
  authorId,
  authorName,
  initialTab = 'followers',
  followersCount,
  followingCount,
}: AuthorFollowDialogProps) {
  const { t } = useTranslation('beta');
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [tab, setTab] = useState<'followers' | 'following'>(initialTab);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);
  const [followingStatus, setFollowingStatus] = useState<Record<string, boolean>>({});

  // Reset tab when dialog opens
  useEffect(() => {
    if (open) {
      setTab(initialTab);
    }
  }, [open, initialTab]);

  useEffect(() => {
    if (open && authorId) {
      fetchProfiles();
    }
  }, [open, authorId, tab]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('follower_id, following_id')
        .eq(tab === 'followers' ? 'following_id' : 'follower_id', authorId);

      if (followsError) throw followsError;

      if (!follows || follows.length === 0) {
        setProfiles([]);
        setFollowingStatus({});
        return;
      }

      const profileIds = follows.map((f) =>
        tab === 'followers' ? f.follower_id : f.following_id
      );

      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, tagline')
        .in('id', profileIds);

      if (profilesError) throw profilesError;

      setProfiles(profilesData || []);

      // Fetch following status for current user
      if (user) {
        const { data: myFollows } = await supabase
          .from('follows')
          .select('following_id')
          .eq('follower_id', user.id)
          .in('following_id', profileIds);

        const statusMap: Record<string, boolean> = {};
        profileIds.forEach(id => { statusMap[id] = false; });
        (myFollows || []).forEach(f => { statusMap[f.following_id] = true; });
        setFollowingStatus(statusMap);
      }
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async (userId: string): Promise<boolean> => {
    if (!user) return false;
    try {
      const { error } = await supabase
        .from('follows')
        .insert({ follower_id: user.id, following_id: userId });
      
      if (error) throw error;
      setFollowingStatus(prev => ({ ...prev, [userId]: true }));
      return true;
    } catch (err) {
      console.error('Error following:', err);
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
      
      if (error) throw error;
      setFollowingStatus(prev => ({ ...prev, [userId]: false }));
      return true;
    } catch (err) {
      console.error('Error unfollowing:', err);
      return false;
    }
  };

  const handleNavigateToProfile = (username: string) => {
    onOpenChange(false);
    navigate(`/@${username}`);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{authorName || 'Usuario'}</DialogTitle>
        </DialogHeader>

        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="followers" className="text-sm">
              {t('authorFollowers')} ({followersCount})
            </TabsTrigger>
            <TabsTrigger value="following" className="text-sm">
              {t('authorFollowing')} ({followingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="followers" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {t('noFollowers')}
              </p>
            ) : (
              <ScrollArea className="max-h-[350px]">
                <div className="space-y-2 pr-2">
                  {profiles.map((profile) => (
                    <FollowerCard
                      key={profile.id}
                      id={profile.id}
                      username={profile.username}
                      name={profile.name}
                      avatar_url={profile.avatar_url}
                      tagline={profile.tagline}
                      isFollowing={followingStatus[profile.id] || false}
                      onFollow={handleFollow}
                      onUnfollow={handleUnfollow}
                      onNavigateToProfile={handleNavigateToProfile}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="following" className="mt-4">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : profiles.length === 0 ? (
              <p className="text-center text-muted-foreground py-8 text-sm">
                {t('noFollowing')}
              </p>
            ) : (
              <ScrollArea className="max-h-[350px]">
                <div className="space-y-2 pr-2">
                  {profiles.map((profile) => (
                    <FollowerCard
                      key={profile.id}
                      id={profile.id}
                      username={profile.username}
                      name={profile.name}
                      avatar_url={profile.avatar_url}
                      tagline={profile.tagline}
                      isFollowing={followingStatus[profile.id] || false}
                      onFollow={handleFollow}
                      onUnfollow={handleUnfollow}
                      onNavigateToProfile={handleNavigateToProfile}
                    />
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
