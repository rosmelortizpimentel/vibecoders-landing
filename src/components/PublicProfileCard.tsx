import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Link as LinkIcon, Github, Instagram, Youtube, Linkedin, Mail, ExternalLink } from 'lucide-react';
import type { PublicProfile, PublicApp } from '@/hooks/usePublicProfile';
import { PioneerBadge } from '@/components/PioneerBadge';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import lovableIcon from '@/assets/logos/lovable-icon.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface PublicProfileCardProps {
  profile: PublicProfile;
}

// X icon (current logo)
const XIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

// TikTok icon
const TikTokIcon = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
  </svg>
);

// Lovable icon component
const LovableIcon = ({ className }: { className?: string }) => (
  <img src={lovableIcon} alt="Lovable" className={className} />
);

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

// App Card Component for public profile
function PublicAppCard({ app }: { app: PublicApp }) {
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
    <a 
      href={appUrl}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer"
    >
      {/* Top Row: Logo + Title + Status */}
      <div className="flex items-start gap-3">
        {/* App Logo */}
        {app.logo_url ? (
          <img 
            src={app.logo_url} 
            alt={app.name || ''} 
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-gray-500">
              {app.name?.charAt(0) || '?'}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row with Status Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {app.name || (() => { try { return new URL(app.url).hostname; } catch { return 'App'; } })()}
            </h4>
            
            {/* Status Badge */}
            {app.status && (
              <span 
                className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700"
              >
                <span 
                  className={`w-1.5 h-1.5 rounded-full ${
                    app.status.slug === 'active' || app.status.slug === 'live' 
                      ? 'bg-cyan-500' 
                      : 'bg-blue-500'
                  }`}
                />
                {app.status.name}
              </span>
            )}
          </div>

          {/* Tagline */}
          {app.tagline && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {app.tagline}
            </p>
          )}
        </div>

        {/* Visit Button */}
        <span className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-200 text-gray-400 hover:text-gray-600 hover:border-gray-300 hover:bg-gray-50 transition-colors flex-shrink-0">
          <ExternalLink className="w-4 h-4" />
        </span>
      </div>

      {/* Bottom Row: Tech Stack Icons */}
      {app.stacks.length > 0 && (
        <div className="flex items-center gap-2 mt-3 pt-2 border-t border-gray-100">
          <TooltipProvider delayDuration={200}>
            {app.stacks.map(stack => (
              <Tooltip key={stack.id}>
                <TooltipTrigger asChild>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img 
                      src={stack.logo_url} 
                      alt={stack.name}
                      className="w-5 h-5 object-contain grayscale opacity-60 hover:grayscale-0 hover:opacity-100 transition-all duration-200"
                    />
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom" className="text-xs">
                  {stack.name}
                </TooltipContent>
              </Tooltip>
            ))}
          </TooltipProvider>
        </div>
      )}
    </a>
  );
}

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  // Load font dynamically
  useEffect(() => {
    if (!profile?.font_family) return;
    
    const fontName = profile.font_family.replace(/ /g, '+');
    const linkId = `public-font-${fontName}`;
    
    if (!document.getElementById(linkId)) {
      const link = document.createElement('link');
      link.id = linkId;
      link.href = `https://fonts.googleapis.com/css2?family=${fontName}:wght@400;500;600;700&display=swap`;
      link.rel = 'stylesheet';
      document.head.appendChild(link);
    }
  }, [profile?.font_family]);

  const fontFamily = profile.font_family || 'CameraPlain, system-ui, sans-serif';
  const username = profile.username || 'username';
  const avatarBorderColor = profile.accent_color || '#FFFFFF';

  // Get active socials
  const activeSocials = socialConfig.filter(({ key }) => profile[key as keyof PublicProfile]);

  return (
    <div 
      className="w-full min-h-screen bg-white"
      style={{ fontFamily }}
    >
      {/* Header - Solo logo que lleva a home */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-gray-100">
        <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img 
            src={vibecodersLogo} 
            alt="Vibecoders" 
            className="h-10 w-10 rounded-full border-2 border-gray-200"
          />
        </Link>
      </div>

      {/* Banner + Avatar */}
      <div className="relative">
        {profile.banner_url ? (
          <div className="h-24 md:h-40 w-full">
            <img 
              src={profile.banner_url} 
              alt="Banner" 
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="h-16 md:h-24 w-full bg-gradient-to-r from-gray-100 to-gray-50" />
        )}
        
        {/* Avatar aligned to the left */}
        <div className="absolute left-4 -bottom-10 md:-bottom-14">
          <Avatar 
            className="h-20 w-20 md:h-28 md:w-28 shadow-md"
            style={{ border: `4px solid ${avatarBorderColor}` }}
          >
            <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} />
            <AvatarFallback className="text-xl md:text-3xl font-bold bg-gray-100 text-gray-600">
              {profile.name?.charAt(0) || '?'}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>

      {/* Main Content */}
      <div className="pt-12 md:pt-16 pb-6 px-4 md:px-6 text-left space-y-3">
        {/* Name + Pioneer Badge */}
        <div className="flex items-center gap-2">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900">
            {profile.name || 'Vibecoder'}
          </h1>
          {profile.is_pioneer && profile.show_pioneer_badge && (
            <PioneerBadge />
          )}
        </div>

        {/* Tagline - directly below name */}
        {profile.tagline && (
          <p className="text-sm md:text-base text-gray-600 italic">
            {profile.tagline}
          </p>
        )}

        {/* Social Icons Row */}
        {activeSocials.length > 0 && (
          <div className="flex items-center gap-2 pt-1">
            {activeSocials.map(({ key, icon: Icon, getUrl }) => {
              const value = profile[key as keyof PublicProfile] as string;
              return (
                <a
                  key={key}
                  href={getUrl(value)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                >
                  <Icon className="h-3.5 w-3.5 md:h-4 md:w-4 text-gray-700" />
                </a>
              );
            })}
          </div>
        )}

        {/* Location & Website */}
        {(profile.location || profile.website) && (
          <div className="space-y-1 pt-2">
            {profile.location && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
                <MapPin className="h-3.5 w-3.5" />
                <span>{profile.location}</span>
              </div>
            )}
            {profile.website && (
              <div className="flex items-center gap-1.5 text-sm text-gray-500">
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

      {/* Apps Section */}
      {profile.apps.length > 0 && (
        <div className="border-t border-gray-100 px-4 md:px-6 py-4 bg-gray-50/50">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">
            Apps
          </p>
          {/* Mobile: single column, Desktop: grid of 2 */}
          <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
            {profile.apps.map(app => (
              <PublicAppCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="py-3 text-center border-t border-gray-100 bg-white">
        <p className="text-[10px] md:text-xs text-gray-400">
          <span className="text-gray-500">
            vibecoders.la/@{username}
          </span>
        </p>
      </div>
    </div>
  );
}
