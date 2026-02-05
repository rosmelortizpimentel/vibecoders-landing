import { useNavigate, useLocation } from 'react-router-dom';
import { User, ArrowLeft, LogOut, LogIn, LayoutDashboard } from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

const UserMenu = () => {
  const { user, loading, signInWithGoogle, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const { isAdmin } = useUserRole();

  // Mostrar botón de Ingresar si no hay usuario (solo en landing)
  if (!loading && !user && location.pathname === '/') {
    return (
      <div className="fixed right-4 top-4 z-50">
        <Button
          onClick={() => signInWithGoogle()}
          className="gap-2 bg-white text-[#1c1c1c] hover:bg-white/90 font-semibold shadow-lg"
        >
          <LogIn className="h-4 w-4" />
          Ingresar
        </Button>
      </div>
    );
  }

  if (loading || !user) {
    return null;
  }

  const isProfilePage = location.pathname === '/profile';
  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || user.email;
  const initials = fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="fixed right-4 top-4 z-50">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full ring-2 ring-white/30 ring-offset-2 ring-offset-transparent transition-all hover:ring-white/60 focus:outline-none focus:ring-white/60">
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="bg-[#3D5AFE] text-white text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8} className="w-64 bg-white border border-gray-100 p-0 shadow-xl">
          {/* Identity Header - Non-clickable */}
          <div className="px-3 py-3 flex items-center gap-3">
            <Avatar className="h-10 w-10 border border-gray-200 shrink-0">
              <AvatarImage src={avatarUrl} alt={fullName} />
              <AvatarFallback className="text-sm bg-[#3D5AFE]/10 text-[#3D5AFE] font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col min-w-0">
              <span className="text-sm font-semibold text-gray-900 truncate">
                {profile?.name || fullName || 'Usuario'}
              </span>
              <span className="text-xs text-gray-500 truncate">
                {profile?.username ? `@${profile.username}` : 'Sin username'}
              </span>
            </div>
          </div>
          <DropdownMenuSeparator className="my-0" />
          
          {/* Menu Items */}
          <div className="py-1">
            {isProfilePage ? (
              <DropdownMenuItem 
                onClick={() => navigate('/')}
                className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
              >
                <ArrowLeft className="h-4 w-4 text-gray-400" />
                <span>Volver al Inicio</span>
              </DropdownMenuItem>
            ) : (
              <DropdownMenuItem 
                onClick={() => navigate('/me')}
                className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
              >
                <User className="h-4 w-4 text-gray-400" />
                <span>Mi Perfil</span>
              </DropdownMenuItem>
            )}
            
            {isAdmin && (
              <DropdownMenuItem 
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
              >
                <LayoutDashboard className="h-4 w-4 text-gray-400" />
                <span>Panel Admin</span>
              </DropdownMenuItem>
            )}
          </div>
          
          {/* Footer - Sign Out */}
          <DropdownMenuSeparator className="my-0" />
          <div className="py-1">
            <DropdownMenuItem 
              onClick={handleSignOut}
              className="flex items-center gap-2 py-2.5 px-3 cursor-pointer text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus:bg-gray-100 focus:text-gray-900"
            >
              <LogOut className="h-4 w-4 text-gray-400" />
              <span>Cerrar Sesión</span>
            </DropdownMenuItem>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
