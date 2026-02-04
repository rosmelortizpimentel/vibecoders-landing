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
  created_at: string;
  // Linked profile info (if registered)
  profile?: {
    id: string;
    name: string | null;
    username: string | null;
    avatar_url: string | null;
    created_at: string | null;
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

  useEffect(() => {
    fetchWaitlist();
  }, []);

  const fetchWaitlist = async () => {
    setLoading(true);
    try {
      // Fetch waitlist entries
      const { data: waitlistData, error: waitlistError } = await supabase
        .from('waitlist')
        .select('id, email, created_at')
        .order('created_at', { ascending: false });

      if (waitlistError) throw waitlistError;

      // Fetch all profiles to match by email
      // Note: We need to get emails from auth.users, but we can't access that directly
      // Instead, we'll fetch profiles and try to match by normalized email in the profile
      const { data: profilesData, error: profilesError } = await supabase
        .from('profiles')
        .select('id, name, username, avatar_url, created_at, email_public');

      if (profilesError) throw profilesError;

      // Create a map of normalized emails to profiles
      const emailToProfile = new Map<string, typeof profilesData[0]>();
      profilesData?.forEach((profile) => {
        if (profile.email_public) {
          const normalizedEmail = profile.email_public.toLowerCase().split('+')[0].split('@')[0] + '@' + profile.email_public.toLowerCase().split('@')[1];
          emailToProfile.set(normalizedEmail, profile);
        }
      });

      // Also try to match by username patterns (some users might have username = email prefix)
      const usernameToProfile = new Map<string, typeof profilesData[0]>();
      profilesData?.forEach((profile) => {
        if (profile.username) {
          usernameToProfile.set(profile.username.toLowerCase(), profile);
        }
      });

      // Map waitlist entries with profile info
      const entriesWithProfiles: WaitlistEntry[] = (waitlistData || []).map((entry) => {
        // Normalize waitlist email for matching
        const [localPart, domain] = entry.email.toLowerCase().split('@');
        const normalizedEmail = localPart.split('+')[0] + '@' + domain;
        
        // Try to find matching profile
        let matchedProfile = emailToProfile.get(normalizedEmail);
        
        // If no direct email match, try username match with email prefix
        if (!matchedProfile) {
          const emailPrefix = localPart.split('+')[0];
          matchedProfile = usernameToProfile.get(emailPrefix);
        }

        return {
          ...entry,
          profile: matchedProfile || null,
        };
      });

      setEntries(entriesWithProfiles);
    } catch (error) {
      console.error('Error fetching waitlist:', error);
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

  const registeredCount = entries.filter((e) => e.profile).length;

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
        <h1 className="text-2xl font-bold text-foreground">Waitlist</h1>
        <p className="text-muted-foreground">
          {entries.length} emails en la lista de espera · {registeredCount} ya registrados
        </p>
      </div>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[300px]">Email</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Usuario Registrado</TableHead>
              <TableHead className="text-right">Fecha Waitlist (Toronto)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entries.map((entry) => (
              <TableRow key={entry.id}>
                <TableCell>
                  <span className="font-mono text-sm">{entry.email}</span>
                </TableCell>
                <TableCell>
                  {entry.profile ? (
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
