import { Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { ShowcaseCard } from '@/components/showcase/ShowcaseCard';
import { ShowcaseCardSkeleton } from '@/components/showcase/ShowcaseCardSkeleton';
import { useShowcase } from '@/hooks/useShowcase';
import { Button } from '@/components/ui/button';

export default function Projects() {
  const { data: projects, isLoading, error } = useShowcase();

  return (
    <>
      {/* Hero Section - Clean White */}
      <section className="pt-16 pb-8 md:pt-24 md:pb-12">
        <div className="container mx-auto px-4 md:px-6">
          <header className="text-center max-w-3xl mx-auto">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-4">
              Hecho por Vibecoders
            </h1>
            <p className="text-base md:text-lg text-muted-foreground max-w-2xl mx-auto mb-8">
              Apps reales creadas por gente como tú. Inspírate y lanza la tuya.
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
                Hubo un error al cargar los proyectos. Intenta de nuevo más tarde.
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
                Aún no hay proyectos
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Sé el primero en construir algo increíble con Vibecoders y aparecer aquí.
              </p>
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
        </div>
      </main>
    </>
  );
}
