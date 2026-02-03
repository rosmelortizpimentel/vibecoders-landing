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
    border: 'border-l-gray-400',
    bg: 'bg-gray-50',
    icon: AlertTriangle,
    iconColor: 'text-gray-600',
  },
  info: {
    border: 'border-l-primary',
    bg: 'bg-primary/5',
    icon: Info,
    iconColor: 'text-primary',
  },
  success: {
    border: 'border-l-primary',
    bg: 'bg-white border border-gray-100',
    icon: CheckCircle,
    iconColor: 'text-primary',
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
