import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogDescription 
} from '@/components/ui/dialog';
import { Users, Search, ExternalLink } from 'lucide-react';
import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Link } from 'react-router-dom';

interface ProfileSummary {
  id: string;
  name: string;
  username: string;
  avatarUrl?: string;
}

interface NetworkModalProps {
  isOpen: boolean;
  onClose: () => void;
  followers: ProfileSummary[];
  following: ProfileSummary[];
}

export function NetworkModal({
  isOpen,
  onClose,
  followers,
  following
}: NetworkModalProps) {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filterList = (list: ProfileSummary[]) => 
    list.filter(p => 
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.username.toLowerCase().includes(searchTerm.toLowerCase())
    );

  const filteredFollowers = filterList(followers);
  const filteredFollowing = filterList(following);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] w-full h-[100dvh] sm:h-[85vh] p-0 overflow-hidden sm:rounded-2xl rounded-none border-none shadow-2xl flex flex-col gap-0">
        <DialogHeader className="px-5 pt-5 pb-1 bg-gray-50/50 shrink-0 space-y-0">
          <DialogTitle className="text-lg font-bold text-foreground flex items-center gap-2">
            <Users className="w-4 h-4 text-indigo-500" />
            Red Social
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="followers" className="w-full flex-1 flex flex-col min-h-0">
          <div className="px-5 py-2 bg-gray-50/50 border-b border-gray-100 flex items-center justify-between shrink-0">
            <TabsList className="bg-muted/50 p-1 rounded-lg">
              <TabsTrigger value="followers" className="text-[10px] font-bold px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Seguidores <span className="ml-1 opacity-50">{followers.length}</span>
              </TabsTrigger>
              <TabsTrigger value="following" className="text-[10px] font-bold px-3 py-1.5 data-[state=active]:bg-white data-[state=active]:shadow-sm">
                Siguiendo <span className="ml-1 opacity-50">{following.length}</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Container for tab content - uses relative/absolute to ensure proper height */}
          <div className="relative flex-1 min-h-0">
            <TabsContent value="followers" className="absolute inset-0 m-0 overflow-y-auto">
              <UserList users={filteredFollowers} emptyMessage="No se encontraron seguidores." />
            </TabsContent>
            <TabsContent value="following" className="absolute inset-0 m-0 overflow-y-auto">
              <UserList users={filteredFollowing} emptyMessage="Aún no sigues a nadie." />
            </TabsContent>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function UserList({ users, emptyMessage }: { users: ProfileSummary[], emptyMessage: string }) {
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
                  <AvatarImage src={user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="bg-indigo-50 text-indigo-600 font-bold text-xs uppercase">
                    {user.name.charAt(0)}
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
