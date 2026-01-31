import { useEffect } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { AppData } from '@/hooks/useApps';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Lock, Twitter, Github, Instagram, Youtube, Linkedin, Mail } from 'lucide-react';

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

interface ProfilePreviewProps {
  profile: ProfileData | null;
  apps: AppData[];
}

const socialConfig = [
  { key: 'twitter', icon: Twitter, getUrl: (v: string) => v.startsWith('http') ? v : `https://twitter.com/${v}` },
  { key: 'github', icon: Github, getUrl: (v: string) => v.startsWith('http') ? v : `https://github.com/${v}` },
  { key: 'tiktok', icon: TikTokIcon, getUrl: (v: string) => v.startsWith('http') ? v : `https://tiktok.com/@${v}` },
  { key: 'instagram', icon: Instagram, getUrl: (v: string) => v.startsWith('http') ? v : `https://instagram.com/${v}` },
  { key: 'youtube', icon: Youtube, getUrl: (v: string) => v.startsWith('http') ? v : `https://youtube.com/@${v}` },
  { key: 'linkedin', icon: Linkedin, getUrl: (v: string) => v.startsWith('http') ? v : `https://linkedin.com/in/${v}` },
  { key: 'email_public', icon: Mail, getUrl: (v: string) => `mailto:${v}` },
] as const;

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
  const username = profile.username || 'username';

  // Generate app URL with ref
  const getAppUrl = (appUrl: string) => {
    try {
      const url = new URL(appUrl);
      url.searchParams.set('ref', 'vibecoders.la');
      return url.toString();
    } catch {
      return appUrl;
    }
  };

  return (
    <div 
      className="rounded-2xl overflow-hidden shadow-xl w-full"
      style={{ fontFamily }}
    >
      {/* Browser Chrome */}
      <div className="flex items-center gap-2 md:gap-3 px-3 md:px-4 py-2 md:py-3 bg-[#ECECEC] border-b border-stone-200">
        {/* Traffic Lights - hidden on mobile */}
        <div className="hidden md:flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-full bg-[#FF5F57]" />
          <div className="w-3 h-3 rounded-full bg-[#FFBD2E]" />
          <div className="w-3 h-3 rounded-full bg-[#28CA41]" />
        </div>
        
        {/* URL Bar - full width */}
        <div className="flex-1 flex items-center gap-1.5 md:gap-2 bg-white rounded-md px-2 md:px-3 py-1 md:py-1.5 border border-stone-200">
          <Lock className="w-3 h-3 md:w-3.5 md:h-3.5 text-stone-400 flex-shrink-0" />
          <span className="text-xs md:text-sm text-stone-700 font-medium tracking-tight truncate">
            vibecoders.la/<span className="text-stone-900">@{username}</span>
          </span>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="px-4 md:px-8 py-6 md:py-10 text-center"
        style={{ 
          background: 'linear-gradient(135deg, #4F46E5 0%, #3D5AFE 50%, #2563EB 100%)'
        }}
      >
        {/* Avatar */}
        <Avatar className="h-16 w-16 md:h-24 md:w-24 mx-auto border-4 border-white/30">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} />
          <AvatarFallback 
            className="text-xl md:text-3xl font-bold bg-white/20 text-white"
          >
            {profile.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <h2 className="mt-4 md:mt-5 text-lg md:text-2xl font-bold text-white">
          {profile.name || 'Tu Nombre'}
        </h2>
        
        {/* Tagline */}
        {profile.tagline && (
          <p className="mt-1 md:mt-2 text-xs md:text-sm text-white/70">
            {profile.tagline}
          </p>
        )}

        {/* Bio */}
        {profile.bio && (
          <p className="mt-3 md:mt-4 text-xs md:text-sm text-white/80 leading-relaxed max-w-xs mx-auto">
            {profile.bio}
          </p>
        )}

        {/* Location & Website */}
        <div className="mt-4 md:mt-6 space-y-1">
          {profile.location && (
            <p className="text-xs md:text-sm text-white/60">
              {profile.location}
            </p>
          )}
          {profile.website && (
            <p className="text-xs md:text-sm text-white/60">
              {profile.website.replace(/^https?:\/\//, '')}
            </p>
          )}
        </div>

        {/* Social Networks - Icon links */}
        {(() => {
          const activeSocials = socialConfig.filter(({ key }) => profile[key as keyof ProfileData]);
          if (activeSocials.length === 0) return null;
          
          return (
            <div className="mt-4 md:mt-6 flex items-center justify-center gap-2 md:gap-3">
              {activeSocials.map(({ key, icon: Icon, getUrl }) => {
                const value = profile[key as keyof ProfileData] as string;
                return (
                  <a
                    key={key}
                    href={getUrl(value)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                  >
                    <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-white" />
                  </a>
                );
              })}
            </div>
          );
        })()}

        {/* Apps Section - Integrated */}
        {visibleApps.length > 0 && (
          <div className="mt-6 md:mt-8 p-3 md:p-4 rounded-xl bg-white/10 backdrop-blur-sm">
            <p className="text-xs font-medium text-white/60 uppercase tracking-wide mb-2 md:mb-3 text-left">
              Apps
            </p>
            <div className="space-y-2">
              {visibleApps.slice(0, 3).map(app => (
                <a 
                  key={app.id}
                  href={getAppUrl(app.url)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 md:gap-3 p-2 rounded-lg bg-white/5 hover:bg-white/10 transition-colors cursor-pointer"
                >
                  {app.logo_url ? (
                    <img 
                      src={app.logo_url} 
                      alt={app.name || ''} 
                      className="w-7 h-7 md:w-8 md:h-8 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 md:w-8 md:h-8 rounded-lg bg-white/10 flex items-center justify-center">
                      <span className="text-xs font-medium text-white/60">
                        {app.name?.charAt(0) || '?'}
                      </span>
                    </div>
                  )}
                  <div className="flex-1 min-w-0 text-left">
                    <p className="text-xs md:text-sm font-medium text-white truncate">
                      {app.name || new URL(app.url).hostname}
                    </p>
                    {app.tagline && (
                      <p className="text-[10px] md:text-xs text-white/60 truncate">
                        {app.tagline}
                      </p>
                    )}
                  </div>
                </a>
              ))}
              {visibleApps.length > 3 && (
                <p className="text-[10px] md:text-xs text-center text-white/50 pt-1">
                  +{visibleApps.length - 3} más
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div 
        className="py-3 md:py-4 text-center border-t border-white/10"
        style={{ 
          background: 'linear-gradient(135deg, #4F46E5 0%, #3D5AFE 50%, #2563EB 100%)'
        }}
      >
        <span className="text-[10px] md:text-xs text-white/50">
          vibecoders.la/@{username}
        </span>
      </div>
    </div>
  );
}