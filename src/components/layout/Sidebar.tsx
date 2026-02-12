import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  User, 
  Users,
  Rocket, 
  FlaskConical, 
  Wrench, 
  MessageSquare, 
  LogOut, 
  Settings, 
  Crown,
  LayoutDashboard,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  BookOpen,
  LucideIcon,
  X,
  ChevronDown,
  Globe,
  ExternalLink,
  MessageCircle,
  ChevronsUpDown,
  Bell
} from 'lucide-react';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import { useUserRole } from '@/hooks/useUserRole';
import { useProfile } from '@/hooks/useProfile';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useState, useEffect } from 'react';
import { useBetaBadges } from '@/hooks/useBetaBadges';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { t } = useTranslation('common');
  const { isInWaitlist } = useWaitlistStatus();
  const { isAdmin } = useUserRole();
  const { profile } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const tAuth = useTranslation('auth');
  const { ownedAppsCount, publicSquadsCount } = useBetaBadges();
  const { unreadCount } = useNotifications();
  const { t: tNotif } = useTranslation('notifications');
  
  // Initialize collapsed state from localStorage if available
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    // Dispatch a custom event so layouts can adjust padding
    window.dispatchEvent(new CustomEvent('sidebar-resize', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  const isActive = (path: string) => {
    if (path === '/me') {
      // Strict check for /me and /me/ subroutes, BUT excluding the new top-level routes if they happened to share prefix (they don't anymore)
      // Also ensure we don't match on /me if we are on /megaphones (example)
      return location.pathname === '/me' || (location.pathname.startsWith('/me/') && location.pathname !== '/me');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const navLinks: Array<{ path: string; label: string; icon: LucideIcon; className?: string; badge?: number } | { type: 'separator'; path: string }> = [
    // Personal Block
    { path: '/home', label: t('navigation.home'), icon: LayoutDashboard },
    { path: '/notifications', label: tNotif('title'), icon: Bell, badge: unreadCount },
    { path: '/me', label: t('navigation.myProfile'), icon: User },
    { path: '/ideas', label: t('navigation.myIdeas'), icon: Lightbulb },
    { path: '/prompts', label: t('navigation.prompts'), icon: BookOpen },
    { path: '/connections', label: t('navigation.vibers'), icon: Users },
    { path: '/beta-testing', label: t('navigation.betaTesting'), icon: FlaskConical, badge: ownedAppsCount },

    // Separator
    { type: 'separator', path: 'sep1' },

    // Community Block
    { path: '/public-beta-testing', label: t('navigation.publicBetaTesting'), icon: Rocket, badge: publicSquadsCount },
    { path: '/explore', label: t('navigation.startups'), icon: Globe },

    // Utilities
    { path: '/tools', label: t('navigation.tools'), icon: Wrench },
    { path: '/feedback', label: t('navigation.feedback'), icon: MessageSquare },
    ...(isInWaitlist ? [{ path: '/buildlog', label: t('navigation.buildLog'), icon: Crown, className: "text-amber-500" }] : []),
  ];

  return (
    <div 
      className={cn(
        "hidden md:flex h-screen flex-col fixed left-0 top-0 border-r border-border bg-background z-40 transition-all duration-300 overflow-visible",
        isCollapsed ? "w-20" : "w-64"
      )}
    >
      {/* Header / Logo */}
      <div className={cn("p-6 flex items-center relative group", isCollapsed ? "justify-center p-4" : "justify-start p-6")}>
        <Link to="/home" className={cn("flex items-center gap-3 group transition-all", isCollapsed ? "flex-col" : "flex-row")}>
          <div className="relative">
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md group-hover:bg-primary/30 transition-all opacity-0 group-hover:opacity-100" />
            <img 
              src={vibecodersLogo} 
              alt="Vibecoders" 
              className={cn(
                "relative rounded-full border-2 border-[#1c1c1c] group-hover:scale-105 transition-transform shadow-lg",
                isCollapsed ? "h-8 w-8" : "h-14 w-14" // 20% larger than h-10 (40px) is 48px (h-12). Let's go slightly bolder with h-14 (56px) or stick to h-12. User said 20% larger. h-12 is safe. Let's do h-12.
              )}
            />
          </div>
          {!isCollapsed && (
            <p className="text-[10px] text-muted-foreground font-medium text-left max-w-[140px] leading-tight opacity-80">
              The Official Home for Vibe Coders
            </p>
          )}
        </Link>
        
        {/* Collapse Toggle */}
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute -right-3 top-9 bg-background border border-border rounded-full p-1 text-muted-foreground hover:text-foreground hover:bg-muted/50 shadow-sm transition-all z-50 group-hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 gap-1 flex flex-col overflow-y-auto overflow-x-hidden">
        {navLinks.map((link) => {
          if ('type' in link && link.type === 'separator') {
             return <Separator key={link.path} className="my-2 bg-border/50" />;
          }
          

          // Cast safely because we checked for separator
          const item = link as { path: string; label: string; icon: LucideIcon; className?: string; badge?: number };
          const Icon = item.icon;
          const active = isActive(item.path);
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                active 
                  ? "bg-primary/10 text-primary hover:bg-primary/15" 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50",
                item.className,
                isCollapsed && "justify-center px-2"
              )}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="relative">
                <Icon className={cn(
                  "h-5 w-5 transition-colors shrink-0",
                  active ? "text-primary" : "text-muted-foreground group-hover:text-foreground",
                  item.className
                )} />
                {isCollapsed && item.badge && item.badge > 0 ? (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-secondary ring-2 ring-background">
                    <span className="h-1.5 w-1.5 rounded-full bg-secondary-foreground" />
                  </span>
                ) : null}
              </div>
              
              {!isCollapsed && (
                <>
                  <span className="truncate animate-in fade-in duration-200 flex-1">{item.label}</span>
                  {item.badge && item.badge > 0 ? (
                    <Badge variant="secondary" className="ml-auto h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm border-none">
                      {item.badge}
                    </Badge>
                  ) : null}
                </>
              )}
              
              {active && !isCollapsed && !item.badge && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer / User Menu */}
      <div className="mt-auto border-t border-border/50 px-4 pt-4 pb-6 shrink-0">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button 
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 group ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
                !isCollapsed ? "hover:bg-accent hover:text-accent-foreground justify-between" : "justify-center"
              )}
            >
              <div className={cn("flex items-center gap-3 truncate", !isCollapsed && "flex-1")}>
                <Avatar className={cn("shrink-0 border border-border shadow-sm", isCollapsed ? "h-9 w-9" : "h-8 w-8")}>
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'Avatar'} />
                  <AvatarFallback className="bg-primary/10 text-primary text-xs font-semibold">
                    {profile?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                
                {!isCollapsed && (
                  <div className="flex flex-col items-start text-left min-w-0">
                    <span className="text-sm font-medium text-foreground truncate w-full">
                      {profile?.name || 'User'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate w-full">
                      {profile?.username ? `@${profile.username}` : (user?.email?.split('@')[0] || 'Member')}
                    </span>
                  </div>
                )}
              </div>
              
              {!isCollapsed && (
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground group-hover:text-foreground shrink-0" />
              )}
            </button>
          </DropdownMenuTrigger>
          
          <DropdownMenuContent 
            side={isCollapsed ? "right" : "top"}
            align={isCollapsed ? "end" : "start"}
            sideOffset={isCollapsed ? 12 : 8}
            className="w-72 bg-[#0B123B] border border-white/10 p-0 shadow-2xl rounded-[24px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
          >
            {/* Redesigned Header with profile info - Left Aligned */}
            <div className="px-5 py-5 border-b border-white/5 bg-white/5">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12 border border-white/10 shadow-lg">
                  <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'Avatar'} referrerPolicy="no-referrer" />
                  <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                    {profile?.name?.charAt(0) || '?'}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <span className="text-base font-bold text-white truncate leading-tight">
                    {profile?.name || 'User'}
                  </span>
                  <span className="text-xs text-white/50 truncate">
                    @{profile?.username || (user?.email?.split('@')[0])}
                  </span>
                </div>
              </div>
            </div>
            
            {/* Section: Main Account Links */}
            <div className="py-2.5">
              <LanguageSwitcher variant="dropdown" className="border-b border-white/5 mb-2 pb-2" />
              
              <DropdownMenuItem asChild className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white border-none outline-none">
                <Link 
                  to={profile?.username ? `/@${profile.username}` : "/me/profile"}
                  target="_blank"
                  onClick={() => setMenuOpen(false)}
                  className="flex items-center gap-3 py-3 px-5 cursor-pointer group transition-colors"
                >
                  <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{tAuth.viewPublicProfile}</span>
                </Link>
              </DropdownMenuItem>
              
              {isAdmin && (
                <DropdownMenuItem 
                  onClick={() => { setMenuOpen(false); window.location.href = '/admin'; }}
                  className="flex items-center gap-3 py-3 px-5 cursor-pointer text-white/80 hover:bg-white/10 hover:text-white border-none focus:bg-white/10 focus:text-white outline-none group transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{tAuth.adminPanel}</span>
                </DropdownMenuItem>
              )}

              <div className="mt-2 pt-2 border-t border-white/5">
                <DropdownMenuItem 
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="flex items-center gap-3 py-3 px-5 cursor-pointer text-white/60 hover:bg-red-500/10 hover:text-red-400 border-none focus:bg-red-500/10 focus:text-red-400 outline-none group transition-colors"
                >
                  <LogOut className="h-4 w-4 text-white/40 group-hover:text-red-400 transition-colors" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{tAuth.signOut}</span>
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      


    </div>
  );
}
