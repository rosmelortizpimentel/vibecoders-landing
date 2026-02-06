import { useTranslation } from '@/hooks/useTranslation';
import { Badge } from '@/components/ui/badge';
import { Circle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type FeedbackStatus = 'open' | 'in_review' | 'closed';

interface FeedbackStatusBadgeProps {
  status: FeedbackStatus;
  className?: string;
}

export function FeedbackStatusBadge({ status, className }: FeedbackStatusBadgeProps) {
  const { t } = useTranslation('beta');

  const config: Record<FeedbackStatus, { label: string; icon: React.ReactNode; variant: string }> = {
    open: {
      label: t('feedbackOpen'),
      icon: <Circle className="w-3 h-3" />,
      variant: 'bg-blue-500/10 text-blue-600 border-blue-200',
    },
    in_review: {
      label: t('feedbackInReview'),
      icon: <AlertCircle className="w-3 h-3" />,
      variant: 'bg-yellow-500/10 text-yellow-600 border-yellow-200',
    },
    closed: {
      label: t('feedbackClosed'),
      icon: <CheckCircle2 className="w-3 h-3" />,
      variant: 'bg-muted text-muted-foreground border-muted',
    },
  };

  const { label, icon, variant } = config[status] || config.open;

  return (
    <Badge 
      variant="outline" 
      className={cn('gap-1 text-xs font-normal', variant, className)}
    >
      {icon}
      {label}
    </Badge>
  );
}
