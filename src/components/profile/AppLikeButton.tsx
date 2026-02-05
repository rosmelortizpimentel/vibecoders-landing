 import { Heart } from 'lucide-react';
 import { useAppLike } from '@/hooks/useAppLike';
 import { cn } from '@/lib/utils';
 
 interface AppLikeButtonProps {
   appId: string;
   showCount?: boolean;
   isOwner?: boolean;
   ownerLikeCount?: number;
 }
 
 export function AppLikeButton({ appId, showCount = false, isOwner = false, ownerLikeCount }: AppLikeButtonProps) {
   const { isLiked, likeCount, isLoading, toggleLike, isAuthenticated } = useAppLike(appId);
 
   // If owner, show the count from stats
   if (isOwner) {
     const count = ownerLikeCount ?? likeCount;
     if (count === 0) return null;
     
     return (
       <div className="flex items-center gap-1 text-pink-500">
         <Heart className="w-3.5 h-3.5 fill-current" />
         <span className="text-xs font-medium">{count}</span>
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