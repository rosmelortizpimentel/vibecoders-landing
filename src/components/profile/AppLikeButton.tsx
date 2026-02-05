import { useState } from 'react';
import { Heart, MousePointerClick } from 'lucide-react';
 import { useAppLike } from '@/hooks/useAppLike';
import { useAuth } from '@/hooks/useAuth';
 import { cn } from '@/lib/utils';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
 
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
          "flex items-center gap-1 transition-all duration-200",
          isLiked 
            ? "text-pink-500" 
            : "text-gray-400 hover:text-pink-500",
          isLoading && "opacity-50 cursor-not-allowed"
        )}
      >
        <Heart 
          className={cn(
            "w-3.5 h-3.5 transition-transform",
            isLiked && "fill-current scale-110"
          )} 
        />
        {showCount && likeCount > 0 && (
          <span className="text-xs font-medium">{likeCount}</span>
        )}
      </button>

      <Dialog open={showAuthDialog} onOpenChange={setShowAuthDialog}>
        <DialogContent className="sm:max-w-md bg-[#3D5AFE] border-none text-white">
          <DialogHeader className="text-center">
            <div className="flex justify-center mb-4">
              <img 
                src={vibecodersLogo} 
                alt="Vibecoders" 
                className="h-16 w-16 rounded-full border-[3px] border-white shadow-lg"
              />
            </div>
            <DialogTitle className="text-xl text-white text-center">
              Únete a Vibecoders
            </DialogTitle>
            <DialogDescription className="text-center text-white/90">
              {appName 
                ? `Inicia sesión para dar like a ${appName} y descubrir más proyectos.`
                : 'Inicia sesión para dar like a este proyecto y descubrir más vibecoders.'
              }
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex flex-col gap-3 mt-4">
            <Button
              onClick={handleSignIn}
              className="w-full bg-[#1c1c1c] hover:bg-[#2c2c2c] text-white"
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
              Continuar con Google
            </Button>
            
            <Button
              variant="ghost"
              onClick={() => setShowAuthDialog(false)}
              className="text-white/70 hover:text-white hover:bg-white/10"
            >
              Ahora no
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
   );
 }