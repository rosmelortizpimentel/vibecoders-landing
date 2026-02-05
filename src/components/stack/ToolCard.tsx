import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
 import { type Tool, buildReferralUrl } from '@/hooks/useToolsStack';
import { ExternalLink, Star } from 'lucide-react';

interface ToolCardProps {
  tool: Tool;
}

export function ToolCard({ tool }: ToolCardProps) {
   const href = buildReferralUrl(tool);
 
  return (
    <a
       href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={cn(
        "group block bg-card border border-border rounded-lg p-4 transition-all duration-200",
        "hover:border-primary hover:shadow-sm"
      )}
    >
      {/* Header: Logo + Name + Featured */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          {/* Logo */}
          {tool.logo_url ? (
            <img
              src={tool.logo_url}
              alt={`${tool.name} logo`}
              className="w-10 h-10 rounded-lg object-cover border border-border flex-shrink-0"
            />
          ) : (
            <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
              <ExternalLink className="w-5 h-5 text-muted-foreground" />
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

        {/* Featured indicator - subtle icon */}
        {tool.is_featured && (
          <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />
        )}
      </div>

      {/* Footer: Category & Pricing */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
        <Badge variant="secondary" className="text-xs font-normal">
          {tool.category}
        </Badge>
        
        {tool.pricing_model && (
          <Badge variant="outline" className="text-xs font-normal">
            {tool.pricing_model}
          </Badge>
        )}
      </div>
    </a>
  );
}
