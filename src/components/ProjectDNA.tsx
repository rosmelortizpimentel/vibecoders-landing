import { useTranslation } from '@/hooks/useTranslation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ProjectDNAProps {
  ideationHours: number;
  buildHours: number;
  className?: string;
}

export function ProjectDNA({ ideationHours, buildHours, className = '' }: ProjectDNAProps) {
  const { t } = useTranslation('publicProfile');
  const total = ideationHours + buildHours;
  
  if (total === 0) return null;
  
  const ideationPercent = (ideationHours / total) * 100;
  const buildPercent = (buildHours / total) * 100;
  
  return (
    <TooltipProvider delayDuration={200}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className={`w-full h-1.5 rounded-full overflow-hidden bg-gray-100 flex cursor-default ${className}`}>
            <div 
              className="h-full bg-amber-400 transition-all duration-500" 
              style={{ width: `${ideationPercent}%` }} 
            />
            <div 
              className="h-full bg-indigo-500 transition-all duration-500" 
              style={{ width: `${buildPercent}%` }} 
            />
          </div>
        </TooltipTrigger>
        <TooltipContent side="top" className="p-2 text-[11px] min-w-[120px] bg-white border border-gray-200 shadow-lg text-gray-900">
          <div className="space-y-1">
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 font-medium">{t('ideation')}</span>
              <span className="font-semibold text-gray-900">{ideationHours}h</span>
            </div>
            <div className="flex justify-between gap-4">
              <span className="text-gray-500 font-medium">{t('construction')}</span>
              <span className="font-semibold text-gray-900">{buildHours}h</span>
            </div>
            <div className="pt-1 mt-1 border-t border-gray-100 flex justify-between gap-4">
              <span className="font-bold text-gray-700 uppercase tracking-tight text-[10px]">{t('totalHours')}</span>
              <span className="font-bold text-indigo-600">{total}h</span>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
