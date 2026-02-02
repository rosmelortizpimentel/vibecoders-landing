import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User, LogOut, ExternalLink } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import vibecodersLogo from '@/assets/vibecoders-logo.png';

interface PublicProfileHeaderProps {
  profileUsername?: string;
}

export function PublicProfileHeader({ profileUsername }: PublicProfileHeaderProps) {
  const { user, signOut } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  // Get display name (first name + initial)
  const getDisplayName = () => {
    if (!profile?.name) return 'Usuario';
    const parts = profile.name.trim().split(' ');
    if (parts.length === 1) return parts[0];
    return `${parts[0]} ${parts[1].charAt(0)}.`;
  };

  return (
    <div className="flex items-center justify-between px-4 py-2 bg-white border-b border-gray-100">
      {/* Logo - left side */}
      <Link to="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
        <img 
          src={vibecodersLogo} 
          alt="Vibecoders" 
          className="h-10 w-10 rounded-full border-2 border-gray-200"
        />
      </Link>

      {/* User menu - right side (only if logged in) */}
      {user && (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
              <span className="text-sm font-medium text-gray-700 hidden sm:block">
                {getDisplayName()}
              </span>
              <Avatar className="h-8 w-8 border border-gray-200">
                <AvatarImage src={profile?.avatar_url || ''} alt={profile?.name || ''} />
                <AvatarFallback className="bg-gray-100 text-gray-600 text-xs">
                  {profile?.name?.charAt(0) || '?'}
                </AvatarFallback>
              </Avatar>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent 
            align="end" 
            className="w-48 bg-[#1c1c1c] border-[#1c1c1c] text-white"
          >
            {/* My profile option */}
            <DropdownMenuItem asChild>
              <Link 
                to="/me" 
                className="flex items-center gap-2 cursor-pointer hover:bg-white/10 text-white focus:bg-white/10 focus:text-white"
              >
                <User className="h-4 w-4" />
                Mi Perfil
              </Link>
            </DropdownMenuItem>
            
            {/* View public profile */}
            {profile?.username && (
              <DropdownMenuItem asChild>
                <Link 
                  to={`/@${profile.username}`}
                  className="flex items-center gap-2 cursor-pointer hover:bg-white/10 text-white focus:bg-white/10 focus:text-white"
                >
                  <ExternalLink className="h-4 w-4" />
                  Ver Perfil Público
                </Link>
              </DropdownMenuItem>
            )}
            
            {/* Sign out */}
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="flex items-center gap-2 cursor-pointer hover:bg-white/10 text-white focus:bg-white/10 focus:text-white"
            >
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )}
    </div>
  );
}
