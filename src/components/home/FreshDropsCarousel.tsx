import { useState, useCallback } from 'react';
import { BadgeCheck, ExternalLink } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import type { FreshDropApp } from '@/hooks/useFreshDrops';

interface FreshDropsCarouselProps {
  apps: FreshDropApp[];
}

export function FreshDropsCarousel({ apps }: FreshDropsCarouselProps) {
  const [brokenLogos, setBrokenLogos] = useState<Record<string, boolean>>({});

  const handleLogoError = (appId: string) => {
    setBrokenLogos(prev => ({ ...prev, [appId]: true }));
  };

  const handleOpenApp = useCallback((e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
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

  // Component for the card
  const AppCard = ({ app }: { app: FreshDropApp }) => (
    <div className="w-[calc(100vw-32px)] max-w-[468px] sm:w-[420px] shrink-0 h-full py-2">
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
            {app.is_verified && (
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
              <Link 
                to={`/@${app.profiles.username}`}
                className="flex items-center gap-2 min-w-0 hover:opacity-80 transition-opacity z-20"
                onClick={(e) => e.stopPropagation()}
              >
                <Avatar className="w-5 h-5 border border-border shrink-0">
                  <AvatarImage src={app.profiles.avatar_url || undefined} />
                  <AvatarFallback className="text-[10px]">
                    {app.profiles.username?.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground truncate font-medium hover:text-primary transition-colors">
                  @{app.profiles.username}
                </span>
              </Link>
            )}
            {app.id && (
              <Link 
                to={`/app/${app.id}`}
                className="ml-auto text-xs font-semibold text-primary flex items-center gap-1 shrink-0 bg-primary/5 px-3 py-1.5 rounded-full hover:bg-primary/10 transition-all active:scale-95 z-20"
                onClick={(e) => e.stopPropagation()}
              >
                Visit <ExternalLink className="w-3 h-3" />
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full relative py-2 select-none">
      <Carousel
        opts={{
          align: "start",
          loop: true,
          dragFree: true,
        }}
        plugins={[
          Autoplay({
            delay: 3000,
            stopOnInteraction: false,
            stopOnMouseEnter: true,
          }),
        ]}
        className="w-full"
      >
        <CarouselContent className="-ml-4 h-full py-2">
          {apps.map((app) => (
            <CarouselItem key={app.id} className="pl-4 basis-auto h-full">
              <AppCard app={app} />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {/* Faders for smooth edges */}
      <div className="absolute inset-y-0 left-0 w-8 sm:w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
      <div className="absolute inset-y-0 right-0 w-8 sm:w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
    </div>
  );
}
