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
}

 export function AppCard({ app, onExpand, onToggleVisibility, onVerify }: AppCardProps) {
  const { categories } = useCategories();
  const { statuses } = useStatuses();

  const category = categories.find(c => c.id === app.category_id);
  const status = statuses.find(s => s.id === app.status_id);

  // Get premium status colors
  const statusColors = getStatusColors(status?.slug);

  return (
    <div
      className="group flex items-center gap-4 p-4 border border-gray-200 rounded-lg bg-white hover:border-[#3D5AFE]/50 transition-colors cursor-pointer shadow-sm"
      onClick={onExpand}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0 text-gray-400 cursor-grab">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Logo */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden">
        {app.logo_url ? (
          <img src={app.logo_url} alt={app.name || 'App'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-gray-500">
            {app.name?.charAt(0) || app.url.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
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
            className="text-gray-400 hover:text-[#3D5AFE]"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        
        {app.tagline && (
          <p className="text-sm text-gray-500 truncate">{app.tagline}</p>
        )}

        {/* Tags */}
        <div className="flex items-center gap-2 mt-2">
           <VerificationBadge 
             isVerified={app.is_verified}
             onClick={() => {
               if (!app.is_verified) onVerify();
             }}
           />
          {status && (
            <span 
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${statusColors.bg} ${statusColors.text}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
              {status.name}
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-gray-100 text-gray-600">
              {category.name}
            </span>
          )}
        </div>
      </div>

      {/* Visibility Toggle */}
      <div onClick={e => e.stopPropagation()}>
        <Switch
          checked={app.is_visible}
          onCheckedChange={onToggleVisibility}
          aria-label="Visibilidad"
        />
      </div>
    </div>
  );
}
