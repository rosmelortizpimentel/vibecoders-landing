import { useState } from 'react';
import { User } from '@supabase/supabase-js';
import { CheckCircle, Edit3, Loader2 } from 'lucide-react';
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

  const displayUsername = profile?.username || 'tu_username';

  return (
    <div className="perspective-1000 w-full max-w-sm sm:max-w-md">
      <div
        className={`relative transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Cara frontal */}
        <div className="backface-hidden w-full rounded-2xl bg-[#3D5AFE] p-6 sm:p-8 text-center shadow-2xl">
          <Avatar className="mx-auto h-20 w-20 sm:h-24 sm:w-24 border-4 border-white/30 shadow-lg">
            <AvatarImage src={avatarUrl} alt={fullName} />
            <AvatarFallback className="bg-white/20 text-xl sm:text-2xl text-white">
              {initials}
            </AvatarFallback>
          </Avatar>

          <h1 className="mt-4 sm:mt-6 text-xl sm:text-2xl font-bold text-white break-words">
            {fullName}
          </h1>
          <p className="mt-1 sm:mt-2 text-sm sm:text-base text-white/80 break-all">{email}</p>

          {profile?.username && (
            <p className="mt-2 text-sm text-white/70">
              vibecoding.la/@{profile.username}
            </p>
          )}

          <div className="mt-6 sm:mt-8 rounded-lg bg-white/10 p-3 sm:p-4">
            <p className="flex items-center justify-center gap-2 text-xs sm:text-sm text-white">
              <CheckCircle className="h-4 w-4 flex-shrink-0" />
              Tu nombre está reservado
            </p>
            <p className="mt-2 text-xs text-white/70">
              Te avisaremos cuando todo esté listo para que puedas crear tu portafolio.
            </p>
          </div>

          <Button
            onClick={handleFlipToBack}
            variant="ghost"
            className="mt-4 gap-2 text-white/80 hover:text-white hover:bg-white/10"
            disabled={profileLoading}
          >
            <Edit3 className="h-4 w-4" />
            {profile?.username ? 'Cambiar username' : 'Elegir username'}
          </Button>
        </div>

        {/* Cara trasera */}
        <div className="backface-hidden rotate-y-180 absolute inset-0 w-full rounded-2xl bg-white shadow-2xl overflow-hidden">
          {/* Header azul con preview de URL */}
          <div className="bg-[#3D5AFE] px-6 py-5 text-center">
            <p className="text-white text-sm sm:text-base font-medium">
              vibecoding.la/@{username || 'tu_username'}
            </p>
          </div>

          {/* Formulario */}
          <div className="p-6 sm:p-8">
            <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-4">
              Cambia tu nombre de usuario
            </h2>

            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium">
                @
              </span>
              <Input
                type="text"
                value={username}
                onChange={handleUsernameChange}
                placeholder="tu_username"
                className="pl-8 h-12 text-base border-gray-300 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
                disabled={saving}
              />
            </div>

            {error && (
              <p className="mt-2 text-sm text-red-500">{error}</p>
            )}

            <p className="mt-3 text-xs sm:text-sm text-gray-500">
              Hasta 20 caracteres (letras, números o _)
            </p>

            <div className="mt-6 flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={handleFlipToFront}
                disabled={saving}
                className="border-gray-300 text-gray-700 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSave}
                disabled={saving || !username.trim()}
                className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white"
              >
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
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
