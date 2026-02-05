 import { useRef, useCallback } from 'react';
 import Autoplay from 'embla-carousel-autoplay';
 import { ArrowRight } from 'lucide-react';
 import {
   Carousel,
   CarouselContent,
   CarouselItem,
   CarouselPrevious,
   CarouselNext,
 } from '@/components/ui/carousel';
 import { Button } from '@/components/ui/button';
 import type { ShowcaseProject } from '@/hooks/useShowcase';
 
 interface FreshDropsCarouselProps {
   projects: ShowcaseProject[];
 }
 
 export function FreshDropsCarousel({ projects }: FreshDropsCarouselProps) {
   const autoplayRef = useRef(
     Autoplay({ delay: 4000, stopOnInteraction: true })
   );
 
   const handleOpenProject = useCallback((url: string) => {
     window.open(url, '_blank', 'noopener,noreferrer');
   }, []);
 
   if (!projects.length) {
     return (
       <div className="text-center py-12 text-muted-foreground">
         No hay proyectos recientes para mostrar.
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
         {projects.map((project) => (
           <CarouselItem
             key={project.id}
             className="pl-2 md:pl-4 basis-full sm:basis-1/2 lg:basis-1/3"
           >
             <div className="bg-card border border-border rounded-lg p-4 md:p-6 h-full flex flex-col sm:flex-row items-center gap-4">
               {/* Logo */}
               <div className="flex-shrink-0">
                 {project.project_logo_url ? (
                   <img
                     src={project.project_logo_url}
                     alt={project.project_title}
                     className="w-20 h-20 md:w-24 md:h-24 rounded-xl object-cover bg-muted"
                   />
                 ) : (
                   <div className="w-20 h-20 md:w-24 md:h-24 rounded-xl bg-muted flex items-center justify-center">
                     <span className="text-2xl font-bold text-muted-foreground">
                       {project.project_title.charAt(0)}
                     </span>
                   </div>
                 )}
               </div>
 
               {/* Content */}
               <div className="flex-1 text-center sm:text-left min-w-0">
                 <h3 className="font-semibold text-foreground text-lg truncate">
                   {project.project_title}
                 </h3>
                 <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                   {project.project_tagline}
                 </p>
                 <Button
                   variant="link"
                   size="sm"
                   className="p-0 h-auto mt-2 text-primary"
                   onClick={() => handleOpenProject(project.project_url)}
                 >
                   Ver Proyecto
                   <ArrowRight className="ml-1 h-4 w-4" />
                 </Button>
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