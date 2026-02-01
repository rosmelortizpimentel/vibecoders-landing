import { Star } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PioneerBadgeProps {
  className?: string;
}

export function PioneerBadge({ className = '' }: PioneerBadgeProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-700 border border-amber-200 cursor-default ${className}`}
          >
            <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
            PIONEER
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>Early Founding Member</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
