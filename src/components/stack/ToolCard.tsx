import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Tool } from '@/hooks/useToolsStack';
import { ExternalLink } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
  const isFree = tool.pricing_model?.toLowerCase().includes('free') || 
                 tool.pricing_model?.toLowerCase().includes('open source');

  return (
    <a
      href={tool.website_url}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block bg-white border rounded-xl p-4 transition-all duration-200",
        "hover:shadow-md hover:border-primary/50 hover:-translate-y-0.5",
        tool.is_featured 
          ? "border-amber-300 bg-amber-50/30 ring-1 ring-amber-200/50" 
          : "border-stone-200"
      )}
    >
      {/* Header: Logo + Category Badge */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          {tool.logo_url ? (
            <img
              src={tool.logo_url}
              alt={`${tool.name} logo`}
              className="w-10 h-10 rounded-lg object-cover border border-stone-200 flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5 text-stone-400" />
            </div>
          )}

          {/* Name & Tagline */}
          <div className="min-w-0">
            <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-1">
              {tool.name}
            </h3>
            <p className="text-sm text-muted-foreground line-clamp-2 mt-0.5">
              {tool.tagline}
            </p>
          </div>
        </div>

        {/* Featured Star */}
        {tool.is_featured && (
          <span className="text-amber-500 flex-shrink-0" title="Destacado">
            ⭐
          </span>
        )}
      </div>

      {/* Footer: Category & Pricing */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-stone-100">
        <Badge variant="outline" className="text-xs font-normal text-muted-foreground">
          {tool.category}
        </Badge>
        
        {tool.pricing_model && (
          <Badge 
            className={cn(
              "text-xs font-normal",
              isFree 
                ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50" 
                : "bg-stone-100 text-stone-600 border-stone-200 hover:bg-stone-100"
            )}
          >
            {tool.pricing_model}
          </Badge>
        )}
      </div>
    </a>
  );
}
