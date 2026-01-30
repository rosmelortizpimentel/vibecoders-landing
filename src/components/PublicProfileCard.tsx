import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { User } from 'lucide-react';
import type { PublicProfile } from '@/hooks/usePublicProfile';

interface PublicProfileCardProps {
  profile: PublicProfile;
}

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  return (
    <Card 
      className="w-full max-w-sm mx-auto overflow-hidden shadow-2xl border-0 rounded-2xl"
      style={{ background: '#3D5AFE' }}
    >
      <div className="py-12 px-8 flex flex-col items-center">
        {/* Avatar */}
        <Avatar className="h-28 w-28 border-4 border-white/20 shadow-xl mb-6">
          <AvatarImage 
            src={profile.avatar_url || undefined} 
            alt={profile.first_name}
            className="object-cover"
          />
          <AvatarFallback className="bg-white/10 text-white text-3xl font-bold">
            {profile.first_name?.[0]?.toUpperCase() || <User className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {profile.first_name}
        </h1>

        {/* Username */}
        <p className="text-white/60 text-lg">
          @{profile.username}
        </p>
      </div>
    </Card>
  );
}
