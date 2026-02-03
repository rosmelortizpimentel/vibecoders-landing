import { useEffect } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { AppData } from '@/hooks/useApps';
import { useStatuses } from '@/hooks/useStatuses';
import { useTechStacks } from '@/hooks/useTechStacks';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Link as LinkIcon, Github, Instagram, Youtube, Linkedin, Mail } from 'lucide-react';
import lovableIcon from '@/assets/logos/lovable-icon.png';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import { PreviewAppCard } from './PreviewAppCard';
import { PioneerBadge } from '@/components/PioneerBadge';

// X icon (current logo)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// TikTok icon (not in lucide-react)
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

// Lovable icon component
const LovableIcon = ({ className }: { className?: string }) => (
  <img src={lovableIcon} alt="Lovable" className={className} />
);

interface ProfilePreviewProps {
  profile: ProfileData | null;
  apps: AppData[];
  isMobileSheet?: boolean;
}

const socialConfig = [
  { key: 'lovable', icon: LovableIcon, getUrl: (v: string) => v.startsWith('http') ? v : `https://lovable.dev/@${v}` },
  { key: 'linkedin', icon: Linkedin, getUrl: (v: string) => v.startsWith('http') ? v : `https://linkedin.com/in/${v}` },
  { key: 'twitter', icon: XIcon, getUrl: (v: string) => v.startsWith('http') ? v : `https://x.com/${v}` },
  { key: 'instagram', icon: Instagram, getUrl: (v: string) => v.startsWith('http') ? v : `https://instagram.com/${v}` },
  { key: 'youtube', icon: Youtube, getUrl: (v: string) => v.startsWith('http') ? v : `https://youtube.com/@${v}` },
  { key: 'tiktok', icon: TikTokIcon, getUrl: (v: string) => v.startsWith('http') ? v : `https://tiktok.com/@${v}` },
  { key: 'github', icon: Github, getUrl: (v: string) => v.startsWith('http') ? v : `https://github.com/${v}` },
  { key: 'email_public', icon: Mail, getUrl: (v: string) => `mailto:${v}` },
] as const;

export function ProfilePreview({ profile, apps, isMobileSheet = false }: ProfilePreviewProps) {
  const { statuses } = useStatuses();
  const { stacks } = useTechStacks();
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

  const fontFamily = profile.font_family || 'CameraPlain, system-ui, sans-serif';
  const username = profile.username || 'username';
  const avatarBorderColor = profile.accent_color || '#FFFFFF';
  const avatarPosition = profile.avatar_position || 'center';
  const bannerPosition = profile.banner_position || 'center';
  
  // Dynamic base URL for footer
  const baseHost = window.location.host;

  // Avatar position classes
  const positionClasses = {
    left: 'left-4',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-4'
  };

  // Banner position classes (flexbox alignment)
  const bannerPositionClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end'
  };

  // Content alignment classes based on avatar position
  const contentAlignmentClasses = {
    left: 'text-left items-start',
    center: 'text-center items-center',
    right: 'text-right items-end'
  };

  // Get active socials
  const activeSocials = socialConfig.filter(({ key }) => profile[key as keyof ProfileData]);

  return (
    <div className="space-y-3">
      {/* Preview Header - hide in mobile sheet */}
      {!isMobileSheet && (
        <div className="flex items-center gap-2 px-1">
          <span className="text-sm font-medium text-slate-500">Vista Previa</span>
        </div>
      )}
      
      {/* Preview Card */}
      <div 
        className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm w-full bg-white"
        style={{ fontFamily }}
      >
      {/* App-style Header - Logo on the left */}
      <div className="flex items-center justify-start px-4 py-2 bg-white border-b border-gray-100">
        <img 
          src={vibecodersLogo} 
          alt="Vibecoders" 
          className="h-10 w-10 rounded-full border-2 border-gray-200"
        />
      </div>

      {/* Banner + Avatar */}
      <div className="relative">
        {profile.banner_url ? (
          <div className={`aspect-[4/1] w-full flex items-center bg-gray-50 ${bannerPositionClasses[bannerPosition]}`}>
            <img 
              src={profile.banner_url} 
              alt="Banner" 
              className="max-w-full max-h-full object-contain"
            />
          </div>
        ) : (
          <div className="aspect-[4/1] w-full bg-gradient-to-r from-gray-100 to-gray-50" />
        )}
        
        {/* Avatar with dynamic position */}
        <div className={`absolute -bottom-10 md:-bottom-12 ${positionClasses[avatarPosition]}`}>
          <Avatar 
            className="h-20 w-20 md:h-24 md:w-24 shadow-md"
            style={{ border: `4px solid ${avatarBorderColor}` }}
          >
            <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} />
            <AvatarFallback className="text-xl md:text-2xl font-bold bg-gray-100 text-gray-600">
              {profile.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Content */}
      <div className={`pt-12 md:pt-14 pb-6 px-4 md:px-6 space-y-3 flex flex-col ${contentAlignmentClasses[avatarPosition]}`}>
        {/* Name + Pioneer Badge */}
        <div className={`flex items-center gap-2 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
          <h2 className="text-lg md:text-xl font-bold text-gray-900">
            {profile.name || 'Tu Nombre'}
          </h2>
          {profile.is_pioneer && profile.show_pioneer_badge && (
            <PioneerBadge />
          )}
        </div>

        {/* Tagline - directly below name */}
        {profile.tagline && (
          <p className="text-sm text-gray-600 italic">
            {profile.tagline}
          </p>
        )}

        {/* Social Icons Row - only if there are active socials */}
        {activeSocials.length > 0 && (
          <div className={`flex items-center gap-2 pt-1 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
            {activeSocials.map(({ key, icon: Icon, getUrl }) => {
              const value = profile[key as keyof ProfileData] as string;
              return (
                <a
                  key={key}
                  href={getUrl(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 text-gray-700" />
                </a>
              );
            })}
          </div>
        )}

        {(profile.location || profile.website) && (
          <div className="space-y-1 pt-2">
            {profile.location && (
              <div className={`flex items-center gap-1.5 text-sm text-gray-500 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                <MapPin className="h-3.5 w-3.5" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <div className={`flex items-center gap-1.5 text-sm text-gray-500 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                <LinkIcon className="h-3.5 w-3.5" />
                <a 
                  href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-gray-700 hover:underline"
                >
                  {profile.website.replace(/^https?:\/\//, '')}
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Apps Section - only if there are visible apps */}
      {visibleApps.length > 0 && (
        <div className="border-t border-gray-100 px-4 md:px-6 py-4 bg-gray-50/50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Apps
          </p>
          <div className="space-y-2">
            {visibleApps.slice(0, 3).map(app => {
              // Generate app URL with ref
              const appUrl = (() => {
                try {
                  const url = new URL(app.url);
                  url.searchParams.set('ref', 'vibecoders.la');
                  return url.toString();
                } catch {
                  return app.url;
                }
              })();
              
              return (
                <PreviewAppCard 
                  key={app.id}
                  app={app}
                  statuses={statuses}
                  stacks={stacks}
                  appUrl={appUrl}
                />
              );
            })}
            {visibleApps.length > 3 && (
              <p className="text-xs text-center text-gray-400 pt-1">
                +{visibleApps.length - 3} más
              </p>
            )}
          </div>
        </div>
      )}

      {/* Footer with dynamic base path */}
      <div className="py-3 text-center border-t border-gray-100 bg-white">
        <p className="text-[10px] md:text-xs text-gray-400">
          <a 
            href={`${window.location.origin}/@${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-gray-700 hover:underline"
          >
            {baseHost}/@{username}
          </a>
        </p>
      </div>
      </div>
    </div>
  );
}
