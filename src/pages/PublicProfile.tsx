import { useParams, Navigate } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { PublicProfileCard } from '@/components/PublicProfileCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicProfile() {
  const { handle } = useParams<{ handle: string }>();

  // Validate: must start with @ to be a public profile
  if (!handle || !handle.startsWith('@')) {
    return <Navigate to="/" replace />;
  }

  // Extract username without the @ prefix
  const username = handle.slice(1);

  return <PublicProfileContent username={username} />;
}

// Separated component to use hooks after validation
function PublicProfileContent({ username }: { username: string }) {
  const { profile, loading, error, notFound } = usePublicProfile(username);

  // If profile doesn't exist, redirect to landing
  if (notFound && !loading) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-white">
      {loading ? (
        <div className="w-full min-h-screen bg-white">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
          </div>
          
          {/* Centered content container - matches PublicProfileCard */}
          <div className="w-full max-w-4xl mx-auto">
            {/* Banner Skeleton */}
            <Skeleton className="h-24 md:h-48 w-full md:mt-4 md:mx-auto md:rounded-2xl" />
            
            {/* Avatar overlapping banner - centered */}
            <div className="relative -mt-10 md:-mt-14 flex justify-center">
              <Skeleton className="h-20 w-20 md:h-28 md:w-28 rounded-full border-4 border-white" />
            </div>
            
            {/* Content Skeleton - centered */}
            <div className="pt-4 pb-6 px-4 md:px-6 flex flex-col items-center text-center space-y-3">
              {/* Name */}
              <Skeleton className="h-7 w-40" />
              
              {/* Followers row */}
              <div className="flex items-center gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-16" />
              </div>
              
              {/* Tagline */}
              <Skeleton className="h-4 w-64" />
              
              {/* Social icons */}
              <div className="flex gap-2 pt-2">
                {[1, 2, 3, 4].map(i => (
                  <Skeleton key={i} className="h-8 w-8 rounded-full" />
                ))}
              </div>
              
              {/* Location/Website */}
              <div className="flex flex-col items-center gap-2 pt-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-40" />
              </div>
            </div>
            
            {/* Apps Section Skeleton */}
            <div className="border-t border-gray-100 px-4 md:px-6 py-4 bg-gray-50/50">
              <Skeleton className="h-3 w-12 mb-3" />
              <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                {[1, 2].map(i => (
                  <div key={i} className="p-3 rounded-lg bg-white border border-gray-200">
                    <div className="flex items-start gap-3">
                      <Skeleton className="h-10 w-10 rounded-lg" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-24" />
                        <Skeleton className="h-3 w-32" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center text-gray-500">
            <p className="text-lg">Error al cargar el perfil</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      ) : profile ? (
        <PublicProfileCard profile={profile} />
      ) : null}
    </div>
  );
}
