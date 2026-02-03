import { cn } from '@/lib/utils';
import { AlertTriangle, Info, CheckCircle } from 'lucide-react';

type CalloutVariant = 'warning' | 'info' | 'success';

interface ProTipCalloutProps {
  variant: CalloutVariant;
  title: string;
  children: React.ReactNode;
}

const variantStyles: Record<CalloutVariant, { border: string; bg: string; icon: typeof AlertTriangle; iconColor: string }> = {
  warning: {
    border: 'border-l-amber-500',
    bg: 'bg-amber-50/50',
    icon: AlertTriangle,
    iconColor: 'text-amber-600',
  },
  info: {
    border: 'border-l-blue-500',
    bg: 'bg-blue-50/50',
    icon: Info,
    iconColor: 'text-blue-600',
  },
  success: {
    border: 'border-l-emerald-500',
    bg: 'bg-emerald-50/50',
    icon: CheckCircle,
    iconColor: 'text-emerald-600',
  },
};

export function ProTipCallout({ variant, title, children }: ProTipCalloutProps) {
  const styles = variantStyles[variant];
  const Icon = styles.icon;

  return (
    <div 
      className={cn(
        "border-l-4 rounded-r-lg p-5",
        styles.border,
        styles.bg
      )}
    >
      <div className="flex items-start gap-3">
        <Icon className={cn("h-5 w-5 mt-0.5 shrink-0", styles.iconColor)} />
        <div>
          <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
          <div className="text-sm text-gray-600 leading-relaxed">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
