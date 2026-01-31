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
      className="min-h-screen flex items-center justify-center p-4 sm:p-6 md:p-8 bg-stone-100"
    >
      {loading ? (
        <div className="w-full max-w-md mx-auto space-y-6">
          {/* Skeleton for Founder Pass Card */}
          <div className="rounded-3xl overflow-hidden shadow-2xl" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #3D5AFE 50%, #2563EB 100%)' }}>
            <div className="py-10 px-8 flex flex-col items-center">
              <Skeleton className="h-5 w-32 bg-white/20 mb-6" />
              <Skeleton className="h-32 w-32 rounded-full bg-white/20 mb-6" />
              <Skeleton className="h-8 w-36 bg-white/20 mb-2" />
              <Skeleton className="h-5 w-24 bg-white/20 mb-6" />
              <Skeleton className="h-8 w-40 rounded-full bg-white/20" />
            </div>
          </div>
          {/* Skeleton for Roadmap */}
          <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6">
            <Skeleton className="h-4 w-28 mb-5" />
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <Skeleton className="h-10 w-10 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : error ? (
        <div className="text-center text-stone-500">
          <p className="text-lg">Error al cargar el perfil</p>
          <p className="text-sm mt-2">{error}</p>
        </div>
      ) : profile ? (
        <PublicProfileCard profile={profile} />
      ) : null}
    </div>
  );
}
