import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Loader2, Check, AlertCircle, ExternalLink, LogOut, ChevronDown, Shield, Menu, Rocket, Wrench, Crown, User, LayoutDashboard, MessageCircle, FlaskConical, Lightbulb, Globe, X, Zap, Linkedin } from 'lucide-react';
import { useSidebarMenu } from '@/hooks/useSidebarMenu';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/lib/utils';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { GlobalShareButton } from './GlobalShareButton';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { useBetaBadges } from '@/hooks/useBetaBadges';
import { useNotifications } from '@/hooks/useNotifications';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

interface AuthenticatedHeaderProps {
  profile: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
  onSignOut: () => void;
  // Optional save status props (only used in /me)
  isSaving?: boolean;
  lastSaved?: Date | null;
  error?: Error | null;
}

// Format name as "FirstName L." where L is the initial of the last name/word
function formatDisplayName(name: string | null | undefined, fallback: string): string {
  if (!name) return fallback;
  
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  
  return `${firstName} ${lastInitial}.`;
}


export function AuthenticatedHeader({ 
  profile, 
  onSignOut, 
  isSaving, 
  lastSaved, 
  error 
}: AuthenticatedHeaderProps) {
  const location = useLocation();
  const { user } = useAuth();
  const { isPro, isFounder, isFree, loading: subLoading } = useSubscription();
  const { t: tAuth } = useTranslation('auth');
  const { t: tProfile } = useTranslation('profile');
  const { t } = useTranslation('common');
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const { header } = usePageHeader();
  const { items: sidebarMenuItems } = useSidebarMenu();
  const { ownedAppsCount, publicSquadsCount } = useBetaBadges();
  const { unreadCount } = useNotifications();
  const { t: tNotif } = useTranslation('notifications');
  const { isAdmin } = useUserRole();
  const { isInWaitlist } = useWaitlistStatus();

  const displayName = formatDisplayName(profile?.name, tAuth('user'));
  const publicProfileUrl = profile?.username ? `/@${profile.username}` : null;

  const badgeMap: Record<string, number> = {
    'notifications': unreadCount,
    'beta-testing': ownedAppsCount,
    'public-beta-testing': publicSquadsCount,
  };

  const resolveLabel = (labelKey: string): string => {
    const parts = labelKey.split('.');
    if (parts.length === 2 && parts[0] === 'notifications') {
      return tNotif(parts[1]);
    }
    return t(labelKey);
  };

  // Build mobile menu from dynamic sidebar items
  const mobileMenuItems = sidebarMenuItems
    .filter(item => !item.requiresWaitlist || isInWaitlist);

  const isActive = (path: string) => {
    // For /me, match any /me/* route
    if (path === '/me') {
      return location.pathname === '/me' || location.pathname.startsWith('/me/');
    }
    return location.pathname === path;
  };

  // Build navigation links dynamically based on waitlist status
  // Include all Sidebar links here so the header can resolve the title/icon
  const navLinks: { path: string; label: string; icon: typeof User; premium: boolean; isNew?: boolean }[] = [
    { path: '/connections', label: t('navigation.vibers'), icon: User, premium: false },
    { path: '/feedback', label: t('navigation.feedback'), icon: MessageCircle, premium: false },
    { path: '/beta-testing', label: t('navigation.betaTesting'), icon: FlaskConical, premium: false },
    { path: '/public-beta-testing', label: t('navigation.publicBetaTesting'), icon: Rocket, premium: false },
    { path: '/explore', label: t('navigation.startups'), icon: Rocket, premium: false },
    { path: '/tools', label: t('navigation.tools'), icon: Wrench, premium: false },
    ...(isInWaitlist ? [{ path: '/buildlog', label: t('navigation.buildLog'), icon: Crown, premium: true }] : []),
  ];

  const handleNavClick = () => {
    setSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground min-w-0 flex-1">
          {header.element ? (
            // Custom page header content (e.g., app detail with logo + badges)
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {header.element}
            </div>
          ) : (
            <>
              <Link to="/home" className="hover:text-foreground font-medium transition-colors shrink-0">Home</Link>
              {location.pathname !== '/home' && (
                <>
                  <span className="text-border/60">|</span>
                  {(() => {
                     const activeLink = navLinks.find(link => isActive(link.path));
                     const Icon = activeLink?.icon;
                     
                     return (
                      <span className="text-foreground font-medium flex items-center gap-2 truncate">
                        {Icon && <Icon className="h-4 w-4 shrink-0" />}
                        {activeLink?.label || displayName}
                      </span>
                     );
                  })()}
                </>
              )}
            </>
          )}
        </div>
        {/* Mobile: show custom header or logo */}
        <div className="flex md:hidden items-center min-w-0 flex-1">
          {header.element ? (
            <div className="flex items-center gap-2 min-w-0 flex-1">
              {header.element}
            </div>
          ) : (
            <>
           {(() => {
                const activeLink = navLinks.find(link => isActive(link.path));
                const Icon = activeLink?.icon;
                if (activeLink && location.pathname !== '/home') {
                  return (
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      {Icon && <Icon className="h-4 w-4 text-primary shrink-0" />}
                      <span className="font-semibold text-foreground truncate text-sm">{activeLink.label}</span>
                    </div>
                  );
                }
                return (
                  <>
                    <Link to="/home" className="flex items-center shrink-0">
                      <img 
                        src={vibecodersLogo} 
                        alt="Vibecoders" 
                        className="h-10 w-10 rounded-full border-2 border-border hover:border-primary transition-colors"
                      />
                    </Link>
                    <div className="flex ml-2">
                      <GlobalShareButton showText={false} className="h-8 w-8" />
                    </div>
                  </>
                );
              })()}
            </>
          )}
        </div>
          

          {/* Right Zone: Admin + Save Status + Bell + Avatar */}
          <div className="flex items-center gap-3 sm:gap-4 ml-auto">
            {/* Save status indicator - only shown when props are provided */}
            {(isSaving !== undefined || lastSaved !== undefined || error !== undefined) && (
              <div className="flex items-center gap-2 text-sm">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">{t('saving')}</span>
                  </>
                ) : error ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">{t('error')}</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{t('saved')}</span>
                  </>
                ) : null}
              </div>
            )}

            {/* Upgrade Button - only for free tier */}
            {isFree && !subLoading && (
              <div className="relative group">
                {/* Subtle ping animation on the subtle border background */}
                <div className="absolute -inset-[1px] bg-amber-500/30 rounded-full animate-ping opacity-75 group-hover:opacity-100 transition-opacity"></div>
                <Link
                  to="/choose-plan"
                  className="relative flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-gradient-to-b from-stone-800 to-stone-900 hover:from-stone-700 hover:to-stone-800 text-white transition-all duration-300 border border-amber-500/50 hover:border-amber-400/80 shadow-md hover:shadow-[0_0_15px_rgba(245,158,11,0.2)] hover:-translate-y-0.5 overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/10 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]"></div>
                  <span className="relative z-10 text-[11px] sm:text-xs font-bold tracking-wide">
                    {t('upgradeOffer') || '🔥 Oferta expira 28 Feb'}
                  </span>
                </Link>
              </div>
            )}

            {/* Share Button - Desktop */}
            <div className="hidden md:flex items-center border-l border-border/50 pl-3 sm:pl-4">
              <GlobalShareButton showText={false} className="h-8 w-8" />
            </div>

            {/* Notification Bell */}
            <div className="flex items-center border-l border-border/50 pl-3 sm:pl-4">
              <NotificationBell />
            </div>

            {/* User Info - Simplified since main menu is in Sidebar */}
            {/* REMOVED: Profile section is now in the Sidebar footer */}
          </div>


        {/* Mobile Layout - only hamburger menu */}
        <div className="flex md:hidden items-center">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label={t('menu')}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-0 flex flex-col">
              <SheetHeader className="p-5 border-b border-border">
                <SheetTitle className="text-left text-base font-medium text-foreground">{t('menu')}</SheetTitle>
              </SheetHeader>
              
                {/* Navigation Links - Dynamic from sidebar menu */}
                <nav className="flex flex-col px-5 py-6 flex-1 overflow-y-auto">
                  {(() => {
                    let lastSection = '';
                    return mobileMenuItems.map((item) => {
                      const showSeparator = lastSection && item.section !== lastSection;
                      lastSection = item.section;
                      const Icon = item.icon;
                      const badge = badgeMap[item.key] || 0;
                      return (
                        <div key={item.path}>
                          {showSeparator && <Separator className="my-2 bg-border/50" />}
                          <Link
                            to={item.path}
                            onClick={handleNavClick}
                            className={cn(
                              "flex items-center gap-3 text-base py-3 transition-colors",
                              isActive(item.path)
                                ? "text-foreground font-semibold"
                                : "text-muted-foreground hover:text-foreground"
                            )}
                          >
                            <Icon className="h-4 w-4" />
                            <span className="flex-1">{resolveLabel(item.labelKey)}</span>
                            {badge > 0 && (
                              <Badge variant="secondary" className="h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full text-[10px] font-bold border-none">
                                {badge}
                              </Badge>
                            )}
                          </Link>
                        </div>
                      );
                    });
                  })()}

                  {/* Admin Link - Only visible for admins */}
                  {isAdmin && (
                    <>
                      <Separator className="my-2 bg-border/50" />
                      <Link
                        to="/admin"
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 text-base py-3 transition-colors",
                          isActive('/admin')
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Shield className="h-4 w-4" />
                        {t('navigation.admin')}
                      </Link>
                    </>
                  )}
  
                  {/* Mobile Language Switcher */}
                  <div className="mt-4 pt-4 border-t border-border/50">
                    <LanguageSwitcher variant="mobile" className="w-full" />
                  </div>
                </nav>

              {/* User Section - Anchored to bottom */}
              <div className="mt-auto border-t border-border p-5">
                <Link 
                  to="/me/profile"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 group"
                >
                  <Avatar className="h-10 w-10 border border-border group-hover:border-muted-foreground transition-colors">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'Avatar'} referrerPolicy="no-referrer" />
                    <AvatarFallback className="text-sm bg-muted text-muted-foreground font-medium">
                      {profile?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-foreground/80 transition-colors">
                      {profile?.name || tAuth('user')}
                    </p>
                    {profile?.username && (
                      <p className="text-xs text-muted-foreground truncate">@{profile.username}</p>
                    )}
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleNavClick();
                      onSignOut();
                    }}
                    className="p-2 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label={tAuth('signOut')}
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      {header.secondaryNav && (
        <div className="container px-4 pb-3">
          {header.secondaryNav}
        </div>
      )}
    </header>
  );
}
