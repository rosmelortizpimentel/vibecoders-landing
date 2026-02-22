import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Users, Search, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';
import { useFollowList, FollowerProfile } from '@/hooks/useFollowList';
import { Skeleton } from '@/components/ui/skeleton';

interface ProfileSummary {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string | undefined;
  followersCount: number;
  followingCount: number;
}

export function NetworkModal({
  isOpen,
  onClose,
  userId,
  followersCount,
  followingCount
}: NetworkModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'followers' | 'following'>('followers');
  
  const { profiles: followerProfiles, loading: followersLoading } = useFollowList(
    userId, 
    'followers', 
    { enabled: isOpen && activeTab === 'followers' }
  );

  const { profiles: followingProfiles, loading: followingLoading } = useFollowList(
    userId, 
    'following', 
    { enabled: isOpen && activeTab === 'following' }
  );

  const filterList = (list: FollowerProfile[]) => 
    list.filter(p => 
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
      (p.username || '').toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredFollowers = filterList(followerProfiles);
  const filteredFollowing = filterList(followingProfiles);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-full h-[100dvh] sm:h-[85vh] p-0 overflow-hidden sm:rounded-2xl rounded-none border-none shadow-2xl flex flex-col gap-0">
        <DialogHeader className="px-5 pt-5 pb-1 bg-gray-50/50 shrink-0 space-y-0">
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Red Social
          </DialogTitle>
        </DialogHeader>

        <Tabs 
          value={activeTab} 
          onValueChange={(v) => setActiveTab(v as 'followers' | 'following')} 
          className="w-full flex-1 flex flex-col min-h-0"
        >
          <div className="px-5 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0">
            <TabsList className="bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="followers" className="text-[10px] font-bold px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Seguidores <span className="ml-1 opacity-50">{followersCount}</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="text-[10px] font-bold px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Siguiendo <span className="ml-1 opacity-50">{followingCount}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="px-5 py-3 bg-white border-b border-gray-50 flex items-center gap-2 shrink-0">
            <Search className="w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Buscar..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8 text-xs border-none bg-transparent focus-visible:ring-0 px-0"
            />
          </div>

          <div className="relative flex-1 min-h-0">
            <TabsContent value="followers" className="absolute inset-0 m-0 overflow-y-auto">
              {followersLoading ? <LoadingList /> : <UserList users={filteredFollowers} emptyMessage="No se encontraron seguidores." />}
            </TabsContent>
            <TabsContent value="following" className="absolute inset-0 m-0 overflow-y-auto">
              {followingLoading ? <LoadingList /> : <UserList users={filteredFollowing} emptyMessage="Aún no sigues a nadie." />}
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function LoadingList() {
  return (
    <div className="p-4 space-y-4">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-3 w-1/3" />
            <Skeleton className="h-2 w-1/4" />
          </div>
        </div>
      ))}
    </div>
  );
}

function UserList({ users, emptyMessage }: { users: FollowerProfile[], emptyMessage: string }) {
  return (
    <>
      {users.length > 0 ? (
        <div className="p-2 grid grid-cols-1 gap-1">
          {users.map((user) => (
            <Link 
              key={user.id} 
              to={`/@${user.username}`}
              className="flex items-center justify-between p-3 rounded-xl hover:bg-muted/50 transition-colors group"
            >
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-border shadow-sm group-hover:scale-105 transition-transform duration-200">
                  <AvatarImage src={user.avatarUrl || undefined} alt={user.name || ''} />
                  <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-xs uppercase">
                    {(user.name || '').charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-foreground leading-none mb-1 group-hover:text-indigo-600 transition-colors">
                    {user.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    @{user.username}
                  </span>
                </div>
              </div>
              <ExternalLink className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
            </Link>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 px-6">
          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center mx-auto mb-3">
             <Users className="w-6 h-6 text-muted-foreground/30" />
          </div>
          <p className="text-sm text-muted-foreground">{emptyMessage}</p>
        </div>
      )}
    </>
  );
}
