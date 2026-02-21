import { AppData } from '@/hooks/useApps';
import { useCategories } from '@/hooks/useCategories';
import { useStatuses } from '@/hooks/useStatuses';
import { Switch } from '@/components/ui/switch';
import { GripVertical } from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';
import { getStatusColors } from '@/lib/appStatusColors';

interface AppCardProps {
  app: AppData;
  onExpand: () => void;
  onToggleVisibility: () => void;
  onVerify: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<HTMLDivElement> };
}

export function AppCard({ app, onExpand, onToggleVisibility, onVerify, dragHandleProps }: AppCardProps) {
  const { categories } = useCategories();
  const { statuses } = useStatuses();

  const category = categories.find(c => c.id === app.category_id);
  const status = statuses.find(s => s.id === app.status_id);
  const statusColors = getStatusColors(status?.slug);

  return (
    <div
      className="group flex items-center gap-2 sm:gap-4 py-3 px-3 bg-card hover:bg-[#f9fafb] transition-all duration-200 cursor-pointer overflow-hidden relative"
      onClick={onExpand}
    >
      {/* Drag Handle - Hide on mobile */}
      <div 
        className="hidden md:flex flex-shrink-0 text-muted-foreground cursor-grab hover:text-foreground outline-none"
        {...dragHandleProps}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Logo */}
      <div className="flex-shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden border border-border">
        {app.logo_url ? (
          <img src={app.logo_url} alt={app.name || 'App'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-sm sm:text-base font-semibold text-muted-foreground">
            {app.name?.charAt(0) || app.url.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center gap-2 sm:gap-3">
        <div className="flex flex-col gap-0.5 min-w-0 flex-1">
          <div className="flex items-center gap-1.5 sm:gap-2">
            <h3 className="font-medium text-foreground truncate text-sm sm:text-base">
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
            </h3>
            <VerificationBadge 
              isVerified={app.is_verified}
              onClick={() => {
                if (!app.is_verified) onVerify();
              }}
            />
          </div>
          
          <a
            href={(() => {
              const normalized = app.url.trim();
              return normalized.startsWith('http://') || normalized.startsWith('https://') 
                ? normalized 
                : `https://${normalized}`;
            })()}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-xs text-muted-foreground hover:text-primary hover:underline truncate w-fit"
          >
            {(() => {
              try { 
                const normalized = app.url.trim();
                const urlWithProtocol = normalized.startsWith('http://') || normalized.startsWith('https://') 
                  ? normalized 
                  : `https://${normalized}`;
                return new URL(urlWithProtocol).hostname; 
              } catch { 
                return app.url; 
              } 
            })()}
          </a>
        </div>
        
        {/* Status badge - visible on all screens */}
        {status && (
          <span 
            className={`inline-flex items-center gap-1 sm:gap-1.5 px-1.5 sm:px-2.5 py-0.5 rounded-full text-[9px] sm:text-[10px] font-bold uppercase tracking-tight border shrink-0 ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
          >
            <span className={`w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full ${statusColors.dot}`} />
            <span className="hidden min-[400px]:inline">{status.name}</span>
          </span>
        )}
      </div>

      {/* Visibility Toggle - always visible */}
      <div 
        onClick={e => e.stopPropagation()}
        className="shrink-0"
      >
        <Switch
          checked={app.is_visible}
          onCheckedChange={onToggleVisibility}
          aria-label="Visibilidad"
        />
      </div>
    </div>
  );
}
