import { ExternalLink } from 'lucide-react';
import { AppData } from '@/hooks/useApps';
import { Status } from '@/hooks/useStatuses';
import { TechStack } from '@/hooks/useTechStacks';

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
      {/* Top Row: Logo + Title + Status + Visit Button */}
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
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {app.name || new URL(app.url).hostname}
            </h4>
            
            {/* Status Badge - Soft Brand Blue theme */}
            {status && (
              <span 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700"
              >
                <span 
                  className={`w-1.5 h-1.5 rounded-full ${
                    status.slug === 'active' || status.slug === 'live' 
                      ? 'bg-cyan-500' 
                      : 'bg-blue-500'
                  }`}
                />
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

          {/* Tech Stack Row */}
          {appStacks.length > 0 && (
            <div className="flex items-center gap-1.5 mt-2 flex-wrap">
              {appStacks.map(stack => (
                <span 
                  key={stack.id}
                  className="group/stack inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-gray-100 text-[10px] text-gray-600 transition-colors hover:bg-gray-200"
                >
                  <img 
                    src={stack.logo_url} 
                    alt={stack.name}
                    className="w-3 h-3 object-contain grayscale opacity-70 transition-all duration-200 group-hover/stack:grayscale-0 group-hover/stack:opacity-100"
                  />
                  {stack.name}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Visit Button */}
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition-colors flex-shrink-0">
          Visitar
          <ExternalLink className="w-3 h-3" />
        </span>
      </div>
    </a>
  );
}
