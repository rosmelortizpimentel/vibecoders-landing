import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Users, Loader2 } from 'lucide-react';
import { FollowListDialog } from './FollowListDialog';

interface UserWithCounts {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
  followersCount: number;
  followingCount: number;
}

function formatTorontoDate(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleString('es-ES', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function UsersManager() {
  const [users, setUsers] = useState<UserWithCounts[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; type: 'followers' | 'following' } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      // Fetch only profiles with username (registered users)
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, created_at')
        .not('username', 'is', null)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch all follows to calculate counts
      const { data: follows, error: followsError } = await supabase
        .from('follows')
        .select('follower_id, following_id');

      if (followsError) throw followsError;

      // Calculate counts for each user
      const usersWithCounts: UserWithCounts[] = (profiles || []).map((profile) => {
        const followersCount = follows?.filter((f) => f.following_id === profile.id).length || 0;
        const followingCount = follows?.filter((f) => f.follower_id === profile.id).length || 0;

        return {
          ...profile,
          followersCount,
          followingCount,
        };
      });

      setUsers(usersWithCounts);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCountClick = (userId: string, type: 'followers' | 'following') => {
    setSelectedUser({ id: userId, type });
    setDialogOpen(true);
  };

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Usuarios Registrados</h1>
        <p className="text-muted-foreground">
          {users.length} usuarios con cuenta activa
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Usuario</TableHead>
              <TableHead className="text-center">Seguidores</TableHead>
              <TableHead className="text-center">Siguiendo</TableHead>
              <TableHead>Registro (Toronto)</TableHead>
              <TableHead className="text-center">Perfil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {users.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.name || 'Avatar'} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium text-foreground">{user.name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleCountClick(user.id, 'followers')}
                    disabled={user.followersCount === 0}
                  >
                    <Users className="mr-1 h-4 w-4" />
                    {user.followersCount}
                  </Button>
                </TableCell>
                <TableCell className="text-center">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="font-medium"
                    onClick={() => handleCountClick(user.id, 'following')}
                    disabled={user.followingCount === 0}
                  >
                    <Users className="mr-1 h-4 w-4" />
                    {user.followingCount}
                  </Button>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {formatTorontoDate(user.created_at)}
                </TableCell>
                <TableCell className="text-center">
                  <Button variant="ghost" size="sm" asChild>
                    <a
                      href={`/@${user.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <FollowListDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        userId={selectedUser?.id || ''}
        type={selectedUser?.type || 'followers'}
      />
    </div>
  );
}
