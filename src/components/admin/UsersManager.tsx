import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ExternalLink, Users, Loader2, Search, Mail, ListChecks, Copy, Trash2 } from 'lucide-react';
import { FollowListDialog } from './FollowListDialog';
import { RegistrationTrendChart } from './RegistrationTrendChart';
import { ActivityTrendChart } from './ActivityTrendChart';
import { useSortableData } from '@/hooks/useSortableData';
import { useTranslation } from '@/hooks/useTranslation';
import { useAuth } from '@/hooks/useAuth';

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
  tier: string | null;
  founder_number: number | null;
  subscription_status: string | null;
  current_period_end: string | null;
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

function formatShortDate(dateString: string | null): string {
  if (!dateString) return '—';
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    timeZone: 'America/Toronto',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function getDaysRemaining(periodEnd: string | null): { days: number; label: string } | null {
  if (!periodEnd) return null;
  const end = new Date(periodEnd);
  const now = new Date();
  const diff = end.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  if (days < 0) return { days, label: `Venció hace ${Math.abs(days)}d` };
  return { days, label: `${days}d restantes` };
}

function getTierBadge(user: EnrichedUser) {
  if (!user.tier) return <Badge variant="outline" className="text-xs">Sin plan</Badge>;
  
  switch (user.tier) {
    case 'founder':
      return <Badge className="bg-amber-500/20 text-amber-400 border-amber-500/30 text-xs">Founder #{user.founder_number}</Badge>;
    case 'pro':
      return <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 text-xs">Pro</Badge>;
    case 'free':
      return <Badge variant="secondary" className="text-xs">Free</Badge>;
    case 'pending':
      return <Badge variant="outline" className="text-xs text-muted-foreground">Pending</Badge>;
    default:
      return <Badge variant="outline" className="text-xs">{user.tier}</Badge>;
  }
}

function getSubscriptionStatusBadge(status: string | null) {
  if (!status) return null;
  const map: Record<string, { className: string; label: string }> = {
    active: { className: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Activa' },
    canceled: { className: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Cancelada' },
    past_due: { className: 'bg-orange-500/20 text-orange-400 border-orange-500/30', label: 'Vencida' },
    trialing: { className: 'bg-purple-500/20 text-purple-400 border-purple-500/30', label: 'Trial' },
    incomplete: { className: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30', label: 'Incompleta' },
  };
  const s = map[status] || { className: '', label: status };
  return <Badge variant="outline" className={`text-xs ${s.className}`}>{s.label}</Badge>;
}

export function UsersManager() {
  const { t } = useTranslation('admin');
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [dailyActivity, setDailyActivity] = useState<DailyActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showOnlyAnonymous, setShowOnlyAnonymous] = useState(false);
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<{ id: string; type: 'followers' | 'following' } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<EnrichedUser | null>(null);
  const [deleting, setDeleting] = useState(false);

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

  const handleDeleteUser = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('admin-delete-user', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session.access_token}` },
        body: { userId: deleteTarget.id },
      });

      if (response.error) throw response.error;
      if (response.data?.error) throw new Error(response.data.error);

      toast.success(`Usuario ${deleteTarget.name || deleteTarget.email} eliminado`);
      setDeleteTarget(null);
      fetchUsers();
    } catch (err) {
      console.error('Error deleting user:', err);
      toast.error(err instanceof Error ? err.message : 'Error al eliminar usuario');
    } finally {
      setDeleting(false);
    }
  };

  const filteredUsers = useMemo(() => {
    let result = users;
    
    if (showOnlyAnonymous) {
      result = result.filter(user => !user.username || user.username.trim() === '');
    }

    if (tierFilter !== 'all') {
      if (tierFilter === 'no_plan') {
        result = result.filter(user => !user.tier);
      } else {
        result = result.filter(user => user.tier === tierFilter);
      }
    }

    if (!searchQuery.trim()) return result;
    
    const query = searchQuery.toLowerCase();
    return result.filter(
      (user) =>
        user.name?.toLowerCase().includes(query) ||
        user.username?.toLowerCase().includes(query) ||
        user.email?.toLowerCase().includes(query)
    );
  }, [users, searchQuery, showOnlyAnonymous, tierFilter]);

  const { sortedData, requestSort, getSortIndicator } = useSortableData<EnrichedUser, keyof EnrichedUser>(filteredUsers, {
    key: 'created_at',
    direction: 'desc',
  });

  const handleCountClick = (userId: string, type: 'followers' | 'following') => {
    setSelectedUser({ id: userId, type });
    setDialogOpen(true);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
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

  const canDelete = (user: EnrichedUser) => {
    return user.id !== currentUser?.id;
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
    <div className="h-full overflow-y-auto space-y-6 pr-2">
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
        <div className="flex gap-2 flex-wrap">
          <Select value={tierFilter} onValueChange={setTierFilter}>
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Plan" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="founder">Founder</SelectItem>
              <SelectItem value="pro">Pro</SelectItem>
              <SelectItem value="free">Free</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="no_plan">Sin plan</SelectItem>
            </SelectContent>
          </Select>
          <Button 
            variant={showOnlyAnonymous ? "default" : "outline"}
            onClick={() => setShowOnlyAnonymous(!showOnlyAnonymous)}
            className="gap-2 shrink-0"
          >
            <Users className="h-4 w-4" />
            Solo Anónimos
          </Button>
          <Button onClick={handleOpenGmail} disabled={users.length === 0} className="gap-2 shrink-0">
            <Mail className="h-4 w-4" />
            {t('emailAll')} ({users.length})
          </Button>
        </div>
      </div>

      {/* Records count */}
      {(searchQuery || tierFilter !== 'all') && (
        <p className="text-sm text-muted-foreground">
          {sortedData.length} de {users.length} registros
        </p>
      )}

      {/* Table */}
      <div className="rounded-lg border bg-card overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-border">
          <div className="min-w-[1200px]">
            <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="name" className="w-[280px]">Usuario</SortableHeader>
              <SortableHeader column="tier" className="text-center">Plan</SortableHeader>
              <SortableHeader column="isOnWaitlist" className="text-center">Waitlist</SortableHeader>
              <SortableHeader column="followersCount" className="text-center">Seguidores</SortableHeader>
              <SortableHeader column="followingCount" className="text-center">Siguiendo</SortableHeader>
              <SortableHeader column="created_at">Registro</SortableHeader>
              <SortableHeader column="lastActivity">{t('lastActivity')}</SortableHeader>
              <TableHead className="text-center">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((user) => {
              const remaining = getDaysRemaining(user.current_period_end);
              return (
              <TableRow key={user.id}>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={user.avatar_url || undefined} alt={user.name || 'Avatar'} />
                      <AvatarFallback>{getInitials(user.name)}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 group/copy">
                        <p className="font-medium text-foreground truncate">{user.name || 'Sin nombre'}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 opacity-0 group-hover/copy:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(user.name || '', 'Nombre')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                      <div className="flex items-center gap-2 group/copy-user">
                        <p className="text-sm text-muted-foreground truncate">@{user.username}</p>
                        {user.username && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-4 w-4 opacity-0 group-hover/copy-user:opacity-100 transition-opacity"
                            onClick={() => copyToClipboard(user.username || '', 'Username')}
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <div className="flex items-center gap-2 group/copy-email">
                        <p className="text-xs text-muted-foreground/70 truncate">{user.email}</p>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 opacity-0 group-hover/copy-email:opacity-100 transition-opacity"
                          onClick={() => copyToClipboard(user.email, 'Correo')}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="text-center">
                  <div className="flex flex-col items-center gap-1">
                    {getTierBadge(user)}
                    {getSubscriptionStatusBadge(user.subscription_status)}
                    {remaining && (
                      <span className={`text-xs ${remaining.days < 0 ? 'text-red-400' : remaining.days < 7 ? 'text-orange-400' : 'text-muted-foreground'}`}>
                        {remaining.label}
                      </span>
                    )}
                    {user.current_period_end && (
                      <span className="text-xs text-muted-foreground/60">
                        {formatShortDate(user.current_period_end)}
                      </span>
                    )}
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
                  <div className="flex items-center justify-center gap-1">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      asChild 
                      disabled={!user.username}
                      className={!user.username ? 'opacity-30 cursor-not-allowed' : ''}
                    >
                      {user.username ? (
                        <a href={`/@${user.username}`} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      ) : (
                        <ExternalLink className="h-4 w-4" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={!canDelete(user)}
                      className={`text-destructive hover:text-destructive hover:bg-destructive/10 ${!canDelete(user) ? 'opacity-30 cursor-not-allowed' : ''}`}
                      onClick={() => setDeleteTarget(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
              );
            })}
          </TableBody>
        </Table>
          </div>
        </div>
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

      {/* Delete confirmation dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar usuario</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de eliminar a <strong>{deleteTarget?.name || 'Sin nombre'}</strong> ({deleteTarget?.email})?
              {deleteTarget?.tier && (
                <span className="block mt-1">
                  Plan actual: <strong>{deleteTarget.tier === 'founder' ? `Founder #${deleteTarget.founder_number}` : deleteTarget.tier}</strong>
                </span>
              )}
              <span className="block mt-2 text-destructive font-medium">
                Esta acción es irreversible. Se eliminarán todos sus datos.
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={deleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
