import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { FollowerCard } from './FollowerCard';
import { useFollowList } from '@/hooks/useFollowList';
import { useFollowAction } from '@/hooks/useFollowAction';

interface FollowersListProps {
  profileId: string;
  type: 'followers' | 'following';
  onBack: () => void;
  onNavigateToProfile: (username: string) => void;
}

export function FollowersList({
  profileId,
  type,
  onBack,
  onNavigateToProfile,
}: FollowersListProps) {
  const { profiles, loading, refetch } = useFollowList(profileId, type);
  const { follow, unfollow } = useFollowAction();

  const handleFollow = async (userId: string): Promise<boolean> => {
    const success = await follow(userId);
    if (success) {
      refetch();
    }
    return success;
  };

  const handleUnfollow = async (userId: string): Promise<boolean> => {
    const success = await unfollow(userId);
    if (success) {
      refetch();
    }
    return success;
  };

  const title = type === 'followers' ? 'Seguidores' : 'Siguiendo';

  return (
    <div className="border-t border-gray-100 px-4 md:px-6 py-4 bg-gray-50/50">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBack}
          className="text-gray-600 hover:text-gray-900 -ml-2"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          Volver a Apps
        </Button>
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide">
          {title} ({profiles.length})
        </p>
      </div>

      {/* Content */}
      {loading ? (
        <div className="space-y-2">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-3 w-16" />
              </div>
              <Skeleton className="h-8 w-20" />
            </div>
          ))}
        </div>
      ) : profiles.length === 0 ? (
        <div className="text-center py-8 text-gray-500 text-sm">
          {type === 'followers'
            ? 'Aún no tiene seguidores'
            : 'Aún no sigue a nadie'}
        </div>
      ) : (
        <div className="space-y-2">
          {profiles.map((profile) => (
            <FollowerCard
              key={profile.id}
              id={profile.id}
              username={profile.username}
              name={profile.name}
              avatar_url={profile.avatar_url}
              tagline={profile.tagline}
              isFollowing={profile.isFollowing}
              onFollow={handleFollow}
              onUnfollow={handleUnfollow}
              onNavigateToProfile={onNavigateToProfile}
            />
          ))}
        </div>
      )}
    </div>
  );
}
