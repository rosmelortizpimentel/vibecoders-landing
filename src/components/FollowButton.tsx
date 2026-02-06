import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { UserPlus, UserCheck, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { UnfollowConfirmDialog } from './profile/UnfollowConfirmDialog';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
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

      {/* Auth Dialog */}
      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md bg-primary border-none text-primary-foreground">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={vibecodersLogo} 
                alt="Vibecoders" 
                className="h-16 w-16 rounded-full border-[3px] border-white shadow-lg"
              />
            </div>
            <DialogTitle className="text-xl text-primary-foreground text-center">
              Vibecoders
            </DialogTitle>
            <DialogDescription className="text-center text-primary-foreground/90">
              {profileUsername 
                ? `${tAuth.signIn} @${profileUsername}`
                : tAuth.signIn
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleSignIn}
              className="w-full bg-foreground hover:bg-foreground/90 text-background"
            >
              <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              {tAuth.signInWithGoogle}
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setShowAuthDialog(false)}
              className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10"
            >
              {/* Not now */}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

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
