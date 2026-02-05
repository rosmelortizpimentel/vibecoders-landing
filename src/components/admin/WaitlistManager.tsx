import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { ExternalLink, Loader2, CheckCircle, Clock } from 'lucide-react';

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
  const [entries, setEntries] = useState<WaitlistEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        <h1 className="text-2xl font-bold text-foreground">Waitlist</h1>
        <p className="text-muted-foreground">
          {entries.length} emails en la lista de espera · {registeredCount} ya registrados
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[280px]">Email</TableHead>
              <TableHead>Timezone</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Usuario Registrado</TableHead>
              <TableHead className="text-right">Fecha (Toronto)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
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
