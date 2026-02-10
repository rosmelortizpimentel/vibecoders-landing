import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  User, 
  LogOut, 
  LogIn, 
  LayoutDashboard, 
  X,
  ExternalLink,
  HelpCircle,
  Users,
  Globe,
  Settings,
  CreditCard,
  ChevronLeft,
  Linkedin
} from 'lucide-react';
import { useProfile } from '@/hooks/useProfile';
import { useUserRole } from '@/hooks/useUserRole';
import { useTranslation } from '@/hooks/useTranslation';
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
import { LanguageSwitcher } from './LanguageSwitcher';

const UserMenu = () => {
  const { user, loading, signInWithGoogle, signInWithLinkedIn, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { profile } = useProfile();
  const { isAdmin } = useUserRole();
  const t = useTranslation('auth');
  const tCommon = useTranslation('common');
  const [open, setOpen] = useState(false);

  // Mostrar botón de Ingresar si no hay usuario (solo en landing)
  if (!loading && !user && (location.pathname === '/' || location.pathname === '/new')) {
    return (
      <div className="fixed right-4 top-4 z-50 flex items-center gap-2">
        <LanguageSwitcher variant="header" className="text-white" />
      </div>
    );
  }

  if (loading || !user) {
    return null;
  }

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || user.email;
  const email = user.email;
  const initials = fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleSignOut = async () => {
    setOpen(false);
    await signOut();
    navigate('/');
  };

  const handleNavigate = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  return (
    <div className="fixed right-4 top-4 z-50">
      <DropdownMenu open={open} onOpenChange={setOpen}>
        <DropdownMenuTrigger asChild>
          <button className="rounded-full ring-2 ring-white/30 ring-offset-2 ring-offset-transparent transition-all hover:ring-white/60 focus:outline-none focus:ring-white/60">
            <Avatar className="h-10 w-10 cursor-pointer">
              <AvatarImage src={avatarUrl} alt={fullName} referrerPolicy="no-referrer" />
              <AvatarFallback className="bg-[#3D5AFE] text-white text-sm font-medium">
                {initials}
              </AvatarFallback>
            </Avatar>
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent 
          align="end" 
          sideOffset={8} 
          className="w-72 bg-[#0B123B] border border-white/10 p-0 shadow-2xl rounded-[24px] overflow-hidden animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Redesigned Header with profile info - Left Aligned */}
          <div className="px-5 py-5 border-b border-white/5 bg-white/5">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12 border border-white/10 shadow-lg">
                <AvatarImage src={profile?.avatar_url || avatarUrl} alt={profile?.name || fullName} referrerPolicy="no-referrer" />
                <AvatarFallback className="bg-primary/20 text-primary text-sm font-bold">
                  {profile?.name?.charAt(0) || initials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col min-w-0">
                <span className="text-base font-bold text-white truncate leading-tight">
                  {profile?.name || fullName}
                </span>
                <span className="text-xs text-white/50 truncate">
                  @{profile?.username || (user?.email?.split('@')[0])}
                </span>
              </div>
            </div>
          </div>
          
          {/* Main Account Links */}
          <div className="py-2.5">
            <LanguageSwitcher variant="dropdown" className="border-b border-white/5 mb-2 pb-2" />
            
            <DropdownMenuItem 
              onClick={() => { setOpen(false); handleNavigate('/me'); }}
              className="flex items-center gap-3 py-3 px-5 cursor-pointer text-white/80 hover:bg-white/10 hover:text-white border-none focus:bg-white/10 focus:text-white outline-none group transition-colors"
            >
              <ExternalLink className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
              <span className="text-sm font-medium">View Public Profile</span>
            </DropdownMenuItem>
            
            {isAdmin && (
              <DropdownMenuItem 
                onClick={() => { setOpen(false); handleNavigate('/admin'); }}
                className="flex items-center gap-3 py-3 px-5 cursor-pointer text-white/80 hover:bg-white/10 hover:text-white border-none focus:bg-white/10 focus:text-white outline-none group transition-colors"
              >
                <LayoutDashboard className="h-4 w-4 text-white/40 group-hover:text-white/80 transition-colors" strokeWidth={1.5} />
                <span className="text-sm font-medium">{t.adminPanel}</span>
              </DropdownMenuItem>
            )}

            <div className="mt-2 pt-2 border-t border-white/5">
              <DropdownMenuItem 
                onClick={handleSignOut}
                className="flex items-center gap-3 py-3 px-5 cursor-pointer text-white/60 hover:bg-red-500/10 hover:text-red-400 border-none focus:bg-red-500/10 focus:text-red-400 outline-none group transition-colors"
              >
                <LogOut className="h-4 w-4 text-white/40 group-hover:text-red-400 transition-colors" strokeWidth={1.5} />
                <span className="text-sm font-medium">{t.signOut}</span>
              </DropdownMenuItem>
            </div>
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default UserMenu;

