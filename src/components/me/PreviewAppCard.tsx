import { ExternalLink, BadgeCheck } from 'lucide-react';
import { AppData } from '@/hooks/useApps';
import { Status } from '@/hooks/useStatuses';
import { TechStack } from '@/hooks/useTechStacks';
import { getStatusColors } from '@/lib/appStatusColors';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PreviewAppCardProps {
  app: AppData;
  statuses: Status[];
  stacks: TechStack[];
  appUrl: string;
}

export function PreviewAppCard({ app, statuses, stacks, appUrl }: PreviewAppCardProps) {
  // Find the status for this app
  const status = app.status_id 
    ? statuses.find(s => s.id === app.status_id) 
    : null;

  // Get premium status colors
  const statusColors = getStatusColors(status?.slug);

  // Find the tech stacks for this app (max 4, sorted alphabetically)
  const appStacks = (app.stacks || [])
    .map(stackId => stacks.find(s => s.id === stackId))
    .filter((s): s is TechStack => s !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 4);

  return (
    <a 
      href={appUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Top Row: Logo + Title + Status */}
      <div className="flex items-start gap-3">
        {/* App Logo */}
        {app.logo_url ? (
          <img 
            src={app.logo_url} 
            alt={app.name || ''} 
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-gray-500">
              {app.name?.charAt(0) || '?'}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row with Status Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {app.name || (() => { 
                try { 
                  const normalized = app.url.trim();
                  const urlWithProtocol = normalized.startsWith('http://') || normalized.startsWith('https://') 
                    ? normalized 
                    : `https://${normalized}`;
                  return new URL(urlWithProtocol).hostname; 
                } catch { 
                  return 'App'; 
                } 
              })()}
            </h4>
            
            {/* Verified Badge */}
            {app.is_verified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <BadgeCheck className="h-4 w-4 text-primary flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Propietario Verificado
                </TooltipContent>
              </Tooltip>
            )}

            {/* Status Badge - Premium colors */}
            {status && (
              <span 
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors.bg} ${statusColors.text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                {status.name}
              </span>
            )}
          </div>

          {/* Tagline */}
          {app.tagline && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {app.tagline}
            </p>
          )}
        </div>

        {/* Icon-only Visit Button */}
        <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors flex-shrink-0">
          <ExternalLink className="w-4 h-4" />
        </span>
      </div>

      {/* Bottom Row: Tech Stack Icons Only */}
      {appStacks.length > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
          <TooltipProvider delayDuration={200}>
            {appStacks.map(stack => (
              <Tooltip key={stack.id}>
                <TooltipTrigger asChild>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img 
                      src={stack.logo_url} 
                      alt={stack.name}
                      className="w-5 h-5 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {stack.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}
    </a>
  );
}
