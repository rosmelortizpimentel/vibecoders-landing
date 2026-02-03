import { Rocket } from 'lucide-react';
import { Link, Navigate } from 'react-router-dom';
import { AuthenticatedHeader } from '@/components/AuthenticatedHeader';
import Footer from '@/components/Footer';

import { ShowcaseCard } from '@/components/showcase/ShowcaseCard';
import { ShowcaseCardSkeleton } from '@/components/showcase/ShowcaseCardSkeleton';
import { useShowcase } from '@/hooks/useShowcase';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export default function Projects() {
  const { data: projects, isLoading, error } = useShowcase();
  const { user, loading: authLoading, signOut } = useAuth();
  const { profile, loading: profileLoading } = useProfile();

  // Show loading while checking auth
  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Redirect to home if not authenticated
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col">
      <AuthenticatedHeader 
        profile={profile || null}
        onSignOut={signOut}
      />
      
      {/* Hero Section - Fondo Blanco Limpio */}
      <section className="bg-white pt-12 pb-8">
        <div className="container mx-auto px-4 md:px-6">
          <header className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[#1c1c1c] mb-4">
              Hecho por Vibecoders
            </h1>
            <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
              Apps reales creadas por gente como tú. Inspírate y lanza la tuya.
            </p>
            <Button
              asChild
              className="bg-[#3D5AFE] text-white hover:bg-[#3D5AFE]/90 rounded-full px-6 py-2 font-medium transition-all hover:shadow-lg"
            >
              <Link to="/me/profile">Quiero aparecer aquí</Link>
            </Button>
          </header>
        </div>
      </section>

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
