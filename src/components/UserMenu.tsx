import { useNavigate, useLocation } from 'react-router-dom';
import { User, ArrowLeft, LogOut } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useAuth } from '@/hooks/useAuth';

const UserMenu = () => {
  const { user, loading, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
          className="w-48 bg-white border border-border shadow-lg"
        >
          {isProfilePage ? (
            <>
              <DropdownMenuItem 
                onClick={() => navigate('/')}
                className="cursor-pointer gap-2"
              >
                <ArrowLeft className="h-4 w-4" />
                Volver al Inicio
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                Cerrar Sesión
              </DropdownMenuItem>
            </>
          ) : (
            <>
              <DropdownMenuItem 
                onClick={() => navigate('/profile')}
                className="cursor-pointer gap-2"
              >
                <User className="h-4 w-4" />
                Mi Perfil
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="cursor-pointer gap-2 text-red-600 focus:text-red-600"
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
