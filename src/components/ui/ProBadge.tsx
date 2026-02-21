import { Crown } from "lucide-react";
import { cn } from "@/lib/utils";

interface ProBadgeProps {
  className?: string;
}

export function ProBadge({ className }: ProBadgeProps) {
  return (
    <div className={cn("inline-flex items-center justify-center gap-[3px] bg-transparent px-[6px] py-[1px] rounded-[4px] border border-border/60 transition-all flex-shrink-0 w-fit", className)}>
      <Crown className="w-[10px] h-[10px] text-muted-foreground stroke-[2px]" />
      <span className="text-[9px] font-bold uppercase tracking-wider text-muted-foreground leading-none mt-[1px]">Pro</span>
    </div>
  );
}
