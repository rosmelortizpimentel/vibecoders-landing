import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, CheckCircle, Lock, Rocket, Mail } from 'lucide-react';
import type { PublicProfile } from '@/hooks/usePublicProfile';

interface PublicProfileCardProps {
  profile: PublicProfile;
}

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  const memberNumber = profile.member_number;

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Founder Pass Card */}
      <div 
        className="relative overflow-hidden rounded-3xl shadow-2xl"
        style={{ 
          background: 'linear-gradient(135deg, #4F46E5 0%, #3D5AFE 50%, #2563EB 100%)'
        }}
      >
        {/* Subtle texture overlay */}
        <div 
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.4"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")'
          }}
        />

        <div className="relative py-10 px-8 flex flex-col items-center">
          {/* Member Badge */}
          <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm">
            <span className="text-xs font-mono text-white/80 tracking-wider">
              VIBECODER #{memberNumber.toString().padStart(3, '0')}
            </span>
          </div>

          {/* Founder Pass Label */}
          <div className="mb-6">
            <span className="text-xs font-semibold tracking-[0.3em] text-white/60 uppercase">
              Founder Pass
            </span>
          </div>

          {/* Avatar */}
          <Avatar className="h-32 w-32 border-4 border-white/30 shadow-2xl mb-6 ring-4 ring-white/10 ring-offset-4 ring-offset-transparent">
            <AvatarImage 
              src={profile.avatar_url || undefined} 
              alt={profile.first_name}
              className="object-cover"
            />
            <AvatarFallback className="bg-white/20 text-white text-4xl font-bold">
              {profile.first_name?.[0]?.toUpperCase() || <User className="h-14 w-14" />}
            </AvatarFallback>
          </Avatar>

          {/* Name */}
          <h1 className="text-3xl font-bold text-white mb-1 tracking-tight">
            {profile.first_name}
          </h1>

          {/* Username */}
          <p className="text-white/70 text-lg font-mono mb-6">
            @{profile.username}
          </p>

          {/* Verified Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm">
            <CheckCircle className="h-4 w-4 text-emerald-400" />
            <span className="text-sm font-medium text-white">
              Reservado & Verificado
            </span>
          </div>
        </div>
      </div>

      {/* Setup Roadmap */}
      <div className="bg-white rounded-2xl shadow-lg border border-stone-200 p-6">
        <h2 className="text-sm font-semibold text-stone-500 uppercase tracking-wider mb-5">
          Próximos pasos
        </h2>
        
        <div className="space-y-4">
          {/* Step 1 - Completed */}
          <div className="flex items-center gap-4">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <CheckCircle className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-900">Reservar tu Username</p>
              <p className="text-xs text-emerald-600 font-medium">Completado</p>
            </div>
          </div>

          {/* Step 2 - Locked */}
          <div className="flex items-center gap-4 opacity-60">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
              <Lock className="h-5 w-5 text-stone-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-700">Conectar GitHub & Stack</p>
              <p className="text-xs text-stone-400">Próximamente</p>
            </div>
          </div>

          {/* Step 3 - Locked */}
          <div className="flex items-center gap-4 opacity-60">
            <div className="flex-shrink-0 h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center">
              <Rocket className="h-5 w-5 text-stone-400" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-stone-700">Lanzar Portafolio Oficial</p>
              <p className="text-xs text-stone-400">Próximamente</p>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Footer */}
      <div className="flex items-center justify-center gap-2 text-stone-400 text-sm">
        <Mail className="h-4 w-4" />
        <span>Te notificaremos apenas abramos las puertas</span>
      </div>
    </div>
  );
}
