import { AppData } from '@/hooks/useApps';
import { useCategories } from '@/hooks/useCategories';
import { useStatuses } from '@/hooks/useStatuses';
import { Switch } from '@/components/ui/switch';
import { ExternalLink, GripVertical } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface AppCardProps {
  app: AppData;
  onExpand: () => void;
  onToggleVisibility: () => void;
}

export function AppCard({ app, onExpand, onToggleVisibility }: AppCardProps) {
  const { categories } = useCategories();
  const { statuses } = useStatuses();

  const category = categories.find(c => c.id === app.category_id);
  const status = statuses.find(s => s.id === app.status_id);

  // Get icon component dynamically
  const getIcon = (iconName: string) => {
    const pascalCase = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string }>>)[pascalCase];
  };

  const StatusIcon = status ? getIcon(status.icon) : null;

  return (
    <div 
      className="group flex items-center gap-4 p-4 border border-border rounded-lg bg-card hover:border-primary/50 transition-colors cursor-pointer"
      onClick={onExpand}
    >
      {/* Drag Handle */}
      <div className="flex-shrink-0 text-muted-foreground/50 cursor-grab">
        <GripVertical className="h-5 w-5" />
      </div>

      {/* Logo */}
      <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden">
        {app.logo_url ? (
          <img src={app.logo_url} alt={app.name || 'App'} className="w-full h-full object-cover" />
        ) : (
          <span className="text-lg font-semibold text-muted-foreground">
            {app.name?.charAt(0) || app.url.charAt(0).toUpperCase()}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-foreground truncate">
            {app.name || new URL(app.url).hostname}
          </h3>
          <a
            href={app.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={e => e.stopPropagation()}
            className="text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
        
        {app.tagline && (
          <p className="text-sm text-muted-foreground truncate">{app.tagline}</p>
        )}

        {/* Tags */}
        <div className="flex items-center gap-2 mt-2">
          {status && StatusIcon && (
            <span 
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium"
              style={{ backgroundColor: `${status.color}20`, color: status.color }}
            >
              <StatusIcon className="h-3 w-3" />
              {status.name}
            </span>
          )}
          {category && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-muted text-muted-foreground">
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
