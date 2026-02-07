import { AppData } from '@/hooks/useApps';
import { useCategories } from '@/hooks/useCategories';
import { useStatuses } from '@/hooks/useStatuses';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, GripVertical } from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';
import { getStatusColors } from '@/lib/appStatusColors';

interface AppCardProps {
  app: AppData;
  onExpand: () => void;
  onToggleVisibility: () => void;
  onVerify: () => void;
  dragHandleProps?: React.HTMLAttributes<HTMLDivElement> & { ref?: React.Ref<any> };
}

export function AppCard({ app, onExpand, onToggleVisibility, onVerify, dragHandleProps }: AppCardProps) {
  const { categories } = useCategories();
  const { statuses } = useStatuses();

  const category = categories.find(c => c.id === app.category_id);
  const status = statuses.find(s => s.id === app.status_id);

  // Get premium status colors
  const statusColors = getStatusColors(status?.slug);

  return (
    <div
      className="group flex items-center gap-4 py-3 px-2 border-b border-gray-100 bg-white hover:bg-gray-50/50 transition-colors cursor-pointer"
      onClick={onExpand}
    >
      {/* Drag Handle - Hide on mobile */}
      <div 
        className="hidden md:flex flex-shrink-0 text-gray-400 cursor-grab hover:text-gray-600 outline-none"
        {...dragHandleProps}
      >
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Logo */}
      <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden border border-gray-100">
        {app.logo_url ? (
          <img src={app.logo_url} alt={app.name || 'App'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-base font-semibold text-gray-400">
            {app.name?.charAt(0) || app.url.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 flex items-center gap-3">
        <div className="flex flex-col gap-0.5 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-medium text-[#1c1c1c] truncate">
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
        
        <div className="hidden md:flex items-center gap-3 ml-auto mr-4">
          {status && (
            <span 
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight border ${statusColors.bg} ${statusColors.text} ${statusColors.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
              {status.name}
            </span>
          )}

        </div>
      </div>

      {/* Visibility Toggle - Hide on mobile */}
      <div 
        onClick={e => e.stopPropagation()}
        className="hidden md:block"
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
