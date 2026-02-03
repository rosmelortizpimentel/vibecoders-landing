import { cn } from '@/lib/utils';
import { GitBranch, ArrowRight } from 'lucide-react';

interface TimelineStep {
  title: string;
  description: React.ReactNode;
  isNested?: boolean;
}

interface WorkflowTimelineProps {
  steps: TimelineStep[];
}

export function WorkflowTimeline({ steps }: WorkflowTimelineProps) {
  return (
    <div className="relative pl-6 border-l-2 border-gray-200 space-y-6">
      {steps.map((step, index) => (
        <div key={index} className="relative">
          {/* Timeline dot */}
          <div className="absolute -left-[25px] top-1 w-3 h-3 bg-primary rounded-full border-2 border-white shadow-sm" />
          
          <div className={cn(step.isNested && "ml-4")}>
            <h4 className="font-medium text-gray-900 mb-1 flex items-center gap-2">
              {step.isNested && <GitBranch className="h-4 w-4 text-gray-400" />}
              {step.title}
            </h4>
            <div className="text-sm text-gray-600 leading-relaxed">
              {step.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function BranchDiagram() {
  return (
    <div className="bg-gray-50 rounded-lg p-4 my-4">
      <div className="flex items-center gap-3 text-sm">
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-amber-100 text-amber-800 rounded font-mono text-xs">release</span>
          <span className="text-gray-500">(staging)</span>
        </div>
        <ArrowRight className="h-4 w-4 text-gray-400" />
        <div className="flex items-center gap-2">
          <span className="px-2 py-1 bg-emerald-100 text-emerald-800 rounded font-mono text-xs">main</span>
          <span className="text-gray-500">(production)</span>
        </div>
      </div>
    </div>
  );
}
