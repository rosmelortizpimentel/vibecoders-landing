import { Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShowcaseCard } from '@/components/showcase/ShowcaseCard';
import { ShowcaseCardSkeleton } from '@/components/showcase/ShowcaseCardSkeleton';
import { useShowcase } from '@/hooks/useShowcase';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';

import { FreshDropsCarousel } from '@/components/home/FreshDropsCarousel';
import { useFreshDrops } from '@/hooks/useFreshDrops';

export default function Projects() {
  const { data: projects, isLoading, error } = useShowcase();
  const { data: freshDrops = [], isLoading: freshDropsLoading } = useFreshDrops();
  const t = useTranslation('projects');
  const tErrors = useTranslation('errors');
  const tHome = useTranslation('home');

  return (
    <>
      {/* Hero Section - Clean White */}
      <section className="pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              {t.title}
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              {t.subtitle}
            </p>
          </header>
        </div>
      </section>

      {/* Main Content */}
      <main className="flex-1 pb-16 md:pb-24">
        <div className="container mx-auto px-4 md:px-6">
          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShowcaseCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">
                {tErrors.loadingError}. {tErrors.tryAgain}
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && projects?.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-6">
                <Rocket className="w-8 h-8 text-muted-foreground" />
              </div>
              <h2 className="text-xl font-semibold text-foreground mb-2">
                {t.noProjects}
              </h2>
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && !error && projects && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {projects.map((project) => (
                <ShowcaseCard key={project.id} project={project} />
              ))}
            </div>
          )}

          {/* Fresh Drops Carousel Section */}
          <section className="mt-20 w-full max-w-full min-w-0 pt-8 border-t border-border/40 overflow-hidden">
            <div className="flex items-center gap-2 mb-6">
              <div className="p-2 bg-muted rounded-lg">
                <Rocket className="w-4 h-4 text-muted-foreground" strokeWidth={1.5} />
              </div>
              <h2 className="text-lg font-semibold text-foreground">
                {tHome.freshDrops?.title || 'Fresh out of the oven'}
              </h2>
            </div>

            {freshDropsLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {[...Array(3)].map((_, i) => (
                  <ShowcaseCardSkeleton key={i} />
                ))}
              </div>
            ) : (
              <FreshDropsCarousel apps={freshDrops} />
            )}
          </section>
        </div>
      </main>
    </>
  );
}
