import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, User } from 'lucide-react';
import type { PublicProfile } from '@/hooks/usePublicProfile';

interface PublicProfileCardProps {
  profile: PublicProfile;
}

export function PublicProfileCard({ profile }: PublicProfileCardProps) {
  return (
    <Card className="w-full max-w-sm mx-auto overflow-hidden shadow-2xl border-0">
      {/* Blue gradient background */}
      <div 
        className="relative py-12 px-8 flex flex-col items-center"
        style={{ 
          background: 'linear-gradient(135deg, #3D5AFE 0%, #536DFE 50%, #7C4DFF 100%)' 
        }}
      >
        {/* Decorative elements */}
        <div className="absolute top-4 left-4 w-20 h-20 bg-white/10 rounded-full blur-2xl" />
        <div className="absolute bottom-4 right-4 w-32 h-32 bg-purple-400/20 rounded-full blur-3xl" />
        
        {/* Avatar */}
        <Avatar className="h-28 w-28 border-4 border-white/30 shadow-xl mb-6">
          <AvatarImage 
            src={profile.avatar_url || undefined} 
            alt={profile.first_name}
            className="object-cover"
          />
          <AvatarFallback className="bg-white/20 text-white text-3xl font-bold">
            {profile.first_name?.[0]?.toUpperCase() || <User className="h-12 w-12" />}
          </AvatarFallback>
        </Avatar>

        {/* Name */}
        <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
          {profile.first_name}
        </h1>

        {/* Username */}
        <p className="text-white/70 text-lg mb-6">
          @{profile.username}
        </p>

        {/* Vibecoder Badge */}
        <Badge 
          className="bg-white/15 hover:bg-white/20 text-white border-white/20 px-4 py-2 text-sm font-medium backdrop-blur-sm"
          variant="outline"
        >
          <Star className="h-4 w-4 mr-2 fill-yellow-300 text-yellow-300" />
          Vibecoder
        </Badge>
      </div>
    </Card>
  );
}
