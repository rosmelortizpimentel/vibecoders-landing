import { Link } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { useTranslation } from '@/hooks/useTranslation';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ExternalLink, LogOut, ChevronDown, Shield, Settings } from 'lucide-react';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import { LanguageSwitcher } from './LanguageSwitcher';

function formatDisplayName(name: string | null | undefined, fallback: string): string {
  if (!name) return fallback;
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0];
  const firstName = parts[0];
  const lastInitial = parts[parts.length - 1].charAt(0).toUpperCase();
  return `${firstName} ${lastInitial}.`;
}

export function PublicHeader() {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();
  const { isAdmin } = useUserRole();
  const t = useTranslation('auth');

  const displayName = formatDisplayName(profile?.name, t.user);
  const publicProfileUrl = profile?.username ? `/@${profile.username}` : null;

  return (
    <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to={user ? "/home" : "/"} className="flex items-center">
          <img 
            src={vibecodersLogo} 
            alt="Vibecoders" 
            className="h-12 w-12 rounded-full border-2 border-gray-200 hover:border-primary transition-colors"
          />
        </Link>
        
        {/* User Section - Only if logged in */}
        {user && profile && (
          <div className="flex items-center gap-4">
            {/* Admin Link */}
            {isAdmin && (
              <Link
                to="/admin"
                className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-primary hover:bg-gray-50 rounded-lg transition-colors"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Admin</span>
              </Link>
            )}

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-gray-100 transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20">
                  <Avatar className="h-8 w-8 border border-gray-200">
                    <AvatarImage src={profile.avatar_url || ''} alt={profile.name || 'Avatar'} />
                    <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
                      {profile.name?.charAt(0) || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-sm font-medium text-foreground hidden sm:inline">
                    {displayName}
                  </span>
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-[#1c1c1c] border-[#1c1c1c] p-1">
                <DropdownMenuItem asChild className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
                  <Link to="/me/profile" className="flex items-center gap-2 cursor-pointer">
                    <Settings className="h-4 w-4" />
                    <span>{t.editProfile}</span>
                  </Link>
                </DropdownMenuItem>
                {publicProfileUrl && (
                  <DropdownMenuItem asChild className="text-white hover:bg-white/10 focus:bg-white/10 focus:text-white">
                    <a 
                      href={publicProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>{t.viewPublicProfile}</span>
                    </a>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator className="bg-white/20" />
                <LanguageSwitcher />
                <DropdownMenuSeparator className="bg-white/20" />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="flex items-center gap-2 text-white hover:bg-white/10 focus:bg-white/10 focus:text-white cursor-pointer"
                >
                  <LogOut className="h-4 w-4" />
                  <span>{t.signOut}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </div>
    </header>
  );
}
