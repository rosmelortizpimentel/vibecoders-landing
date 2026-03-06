import { useState } from 'react';
import { Heart, MousePointerClick } from 'lucide-react';
 import { useAppLike } from '@/hooks/useAppLike';
import { useAuth } from '@/hooks/useAuth';
 import { cn } from '@/lib/utils';
import { AuthModal } from '../auth/AuthModal';
 
 interface AppLikeButtonProps {
   appId: string;
   showCount?: boolean;
   isOwner?: boolean;
   ownerLikeCount?: number;
   ownerClickCount?: number;
  appName?: string;
 }
 
export function AppLikeButton({ appId, showCount = false, isOwner = false, ownerLikeCount, ownerClickCount, appName }: AppLikeButtonProps) {
  const { isLiked, likeCount, isLoading, toggleLike } = useAppLike(appId);
  const { user, signInWithGoogle } = useAuth();
  const [showAuthDialog, setShowAuthDialog] = useState(false);
 
   // If owner, show the count from stats
   if (isOwner) {
     const count = ownerLikeCount ?? likeCount;
     const clicks = ownerClickCount ?? 0;
     
     // Don't show anything if both are 0
     if (count === 0 && clicks === 0) return null;
     
     return (
       <div className="flex items-center gap-3 text-gray-400">
         {count > 0 && (
           <div className="flex items-center gap-1">
             <Heart className="w-3 h-3" />
             <span className="text-xs">{count}</span>
           </div>
         )}
         {clicks > 0 && (
           <div className="flex items-center gap-1">
             <MousePointerClick className="w-3 h-3" />
             <span className="text-xs">{clicks}</span>
           </div>
         )}
       </div>
     );
   }
 
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      // Save pending like intent
      localStorage.setItem('pendingLike', appId);
      setShowAuthDialog(true);
      return;
    }
    
    toggleLike();
  };
 
  const handleSignIn = async () => {
    try {
      // Save return URL before redirecting
      localStorage.setItem('authReturnUrl', window.location.pathname);
      await signInWithGoogle(window.location.href);
    } catch (error) {
      console.error('Error signing in:', error);
    }
  };

   return (
    <>
      <button
        onClick={handleClick}
        disabled={isLoading}
        className={cn(
          "flex items-center gap-1 transition-colors duration-200 ease-in-out",
          isLiked 
            ? "text-[#EF4444]" 
            : "text-[#D1D5DB] hover:text-[#EF4444]",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <Heart 
          className={cn(
            "w-3.5 h-3.5 transition-all duration-200 ease-in-out",
            isLiked && "fill-current scale-110"
          )} 
        />
        {showCount && likeCount > 0 && (
          <span className={cn(
            "text-xs font-medium",
            isLiked ? "text-[#EF4444]" : "text-[#9CA3AF]"
          )}>{likeCount}</span>
        )}
      </button>

      <AuthModal
        isOpen={showAuthDialog}
        onClose={() => setShowAuthDialog(false)}
        title="Únete a Vibecoders"
        description={appName 
          ? `Inicia sesión para dar like a ${appName} y descubrir más proyectos.`
          : 'Inicia sesión para dar like a este proyecto y descubrir más vibecoders.'
        }
      />
    </>
   );
 }