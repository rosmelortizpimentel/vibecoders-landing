import { useEffect } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { AppData } from '@/hooks/useApps';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';

interface ProfilePreviewProps {
  profile: ProfileData | null;
  apps: AppData[];
}

const socialLabels: Record<string, string> = {
  twitter: 'Twitter',
  github: 'GitHub',
  tiktok: 'TikTok',
  instagram: 'Instagram',
  youtube: 'YouTube',
  linkedin: 'LinkedIn',
  email_public: 'Email',
};

export function ProfilePreview({ profile, apps }: ProfilePreviewProps) {
  const visibleApps = apps.filter(app => app.is_visible);

  // Load font dynamically
  useEffect(() => {
    if (!profile?.font_family) return;
    
    const fontName = profile.font_family.replace(/ /g, '+');
    const linkId = `preview-font-${fontName}`;
    
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [profile?.font_family]);

  if (!profile) return null;

  const fontFamily = profile.font_family || 'Inter';

  // Get active social networks as text list
  const activeSocials = Object.entries(socialLabels)
    .filter(([key]) => profile[key as keyof ProfileData])
    .map(([, label]) => label);

  return (
    <div 
      className="rounded-2xl overflow-hidden shadow-xl"
      style={{ 
        fontFamily,
        background: 'linear-gradient(135deg, #4F46E5 0%, #3D5AFE 50%, #2563EB 100%)'
      }}
    >
      {/* Main Content */}
      <div className="px-8 py-10 text-center">
        {/* Avatar */}
        <Avatar className="h-24 w-24 mx-auto border-4 border-white/30">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} />
          <AvatarFallback 
            className="text-3xl font-bold bg-white/20 text-white"
          >
            {profile.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <h2 className="mt-5 text-2xl font-bold text-white">
          {profile.name || 'Tu Nombre'}
        </h2>
        
        {/* Tagline */}
        {profile.tagline && (
          <p className="mt-2 text-sm text-white/70">
            {profile.tagline}
          </p>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="mt-4 text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
            {profile.bio}
          </p>
        )}

        {/* Location & Website */}
        <div className="mt-6 space-y-1">
          {profile.location && (
            <p className="text-sm text-white/60">
              {profile.location}
            </p>
          )}
          {profile.website && (
            <p className="text-sm text-white/60">
              {profile.website.replace(/^https?:\/\//, '')}
            </p>
          )}
        </div>

        {/* Social Networks - Text only */}
        {activeSocials.length > 0 && (
          <p className="mt-4 text-xs text-white/50">
            {activeSocials.join(' · ')}
          </p>
        )}
      </div>

      {/* Apps Section */}
      {visibleApps.length > 0 && (
        <div className="mx-6 mb-6 p-4 rounded-xl bg-white/10 backdrop-blur-sm">
          <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-3">
            Apps
          </p>
          <div className="space-y-2">
            {visibleApps.slice(0, 3).map(app => (
              <div 
                key={app.id}
                className="flex items-center gap-3 p-2 rounded-lg bg-white/5"
              >
                {app.logo_url ? (
                  <img 
                    src={app.logo_url} 
                    alt={app.name || ''} 
                    className="w-8 h-8 rounded-lg object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <span className="text-xs font-medium text-white/60">
                      {app.name?.charAt(0) || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-white truncate">
                    {app.name || new URL(app.url).hostname}
                  </p>
                  {app.tagline && (
                    <p className="text-xs text-white/60 truncate">
                      {app.tagline}
                    </p>
                  )}
                </div>
              </div>
            ))}
            {visibleApps.length > 3 && (
              <p className="text-xs text-center text-white/50 pt-1">
                +{visibleApps.length - 3} más
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-4 text-center border-t border-white/10">
        <span className="text-xs text-white/50">
          vibecoders.io/@{profile.username || 'username'}
        </span>
      </div>
    </div>
  );
}
