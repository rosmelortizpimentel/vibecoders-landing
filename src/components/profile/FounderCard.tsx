import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useFollow } from '@/hooks/useFollow';
import { useNavigate } from 'react-router-dom';

interface FounderCardProps {
  profile: {
    id: string;
    username: string;
    full_name: string;
    avatar_url: string | null;
    tagline: string | null;
  };
}

export function FounderCard({ profile }: FounderCardProps) {
  const navigate = useNavigate();
  const { followersCount, followingCount } = useFollow(profile.id);

  const handleProfileClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/@${profile.username}`);
  };

  const handleFollowersClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/@${profile.username}?view=followers`);
  };

  const handleFollowingClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate(`/@${profile.username}?view=following`);
  };

  return (
    <div className="p-4 rounded-2xl border border-gray-100 bg-white shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center gap-4">
        {/* Avatar */}
        <div 
          onClick={handleProfileClick}
          className="cursor-pointer transition-transform hover:scale-105"
        >
          <Avatar className="w-14 h-14 border border-gray-100">
            <AvatarImage src={profile.avatar_url || ''} alt={profile.full_name} />
            <AvatarFallback className="text-lg bg-gray-100 text-gray-500 font-bold">
              {profile.full_name?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h4 
            onClick={handleProfileClick}
            className="text-base font-bold text-gray-900 leading-tight cursor-pointer hover:underline"
          >
            {profile.full_name}
          </h4>
          
          <p className="text-sm text-gray-500 truncate mb-1.5">
            {profile.tagline || `@${profile.username}`}
          </p>

          {/* Stats */}
          <div className="flex items-center gap-3 text-sm">
            <button 
              onClick={handleFollowersClick}
              className="group flex items-center gap-1 cursor-pointer hover:text-gray-900"
            >
              <span className="font-bold text-gray-900">{followersCount}</span>
              <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                seguidores
              </span>
            </button>
            <button 
              onClick={handleFollowingClick}
              className="group flex items-center gap-1 cursor-pointer hover:text-gray-900"
            >
              <span className="font-bold text-gray-900">{followingCount}</span>
              <span className="text-gray-500 group-hover:text-gray-700 transition-colors">
                siguiendo
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
