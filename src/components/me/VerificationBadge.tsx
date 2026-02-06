 import { ShieldCheck, ShieldQuestion } from 'lucide-react';
 import { cn } from '@/lib/utils';
 
 interface VerificationBadgeProps {
   isVerified: boolean;
   onClick?: (e?: React.MouseEvent) => void;
   className?: string;
 }
 
 export function VerificationBadge({ isVerified, onClick, className }: VerificationBadgeProps) {
   if (isVerified) {
      return (
        <span 
          className={cn(
            "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
            "bg-primary text-primary-foreground",
            className
          )}
        >
          <ShieldCheck className="h-3 w-3" />
          Verificado
        </span>
      );
   }
 
   return (
     <button
       type="button"
       onClick={(e) => {
         e.stopPropagation();
         onClick?.(e);
       }}
       className={cn(
         "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
         "bg-gray-100 text-gray-500 hover:bg-gray-200 hover:text-gray-700 transition-colors cursor-pointer",
         className
       )}
     >
       <ShieldQuestion className="h-3 w-3" />
       Sin Verificar
     </button>
   );
 }