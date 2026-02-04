import { ArrowRight } from 'lucide-react';

interface FlowStepProps {
  label: string;
  sublabel?: string;
  isFirst?: boolean;
  isLast?: boolean;
}

function FlowStep({ label, sublabel, isFirst, isLast }: FlowStepProps) {
  return (
    <div className="flex items-center">
      <div className={`
        flex flex-col items-center justify-center text-center
        px-3 py-4 sm:px-4 sm:py-5
        bg-white border border-gray-200 rounded-xl
        shadow-sm hover:shadow-md transition-shadow
        min-w-[100px] sm:min-w-[130px]
      `}>
        <span className="text-xs sm:text-sm font-semibold text-gray-900">{label}</span>
        {sublabel && (
          <span className="text-[10px] sm:text-xs text-gray-500 mt-1">{sublabel}</span>
        )}
      </div>
      {!isLast && (
        <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5 text-primary mx-1 sm:mx-2 flex-shrink-0" />
      )}
    </div>
  );
}

export function OgFlowDiagram() {
  const steps = [
    { label: 'LinkedIn', sublabel: 'Scraper' },
    { label: 'Vercel', sublabel: 'Router' },
    { label: 'Vercel', sublabel: 'Function' },
    { label: 'Supabase', sublabel: 'Edge Fn' },
  ];

  return (
    <div className="space-y-6">
      {/* Flow Diagram */}
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 sm:p-6 overflow-x-auto">
        <div className="flex items-center justify-start sm:justify-center min-w-max">
          {steps.map((step, index) => (
            <FlowStep
              key={step.label + index}
              label={step.label}
              sublabel={step.sublabel}
              isFirst={index === 0}
              isLast={index === steps.length - 1}
            />
          ))}
        </div>
      </div>
      
      {/* Result Box */}
      <div className="flex justify-center">
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 sm:p-5 text-center max-w-sm">
          <p className="text-sm font-medium text-gray-900 mb-2">HTML Dinámico</p>
          <div className="font-mono text-xs text-gray-600 space-y-1">
            <p>&lt;og:title&gt; <span className="text-primary">Nombre del Usuario</span></p>
            <p>&lt;og:description&gt; <span className="text-primary">Su Tagline</span></p>
            <p>&lt;og:image&gt; <span className="text-primary">Su Imagen OG</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}
