import { Lock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface BuildLogEntry {
  id: string;
  number: string;
  title: string;
  subtitle: string;
  isActive?: boolean;
  isLocked?: boolean;
}

const entries: BuildLogEntry[] = [
  {
    id: '01',
    number: '01',
    title: 'El Stack & Arquitectura',
    subtitle: 'Lovable, Supabase & Vercel.',
    isActive: true,
  },
  {
    id: '02',
    number: '02',
    title: 'Filosofía de Diseño AI',
    subtitle: 'Por qué prohibí los emojis.',
    isLocked: true,
  },
  {
    id: '03',
    number: '03',
    title: 'Workflow Profesional',
    subtitle: 'Estrategia de Ramas & Deploy.',
    isLocked: true,
  },
  {
    id: '04',
    number: '04',
    title: 'Optimización de Costos',
    subtitle: 'Cuándo dejar Lovable.',
    isLocked: true,
  },
];

export function BuildLogSidebar() {
  return (
    <aside className="lg:sticky lg:top-24 h-fit">
      <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-gray-500 mb-6 flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Build Log
        </h3>
        
        <nav className="space-y-1">
          {entries.map((entry) => (
            <BuildLogMenuItem key={entry.id} entry={entry} />
          ))}
        </nav>
      </div>
    </aside>
  );
}

function BuildLogMenuItem({ entry }: { entry: BuildLogEntry }) {
  const content = (
    <div
      className={cn(
        "group relative flex flex-col px-4 py-3 rounded-lg transition-all cursor-pointer",
        entry.isActive 
          ? "bg-primary/5 border-l-2 border-primary" 
          : "hover:bg-gray-50 border-l-2 border-transparent",
        entry.isLocked && "opacity-60"
      )}
    >
      <div className="flex items-center justify-between">
        <span 
          className={cn(
            "text-sm font-medium",
            entry.isActive ? "text-primary" : "text-gray-700"
          )}
        >
          {entry.number}. {entry.title}
        </span>
        {entry.isLocked && (
          <Lock className="h-3.5 w-3.5 text-gray-400" />
        )}
      </div>
      <span className="text-xs text-gray-500 mt-0.5">
        {entry.subtitle}
      </span>
    </div>
  );

  if (entry.isLocked) {
    return (
      <Tooltip>
        <TooltipTrigger asChild>
          {content}
        </TooltipTrigger>
        <TooltipContent side="left" className="bg-gray-900 text-white">
          <p className="text-sm">Próximamente</p>
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}
