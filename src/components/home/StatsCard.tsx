import { LucideIcon, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface StatsCardProps {
  icon?: LucideIcon;
  title?: string;
  value?: string | number;
  subtitle?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  progress?: number;
  className?: string;
  onClick?: () => void;
  onDoubleClick?: () => void;
  iconVariant?: 'neutral' | 'primary';
  
  // Custom layouts
  rows?: { icon: LucideIcon; label: string; value: string | number }[];
  headline?: { icon: LucideIcon; label: string; highlight?: string };
  split?: { left: { value: string | number, label: string }, right: { value: string | number, label: string } };
  footer?: string;
}

const variantStyles = {
  neutral: { bg: 'bg-muted/50', icon: 'text-muted-foreground' },
  primary: { bg: 'bg-primary/10', icon: 'text-primary' },
};

export function StatsCard({
  icon: Icon,
  title,
  value,
  subtitle,
  trend,
  trendValue,
  action,
  progress,
  className,
  onClick,
  onDoubleClick,
  iconVariant = 'neutral',
  rows,
  headline,
  split,
  footer,
}: StatsCardProps) {
  const CardWrapper = onClick ? 'button' : 'div';

  return (
    <CardWrapper
      onClick={onClick}
      onDoubleClick={onDoubleClick}
      className={cn(
        'bg-card border border-border rounded-xl p-4 transition-all text-left w-full h-full overflow-hidden relative min-w-0',
        onClick && 'hover:border-primary/30 hover:shadow-md hover:-translate-y-0.5 cursor-pointer focus:outline-none focus:ring-2 focus:ring-primary/20',
        className
      )}
    >
      {/* Default Header */}
      {!split && !headline && (
        <div className="flex items-start justify-between mb-3">
          {Icon && (
            <div className={cn("p-2 rounded-lg transition-colors", variantStyles[iconVariant].bg)}>
              <Icon className={cn("w-4 h-4", variantStyles[iconVariant].icon)} strokeWidth={2} />
            </div>
          )}
          {trend && trendValue && (
            <div
              className={cn(
                'flex items-center gap-0.5 text-xs font-medium',
                trend === 'up' && 'text-green-600',
                trend === 'down' && 'text-red-500',
                trend === 'neutral' && 'text-muted-foreground'
              )}
            >
              {trend === 'up' && <ArrowUpRight className="w-3 h-3" />}
              {trend === 'down' && <ArrowDownRight className="w-3 h-3" />}
              {trendValue}
            </div>
          )}
        </div>
      )}

      {/* Type: Engagement (Headline) */}
      {headline && (
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 bg-muted/60 rounded-md">
            <headline.icon className="w-3.5 h-3.5 text-primary" strokeWidth={1.5} />
          </div>
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-tight truncate">
            {headline.label}: <span className="text-foreground">{headline.highlight}</span>
          </span>
        </div>
      )}

      {/* Content Rendering */}
      {rows ? (
        <div className="space-y-3">
          {rows.map((row, idx) => (
             <div key={idx} className="flex items-center justify-between group/row gap-2 min-w-0">
                <div className="flex items-center gap-2 min-w-0 overflow-hidden">
                  <row.icon className="w-4 h-4 text-muted-foreground shrink-0" strokeWidth={1.5} />
                  <span className="text-[13px] font-medium text-muted-foreground truncate">{row.label}</span>
                </div>
                <span className="text-sm font-bold text-foreground shrink-0">{row.value}</span>
             </div>
          ))}
        </div>
      ) : split ? (
        <div className="flex flex-row h-full py-1">
          <div className="flex-1 flex flex-col justify-center border-r border-border pr-3 sm:pr-6 min-w-0">
            <span className="text-xl sm:text-3xl font-bold text-foreground leading-none truncate">{split.left.value}</span>
            <span className="text-[9px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-tight mt-1 truncate">{split.left.label}</span>
          </div>
          <div className="flex-1 flex flex-col justify-center pl-3 sm:pl-6 min-w-0">
            <span className="text-xl sm:text-3xl font-bold text-foreground leading-none truncate">{split.right.value}</span>
            <span className="text-[9px] sm:text-[11px] font-medium text-muted-foreground uppercase tracking-tight mt-1 truncate">{split.right.label}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1">
          <p className="text-2xl font-bold text-primary tracking-tight">{value}</p>
          <p className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wider">{title}</p>
          {subtitle && (
            <p className="text-[11px] text-muted-foreground/80 mt-1">{subtitle}</p>
          )}
        </div>
      )}

      {/* Progress Bar (Identity) */}
      {progress !== undefined && (
        <div className="mt-4">
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, Math.max(0, progress))}%` }}
            />
          </div>
        </div>
      )}

      {/* Footer (Engagement total) */}
      {footer && (
        <div className="mt-4 pt-3 border-t border-border/50">
          <span className="text-[11px] font-medium text-muted-foreground">
            {footer}
          </span>
        </div>
      )}

      {/* Action Button (Identity) */}
      {action && (
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            action.onClick();
          }}
          className="w-full mt-3 h-8 text-xs font-medium text-primary hover:text-primary hover:bg-primary/5 flex items-center justify-center gap-1 transition-colors border border-primary/20"
        >
          {action.label}
          <ArrowUpRight className="w-3 h-3" />
        </Button>
      )}
    </CardWrapper>
  );
}
