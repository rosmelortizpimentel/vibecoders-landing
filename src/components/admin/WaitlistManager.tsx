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
import { ExternalLink, Loader2, CheckCircle, Clock, Mail, Search } from 'lucide-react';
import { useSortableData } from '@/hooks/useSortableData';
import { useTranslation } from '@/hooks/useTranslation';

interface WaitlistEntry {
  id: string;
  email: string;
  timezone: string | null;
  created_at: string;
  registered: boolean;
  profile: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

function formatTorontoDate(dateString: string): string {
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

export function WaitlistManager() {
  const { t } = useTranslation('admin');
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('admin-waitlist-status', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      setEntries(response.data || []);
    } catch (err) {
      console.error('Error fetching waitlist:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar la waitlist');
    } finally {
      setLoading(false);
    }
  };

  // Filter entries based on search query
  const filteredEntries = useMemo(() => {
    if (!searchQuery.trim()) return entries;
    const query = searchQuery.toLowerCase();
    return entries.filter(
      (entry) =>
        entry.email.toLowerCase().includes(query) ||
        entry.profile?.name?.toLowerCase().includes(query) ||
        entry.profile?.username?.toLowerCase().includes(query) ||
        entry.timezone?.toLowerCase().includes(query)
    );
  }, [entries, searchQuery]);

  // Sortable data
  const { sortedData, requestSort, getSortIndicator } = useSortableData<WaitlistEntry, keyof WaitlistEntry>(filteredEntries, {
    key: 'created_at',
    direction: 'desc',
  });

  const getInitials = (name: string | null) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const registeredCount = entries.filter((e) => e.registered).length;

  const handleOpenGmail = () => {
    const allEmails = entries.map((e) => e.email);
    const bccEmails = allEmails.join(',');
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&bcc=${encodeURIComponent(bccEmails)}`;
    window.open(gmailUrl, '_blank');
  };

  const SortableHeader = ({ column, children, className }: { column: keyof WaitlistEntry; children: React.ReactNode; className?: string }) => (
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
        <h1 className="text-2xl font-bold text-foreground">{t('waitlist')}</h1>
        <p className="text-muted-foreground">
          {entries.length} {t('emailsInWaitlist')} · {registeredCount} {t('alreadyRegistered')}
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
        <Button onClick={handleOpenGmail} disabled={entries.length === 0} className="gap-2">
          <Mail className="h-4 w-4" />
          {t('emailAll')} ({entries.length})
        </Button>
      </div>

      {/* Records count when filtering */}
      {searchQuery && (
        <p className="text-sm text-muted-foreground">
          {sortedData.length} de {entries.length} registros
        </p>
      )}

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <SortableHeader column="email" className="w-[280px]">Email</SortableHeader>
              <SortableHeader column="timezone">Timezone</SortableHeader>
              <SortableHeader column="registered">Estado</SortableHeader>
              <TableHead>Usuario Registrado</TableHead>
              <SortableHeader column="created_at" className="text-right">Fecha (Toronto)</SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedData.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <span className="font-mono text-sm">{entry.email}</span>
                </TableCell>
                <TableCell>
                  <span className="text-sm text-muted-foreground">
                    {entry.timezone || '—'}
                  </span>
                </TableCell>
                <TableCell>
                  {entry.registered ? (
                    <Badge className="bg-[hsl(142,76%,36%)] hover:bg-[hsl(142,76%,30%)] text-white">
                      <CheckCircle className="mr-1 h-3 w-3" />
                      Registrado
                    </Badge>
                  ) : (
                    <Badge variant="secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      Pendiente
                    </Badge>
                  )}
                </TableCell>
                <TableCell>
                  {entry.profile ? (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={entry.profile.avatar_url || undefined} alt={entry.profile.name || 'Avatar'} />
                        <AvatarFallback className="text-xs">{getInitials(entry.profile.name)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground">{entry.profile.name || 'Sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">
                          {entry.profile.username ? `@${entry.profile.username}` : 'Sin username'}
                        </p>
                      </div>
                      {entry.profile.username && (
                        <Button variant="ghost" size="sm" asChild className="ml-auto">
                          <a
                            href={`/@${entry.profile.username}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </TableCell>
                <TableCell className="text-right text-sm text-muted-foreground">
                  {formatTorontoDate(entry.created_at)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
