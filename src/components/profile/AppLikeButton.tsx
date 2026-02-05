 import { Heart, MousePointerClick } from 'lucide-react';
 import { useAppLike } from '@/hooks/useAppLike';
 import { cn } from '@/lib/utils';
 
 interface AppLikeButtonProps {
   appId: string;
   showCount?: boolean;
   isOwner?: boolean;
   ownerLikeCount?: number;
   ownerClickCount?: number;
 }
 
 export function AppLikeButton({ appId, showCount = false, isOwner = false, ownerLikeCount, ownerClickCount }: AppLikeButtonProps) {
   const { isLiked, likeCount, isLoading, toggleLike, isAuthenticated } = useAppLike(appId);
 
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
 
   // For non-authenticated users, don't show the button
   if (!isAuthenticated) return null;
 
   return (
     <button
       onClick={(e) => {
         e.preventDefault();
         e.stopPropagation();
         toggleLike();
       }}
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
   );
 }