import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Users, Loader2, Search, Mail, ListChecks } from 'lucide-react';
import { FollowListDialog } from './FollowListDialog';
import { RegistrationTrendChart } from './RegistrationTrendChart';
import { ActivityTrendChart } from './ActivityTrendChart';
import { useSortableData } from '@/hooks/useSortableData';
import { useTranslation } from '@/hooks/useTranslation';

interface EnrichedUser {
  id: string;
  name: string | null;
  username: string | null;
  avatar_url: string | null;
  created_at: string | null;
  email: string;
  isOnWaitlist: boolean;
  followersCount: number;
  followingCount: number;
  lastActivity: string | null;
}

interface DailyActivity {
  date: string;
  count: number;
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
  const { t } = useTranslation('admin');
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; type: 'followers' | 'following' } | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('admin-users-list', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      const responseData = response.data || {};
      setUsers(responseData.users || []);
      setDailyActivity(responseData.dailyActivity || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar usuarios');
    } finally {
      setLoading(false);
    }
  };

  // Filter users based on search query
  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);

  // Sortable data
  const { sortedData, requestSort, getSortIndicator } = useSortableData<EnrichedUser, keyof EnrichedUser>(filteredUsers, {
    key: 'created_at',
    direction: 'desc',
  });

  const handleCountClick = (userId: string, type: 'followers' | 'following') => {
    setSelectedUser({ id: userId, type });
    setDialogOpen(true);
  };

  const handleOpenGmail = () => {
    const allEmails = users.filter(u => u.email).map((u) => u.email);
    const bccEmails = allEmails.join(',');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(bccEmails)}`;
    window.open(gmailUrl, '_blank');
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

  const SortableHeader = ({ column, children, className }: { column: keyof EnrichedUser; children: React.ReactNode; className?: string }) => (
    <TableHead
      className={`cursor-pointer select-none hover:bg-muted/50 transition-colors ${className || ''}`}
      onClick={() => requestSort(column)}
    >
      <div className="flex items-center gap-1">
        {children}
        <span className="text-xs opacity-70">{getSortIndicator(column) || ''}</span>
      </div>
    </TableHead>
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">{t('users')}</h1>
        <p className="text-muted-foreground">
          {users.length} {t('usersWithAccounts')}
        </p>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button onClick={handleOpenGmail} disabled={users.length === 0} className="gap-2">
          <Mail className="h-4 w-4" />
          {t('emailAll')} ({users.length})
        </Button>
      </div>

      {/* Records count */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {sortedData.length} de {users.length} registros
        </p>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="name" className="w-[300px]">Usuario</SortableHeader>
              <SortableHeader column="isOnWaitlist" className="text-center">Waitlist</SortableHeader>
              <SortableHeader column="followersCount" className="text-center">Seguidores</SortableHeader>
              <SortableHeader column="followingCount" className="text-center">Siguiendo</SortableHeader>
              <SortableHeader column="created_at">Registro (Toronto)</SortableHeader>
              <SortableHeader column="lastActivity">{t('lastActivity')}</SortableHeader>
              <TableHead className="text-center">Perfil</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((user) => (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.name || 'Avatar'} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <p className="font-medium text-foreground truncate">{user.name || 'Sin nombre'}</p>
                      <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                      <p className="text-xs text-muted-foreground/70 truncate">{user.email}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  {user.isOnWaitlist ? (
                    <Badge variant="secondary" className="gap-1">
                      <ListChecks className="h-3 w-3" />
                      {t('onWaitlist')}
                    </Badge>
                  ) : (
                    <span className="text-muted-foreground">—</span>
                  )}
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
                <TableCell className="text-sm text-muted-foreground">
                  {user.lastActivity ? formatTorontoDate(user.lastActivity) : <span className="text-muted-foreground/50">{t('never')}</span>}
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

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RegistrationTrendChart data={users} />
        <ActivityTrendChart data={dailyActivity} />
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
