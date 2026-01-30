import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { CheckCircle, Edit3, Loader2, Lock } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProfile } from '@/hooks/useProfile';
import { toast } from 'sonner';

interface ProfileCardProps {
  user: User;
}

const ProfileCard = ({ user }: ProfileCardProps) => {
  const { profile, loading: profileLoading, updateUsername } = useProfile();
  const [isFlipped, setIsFlipped] = useState(false);
  const [username, setUsername] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const avatarUrl = user.user_metadata?.avatar_url;
  const fullName = user.user_metadata?.full_name || user.email;
  const email = user.email;
  const initials = fullName
    ?.split(' ')
    .map((n: string) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';

  const handleFlipToBack = () => {
    setUsername(profile?.username || '');
    setError(null);
    setIsFlipped(true);
  };

  const handleFlipToFront = () => {
    setIsFlipped(false);
    setError(null);
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setError('Ingresa un username');
      return;
    }

    setSaving(true);
    setError(null);

    const result = await updateUsername(username.trim().toLowerCase());

    if (result.success) {
      toast.success('¡Username actualizado!');
      setIsFlipped(false);
    } else {
      setError(result.error || 'Error al guardar');
    }

    setSaving(false);
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    if (value.length <= 20) {
      setUsername(value);
      setError(null);
    }
  };

  return (
    <div className="perspective-1000 w-full max-w-[340px] sm:max-w-sm md:max-w-md px-4 sm:px-0">
      <div
        className={`relative transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Cara frontal */}
        <div className="backface-hidden w-full rounded-2xl bg-[#3D5AFE] p-5 sm:p-6 md:p-8 text-center shadow-2xl">
          <Avatar className="mx-auto h-16 w-16 sm:h-20 sm:w-20 md:h-24 md:w-24 border-4 border-white/30 shadow-lg">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="bg-white/20 text-lg sm:text-xl md:text-2xl text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h1 className="mt-3 sm:mt-4 md:mt-6 text-lg sm:text-xl md:text-2xl font-bold text-white break-words">
            {fullName}
          </h1>
          <p className="mt-1 sm:mt-2 text-xs sm:text-sm md:text-base text-white/80 break-all">{email}</p>

          {profile?.username && (
            <p className="mt-2 text-xs sm:text-sm text-white/70">
              https://vibecoders.la/@{profile.username}
            </p>
          )}

          <div className="mt-4 sm:mt-6 md:mt-8 rounded-lg bg-white/10 p-3 sm:p-4">
            <p className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white">
              <CheckCircle className="h-3.5 w-3.5 sm:h-4 sm:w-4 flex-shrink-0" />
              Tu nombre está reservado
            </p>
            <p className="mt-2 text-[10px] sm:text-xs text-white/70">
              Te avisaremos cuando todo esté listo para que puedas crear tu portafolio.
            </p>
          </div>

          <Button
            onClick={handleFlipToBack}
            variant="ghost"
            className="mt-3 sm:mt-4 gap-2 text-xs sm:text-sm text-white/80 hover:text-white hover:bg-white/10"
            disabled={profileLoading}
          >
            <Edit3 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {profile?.username ? 'Cambiar username' : 'Elegir username'}
          </Button>
        </div>

        {/* Cara trasera */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Browser-style header */}
          <div className="bg-[#3D5AFE] px-3 sm:px-4 py-3 sm:py-4">
            {/* Browser Chrome */}
            <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
              {/* Traffic Lights */}
              <div className="flex items-center gap-1 sm:gap-1.5">
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FF5F57]" />
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#FFBD2E]" />
                <div className="w-2 h-2 sm:w-3 sm:h-3 rounded-full bg-[#28CA41]" />
              </div>
            </div>
            
            {/* URL Bar */}
            <div className="flex items-center gap-1.5 sm:gap-2 bg-white/20 rounded-md px-2.5 sm:px-3 py-1.5 sm:py-2">
              <Lock className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-white/70 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-white/90 font-medium tracking-tight truncate">
                https://vibecoders.la/<span className="text-white font-bold">@{username || 'tu_username'}</span>
              </span>
            </div>
          </div>

          {/* Formulario */}
          <div className="p-4 sm:p-6 md:p-8">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-900 mb-3 sm:mb-4">
              Cambia tu nombre de usuario
            </h2>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm sm:text-base">
                @
              </span>
              <Input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="tu_username"
                className="pl-7 sm:pl-8 h-10 sm:h-12 text-sm sm:text-base border-gray-300 bg-white text-gray-900 placeholder:text-gray-400"
                disabled={saving}
              />
            </div>

            {error && (
              <p className="mt-2 text-xs sm:text-sm text-red-500">{error}</p>
            )}

            <p className="mt-2 sm:mt-3 text-[10px] sm:text-xs md:text-sm text-gray-500">
              Hasta 20 caracteres (letras, números o _)
            </p>

            <div className="mt-4 sm:mt-6 flex gap-2 sm:gap-3 justify-end">
              <Button
                onClick={handleFlipToFront}
                disabled={saving}
                className="bg-[#1c1c1c] text-white hover:bg-[#1c1c1c]/90 text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !username.trim()}
                className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white text-xs sm:text-sm h-9 sm:h-10 px-3 sm:px-4"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  'Guardar'
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
