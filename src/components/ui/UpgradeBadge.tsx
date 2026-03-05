import { cn } from "@/lib/utils";
import { PremiumComparisonModal } from "./PremiumComparisonModal";

interface UpgradeBadgeProps {
  text?: string;
  className?: string;
}

export const UpgradeBadge = ({ text = "Upgrade", className }: UpgradeBadgeProps) => {
  return (
    <PremiumComparisonModal>
      <span 
        className={cn(
          "text-[10px] sm:text-[11px] font-bold underline text-slate-900 dark:text-white cursor-pointer hover:text-primary transition-colors tracking-tight ml-1.5",
          className
        )}
      >
        {text}
      </span>
    </PremiumComparisonModal>
  );
};
