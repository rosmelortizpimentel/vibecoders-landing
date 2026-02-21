import { useEffect } from 'react';
import { ProfileData } from '@/hooks/useProfileEditor';
import { AppData } from '@/hooks/useApps';
import { useStatuses } from '@/hooks/useStatuses';
import { useTechStacks } from '@/hooks/useTechStacks';
import { useTranslation } from '@/hooks/useTranslation';
import { useFollow } from '@/hooks/useFollow';
import { cn } from '@/lib/utils';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { MapPin, Link as LinkIcon, Github, Instagram, Youtube, Linkedin, Mail, ExternalLink, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
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

// Smart URL normalizer: if the value already looks like a URL (contains a dot + slash or www.), 
// just ensure it has https://. Otherwise, treat it as a username/handle.
const normalizeUrl = (value: string, baseUrl: string): string => {
  const v = value.trim();
  if (v.startsWith('http://') || v.startsWith('https://')) return v;
  if (v.includes('.') && (v.includes('/') || v.startsWith('www.'))) return `https://${v}`;
  return `${baseUrl}${v}`;
};

const socialConfig = [
  { key: 'lovable', icon: LovableIcon, getUrl: (v: string) => normalizeUrl(v, 'https://lovable.dev/@') },
  { key: 'linkedin', icon: Linkedin, getUrl: (v: string) => normalizeUrl(v, 'https://linkedin.com/in/') },
  { key: 'twitter', icon: XIcon, getUrl: (v: string) => normalizeUrl(v, 'https://x.com/') },
  { key: 'instagram', icon: Instagram, getUrl: (v: string) => normalizeUrl(v, 'https://instagram.com/@') },
  { key: 'youtube', icon: Youtube, getUrl: (v: string) => normalizeUrl(v, 'https://youtube.com/@') },
  { key: 'tiktok', icon: TikTokIcon, getUrl: (v: string) => normalizeUrl(v, 'https://tiktok.com/@') },
  { key: 'github', icon: Github, getUrl: (v: string) => normalizeUrl(v, 'https://github.com/') },
  { key: 'email_public', icon: Mail, getUrl: (v: string) => `mailto:${v}` },
] as const;

export function ProfilePreview({ profile, apps, isMobileSheet = false }: ProfilePreviewProps) {
  const { statuses } = useStatuses();
  const { stacks } = useTechStacks();
  const t = useTranslation('profile');
  const visibleApps = apps.filter(app => app.is_visible);
  
  // Get real follow counts (Must be called before any early return)
  const { followersCount, followingCount } = useFollow(profile?.id);

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
    <div className="w-full flex flex-col items-center">
      {/* Preview Header - hide in mobile sheet */}
      {!isMobileSheet && (
        <div className="w-full max-w-[320px] flex items-center justify-between px-2 mb-3">
          <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vista Previa Móvil</span>
          <a 
            href={`${window.location.origin}/@${username}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-full"
            title={(t as any).viewLive || 'Ver sitio en vivo'}
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      )}
      
      {/* Phone Mockup Container */}
      <div 
        className={cn(
          "relative transition-all duration-500",
          !isMobileSheet 
            ? "w-[300px] h-[600px] border-[8px] border-slate-900 rounded-[2.2rem] shadow-[0_45px_100px_-20px_rgba(0,0,0,0.6)] bg-slate-900 ring-2 ring-slate-800/50 group" 
            : "w-full min-h-screen"
        )}
      >
        {/* Internal Screen Container with Independent Scroll */}
        <div 
          className={cn(
            "w-full bg-white overflow-x-hidden transition-all duration-300",
            !isMobileSheet 
              ? "h-full overflow-y-auto rounded-[1.8rem] relative custom-mobile-scroll" 
              : "min-h-screen"
          )}
          style={{ 
            fontFamily,
            scrollbarWidth: 'none', // Hide standard scrollbar for Firefox
            msOverflowStyle: 'none', // Hide for IE
          }}
        >
          {/* Style injection for custom scrollbar (only for the mockup) */}
          {!isMobileSheet && (
            <style>{`
              .custom-mobile-scroll::-webkit-scrollbar {
                width: 4px;
              }
              .custom-mobile-scroll::-webkit-scrollbar-track {
                background: transparent;
              }
              .custom-mobile-scroll::-webkit-scrollbar-thumb {
                background: rgba(0,0,0,0.1);
                border-radius: 10px;
              }
              .custom-mobile-scroll::-webkit-scrollbar-thumb:hover {
                background: rgba(0,0,0,0.2);
              }
            `}</style>
          )}

          {/* Banner + Avatar */}
          <div className="relative">
            {profile.banner_url ? (
              <div className="aspect-[4/1.2] w-full relative overflow-hidden bg-gray-50">
                <img 
                  src={profile.banner_url} 
                  alt="Banner" 
                  className="absolute inset-0 w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="aspect-[4/1.2] w-full bg-gradient-to-r from-gray-100 to-gray-50" />
            )}
            
            {/* Avatar with dynamic position */}
            <div className={`absolute -bottom-8 ${positionClasses[avatarPosition]}`}>
              <Avatar 
                className="h-16 w-16 shadow-lg"
                style={{ border: `3px solid ${avatarBorderColor}` }}
              >
                <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} />
                <AvatarFallback className="text-xl font-bold bg-gray-100 text-gray-600">
                  {profile.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>

          {/* Main Content - Scaled down fonts */}
          <div className={`pt-10 pb-6 px-4 space-y-3.5 flex flex-col ${contentAlignmentClasses[avatarPosition]}`}>
            {/* Name + Pioneer Badge Container */}
            <div className={`w-full flex items-center gap-3 ${avatarPosition === 'center' ? 'justify-center' : 'justify-between'}`}>
              <div className={`flex items-center gap-1.5 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                <h2 className="text-base font-bold text-gray-900 tracking-tight">
                  {profile.name || 'Tu Nombre'}
                </h2>
                {profile.is_pioneer && profile.show_pioneer_badge && (
                  <PioneerBadge />
                )}
              </div>

              {profile.booking_url && (
                <a
                  href={profile.booking_url.startsWith('http') ? profile.booking_url : `https://${profile.booking_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    backgroundColor: profile.primary_color || '#3D5AFE',
                    color: profile.accent_color || '#FFFFFF',
                  }}
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold whitespace-nowrap shadow-sm hover:opacity-90 transition-opacity"
                >
                  <span>{profile.booking_button_text || 'Hablemos'}</span>
                  <Calendar className="h-2.5 w-2.5" style={{ color: profile.accent_color || '#FFFFFF' }} />
                </a>
              )}
            </div>

            {/* Tagline */}
            {profile.tagline && (
              <p className="text-xs text-gray-600 leading-relaxed font-medium">
                {profile.tagline}
              </p>
            )}

            {/* Username + Stats Row (Public Profile Style) */}
            <div className={`flex items-center gap-2 text-[10px] text-slate-500 font-medium ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900">{followingCount}</span>
                <span>siguiendo</span>
              </div>
              <div className="flex items-center gap-1">
                <span className="font-bold text-slate-900">{followersCount}</span>
                <span>seguidores</span>
              </div>
              <span>·</span>
              <span className="font-semibold text-slate-400">@{username}</span>
            </div>

            {/* Social Icons Row */}
            {activeSocials.length > 0 && (
              <div className={`flex flex-wrap items-center gap-1.5 pt-1 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                {activeSocials.map(({ key, icon: Icon, getUrl }) => {
                  const value = profile[key as keyof ProfileData] as string;
                  return (
                    <a
                      key={key}
                      href={getUrl(value)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-7 h-7 flex items-center justify-center rounded-full bg-slate-50 border border-slate-100 hover:bg-slate-100 transition-colors"
                    >
                      <Icon className="h-3 w-3 text-slate-600" />
                    </a>
                  );
                })}
              </div>
            )}

            {(profile.location || profile.website) && (
              <div className="space-y-1 pt-1">
                {profile.location && (
                  <div className={`flex items-center gap-2 text-[11px] text-slate-500 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                    <MapPin className="h-3 w-3 text-slate-400" />
                    <span>{profile.location}</span>
                  </div>
                )}
                {profile.website && (
                  <div className={`flex items-center gap-2 text-[11px] text-slate-500 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
                    <LinkIcon className="h-3 w-3 text-slate-400" />
                    <a 
                      href={profile.website.startsWith('http') ? profile.website : `https://${profile.website}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-primary transition-colors font-medium"
                    >
                      {profile.website.replace(/^https?:\/\//, '')}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Apps Section */}
          {visibleApps.length > 0 && (
            <div className="border-t border-slate-100 px-4 py-5 bg-slate-50/30">
              <p className="text-[9px] font-extrabold text-slate-400 uppercase tracking-[0.2em] mb-4">
                Apps
              </p>
              <div className="space-y-3">
                {visibleApps.map(app => {
                  const appUrl = (() => {
                    try {
                      const normalized = app.url.trim();
                      const urlWithProtocol = normalized.startsWith('http://') || normalized.startsWith('https://') 
                        ? normalized 
                        : `https://${normalized}`;
                      const url = new URL(urlWithProtocol);
                      url.searchParams.set('ref', 'vibecoders.la');
                      return url.toString();
                    } catch {
                      const normalized = app.url.trim();
                      return normalized.startsWith('http://') || normalized.startsWith('https://') 
                        ? normalized 
                        : `https://${normalized}`;
                    }
                  })();
                  
                  return (
                    <div key={app.id} className="scale-[0.95] origin-left">
                      <PreviewAppCard 
                        app={app}
                        statuses={statuses}
                        stacks={stacks}
                        appUrl={appUrl}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer - minimal */}
          <div className="py-10 px-6 flex flex-col items-center justify-center gap-2.5 opacity-30">
            <img src={vibecodersLogo} alt="Vibecoders" className="h-4 w-auto grayscale" />
          </div>
        </div>

        {/* Improved Side Buttons (Hardware Look) */}
        {!isMobileSheet && (
          <div className="absolute -left-2 top-0 bottom-0 py-24 flex flex-col gap-4 pointer-events-none">
            <div className="w-[3px] h-8 bg-slate-800 rounded-l-sm border-l border-white/5 shadow-sm" />
            <div className="w-[3px] h-12 bg-slate-800 rounded-l-sm border-l border-white/5 shadow-sm" />
            <div className="w-[3px] h-12 bg-slate-800 rounded-l-sm border-l border-white/5 shadow-sm" />
          </div>
        )}
        {!isMobileSheet && (
          <div className="absolute -right-2 top-32 pointer-events-none">
            <div className="w-[3px] h-16 bg-slate-800 rounded-r-sm border-r border-white/5 shadow-sm" />
          </div>
        )}
      </div>
    </div>
  );
}
