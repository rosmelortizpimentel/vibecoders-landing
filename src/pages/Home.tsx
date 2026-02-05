 import { useState, useEffect } from 'react';
 import { useAuth } from '@/hooks/useAuth';
 import { useProfileCompletion } from '@/hooks/useProfileCompletion';
 import { useFreshDrops } from '@/hooks/useFreshDrops';
 import { useShowcase } from '@/hooks/useShowcase';
 import { PublicProfileHeader } from '@/components/PublicProfileHeader';
import Footer from '@/components/Footer';
 import { BuilderOnboarding } from '@/components/home/BuilderOnboarding';
 import { FreshDropsCarousel } from '@/components/home/FreshDropsCarousel';
 import { ShowcaseCard } from '@/components/showcase/ShowcaseCard';
 import { ShowcaseCardSkeleton } from '@/components/showcase/ShowcaseCardSkeleton';
 
 const ONBOARDING_STORAGE_KEY = 'onboarding_dismissed';
 
 export default function Home() {
   const { user } = useAuth();
   const profileCompletion = useProfileCompletion();
   const { data: freshDrops = [], isLoading: freshDropsLoading } = useFreshDrops();
   const { data: allProjects = [], isLoading: projectsLoading } = useShowcase();
   
   const [isDismissed, setIsDismissed] = useState(() => {
     return localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
   });
 
   const handleDismissOnboarding = () => {
     setIsDismissed(true);
   };
 
   // Reset dismissed state when user logs in with incomplete profile
   useEffect(() => {
     if (user && !profileCompletion.isComplete) {
       // Optional: reset dismissal on new session
     }
   }, [user, profileCompletion.isComplete]);
 
   const showOnboarding = user && !profileCompletion.isComplete && !isDismissed && !profileCompletion.loading;
 
   return (
     <div className="min-h-screen flex flex-col bg-background">
       {/* Header */}
       <PublicProfileHeader />
 
       <main className="flex-1">
         {/* Builder Onboarding */}
         {showOnboarding && (
           <section className="container px-4 py-6">
             <BuilderOnboarding
               percentage={profileCompletion.percentage}
               checklist={profileCompletion.checklist}
               onDismiss={handleDismissOnboarding}
             />
           </section>
         )}
 
         {/* Fresh Drops Carousel */}
         <section className="py-8 md:py-12">
           <div className="container px-4">
             <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">
               Acaba de salir del horno
             </h2>
             {freshDropsLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                 {[...Array(3)].map((_, i) => (
                   <ShowcaseCardSkeleton key={i} />
                 ))}
               </div>
             ) : (
               <FreshDropsCarousel projects={freshDrops} />
             )}
           </div>
         </section>
 
         {/* Explore All */}
         <section className="py-8 md:py-16 bg-muted/30">
           <div className="container px-4">
             <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6 md:mb-8">
               Explorar Todo
             </h2>
             {projectsLoading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                 {[...Array(6)].map((_, i) => (
                   <ShowcaseCardSkeleton key={i} />
                 ))}
               </div>
             ) : allProjects.length > 0 ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                 {allProjects.map((project) => (
                   <ShowcaseCard key={project.id} project={project} />
                 ))}
               </div>
             ) : (
               <div className="text-center py-12 text-muted-foreground">
                 No hay proyectos para mostrar.
               </div>
             )}
           </div>
         </section>
       </main>
 
       {/* Footer */}
       <Footer />
     </div>
   );
 }