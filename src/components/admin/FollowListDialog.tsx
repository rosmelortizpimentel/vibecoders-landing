import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ExternalLink, Loader2 } from 'lucide-react';

interface Profile {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
}

interface FollowListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string;
  type: 'followers' | 'following';
}

export function FollowListDialog({ open, onOpenChange, userId, type }: FollowListDialogProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && userId) {
      fetchProfiles();
    }
  }, [open, userId, type]);

  const fetchProfiles = async () => {
    setLoading(true);
    try {
      // Get the follow relationships
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('follower_id, following_id')
        .eq(type === 'followers' ? 'following_id' : 'follower_id', userId);

      if (followsError) throw followsError;

      if (!follows || follows.length === 0) {
        setProfiles([]);
        return;
      }

      // Get the profile IDs based on type
      const profileIds = follows.map((f) =>
        type === 'followers' ? f.follower_id : f.following_id
      );

      // Fetch the profiles
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url')
        .in('id', profileIds);

      if (profilesError) throw profilesError;

      setProfiles(profilesData || []);
    } catch (error) {
      console.error('Error fetching profiles:', error);
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const title = type === 'followers' ? 'Seguidores' : 'Siguiendo';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : profiles.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            No hay {type === 'followers' ? 'seguidores' : 'perfiles seguidos'}
          </p>
        ) : (
          <ScrollArea className="max-h-[400px] pr-4">
            <div className="space-y-3">
              {profiles.map((profile) => (
                <div
                  key={profile.id}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={profile.avatar_url || undefined} alt={profile.name || 'Avatar'} />
                      <AvatarFallback>{getInitials(profile.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{profile.name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">
                        {profile.username ? `@${profile.username}` : 'Sin username'}
                      </p>
                    </div>
                  </div>
                  {profile.username && (
                    <Button variant="ghost" size="sm" asChild>
                      <a
                        href={`/@${profile.username}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" />
                      </a>
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </DialogContent>
    </Dialog>
  );
}
