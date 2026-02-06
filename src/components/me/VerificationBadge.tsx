import { ShieldCheck, ShieldQuestion } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

interface VerificationBadgeProps {
  isVerified: boolean;
  onClick?: (e?: React.MouseEvent) => void;
  className?: string;
}

export function VerificationBadge({ isVerified, onClick, className }: VerificationBadgeProps) {
  const { t } = useTranslation('apps');

  if (isVerified) {
    return (
      <span 
        className={cn(
          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
          "bg-primary text-primary-foreground",
          className
        )}
      >
        <ShieldCheck className="h-3 w-3" />
        {t('verified')}
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(e);
      }}
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium",
        // Matte red premium background for unverified state
        "bg-rose-100 text-rose-700 hover:bg-rose-200 hover:text-rose-800 transition-colors cursor-pointer",
        className
      )}
    >
      <ShieldQuestion className="h-3 w-3" />
      {t('verifyDomain')}
    </button>
  );
}