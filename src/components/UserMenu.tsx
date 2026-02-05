import { useNavigate, useLocation } from 'react-router-dom';
import { User, ArrowLeft, LogOut, LogIn } from 'lucide-react';
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
        <DropdownMenuContent 
          align="end" 
          className="w-48 bg-white border border-gray-200 shadow-lg rounded-lg"
        >
          {isProfilePage ? (
            <>
              <DropdownMenuItem 
                onClick={() => navigate('/')}
                className="cursor-pointer gap-2 text-[#1c1c1c] hover:bg-[#3D5AFE] hover:text-white focus:bg-[#3D5AFE] focus:text-white transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer gap-2 text-[#1c1c1c] hover:bg-[#3D5AFE] hover:text-white focus:bg-[#3D5AFE] focus:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem 
                onClick={() => navigate('/profile')}
                className="cursor-pointer gap-2 text-[#1c1c1c] hover:bg-[#3D5AFE] hover:text-white focus:bg-[#3D5AFE] focus:text-white transition-colors"
              >
                <User className="h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-gray-200" />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer gap-2 text-[#1c1c1c] hover:bg-[#3D5AFE] hover:text-white focus:bg-[#3D5AFE] focus:text-white transition-colors"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;
