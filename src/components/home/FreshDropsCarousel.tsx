import { useState, useCallback } from 'react';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import type { FreshDropApp } from '@/hooks/useFreshDrops';

interface FreshDropsCarouselProps {
  apps: FreshDropApp[];
}

export function FreshDropsCarousel({ apps }: FreshDropsCarouselProps) {
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});

  const handleLogoError = (appId: string) => {
    setBrokenLogos(prev => ({ ...prev, [appId]: true }));
  };

  const handleOpenApp = useCallback((url: string) => {
    const normalized = url.trim();
    const finalUrl = normalized.startsWith('http://') || normalized.startsWith('https://') 
      ? normalized 
      : `https://${normalized}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  }, []);

  if (!apps.length) {
    return (
      <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
        No new apps yet.
      </div>
    );
  }

  // Triple the apps for a long seamless loop
  const marqueeItems = [...apps, ...apps, ...apps];

  // Component for the card so we can reuse it for the sizer
  const Card = ({ app, isSizer = false }: { app: FreshDropApp; isSizer?: boolean }) => (
    <div className={`flex-shrink-0 w-[calc(100vw-32px)] max-w-[468px] sm:w-[420px] sm:max-w-none ${isSizer ? 'opacity-0 pointer-events-none' : ''}`}>
      <div className="bg-card border border-border rounded-xl p-3 flex flex-row items-center gap-3 relative hover:border-primary/20 transition-all h-full shadow-sm">
        <div className="flex-shrink-0">
          {app.logo_url && !brokenLogos[app.id] ? (
            <img
              src={app.logo_url}
              alt={app.name || 'App'}
              className="w-12 h-12 rounded-lg object-cover bg-muted border border-border/50"
              onError={() => handleLogoError(app.id)}
            />
          ) : (
            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center border border-border/50">
              <span className="text-lg font-bold text-muted-foreground uppercase">
                {app.name?.charAt(0) || '?'}
              </span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
          <div className="flex items-center gap-1.5">
            <h3 className="font-semibold text-foreground text-base truncate leading-tight">
              {app.name || 'Unnamed App'}
            </h3>
            {app.is_verified && !isSizer && (
              <BadgeCheck className="w-4 h-4 text-primary flex-shrink-0" />
            )}
          </div>
          {app.tagline && (
            <p className="text-sm text-muted-foreground truncate leading-tight">
              {app.tagline}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2">
            {app.profiles && (
              <div className="flex items-center gap-2 min-w-0">
                <Avatar className="w-5 h-5 border border-border shrink-0">
                  <AvatarImage src={app.profiles.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {app.profiles.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate">
                  @{app.profiles.username}
                </span>
              </div>
            )}
            <div className="ml-auto text-xs font-medium text-primary flex items-center gap-1 shrink-0 bg-primary/5 px-2.5 py-1 rounded-full hover:bg-primary/10 transition-colors">
              Visit <ExternalLink className="w-3 h-3" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full relative py-4 select-none overflow-hidden pb-8">
      {/* 
        THE GHOST SIZER: 
        This transparent card defines the container height.
        Because it is just ONE card, it does NOT expand the width.
      */}
      <div className="w-full flex justify-start opacity-0 pointer-events-none py-2">
        <Card app={apps[0]} isSizer />
      </div>

      {/* 
        THE ACTUAL MARQUEE: 
        Positioned ABSOLUTE so its width is ZERO to the layout engine.
        It will fill the space defined by the Sizer above.
      */}
      <div className="absolute inset-0 w-full overflow-hidden flex items-center py-2">
        <div 
          className="flex gap-4 animate-marquee py-2 hover:[animation-play-state:paused] w-max"
          onContextMenu={(e) => e.preventDefault()}
        >
          {marqueeItems.map((app, idx) => (
            <Card key={`${app.id}-${idx}`} app={app} />
          ))}
        </div>

        {/* Faders for smooth edges */}
        <div className="absolute inset-y-0 left-0 w-8 sm:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
        <div className="absolute inset-y-0 right-0 w-8 sm:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes marquee-loop {
          0% { transform: translateX(0); }
          100% { transform: translateX(calc(-33.33% - 5.33px)); } /* 1/3 since we have 3x items */
        }
        .animate-marquee {
          animation: marquee-loop 80s linear infinite;
        }
      ` }} />
    </div>
  );
}