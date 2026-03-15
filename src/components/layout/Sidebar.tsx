import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  LogOut, 
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ChevronsUpDown,
  LayoutDashboard,
  Settings,
  MessageSquare,
  BarChart3,
  Mic,
} from 'lucide-react';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '@/hooks/useTranslation';

import { useUserRole } from '@/hooks/useUserRole';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProBadge } from "@/components/ui/ProBadge";
import { useSubscription } from "@/hooks/useSubscription";
import { useProfile } from '@/hooks/useProfile';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { LanguageSwitcher } from '@/components/LanguageSwitcher';
import { useState, useEffect } from 'react';
import { useBetaBadges } from '@/hooks/useBetaBadges';
import { Badge } from '@/components/ui/badge';
import { useNotifications } from '@/hooks/useNotifications';
import { useSidebarMenu } from '@/hooks/useSidebarMenu';
import { useFeatures } from '@/hooks/useFeatures';
import type { LucideIcon } from 'lucide-react';

export function Sidebar() {
  const location = useLocation();
  const { signOut, user } = useAuth();
  const { t } = useTranslation('common');

  const { isAdmin } = useUserRole();
  const { profile } = useProfile();
  const [menuOpen, setMenuOpen] = useState(false);
  const { t: tAuth } = useTranslation('auth');
  const { ownedAppsCount, publicSquadsCount } = useBetaBadges();
  const { unreadCount } = useNotifications();
  const { items: menuItems } = useSidebarMenu();
  const { data: userFeatures } = useFeatures();
  
  // Initialize collapsed state from localStorage if available
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebarCollapsed');
    return saved === 'true';
  });

  useEffect(() => {
    localStorage.setItem('sidebarCollapsed', String(isCollapsed));
    window.dispatchEvent(new CustomEvent('sidebar-resize', { detail: { isCollapsed } }));
  }, [isCollapsed]);

  const { isPro, isFounder } = useSubscription();
  const hasPremium = isPro || isFounder;

  // Check if user is speaker and has upcoming workshops
  const { data: speakerStatus } = useQuery({
    queryKey: ['sidebar-speaker-status', user?.id],
    queryFn: async () => {
      if (!user?.id) return { isSpeaker: false, hasUpcoming: false };
      
      // 1. Get speaker id
      const { data: speaker } = await supabase
        .from('speakers')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();
      
      if (!speaker) return { isSpeaker: false, hasUpcoming: false };
      
      // 2. Check for upcoming confirmed workshops
      const { count } = await supabase
        .from('workshops')
        .select('id, workshop_speakers!inner(speaker_id)', { count: 'exact', head: true })
        .eq('workshop_speakers.speaker_id', speaker.id)
        .eq('is_confirmed', true)
        .gt('scheduled_at', new Date().toISOString());
        
      return { isSpeaker: true, hasUpcoming: (count || 0) > 0 };
    },
    enabled: !!user?.id,
    staleTime: 5 * 60 * 1000,
  });

  // Listen for external sidebar-collapse commands (e.g. from roadmap auto-collapse)
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.external && typeof detail.isCollapsed === 'boolean') {
        setIsCollapsed(detail.isCollapsed);
      }
    };
    window.addEventListener('sidebar-collapse', handler);
    return () => window.removeEventListener('sidebar-collapse', handler);
  }, []);

  const isActive = (path: string) => {
    if (path === '/me') {
      // Highlight "Mi Perfil" for /me, /me/profile, etc. BUT exclude /me/apps which is a separate menu item
      return (location.pathname === '/me' || location.pathname.startsWith('/me/')) && !location.pathname.startsWith('/me/apps');
    }
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  // Badge map: key -> runtime count
  // Map sidebar item keys to their respective badge counts from hooks
  const badgeMapping: Record<string, number> = {
    'notifications': unreadCount,
    'public-beta-testing': publicSquadsCount,
  };

  // Build nav links from DB items, filtering by features and roles, inserting separators between sections
  const filteredItems = menuItems.filter(item => {
    if (item.requiredFeatureKey && !userFeatures?.includes(item.requiredFeatureKey)) return false;
    if (item.requiredRole && item.requiredRole === 'admin' && !isAdmin) return false;
    return true;
  });
  // Resolve i18n labels - for notifications namespace, use a simple lookup
  const { t: tNotif } = useTranslation('notifications');
  const { t: tHero } = useTranslation('hero');
  
  const resolveLabel = (labelKey: string): string => {
    const parts = labelKey.split('.');
    if (parts.length === 2 && parts[0] === 'notifications') {
      return tNotif(parts[1]);
    }
    return t(labelKey);
  };

  type NavItem = { path: string; label: string; icon: typeof LayoutDashboard; className?: string; badge?: number; isPro?: boolean; badgeText?: string | null } | { type: 'separator'; path: string };
  
  const navLinks: NavItem[] = [];
  let lastSection = '';
  let sepIndex = 0;
  filteredItems.forEach((item) => {
    if (lastSection && item.section !== lastSection) {
      navLinks.push({ type: 'separator', path: `sep-${sepIndex++}` });
    }
    lastSection = item.section;
    const badgeCount = item.key ? badgeMapping[item.key] : 0;
    navLinks.push({
      path: item.path,
      label: resolveLabel(item.labelKey),
      icon: item.icon,
      className: item.cssClass || undefined,
      badge: badgeCount > 0 ? badgeCount : undefined,
      badgeText: item.badgeText,
    });

    // Inject requested options for local validation
    if (item.path === '/me/apps') {
      navLinks.push({
        path: '/analytics',
        label: t('navigation.analytics'),
        icon: BarChart3,
        isPro: true,
      });
    }
    if (item.path === '/connections') {
      navLinks.push({
        path: '/chat',
        label: t('navigation.chat'),
        icon: MessageSquare,
      });
    }
  });

  return (
    <div 
      className={cn(
        "hidden md:flex h-screen flex-col fixed left-0 top-0 border-r border-border bg-background z-40 transition-all duration-300",
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
            <p className="text-sm text-muted-foreground font-medium text-left max-w-[160px] leading-tight opacity-100 whitespace-pre-line">
              {tHero('badge')}
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
      <nav className="flex-1 min-h-0 px-4 py-4 gap-1 flex flex-col overflow-y-auto overflow-x-hidden">
        {navLinks.map((link) => {
          if ('type' in link && link.type === 'separator') {
             return <Separator key={link.path} className="my-2 bg-border/50" />;
          }
          

          // Cast safely because we checked for separator
          const item = link as { path: string; label: string; icon: LucideIcon; className?: string; badge?: number; isPro?: boolean; badgeText?: string | null };
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
                  {item.isPro && (
                    <div className="ml-auto mr-1 flex items-center">
                      <ProBadge />
                    </div>
                  )}
                  {item.badge && item.badge > 0 ? (
                    <Badge variant="secondary" className="ml-auto h-5 min-w-[1.25rem] px-1 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm border-none">
                      {item.badge}
                    </Badge>
                  ) : null}
                  {item.badgeText && (
                    <Badge variant="outline" className="ml-auto h-5 px-1.5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm border-none bg-black text-white hover:bg-black/90">
                      {item.badgeText}
                    </Badge>
                  )}
                </>
              )}
              
              {active && !isCollapsed && !item.badge && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              )}
            </Link>
          );
        })}
        
        {/* Conditional Speaker Button */}
        {speakerStatus?.isSpeaker && speakerStatus?.hasUpcoming && (
          <Link
            to="/settings/speaker"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 mt-2",
              location.pathname === '/settings/speaker'
                ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_-3px_rgba(61,90,254,0.3)]"
                : "bg-[#3D5AFE] text-white hover:bg-[#3D5AFE]/90 shadow-lg shadow-[#3D5AFE]/20 hover:scale-[1.02] active:scale-[0.98]",
              isCollapsed && "justify-center px-2"
            )}
            title={isCollapsed ? "Speaker" : undefined}
          >
            <div className="relative">
              <Mic className={cn(
                "h-5 w-5 transition-colors shrink-0",
                location.pathname === '/settings/speaker' ? "text-primary" : "text-white"
              )} />
              {location.pathname !== '/settings/speaker' && (
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-white rounded-full animate-pulse shadow-sm" />
              )}
            </div>
            {!isCollapsed && (
              <span className="truncate flex-1 font-bold tracking-tight">Speaker</span>
            )}
          </Link>
        )}
      </nav>

      {/* Roadmap & Feedback */}
      <div className="mt-auto px-4 pb-3 pt-2 shrink-0">
        <a 
          href="https://vibecoders.vibecoders.la/roadmap" 
          target="_blank" 
          rel="noopener noreferrer"
          className={cn(
            "flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors opacity-80 hover:opacity-100",
            isCollapsed ? "justify-center" : "px-3"
          )}
          title={isCollapsed ? t('navigation.roadmapAndFeedback') : undefined}
        >
          <span className="text-sm shrink-0">🗺</span>
          {!isCollapsed && <span className="truncate">{t('navigation.roadmapAndFeedback')}</span>}
        </a>
      </div>

      {/* Footer / User Menu */}
      <div className="border-t border-border/50 px-3 pt-3 pb-3 shrink-0 overflow-visible">
        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <button 
              className={cn(
                "w-full flex items-center gap-3 p-2 rounded-lg transition-all duration-200 group ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 overflow-visible",
                !isCollapsed ? "hover:bg-accent hover:text-accent-foreground justify-between" : "justify-center"
              )}
            >
              <div className={cn("flex items-center gap-3 overflow-visible", !isCollapsed && "flex-1 min-w-0")}>
                <Avatar className={cn("shrink-0 border border-border shadow-sm overflow-hidden", isCollapsed ? "h-9 w-9" : "h-8 w-8")}>
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
                  <span className="text-sm font-medium">{tAuth('viewPublicProfile')}</span>
                </Link>
              </DropdownMenuItem>
              
              <DropdownMenuItem 
                onClick={() => { setMenuOpen(false); window.location.href = '/settings'; }}
                className="flex items-center gap-3 py-3 px-5 cursor-pointer text-white/80 hover:bg-white/10 hover:text-white border-none focus:bg-white/10 focus:text-white outline-none group transition-colors"
              >
                <Settings className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
                <span className="text-sm font-medium">{t('navigation.settings')}</span>
              </DropdownMenuItem>
              
              {isAdmin && (
                <DropdownMenuItem 
                  onClick={() => { setMenuOpen(false); window.location.href = '/admin'; }}
                  className="flex items-center gap-3 py-3 px-5 cursor-pointer text-white/80 hover:bg-white/10 hover:text-white border-none focus:bg-white/10 focus:text-white outline-none group transition-colors"
                >
                  <LayoutDashboard className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{tAuth('adminPanel')}</span>
                </DropdownMenuItem>
              )}

              <div className="mt-2 pt-2 border-t border-white/5">
                <DropdownMenuItem 
                  onClick={() => { setMenuOpen(false); signOut(); }}
                  className="flex items-center gap-3 py-3 px-5 cursor-pointer text-white/60 hover:bg-red-500/10 hover:text-red-400 border-none focus:bg-red-500/10 focus:text-red-400 outline-none group transition-colors"
                >
                  <LogOut className="h-4 w-4 text-white/40 group-hover:text-red-400 transition-colors" strokeWidth={1.5} />
                  <span className="text-sm font-medium">{tAuth('signOut')}</span>
                </DropdownMenuItem>
              </div>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      


    </div>
  );
}
