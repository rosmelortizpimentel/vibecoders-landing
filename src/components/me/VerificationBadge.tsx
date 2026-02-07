import { BadgeCheck, ShieldQuestion } from 'lucide-react';
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
          "inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-tight",
          "bg-black text-white",
          className
        )}
      >
        <BadgeCheck className="h-3.5 w-3.5" />
        <span className="hidden md:inline">{t('verified')}</span>
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
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono uppercase tracking-wider border border-yellow-600/50",
        // Technical/Outline style (High-end)
        "bg-white text-yellow-700 hover:bg-yellow-50 transition-colors cursor-pointer",
        className
      )}
    >
      <ShieldQuestion className="h-3 w-3" />
      <span className="hidden md:inline">{t('verifyDomain')}</span>
    </button>
  );
}