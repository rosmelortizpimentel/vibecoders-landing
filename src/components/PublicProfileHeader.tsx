import { Link } from 'react-router-dom';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
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

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
);

interface PublicProfileHeaderProps {
  profileUsername?: string;
}

export function PublicProfileHeader({ profileUsername }: PublicProfileHeaderProps) {
  const { user, signOut, signInWithGoogle } = useAuth();
  const { profile } = useProfile();

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      localStorage.setItem('authReturnUrl', window.location.pathname);
      await signInWithGoogle(window.location.href);
    } catch (error) {
      console.error('Error signing in:', error);
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
      {user ? (
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
      ) : (
        <Button
          onClick={handleGoogleSignIn}
          variant="outline"
          className="flex items-center gap-2 border-gray-300 bg-white hover:bg-gray-50 text-gray-700 text-sm font-medium"
        >
          <GoogleIcon />
          <span className="hidden sm:inline">Continuar con Google</span>
          <span className="sm:hidden">Entrar</span>
        </Button>
      )}
    </div>
  );
}
