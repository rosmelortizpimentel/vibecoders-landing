import { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { PublicProfileCard } from '@/components/PublicProfileCard';
import { Skeleton } from '@/components/ui/skeleton';
import { PublicProfileHeader } from '@/components/PublicProfileHeader';

interface ProfileNavigatorProps {
  initialUsername: string;
}

export function ProfileNavigator({ initialUsername }: ProfileNavigatorProps) {
  const navigate = useNavigate();

  // Navigate to another profile by updating the URL (no full refresh)
  const navigateToProfile = useCallback((username: string) => {
    navigate(`/@${username}`);
  }, [navigate]);

  const { profile, loading, error, notFound } = usePublicProfile(initialUsername);

  if (loading) {
    return (
      <div className="w-full min-h-screen bg-white">
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
      <div className="min-h-screen bg-white">
        <PublicProfileHeader />
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center text-gray-500">
            <p className="text-lg">Perfil no encontrado</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <PublicProfileHeader profileUsername={profile.username} />
      <PublicProfileCard 
        profile={profile} 
        onNavigateToProfile={navigateToProfile}
      />
    </div>
  );
}
