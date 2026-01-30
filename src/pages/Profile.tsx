import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/hooks/useAuth';
import UserMenu from '@/components/UserMenu';

const Profile = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white">
        <div className="animate-pulse text-[#3D5AFE] text-lg">Cargando...</div>
      </div>
    );
  }

  if (!user) {
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

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4 py-8 sm:py-0">
      <UserMenu />
      
      <div className="w-full max-w-sm sm:max-w-md rounded-2xl bg-[#3D5AFE] p-6 sm:p-8 text-center shadow-2xl">
        <Avatar className="mx-auto h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/30 shadow-lg">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="bg-white/20 text-xl sm:text-2xl text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-white break-words">{fullName}</h1>
        <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/80 break-all">{email}</p>

        <div className="mt-6 sm:mt-8 rounded-lg bg-white/10 p-3 sm:p-4">
          <p className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white">
            <CheckCircle className="h-4 w-4 flex-shrink-0" />
            Tu nombre está reservado
          </p>
          <p className="mt-2 text-xs text-white/70">
            Te avisaremos cuando todo esté listo para que puedas crear tu portafolio.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
