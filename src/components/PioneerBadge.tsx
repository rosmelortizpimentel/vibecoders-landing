import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { usePioneerBadgeUrl } from '@/hooks/useGeneralSettings';

interface PioneerBadgeProps {
  className?: string;
}

export function PioneerBadge({ className = '' }: PioneerBadgeProps) {
  const { pioneerBadgeUrl, isLoading } = usePioneerBadgeUrl();

  if (isLoading || !pioneerBadgeUrl) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <img 
            src={pioneerBadgeUrl}
            alt="Pioneer Badge"
            className={`w-4 h-4 rounded-full object-cover cursor-default ${className}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Early Founding Member</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
