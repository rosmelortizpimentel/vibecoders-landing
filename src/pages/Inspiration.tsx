import { Rocket } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ShowcaseCard } from '@/components/showcase/ShowcaseCard';
import { ShowcaseCardSkeleton } from '@/components/showcase/ShowcaseCardSkeleton';
import { useShowcase } from '@/hooks/useShowcase';

export default function Inspiration() {
  const { data: projects, isLoading, error } = useShowcase();

  return (
    <div className="min-h-screen flex flex-col bg-[#F6F5F4]">
      <Navbar />
      
      <main className="flex-1 pt-24 pb-16">
        <div className="container mx-auto px-4 md:px-6">
          {/* Header */}
          <header className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1c1c1c] mb-4">
              Community Showcase
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto">
              Proyectos reales creados por vibecoders como tú. Inspírate y construye algo increíble.
            </p>
          </header>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <ShowcaseCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <div className="text-center py-16">
              <p className="text-stone-600">
                Hubo un error al cargar los proyectos. Intenta de nuevo más tarde.
              </p>
            </div>
          )}

          {/* Empty State */}
          {!isLoading && !error && projects?.length === 0 && (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-stone-100 mb-6">
                <Rocket className="w-8 h-8 text-stone-400" />
              </div>
              <h2 className="text-xl font-semibold text-[#1c1c1c] mb-2">
                Aún no hay proyectos
              </h2>
              <p className="text-stone-600 max-w-md mx-auto">
                Sé el primero en construir algo increíble con Vibecoders y aparecer aquí.
              </p>
            </div>
          )}

          {/* Projects Grid */}
          {!isLoading && !error && projects && projects.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map((project) => (
                <ShowcaseCard key={project.id} project={project} />
              ))}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
