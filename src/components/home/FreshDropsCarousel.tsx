 import { useRef, useCallback } from 'react';
 import { Link } from 'react-router-dom';
 import Autoplay from 'embla-carousel-autoplay';
import { ArrowRight, BadgeCheck } from 'lucide-react';
 import {
   Carousel,
   CarouselContent,
   CarouselItem,
   CarouselPrevious,
   CarouselNext,
 } from '@/components/ui/carousel';
 import { Button } from '@/components/ui/button';
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
   const autoplayRef = useRef(
     Autoplay({ delay: 4000, stopOnInteraction: true })
   );
 
  const handleOpenApp = useCallback((url: string) => {
    // Normalize URL - prepend https:// if missing
    const normalized = url.trim();
    const finalUrl = normalized.startsWith('http://') || normalized.startsWith('https://') 
      ? normalized 
      : `https://${normalized}`;
    window.open(finalUrl, '_blank', 'noopener,noreferrer');
  }, []);
 
   if (!apps.length) {
     return (
       <div className="text-center py-12 text-muted-foreground">
         No hay apps recientes para mostrar.
       </div>
     );
   }
 
   return (
     <Carousel
       opts={{
         align: 'start',
         loop: true,
       }}
       plugins={[autoplayRef.current]}
       className="w-full"
     >
       <CarouselContent className="-ml-2 md:-ml-4">
         {apps.map((app) => (
           <CarouselItem
             key={app.id}
             className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
           >
             <div className="bg-card border border-border rounded-lg p-4 md:p-6 h-full flex flex-col sm:flex-row items-center gap-4">
               {/* Logo */}
               <div className="flex-shrink-0">
                 {app.logo_url ? (
                   <img
                     src={app.logo_url}
                     alt={app.name || 'App'}
                     className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover bg-muted"
                   />
                 ) : (
                   <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-muted flex items-center justify-center">
                     <span className="text-2xl font-bold text-muted-foreground">
                       {app.name?.charAt(0) || '?'}
                     </span>
                   </div>
                 )}
               </div>
 
               {/* Content */}
               <div className="flex-1 text-center sm:text-left min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5">
                    <h3 className="font-semibold text-foreground text-lg truncate">
                      {app.name || 'Sin nombre'}
                    </h3>
                    {app.is_verified && (
                      <TooltipProvider delayDuration={200}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <BadgeCheck className="h-[18px] w-[18px] text-primary flex-shrink-0" />
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">
                            Propietario Verificado
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </div>
                 {app.tagline && (
                   <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                     {app.tagline}
                   </p>
                 )}
                 {app.profiles?.username && (
                   <Link
                     to={`/${app.profiles.username}`}
                     className="text-xs text-muted-foreground hover:text-primary transition-colors mt-1 inline-block"
                   >
                     por @{app.profiles.username}
                   </Link>
                 )}
                 <div className="mt-2">
                   <Button
                     variant="link"
                     size="sm"
                     className="p-0 h-auto text-primary"
                     onClick={() => handleOpenApp(app.url)}
                   >
                     Ver Proyecto
                     <ArrowRight className="ml-1 h-4 w-4" />
                   </Button>
                 </div>
               </div>
             </div>
           </CarouselItem>
         ))}
       </CarouselContent>
       <CarouselPrevious className="hidden md:flex -left-4" />
       <CarouselNext className="hidden md:flex -right-4" />
     </Carousel>
   );
 }