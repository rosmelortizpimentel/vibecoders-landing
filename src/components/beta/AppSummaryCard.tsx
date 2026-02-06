import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AppLikeButton } from '@/components/profile/AppLikeButton';
import { 
  ExternalLink, 
  CheckCircle2, 
  Globe,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TechStack {
  id: string;
  name: string;
  logo_url: string;
}

interface AppStatus {
  id: string;
  name: string;
  slug: string;
  color: string;
  icon: string;
}

interface AppSummaryCardProps {
  appId: string;
  name: string | null;
  tagline: string | null;
  logoUrl: string | null;
  url: string;
  isVerified: boolean;
  status: AppStatus | null;
  stacks: TechStack[];
  appName?: string;
}

export function AppSummaryCard({
  appId,
  name,
  tagline,
  logoUrl,
  url,
  isVerified,
  status,
  stacks,
}: AppSummaryCardProps) {
  const { t } = useTranslation('beta');

  const normalizedUrl = (() => {
    const trimmed = url.trim();
    return trimmed.startsWith('http://') || trimmed.startsWith('https://') 
      ? trimmed 
      : `https://${trimmed}`;
  })();

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex gap-4">
          {/* Logo */}
          <div className="flex-shrink-0">
            {logoUrl ? (
              <img
                src={logoUrl}
                alt={name || 'App'}
                className="w-14 h-14 rounded-full object-cover border-2 border-muted"
              />
            ) : (
              <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center border-2 border-muted">
                <Globe className="w-7 h-7 text-muted-foreground" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Header Row */}
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0 flex-1">
                {/* Name with verification and status */}
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="font-semibold text-lg truncate">
                    {name || 'Untitled App'}
                  </h2>
                  {isVerified && (
                    <CheckCircle2 className="w-[18px] h-[18px] text-primary-foreground bg-primary rounded-full flex-shrink-0" />
                  )}
                  {status && (
                    <Badge 
                      variant="outline"
                      className="gap-1 text-xs border-border text-muted-foreground"
                    >
                      {status.name}
                    </Badge>
                  )}
                </div>

                {/* Tagline */}
                {tagline && (
                  <p className="text-sm text-muted-foreground mt-0.5 line-clamp-2">
                    {tagline}
                  </p>
                )}
              </div>

              {/* External Link Button */}
              <Button
                variant="ghost"
                size="icon"
                className="flex-shrink-0 -mt-1 -mr-1"
                asChild
              >
                <a 
                  href={normalizedUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                  title={t('viewApp')}
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </Button>
            </div>

            {/* Bottom Row - Stacks and Like */}
            <div className="flex items-center justify-between mt-3">
              {/* Tech Stack Icons */}
              <div className="flex items-center gap-1.5">
                {stacks.slice(0, 5).map((stack) => (
                  <div
                    key={stack.id}
                    className="w-6 h-6 rounded-md bg-muted p-1 flex items-center justify-center"
                    title={stack.name}
                  >
                    <img 
                      src={stack.logo_url} 
                      alt={stack.name}
                      className="w-4 h-4 object-contain"
                    />
                  </div>
                ))}
                {stacks.length > 5 && (
                  <span className="text-xs text-muted-foreground ml-1">
                    +{stacks.length - 5}
                  </span>
                )}
              </div>

              {/* Like Button */}
              <AppLikeButton
                appId={appId}
                showCount
              />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
