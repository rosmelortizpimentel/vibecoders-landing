import { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StackCardProps {
  icon?: LucideIcon;
  logoSrc?: string;
  logoAlt?: string;
  title: string;
  description: React.ReactNode;
  className?: string;
}

export function StackCard({ icon: Icon, logoSrc, logoAlt, title, description, className }: StackCardProps) {
  return (
    <div 
      className={cn(
        "bg-white border border-gray-200 rounded-xl p-6 hover:border-primary/30 hover:shadow-md transition-all",
        className
      )}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="p-2 bg-primary/5 rounded-lg flex items-center justify-center">
          {logoSrc ? (
            <img 
              src={logoSrc} 
              alt={logoAlt || title} 
              className="h-6 w-6 object-contain"
            />
          ) : Icon ? (
            <Icon className="h-5 w-5 text-primary" />
          ) : null}
        </div>
        <h4 className="font-semibold text-gray-900">{title}</h4>
      </div>
      <div className="text-sm text-gray-600 leading-relaxed">{description}</div>
    </div>
  );
}
