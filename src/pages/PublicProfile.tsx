import { useParams, Navigate } from 'react-router-dom';
import { usePublicProfile } from '@/hooks/usePublicProfile';
import { PublicProfileCard } from '@/components/PublicProfileCard';
import { Skeleton } from '@/components/ui/skeleton';

export default function PublicProfile() {
  const { handle } = useParams<{ handle: string }>();

  // Validate: must start with @ to be a public profile
  // Otherwise redirect to landing (fulfills "everything else to /" rule)
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
    <div 
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: '#3D5AFE' }}
    >
      {loading ? (
        <div className="w-full max-w-sm mx-auto">
          <div className="rounded-xl overflow-hidden" style={{ background: '#3D5AFE' }}>
            <div className="py-12 px-8 flex flex-col items-center">
              <Skeleton className="h-28 w-28 rounded-full bg-white/20 mb-6" />
              <Skeleton className="h-8 w-32 bg-white/20 mb-2" />
              <Skeleton className="h-5 w-24 bg-white/20 mb-6" />
              <Skeleton className="h-8 w-28 bg-white/20 rounded-full" />
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-white/70">
          <p className="text-lg">Error al cargar el perfil</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      ) : profile ? (
        <PublicProfileCard profile={profile} />
      ) : null}
    </div>
  );
}
