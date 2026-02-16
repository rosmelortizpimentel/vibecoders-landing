import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { AuthModal } from './auth/AuthModal';
import { UnfollowConfirmDialog } from './profile/UnfollowConfirmDialog';
import { cn } from '@/lib/utils';

interface FollowButtonProps {
  isFollowing: boolean;
  isLoading: boolean;
  onToggleFollow: () => Promise<void>;
  profileUsername: string | null;
  profileId: string | null;
  profileName?: string | null;
  profileAvatarUrl?: string | null;
}

export function FollowButton({ 
  isFollowing, 
  isLoading, 
  onToggleFollow,
  profileUsername,
  profileId,
  profileName,
  profileAvatarUrl
}: FollowButtonProps) {
  const { user, signInWithGoogle } = useAuth();
  const t = useTranslation('publicProfile');
  const tAuth = useTranslation('auth');
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [showUnfollowDialog, setShowUnfollowDialog] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isHovering, setIsHovering] = useState(false);

  const handleClick = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      setShowAuthDialog(true);
      return;
    }
    
    if (isFollowing) {
      setShowUnfollowDialog(true);
      return;
    }
    
    await performToggleFollow();
  };

  const performToggleFollow = async () => {
    setIsSubmitting(true);
    try {
      await onToggleFollow();
    } finally {
      setIsSubmitting(false);
      setShowUnfollowDialog(false);
    }
  };

  const handleSignIn = async () => {
    try {
      // Save pending follow intent before redirecting
      if (profileId) {
        localStorage.setItem('pendingFollow', profileId);
      }
      
      // Save return URL and redirect back after login
      localStorage.setItem('authReturnUrl', window.location.pathname);
      await signInWithGoogle(window.location.href);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

  const buttonLoading = isLoading || isSubmitting;

  return (
    <>
      <Button
        variant={isFollowing ? "outline" : "default"}
        size="sm"
        onClick={handleClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        disabled={buttonLoading}
        className={cn(
          "rounded-full px-4 h-9 font-medium transition-all min-w-[120px]",
          isFollowing && !isHovering && "bg-white border-gray-200 text-[#1c1c1c] hover:bg-gray-50",
          isFollowing && isHovering && "border-red-200 bg-red-50 text-red-600 hover:bg-red-100 hover:text-red-700 hover:border-red-300",
          !isFollowing && "bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/90"
        )}
      >
        {buttonLoading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : isFollowing ? (
          <>
            <UserCheck className="h-4 w-4 mr-1.5" />
            {isHovering ? t.unfollow : t.following}
          </>
        ) : (
          <>
            <UserPlus className="h-4 w-4 mr-1.5" />
            {t.follow}
          </>
        )}
      </Button>

      <AuthModal
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        title={tAuth.signIn}
        description={profileUsername 
          ? `${tAuth.signIn} @${profileUsername}`
          : tAuth.signIn
        }
      />

      {/* Unfollow Confirmation */}
      <UnfollowConfirmDialog
        isOpen={showUnfollowDialog}
        onClose={() => setShowUnfollowDialog(false)}
        onConfirm={performToggleFollow}
        user={{
          name: profileName || null,
          username: profileUsername,
          avatar_url: profileAvatarUrl || null
        }}
        isLoading={isSubmitting}
      />
    </>
  );
}
