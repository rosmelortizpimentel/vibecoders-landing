import { useState, useCallback } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { PublicProfileCard } from '@/components/PublicProfileCard';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileNavigatorProps {
  initialUsername: string;
}

export function ProfileNavigator({ initialUsername }: ProfileNavigatorProps) {
  const [profileStack, setProfileStack] = useState<string[]>([initialUsername]);
  const currentUsername = profileStack[profileStack.length - 1];
  const canGoBack = profileStack.length > 1;

  const pushProfile = useCallback((username: string) => {
    setProfileStack((prev) => [...prev, username]);
  }, []);

  const popProfile = useCallback(() => {
    setProfileStack((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev));
  }, []);

  const { profile, loading, error, notFound } = usePublicProfile(currentUsername);

  // Show back button in header when navigating between profiles
  const BackButton = canGoBack ? (
    <Button
      variant="ghost"
      size="sm"
      onClick={popProfile}
      className="absolute left-2 top-2 z-10 text-gray-600 hover:text-gray-900 bg-white/80 backdrop-blur-sm"
    >
      <ArrowLeft className="h-4 w-4 mr-1" />
      Atrás
    </Button>
  ) : null;

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white">
        {BackButton}
        <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-8 w-8 rounded-full" />
          </div>
        </div>
        <div className="w-full max-w-4xl mx-auto">
          <Skeleton className="h-24 md:h-48 w-full md:mt-4 md:mx-auto md:rounded-2xl" />
          <div className="relative -mt-10 md:-mt-14 flex justify-center">
            <Skeleton className="h-20 w-20 md:h-28 md:w-28 rounded-full border-4 border-white" />
          </div>
          <div className="pt-4 pb-6 px-4 md:px-6 flex flex-col items-center text-center space-y-3">
            <Skeleton className="h-7 w-40" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || error || !profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        {BackButton}
        <div className="text-center text-gray-500">
          <p className="text-lg">Perfil no encontrado</p>
          {canGoBack && (
            <Button variant="link" onClick={popProfile} className="mt-2">
              Volver al perfil anterior
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      {BackButton}
      <PublicProfileCard 
        profile={profile} 
        onNavigateToProfile={pushProfile}
      />
    </div>
  );
}
