import { useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
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
import { Separator } from '@/components/ui/separator';
import { Loader2, Check, AlertCircle, ExternalLink, LogOut, ChevronDown, Shield, Menu, Rocket, Wrench, Sparkles } from 'lucide-react';
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
    { path: '/startups', label: 'Startups', icon: Rocket },
    { path: '/tools', label: 'Herramientas', icon: Wrench },
    ...(isInWaitlist ? [{ path: '/buildlog', label: 'Build Log', icon: Sparkles }] : []),
  ];

  const handleNavClick = () => {
    setSheetOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo - Left */}
        <Link to="/" className="flex items-center shrink-0">
          <img 
            src={vibecodersLogo} 
            alt="Vibecoders" 
            className="h-10 w-10 rounded-full border-2 border-gray-200 hover:border-[#3D5AFE] transition-colors"
          />
        </Link>

        {/* Desktop Navigation - Center (hidden on mobile) */}
        {!isMobile && (
          <nav className="flex items-center gap-6 sm:gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={cn(
                  "text-sm font-medium transition-colors",
                  isActive(link.path)
                    ? "text-[#3D5AFE] font-semibold"
                    : "text-gray-600 hover:text-[#3D5AFE]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        )}
        
        {/* Desktop Right section (hidden on mobile) */}
        {!isMobile && (
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Admin Link - Only visible for admins */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-[#3D5AFE] hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* Save status indicator - only shown when props are provided */}
            {(isSaving !== undefined || lastSaved !== undefined || error !== undefined) && (
              <div className="flex items-center gap-2 text-sm">
                {isSaving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                    <span className="text-gray-500 hidden sm:inline">Guardando...</span>
                  </>
                ) : error ? (
                  <>
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <span className="text-red-500 hidden sm:inline">Error</span>
                  </>
                ) : lastSaved ? (
                  <>
                    <Check className="h-4 w-4 text-[#3D5AFE]" />
                    <span className="text-gray-500 hidden sm:inline">Guardado</span>
                  </>
                ) : null}
              </div>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20">
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || 'Avatar'} />
                    <AvatarFallback className="text-xs bg-[#3D5AFE]/10 text-[#3D5AFE] font-medium">
                      {profile?.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-[#1c1c1c] hidden sm:inline">
                    {displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border-gray-200 p-1 shadow-lg">
                {/* Profile link */}
                <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-100 focus:bg-[#3D5AFE] focus:text-white">
                  <Link to="/me/profile" className="flex items-center gap-2 cursor-pointer">
                    <span>Mi Perfil</span>
                  </Link>
                </DropdownMenuItem>
                {publicProfileUrl && (
                  <DropdownMenuItem asChild className="text-gray-700 hover:bg-gray-100 focus:bg-[#3D5AFE] focus:text-white">
                    <a 
                      href={publicProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>Ver Perfil Público</span>
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-gray-200" />
                <DropdownMenuItem 
                  onClick={onSignOut}
                  className="flex items-center gap-2 text-gray-700 hover:bg-gray-100 focus:bg-[#3D5AFE] focus:text-white cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Cerrar Sesión</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}

        {/* Mobile Menu Button (only on mobile) */}
        {isMobile && (
          <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
            <SheetTrigger asChild>
              <button 
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20"
                aria-label="Abrir menú"
              >
                <Menu className="h-6 w-6 text-gray-700" />
              </button>
            </SheetTrigger>
            <SheetContent side="right" className="w-[280px] bg-white p-0 flex flex-col">
              <SheetHeader className="p-5 border-b border-gray-100">
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
                          : "text-gray-500 hover:text-foreground"
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
                        : "text-gray-500 hover:text-foreground"
                    )}
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}
              </nav>

              {/* User Section - Anchored to bottom */}
              <div className="mt-auto border-t border-gray-100 p-5">
                <Link 
                  to="/me/profile"
                  onClick={handleNavClick}
                  className="flex items-center gap-3 group"
                >
                  <Avatar className="h-10 w-10 border border-gray-200 group-hover:border-gray-300 transition-colors">
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
                    className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                    aria-label="Cerrar sesión"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </Link>
              </div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </header>
  );
}