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
import { Loader2, Check, AlertCircle, ExternalLink, LogOut, ChevronDown, Shield, Menu, Rocket, Wrench, Crown, User, LayoutDashboard, MessageCircle, FlaskConical, Lightbulb, Globe, X, Zap } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import { useSubscription } from '@/hooks/useSubscription';
import { useTranslation } from '@/hooks/useTranslation';
import { cn } from '@/lib/utils';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { NotificationBell } from '@/components/notifications/NotificationBell';

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
  const t = useTranslation('common');
  const tAuth = useTranslation('auth');
  const tProfile = useTranslation('profile');
  const { isFree, loading: subLoading } = useSubscription();
  
  const displayName = formatDisplayName(profile?.name, tAuth.user);
  const publicProfileUrl = profile?.username ? `/@${profile.username}` : null;
  const { isAdmin } = useUserRole();
  const { isInWaitlist } = useWaitlistStatus();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);
  const [open, setOpen] = useState(false);

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
    { path: '/home', label: t.navigation.home, icon: LayoutDashboard, premium: false },
    { path: '/me', label: t.navigation.myProfile, icon: User, premium: false },
    { path: '/ideas', label: t.navigation.myIdeas, icon: Lightbulb, premium: false },
    { path: '/beta-testing', label: t.navigation.betaTesting, icon: FlaskConical, premium: false },
    { path: '/public-beta-testing', label: t.navigation.publicBetaTesting, icon: Rocket, premium: false },
    { path: '/explore', label: t.navigation.startups, icon: Rocket, premium: false },
    { path: '/tools', label: t.navigation.tools, icon: Wrench, premium: false },
    { path: '/feedback', label: t.navigation.feedback, icon: MessageCircle, premium: false },
    ...(isInWaitlist ? [{ path: '/buildlog', label: t.navigation.buildLog, icon: Crown, premium: true }] : []),
  ];

  const handleNavClick = () => {
    setSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Mobile Logo - hidden on desktop (moved to sidebar) */}
        <Link to="/home" className="flex md:hidden items-center shrink-0">
          <img 
            src={vibecodersLogo} 
            alt="Vibecoders" 
            className="h-10 w-10 rounded-full border-2 border-border hover:border-primary transition-colors"
          />
        </Link>
        <div className="hidden md:flex items-center gap-2 text-sm text-muted-foreground">
          <Link to="/home" className="hover:text-foreground font-medium transition-colors">Home</Link>
          {location.pathname !== '/home' && (
            <>
              <span className="text-border/60">|</span>
              {(() => {
                 const activeLink = navLinks.find(link => isActive(link.path));
                 const Icon = activeLink?.icon;
                 
                 return (
                  <span className="text-foreground font-medium flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    {activeLink?.label || displayName}
                  </span>
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
                    <span className="text-muted-foreground">{tProfile.saving}</span>
                  </>
                ) : error ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">{tProfile.error}</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">{tProfile.saved}</span>
                  </>
                ) : null}
              </div>
            )}

            {/* Upgrade Button - only for free tier */}
            {isFree && !subLoading && (
              <Link
                to="/choose-plan"
                className="flex items-center gap-2 px-4 py-2 rounded-full bg-stone-900 hover:bg-stone-800 text-white transition-colors border border-amber-500/60 hover:border-amber-400/80"
              >
                <Zap className="h-3.5 w-3.5 fill-current" />
                <span className="text-xs font-bold">$9.90/año</span>
              </Link>
            )}

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
              <Button variant="ghost" size="icon" aria-label={tAuth.menu}>
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-0 flex flex-col">
              <SheetHeader className="p-5 border-b border-border">
                <SheetTitle className="text-left text-base font-medium text-foreground">{tAuth.menu}</SheetTitle>
              </SheetHeader>
              
                {/* Navigation Links - Clean list */}
                <nav className="flex flex-col px-5 py-6 flex-1 overflow-y-auto">
                  {/* Home and Personal */}
                  {[
                    navLinks.find(l => l.path === '/home'),
                    navLinks.find(l => l.path === '/me'),
                    navLinks.find(l => l.path === '/ideas'),
                    navLinks.find(l => l.path === '/beta-testing')
                  ].filter(Boolean).map((link) => {
                    const l = link!;
                    const Icon = l.icon;
                    return (
                      <Link
                        key={l.path}
                        to={l.path}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 text-base py-3 transition-colors",
                          isActive(l.path)
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {l.label}
                      </Link>
                    );
                  })}

                  <div className="my-2 border-t border-border/50" />

                  {/* Public and Explore */}
                  {[
                    navLinks.find(l => l.path === '/public-beta-testing'),
                    navLinks.find(l => l.path === '/explore')
                  ].filter(Boolean).map((link) => {
                    const l = link!;
                    const Icon = l.icon;
                    return (
                      <Link
                        key={l.path}
                        to={l.path}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 text-base py-3 transition-colors",
                          isActive(l.path)
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {l.label}
                      </Link>
                    );
                  })}

                  <div className="my-2 border-t border-border/50" />

                  {/* Tools and Others */}
                  {[
                    navLinks.find(l => l.path === '/tools'),
                    navLinks.find(l => l.path === '/hablemos'),
                    ...(isInWaitlist ? [navLinks.find(l => l.path === '/buildlog')] : [])
                  ].filter(Boolean).map((link) => {
                    const l = link!;
                    const Icon = l.icon;
                    return (
                      <Link
                        key={l.path}
                        to={l.path}
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-3 text-base py-3 transition-colors",
                          isActive(l.path)
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {l.label}
                        {l.isNew && (
                          <span className="ml-1 px-1.5 py-0.5 text-[10px] font-semibold bg-primary text-primary-foreground rounded-full">
                            New
                          </span>
                        )}
                      </Link>
                    );
                  })}

                  {/* Admin Link - Only visible for admins */}
                  {isAdmin && (
                    <>
                      <div className="my-2 border-t border-border/50" />
                      <Link
                        to="/admin"
                        onClick={handleNavClick}
                        className={cn(
                          "flex items-center gap-2 text-base py-3 transition-colors",
                          isActive('/admin')
                            ? "text-foreground font-semibold"
                            : "text-muted-foreground hover:text-foreground"
                        )}
                      >
                        <Shield className="h-4 w-4" />
                        {t.navigation.admin}
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
                      {profile?.name || tAuth.user}
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
                    aria-label={tAuth.signOut}
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
