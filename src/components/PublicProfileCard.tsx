import { useEffect, useState } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Link as LinkIcon, Github, Instagram, Youtube, Linkedin, Mail, ExternalLink, BadgeCheck, Calendar, Share2, Globe, Twitter, ArrowLeft, MousePointerClick, Heart, UserPlus, UserCheck, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { PublicProfile, PublicApp } from '@/hooks/usePublicProfile';
import { useTranslation } from '@/hooks/useTranslation';
import { PioneerBadge } from '@/components/PioneerBadge';
import { ContributorBadge } from '@/components/ContributorBadge';

import { FollowButton } from '@/components/FollowButton';
import { FollowersList } from '@/components/profile/FollowersList';
import { BetaContributionsBadges } from '@/components/beta/BetaContributionsBadges';
import { useFollow } from '@/hooks/useFollow';
import { useFavicon } from '@/hooks/useFavicon';
import { useAuth } from '@/hooks/useAuth';
import { useProfileStats } from '@/hooks/useProfileStats';
import { useProfileTracking, trackAppClick } from '@/hooks/useProfileTracking';
import { Eye } from 'lucide-react';
import { AppLikeButton } from '@/components/profile/AppLikeButton';
import { getStatusColors } from '@/lib/appStatusColors';
import lovableIcon from '@/assets/logos/lovable-icon.png';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { AppDetailView } from './profile/AppDetailView';
import { AuthModal } from './auth/AuthModal';

interface PublicProfileCardProps {
  profile: PublicProfile;
  onNavigateToProfile?: (username: string) => void;
}

type ViewMode = 'apps' | 'followers' | 'following';

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

// App Card Component for public profile
function PublicAppCard({ 
  app, 
  profileId,
  isOwner,
   ownerLikeCount,
   ownerClickCount,
   onSelect
}: { 
  app: PublicApp; 
  profileId: string;
  isOwner: boolean;
  ownerLikeCount?: number;
   ownerClickCount?: number;
   onSelect: () => void;
}) {
  const { t } = useTranslation('publicProfile');

  const appUrl = (() => {
    try {
      // Normalize URL first - prepend https:// if missing
      const normalized = app.url.trim();
      const urlWithProtocol = normalized.startsWith('http://') || normalized.startsWith('https://') 
        ? normalized 
        : `https://${normalized}`;
      const url = new URL(urlWithProtocol);
      url.searchParams.set('ref', 'vibecoders.la');
      return url.toString();
    } catch {
      // Fallback: just prepend https:// if missing
      const normalized = app.url.trim();
      return normalized.startsWith('http://') || normalized.startsWith('https://') 
        ? normalized 
        : `https://${normalized}`;
    }
  })();

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    onSelect();
    // Track the click asynchronously
    trackAppClick(app.id, profileId);
  };

  return (
    <div 
      onClick={handleClick}
      className="block p-3 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all cursor-pointer group"
    >
      {/* Top Row: Logo + Title + Status */}
      <div className="flex items-start gap-3">
        {/* App Logo */}
        {app.logo_url ? (
          <img 
            src={app.logo_url} 
            alt={app.name || ''} 
            className="w-10 h-10 rounded-full object-contain bg-white border border-gray-100 flex-shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
            <span className="text-sm font-medium text-gray-500">
              {app.name?.charAt(0) || '?'}
            </span>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Title Row with Status Badge */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <h4 className="text-sm font-semibold text-gray-900 truncate">
              {app.name || (() => { 
                try { 
                  const normalized = app.url.trim();
                  const urlWithProtocol = normalized.startsWith('http://') || normalized.startsWith('https://') 
                    ? normalized 
                    : `https://${normalized}`;
                  return new URL(urlWithProtocol).hostname; 
                } catch { 
                  return 'App'; 
                } 
              })()}
            </h4>
            
            {/* Verified Badge */}
            {app.is_verified && (
              <Tooltip>
                <TooltipTrigger asChild>
                  <BadgeCheck className="h-4 w-4 text-black flex-shrink-0" />
                </TooltipTrigger>
                <TooltipContent side="top" className="text-xs">
                  Verificado
                </TooltipContent>
              </Tooltip>
            )}

            {/* Removed Status Badge from here */}
          </div>

          {/* Tagline - Fixed height for 2 lines to ensure uniformity */}
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2 h-8">
            {app.tagline}
          </p>
        </div>

        {/* Badges aligned to right */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {app.beta_active && (
            <TooltipProvider delayDuration={200}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="relative group cursor-help flex-shrink-0">
                    <div className="absolute -inset-[1px] bg-indigo-500/30 rounded-full animate-ping opacity-75 group-hover:opacity-100 transition-opacity"></div>
                    <span className="relative inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium bg-indigo-100 text-indigo-700">
                      <Zap className="w-2.5 h-2.5 fill-current" />
                      Open Beta
                    </span>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top">
                  <p className="text-xs">{t('openBetaTooltip')}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {app.status && (() => {
            const statusColors = getStatusColors(app.status.slug);
            return (
              <span 
                className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-medium ${statusColors.bg} ${statusColors.text} flex-shrink-0`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${statusColors.dot}`} />
                {app.status.name.toUpperCase()}
              </span>
            );
          })()}
        </div>
      </div>

      {/* Bottom Row: Tech Stack Icons */}
      <div className="flex items-center justify-between gap-2 mt-3 pt-2 border-t border-gray-100">
        {/* Tech Stack Icons */}
        <div className="flex items-center gap-2">
          <TooltipProvider delayDuration={200}>
            {app.stacks.slice(0, 4).map(stack => (
              <Tooltip key={stack.id}>
                <TooltipTrigger asChild>
                  <div className="w-5 h-5 flex items-center justify-center">
                    <img 
                      src={stack.logo_url} 
                      alt={stack.name}
                      className="w-5 h-5 object-contain grayscale hover:grayscale-0 transition-all duration-200"
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

        {/* Like Button */}
        <AppLikeButton 
          appId={app.id} 
          isOwner={isOwner}
          ownerLikeCount={ownerLikeCount}
          ownerClickCount={ownerClickCount}
          appName={app.name || undefined}
        />
      </div>
    </div>
  );
}

export function PublicProfileCard({ profile, onNavigateToProfile }: PublicProfileCardProps) {
  const { user } = useAuth();
  const [showAuthModal, setShowAuthModal] = useState(false);
  const { isFollowing, isLoading: followLoading, followersCount, followingCount, toggleFollow, refetch: refetchFollowData } = useFollow(profile.id);
  const [viewMode, setViewMode] = useState<ViewMode>('apps');
  const [selectedAppIndex, setSelectedAppIndex] = useState<number | null>(null);
  const [selectedBetaApp, setSelectedBetaApp] = useState<PublicApp | null>(null);
  const { stats, isOwnProfile } = useProfileStats(profile.id);

  // Track profile view
  useProfileTracking(profile.id);


  // Dynamic favicon with user's avatar
  useFavicon(profile.avatar_url || undefined);

  // Reset view mode when profile changes
  useEffect(() => {
    setViewMode('apps');
  }, [profile.id]);

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
  const avatarPosition = profile.avatar_position || 'center';
  const bannerPosition = profile.banner_position || 'center';

  // Avatar position classes
  const avatarPositionClasses = {
    left: 'left-4 md:left-6',
    center: 'left-1/2 -translate-x-1/2',
    right: 'right-4 md:right-6'
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

  const handleBookingClick = (e: React.MouseEvent) => {
    if (!user) {
      e.preventDefault();
      setShowAuthModal(true);
    }
  };

  // Get active socials
  const activeSocials = socialConfig.filter(({ key }) => profile[key as keyof PublicProfile]);

  const handleNavigateToProfile = (targetUsername: string) => {
    if (onNavigateToProfile) {
      onNavigateToProfile(targetUsername);
    }
  };

  return (
    <div 
      className="w-full bg-white flex flex-col flex-1"
      style={{ fontFamily }}
    >
      {/* Content container - centered on desktop */}
      <div className="w-full max-w-4xl mx-auto flex flex-col flex-1">
        {/* Banner + Avatar */}
        <div className="relative">
          {profile.banner_url ? (
            <div className={`aspect-[4/1] w-full md:mt-4 md:mx-auto md:rounded-2xl overflow-hidden bg-gray-50 flex items-center ${bannerPositionClasses[bannerPosition]}`}>
              <img 
                src={profile.banner_url} 
                alt="Banner" 
                className="max-w-full max-h-full object-contain"
              />
            </div>
          ) : (
            <div className="aspect-[4/1] w-full md:mt-4 md:mx-auto md:rounded-2xl bg-gradient-to-r from-gray-100 to-gray-50" />
          )}
          
          {/* Avatar with dynamic position */}
          <div className={`absolute -bottom-10 md:-bottom-14 ${avatarPositionClasses[avatarPosition]}`}>
            <Avatar 
              className="h-20 w-20 md:h-28 md:w-28 shadow-md"
              style={{ border: `4px solid ${avatarBorderColor}` }}
            >
              <AvatarImage src={profile.avatar_url || ''} alt={profile.name || ''} referrerPolicy="no-referrer" />
              <AvatarFallback className="text-xl md:text-3xl font-bold bg-gray-100 text-gray-600">
                {profile.name?.charAt(0) || '?'}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>

        {/* Main Content */}
        <div className={`pt-12 md:pt-16 pb-6 px-4 md:px-6 flex flex-col ${contentAlignmentClasses[avatarPosition]}`}>
          {/* Name + Pioneer Badge Container - Now justify-between */}
          <div className={`w-full flex items-center gap-4 ${avatarPosition === 'center' ? 'justify-center' : 'justify-between'}`}>
            <div className={`flex items-center gap-2 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                {profile.name || 'Vibecoder'}
              </h1>
              {profile.is_pioneer && profile.show_pioneer_badge && (
                <PioneerBadge />
              )}
              {profile.is_contributor && profile.show_contributor_badge && (
                <ContributorBadge />
              )}
            </div>

            {profile.booking_url && (
              <a
                href={profile.booking_url.startsWith('http') ? profile.booking_url : `https://${profile.booking_url}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleBookingClick}
                style={{
                  backgroundColor: profile.primary_color || '#3D5AFE',
                  color: profile.accent_color || '#FFFFFF',
                }}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm hover:opacity-90 transition-opacity"
              >
                <span className="hidden sm:inline">{profile.booking_button_text || 'Book a call'}</span>
                <Calendar className="h-3.5 w-3.5" style={{ color: profile.accent_color || '#FFFFFF' }} />
              </a>
            )}
          </div>

          <AuthModal
            isOpen={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            title={`Agenda una llamada con ${profile.name || 'este Vibecoder'}`}
            description="Inicia sesión para poder agendar una llamada y conectar con otros builders de la comunidad."
          />

          {/* Username + Followers (Clickeable) */}
          <div className={`flex items-center gap-2 text-sm text-gray-500 mt-2 ${avatarPosition === 'right' ? 'flex-row-reverse' : ''}`}>
            <button 
              onClick={() => setViewMode(viewMode === 'following' ? 'apps' : 'following')}
              className={`cursor-pointer hover:text-gray-900 hover:underline transition-colors ${viewMode === 'following' ? 'text-gray-900 font-medium underline' : ''}`}
            >
              <strong className="text-gray-900">{followingCount}</strong> siguiendo
            </button>
            <button 
              onClick={() => setViewMode(viewMode === 'followers' ? 'apps' : 'followers')}
              className={`cursor-pointer hover:text-gray-900 hover:underline transition-colors ${viewMode === 'followers' ? 'text-gray-900 font-medium underline' : ''}`}
            >
              <strong className="text-gray-900">{followersCount}</strong> seguidores
            </button>
            <span>·</span>
            <span>@{username}</span>
           {isOwnProfile && stats && stats.profileViews > 0 && (
             <>
               <span>·</span>
               <span className="flex items-center gap-1">
                 <Eye className="w-3.5 h-3.5" />
                 {stats.profileViews} visitas
               </span>
             </>
           )}
          </div>

          {/* Tagline */}
          {profile.tagline && (
            <p className="text-sm md:text-base text-gray-600 italic mt-2">
              {profile.tagline}
            </p>
          )}

          {/* Follow Button - Don't show on own profile */}
          {!isOwnProfile && (
            <div className="mt-4">
              <FollowButton
                isFollowing={isFollowing}
                isLoading={followLoading}
                onToggleFollow={toggleFollow}
                profileUsername={profile.username}
                profileId={profile.id}
                profileName={profile.name}
                profileAvatarUrl={profile.avatar_url}
              />
            </div>
          )}

          {/* Social Icons Row */}
          {activeSocials.length > 0 && (
            <div className={`flex items-center gap-2 pt-4 ${avatarPosition === 'center' ? 'justify-center' : avatarPosition === 'right' ? 'justify-end flex-row-reverse' : ''}`}>
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
            <div className={`space-y-1 pt-3 flex flex-col ${contentAlignmentClasses[avatarPosition]}`}>
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

        {/* Apps Section OR Followers/Following List */}
        {viewMode === 'apps' ? (
          profile.apps.length > 0 && (
            <div className="border-t border-gray-100 px-4 md:px-6 py-4 bg-gray-50/50">
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3 mt-10">
                Apps
              </p>
              {/* Mobile: single column, Desktop: grid of 2 */}
              <div className="space-y-2 md:grid md:grid-cols-2 md:gap-3 md:space-y-0">
                {profile.apps.map((app, index) => (
                  <PublicAppCard 
                    key={app.id} 
                    app={app} 
                    profileId={profile.id}
                    isOwner={isOwnProfile}
                    ownerLikeCount={stats?.appLikes[app.id]}
                    ownerClickCount={stats?.appClicksByApp[app.id]}
                    onSelect={() => setSelectedAppIndex(index)}
                  />
                ))}
              </div>
            </div>
          )
        ) : (
          <FollowersList
            profileId={profile.id}
            type={viewMode}
            onBack={() => setViewMode('apps')}
            onNavigateToProfile={handleNavigateToProfile}
            onFollowChange={refetchFollowData}
          />
        )}

        {/* Beta Contributions Badges */}
        {viewMode === 'apps' && (
        <BetaContributionsBadges 
            userId={profile.id} 
            onAppClick={(app) => setSelectedBetaApp(app)}
          />
        )}
        <div className="mt-auto py-8 border-t border-gray-100 bg-white">
          <button
            onClick={() => {
              // Save return URL for post-login redirect to /me/profile
              localStorage.setItem('authReturnUrl', '/me/profile');
              // Trigger Google sign-in
              import('@/integrations/supabase/client').then(({ supabase }) => {
                supabase.auth.signInWithOAuth({
                  provider: 'google',
                  options: {
                    redirectTo: `${window.location.origin}/me/profile`,
                  },
                });
              });
            }}
            className="flex items-center justify-center gap-2 mx-auto px-4 py-2 rounded-full bg-gray-50 hover:bg-gray-100 border border-gray-200 transition-colors group"
          >
            <img 
              src={vibecodersLogo} 
              alt="Vibecoders" 
              className="h-6 w-6 rounded-full border-2 border-white shadow-sm"
            />
            <span className="text-xs font-medium text-gray-600 group-hover:text-gray-900 transition-colors">
              Crea tu Perfil
            </span>
          </button>
        </div>
      </div>

      <AppDetailView 
        apps={selectedBetaApp ? [selectedBetaApp] : profile.apps}
        selectedIndex={selectedBetaApp ? 0 : selectedAppIndex}
        onClose={() => {
          setSelectedAppIndex(null);
          setSelectedBetaApp(null);
        }}
        onNavigate={(index) => {
          if (selectedBetaApp) return; // No navigation for single beta app
          setSelectedAppIndex(index);
        }}
        defaultOwner={{
          id: profile.id,
          username: profile.username,
          name: profile.name,
          avatar_url: profile.avatar_url,
          tagline: profile.tagline
        }}
      />
    </div>
  );
}
