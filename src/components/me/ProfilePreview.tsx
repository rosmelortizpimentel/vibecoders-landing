import { useEffect } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { AppData } from '@/hooks/useApps';
import { parseMarkdown } from '@/lib/markdown';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { 
  MapPin, 
  Globe, 
  Twitter, 
  Github, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Mail,
  ExternalLink
} from 'lucide-react';

// TikTok icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

interface ProfilePreviewProps {
  profile: ProfileData | null;
  apps: AppData[];
}

const socialIcons = {
  twitter: Twitter,
  github: Github,
  tiktok: TikTokIcon,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  email_public: Mail,
} as const;

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

  const primaryColor = profile.primary_color || '#3D5AFE';
  const accentColor = profile.accent_color || '#1c1c1c';
  const fontFamily = profile.font_family || 'Inter';
  const cardStyle = profile.card_style || 'minimal';

  const getCardClass = () => {
    switch (cardStyle) {
      case 'elevated':
        return 'border-0 shadow-lg';
      case 'outlined':
        return 'border-2';
      default:
        return 'border';
    }
  };

  const activeSocials = Object.entries(socialIcons).filter(
    ([key]) => profile[key as keyof ProfileData]
  );

  return (
    <div 
      className="rounded-xl border border-border bg-card overflow-hidden"
      style={{ fontFamily }}
    >
      {/* Header */}
      <div 
        className="h-20"
        style={{ background: `linear-gradient(135deg, ${primaryColor}, ${primaryColor}CC)` }}
      />

      {/* Profile Info */}
      <div className="px-6 pb-6">
        <Avatar className="h-20 w-20 -mt-10 border-4 border-card">
          <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} />
          <AvatarFallback 
            className="text-2xl"
            style={{ backgroundColor: `${primaryColor}20`, color: primaryColor }}
          >
            {profile.name?.charAt(0) || '?'}
          </AvatarFallback>
        </Avatar>

        <div className="mt-3 space-y-2">
          <h2 className="text-xl font-semibold" style={{ color: accentColor }}>
            {profile.name || 'Tu Nombre'}
          </h2>
          
          {profile.tagline && (
            <p className="text-sm" style={{ color: `${accentColor}99` }}>
              {profile.tagline}
            </p>
          )}

          {profile.bio && (
            <div 
              className="text-sm mt-3"
              style={{ color: `${accentColor}CC` }}
              dangerouslySetInnerHTML={{ __html: parseMarkdown(profile.bio) }}
            />
          )}

          {/* Location & Website */}
          <div className="flex flex-wrap gap-3 mt-4 text-sm" style={{ color: `${accentColor}99` }}>
            {profile.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" />
                {profile.location}
              </span>
            )}
            {profile.website && (
              <a 
                href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                className="flex items-center gap-1 hover:underline"
                style={{ color: primaryColor }}
              >
                <Globe className="h-4 w-4" />
                {profile.website.replace(/^https?:\/\//, '')}
              </a>
            )}
          </div>

          {/* Socials */}
          {activeSocials.length > 0 && (
            <div className="flex gap-2 mt-4">
              {activeSocials.map(([key, Icon]) => (
                <div
                  key={key}
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: `${primaryColor}15` }}
                >
                  <Icon className="h-4 w-4" style={{ color: primaryColor }} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Apps */}
      {visibleApps.length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="text-sm font-medium mb-3" style={{ color: accentColor }}>
            Apps
          </h3>
          <div className="space-y-2">
            {visibleApps.slice(0, 3).map(app => (
              <div 
                key={app.id}
                className={`p-3 rounded-lg bg-muted/30 ${getCardClass()}`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
                    {app.logo_url ? (
                      <img src={app.logo_url} alt={app.name || ''} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-sm font-medium" style={{ color: `${accentColor}66` }}>
                        {app.name?.charAt(0) || '?'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate" style={{ color: accentColor }}>
                      {app.name || new URL(app.url).hostname}
                    </p>
                    {app.tagline && (
                      <p className="text-xs truncate" style={{ color: `${accentColor}99` }}>
                        {app.tagline}
                      </p>
                    )}
                  </div>
                  <ExternalLink className="h-4 w-4 flex-shrink-0" style={{ color: `${accentColor}66` }} />
                </div>
              </div>
            ))}
            {visibleApps.length > 3 && (
              <p className="text-xs text-center" style={{ color: `${accentColor}66` }}>
                +{visibleApps.length - 3} más
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="px-6 py-3 border-t border-border/50 text-center">
        <span className="text-xs" style={{ color: `${accentColor}66` }}>
          vibecoders.io/@{profile.username || 'username'}
        </span>
      </div>
    </div>
  );
}
