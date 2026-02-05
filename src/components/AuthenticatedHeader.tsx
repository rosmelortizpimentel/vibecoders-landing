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
import { Loader2, Check, AlertCircle, ExternalLink, LogOut, ChevronDown, Shield, Menu, Rocket, Wrench, Crown, User, LayoutDashboard } from 'lucide-react';
import { useUserRole } from '@/hooks/useUserRole';
import { useIsMobile } from '@/hooks/use-mobile';
import { useWaitlistStatus } from '@/hooks/useWaitlistStatus';
import { cn } from '@/lib/utils';
import vibecodersLogo from '@/assets/vibecoders-logo.png';

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
function formatDisplayName(name: string | null | undefined): string {
  if (!name) return 'Usuario';
  
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
  const displayName = formatDisplayName(profile?.name);
  const publicProfileUrl = profile?.username ? `/@${profile.username}` : null;
  const { isAdmin } = useUserRole();
  const { isInWaitlist } = useWaitlistStatus();
  const isMobile = useIsMobile();
  const [sheetOpen, setSheetOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  // Build navigation links dynamically based on waitlist status
  const navLinks = [
    { path: '/me', label: 'Mi Perfil', icon: User, premium: false },
    { path: '/startups', label: 'Startups', icon: Rocket, premium: false },
    { path: '/tools', label: 'Herramientas', icon: Wrench, premium: false },
    ...(isInWaitlist ? [{ path: '/buildlog', label: 'Build Log', icon: Crown, premium: true }] : []),
  ];

  const handleNavClick = () => {
    setSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo - Left */}
        <Link to="/" className="flex items-center shrink-0">
          <img 
            src={vibecodersLogo} 
            alt="Vibecoders" 
            className="h-10 w-10 rounded-full border-2 border-border hover:border-primary transition-colors"
          />
        </Link>

        {/* Desktop Layout - hidden on mobile */}
        <div className="hidden md:flex items-center flex-1">
          {/* Separator 1 - after logo */}
          <div className="h-6 w-px bg-border/60 mx-4" />
          
          {/* Central Navigation with Ghost Buttons */}
          <nav className="flex items-center gap-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Button
                  key={link.path}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "gap-1.5",
                    isActive(link.path) && "bg-accent text-primary font-semibold"
                  )}
                >
                  <Link to={link.path}>
                    <Icon className={cn(
                      "h-4 w-4",
                      link.premium && "text-amber-400"
                    )} />
                    {link.label}
                  </Link>
                </Button>
              );
            })}
          </nav>
          
          {/* Spacer to push right zone */}
          <div className="flex-1" />
          
          {/* Separator 2 - before avatar */}
          <div className="h-6 w-px bg-border/60 mx-4" />
          
          {/* Right Zone: Admin + Save Status + Avatar */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Admin Link - Only visible for admins */}
            {isAdmin && (
              <Button variant="ghost" size="sm" asChild className="gap-1.5">
                <Link to="/admin">
                  <Shield className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              </Button>
            )}

            {/* Save status indicator - only shown when props are provided */}
            {(isSaving !== undefined || lastSaved !== undefined || error !== undefined) && (
              <div className="flex items-center gap-2 text-sm">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    <span className="text-muted-foreground">Guardando...</span>
                  </>
                ) : error ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-500">Error</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-4 w-4 text-primary" />
                    <span className="text-muted-foreground">Guardado</span>
                  </>
                ) : null}
              </div>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-accent transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <Avatar className="h-8 w-8 border border-border">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'Avatar'} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {profile?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground">
                    {displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" sideOffset={8} className="w-64 bg-background border border-border p-0 shadow-xl">
                {/* Identity Header - Non-clickable */}
                <div className="px-3 py-3 flex items-center gap-3">
                  <Avatar className="h-10 w-10 border border-border shrink-0">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'Avatar'} />
                    <AvatarFallback className="text-sm bg-primary/10 text-primary font-medium">
                      {profile?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-semibold text-foreground truncate">
                      {profile?.name || 'Usuario'}
                    </span>
                    <span className="text-xs text-muted-foreground truncate">
                      {profile?.username ? `@${profile.username}` : 'Sin username'}
                    </span>
                  </div>
                </div>
                <DropdownMenuSeparator className="my-0" />
                
                {/* Menu Items */}
                <div className="py-1">
                  {publicProfileUrl && (
                    <DropdownMenuItem asChild className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-foreground/80 hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground">
                      <a 
                        href={publicProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4 text-muted-foreground" />
                        <span>Ver Perfil Público</span>
                      </a>
                    </DropdownMenuItem>
                  )}
                  
                  {isAdmin && (
                    <DropdownMenuItem asChild className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-foreground/80 hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground">
                      <Link to="/admin">
                        <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
                        <span>Panel Admin</span>
                      </Link>
                    </DropdownMenuItem>
                  )}
                </div>
                
                {/* Footer - Sign Out */}
                <DropdownMenuSeparator className="my-0" />
                <div className="py-1">
                  <DropdownMenuItem 
                    onClick={onSignOut}
                    className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-foreground/80 hover:bg-accent hover:text-foreground focus:bg-accent focus:text-foreground"
                  >
                    <LogOut className="h-4 w-4 text-muted-foreground" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </div>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Mobile Layout - only hamburger menu */}
        <div className="flex md:hidden items-center">
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" aria-label="Abrir menú">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-background p-0 flex flex-col">
              <SheetHeader className="p-5 border-b border-border">
                <SheetTitle className="text-left text-base font-medium text-foreground">Menú</SheetTitle>
              </SheetHeader>
              
              {/* Navigation Links - Clean list */}
              <nav className="flex flex-col px-5 py-6 flex-1">
                {navLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <Link
                      key={link.path}
                      to={link.path}
                      onClick={handleNavClick}
                      className={cn(
                        "flex items-center gap-3 text-base py-3 transition-colors",
                        isActive(link.path)
                          ? "text-foreground font-semibold"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </Link>
                  );
                })}

                {/* Admin Link - Only visible for admins */}
                {isAdmin && (
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
                    Admin
                  </Link>
                )}
              </nav>

              {/* User Section - Anchored to bottom */}
              <div className="mt-auto border-t border-border p-5">
                <Link 
                  to="/me/profile"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 group"
                >
                  <Avatar className="h-10 w-10 border border-border group-hover:border-muted-foreground transition-colors">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'Avatar'} />
                    <AvatarFallback className="text-sm bg-muted text-muted-foreground font-medium">
                      {profile?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate group-hover:text-foreground/80 transition-colors">
                      {profile?.name || 'Usuario'}
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
                    aria-label="Cerrar sesión"
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