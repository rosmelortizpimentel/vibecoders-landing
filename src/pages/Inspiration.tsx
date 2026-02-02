import { Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PublicHeader } from '@/components/PublicHeader';
import Footer from '@/components/Footer';
import WaveDivider from '@/components/WaveDivider';
import { ShowcaseCard } from '@/components/showcase/ShowcaseCard';
import { ShowcaseCardSkeleton } from '@/components/showcase/ShowcaseCardSkeleton';
import { useShowcase } from '@/hooks/useShowcase';
import { Button } from '@/components/ui/button';

export default function Inspiration() {
  const { data: projects, isLoading, error } = useShowcase();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />
      
      {/* Hero Section - Fondo Azul */}
      <section className="bg-[#3D5AFE] pt-12 pb-16 md:pb-20">
        <div className="container mx-auto px-4 md:px-6">
          <header className="relative">
            {/* Desktop: Button positioned absolute right */}
            <div className="hidden md:block absolute right-0 top-1/2 -translate-y-1/2">
              <Button
                asChild
                className="bg-white text-[#3D5AFE] hover:bg-white/90 rounded-full px-6 py-2 font-medium transition-all hover:shadow-lg"
              >
                <Link to="/me/profile">Quiero aparecer aquí</Link>
              </Button>
            </div>

            {/* Centered text - BLANCO */}
            <div className="text-center">
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
                Hecho por Vibecoders
              </h1>
              <p className="text-lg text-white/80 max-w-2xl mx-auto">
                Apps reales creadas por gente como tú. Inspírate y lanza la tuya.
              </p>
            </div>

            {/* Mobile: Button stacked below */}
            <div className="flex justify-center mt-6 md:hidden">
              <Button
                asChild
                className="bg-white text-[#3D5AFE] hover:bg-white/90 rounded-full px-6 py-2 font-medium transition-all hover:shadow-lg"
              >
                <Link to="/me/profile">Quiero aparecer aquí</Link>
              </Button>
            </div>
          </header>
        </div>
      </section>

      {/* Wave Divider */}
      <WaveDivider fromColor="#3D5AFE" toColor="#F6F5F4" />

      {/* Main Content - Fondo Crema */}
      <main className="flex-1 bg-[#F6F5F4] pb-16">
        <div className="container mx-auto px-4 md:px-6 pt-8">
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
              <p className="text-[#1c1c1c]/70">
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
              <p className="text-[#1c1c1c]/60 max-w-md mx-auto">
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
