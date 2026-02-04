import { useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { UnfollowConfirmDialog } from './UnfollowConfirmDialog';

interface FollowerCardProps {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  tagline: string | null;
  isFollowing: boolean;
  onFollow: (userId: string) => Promise<boolean>;
  onUnfollow: (userId: string) => Promise<boolean>;
  onNavigateToProfile: (username: string) => void;
}

export function FollowerCard({
  id,
  username,
  name,
  avatar_url,
  tagline,
  isFollowing: initialIsFollowing,
  onFollow,
  onUnfollow,
  onNavigateToProfile,
}: FollowerCardProps) {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const [isProcessing, setIsProcessing] = useState(false);
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const isOwnProfile = user?.id === id;

  const handleFollow = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user || isProcessing) return;

    setIsProcessing(true);
    setIsFollowing(true); // Optimistic update
    
    const success = await onFollow(id);
    if (!success) {
      setIsFollowing(false); // Revert on failure
    }
    setIsProcessing(false);
  };

  const handleUnfollowClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowUnfollowDialog(true);
  };

  const handleUnfollowConfirm = async () => {
    if (isProcessing) return;

    setIsProcessing(true);
    setIsFollowing(false); // Optimistic update
    
    const success = await onUnfollow(id);
    if (!success) {
      setIsFollowing(true); // Revert on failure
    }
    setIsProcessing(false);
    setShowUnfollowDialog(false);
  };

  const handleCardClick = () => {
    if (username) {
      onNavigateToProfile(username);
    }
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
      >
        {/* Avatar */}
        <Avatar className="h-10 w-10 flex-shrink-0">
          <AvatarImage src={avatar_url || ''} alt={name || ''} />
          <AvatarFallback className="text-sm font-medium bg-gray-100 text-gray-600">
            {name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 truncate">
            {name || 'Usuario'}
          </p>
          <p className="text-xs text-gray-500 truncate">
            @{username || 'usuario'}
          </p>
          {tagline && (
            <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
              {tagline}
            </p>
          )}
        </div>

        {/* Follow Button - Don't show for own profile */}
        {!isOwnProfile && user && (
          <Button
            size="sm"
            variant={isFollowing ? 'outline' : 'default'}
            onClick={isFollowing ? handleUnfollowClick : handleFollow}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            disabled={isProcessing}
            className={cn(
              'flex-shrink-0 min-w-[100px] text-xs h-8',
              isFollowing && !isHovering && 'border-gray-300 text-gray-700 bg-white',
              isFollowing && isHovering && 'border-red-300 text-red-600 bg-red-50 hover:bg-red-100 hover:border-red-400'
            )}
          >
            {isProcessing
              ? '...'
              : isFollowing
              ? isHovering
                ? 'Dejar de seguir'
                : 'Siguiendo'
              : 'Seguir'}
          </Button>
        )}
      </div>

      <UnfollowConfirmDialog
        isOpen={showUnfollowDialog}
        onClose={() => setShowUnfollowDialog(false)}
        onConfirm={handleUnfollowConfirm}
        user={{ name, username, avatar_url }}
        isLoading={isProcessing}
      />
    </>
  );
}
