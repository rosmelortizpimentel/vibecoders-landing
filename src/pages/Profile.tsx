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
    <div className="flex min-h-screen flex-col items-center justify-center bg-white px-4">
      <UserMenu />
      
      <div className="w-full max-w-md rounded-2xl bg-[#3D5AFE] p-8 text-center shadow-2xl">
        <Avatar className="mx-auto h-24 w-24 border-4 border-white/30 shadow-lg">
          <AvatarImage src={avatarUrl} alt={fullName} />
          <AvatarFallback className="bg-white/20 text-2xl text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <h1 className="mt-6 text-2xl font-bold text-white">{fullName}</h1>
        <p className="mt-2 text-white/80">{email}</p>

        <div className="mt-8 rounded-lg bg-white/10 p-4">
          <p className="flex items-center justify-center gap-2 text-sm text-white">
            <CheckCircle className="h-4 w-4" />
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
