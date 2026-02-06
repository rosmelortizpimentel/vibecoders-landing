import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useContributorBadgeUrl } from '@/hooks/useGeneralSettings';

interface ContributorBadgeProps {
  className?: string;
}

export function ContributorBadge({ className = '' }: ContributorBadgeProps) {
  const { contributorBadgeUrl, isLoading } = useContributorBadgeUrl();

  if (isLoading || !contributorBadgeUrl) {
    return null;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <img 
            src={contributorBadgeUrl}
            alt="Contributor Badge"
            className={`w-[30px] h-[30px] rounded-full object-cover cursor-default ${className}`}
          />
        </TooltipTrigger>
        <TooltipContent>
          <p>Contributor</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
