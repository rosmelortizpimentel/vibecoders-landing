import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
}

export function ProBadge({ className }: ProBadgeProps) {
  return (
    <div className={cn("inline-flex items-center justify-center gap-[4px] bg-black px-[6px] py-[3px] rounded-[4px] shadow-sm transition-all flex-shrink-0 w-fit", className)}>
      <Crown className="w-[10px] h-[10px] text-white stroke-[2.5px]" />
      <span className="text-[9px] font-extrabold uppercase tracking-widest text-white leading-none mt-[1px]">Pro</span>
    </div>
  );
}
