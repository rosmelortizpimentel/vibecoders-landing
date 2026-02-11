import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  ChevronRight, 
  Loader2,
  Users,
  Search,
  Copy,
  Trash2
} from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Input } from '@/components/ui/input';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

interface Broadcast {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  created_at: string;
  sent_count: number;
  read_count?: number;
  status: 'draft' | 'sent';
}

interface BroadcastDetail {
  recipient_id: string;
  read_at: string | null;
  profile: {
    name: string | null;
    username: string | null;
    avatar_url: string | null;
  } | null;
}

interface BroadcastHistoryProps {
  onEditDraft?: (broadcast: any) => void;
  onClone?: (broadcast: any) => void;
}

export function BroadcastHistory({ onEditDraft, onClone }: BroadcastHistoryProps) {
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedBroadcast, setSelectedBroadcast] = useState<Broadcast | null>(null);
  const [details, setDetails] = useState<BroadcastDetail[]>([]);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [broadcastToDelete, setBroadcastToDelete] = useState<Broadcast | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchBroadcasts();
  }, []);

  const fetchBroadcasts = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('system_broadcasts')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const enrichedBroadcasts = await Promise.all((data || []).map(async (b: any) => {
        if (b.status === 'draft') return { ...b, read_count: 0 };

        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('broadcast_id', b.id)
          .not('read_at', 'is', null);
        
        return {
          ...b,
          read_count: count || 0
        };
      }));

      setBroadcasts(enrichedBroadcasts);
    } catch (err) {
      console.error('Error fetching broadcasts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetails = async (broadcastId: string) => {
    try {
      setIsLoadingDetails(true);
      const { data, error } = await (supabase
        .from('notifications' as any) as any)
        .select(`
          recipient_id,
          read_at,
          profile:profiles!recipient_id(name, username, avatar_url)
        `)
        .eq('broadcast_id', broadcastId);

      if (error) throw error;
      setDetails(data as any);
    } catch (err) {
      console.error('Error fetching details:', err);
    } finally {
      setIsLoadingDetails(false);
    }
  };

  const handleViewDetails = (broadcast: Broadcast) => {
    setSelectedBroadcast(broadcast);
    fetchDetails(broadcast.id);
  };

  const handleDelete = async (id: string) => {
    try {
      setIsDeleting(true);
      const { error } = await (supabase
        .from('system_broadcasts' as any) as any)
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast.success('Notificación eliminada permanentemente');
      setBroadcasts(prev => prev.filter(b => b.id !== id));
    } catch (err) {
      console.error('Error deleting broadcast:', err);
      toast.error('Error al eliminar el registro');
    } finally {
      setIsDeleting(false);
      setBroadcastToDelete(null);
    }
  };

  const filteredDetails = details.filter(d => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    const name = d.profile?.name?.toLowerCase() || '';
    const username = d.profile?.username?.toLowerCase() || '';
    return name.includes(searchLower) || username.includes(searchLower);
  });

  const readDetails = filteredDetails
    .filter(d => d.read_at !== null)
    .sort((a, b) => new Date(b.read_at!).getTime() - new Date(a.read_at!).getTime());

  const unreadDetails = filteredDetails.filter(d => d.read_at === null);

  const formatTorontoTime = (dateStr: string) => {
    try {
      return new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Toronto',
        hour12: false
      }).format(new Date(dateStr));
    } catch (e) {
      return '--:--';
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Historial de Notificaciones
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
              <Loader2 className="w-8 h-8 animate-spin" />
              <p className="mt-2 text-sm italic">Cargando historial...</p>
            </div>
          ) : broadcasts.length === 0 ? (
            <div className="py-20 flex flex-col items-center justify-center text-muted-foreground">
              <p className="mt-2 text-sm italic">No se han enviado notificaciones aún.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-muted/20">
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Título</TableHead>
                  <TableHead className="text-center">Enviados</TableHead>
                  <TableHead className="text-center">Leídos</TableHead>
                  <TableHead className="text-center">Alcance</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {broadcasts.map((b) => {
                  const reach = b.sent_count > 0 ? Math.round((b.read_count! / b.sent_count) * 100) : 0;
                  return (
                    <TableRow key={b.id} className="group transition-colors">
                      <TableCell className="font-medium text-xs">
                        {format(new Date(b.created_at), "dd MMM, HH:mm", { locale: es })}
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={b.status === 'draft' ? 'secondary' : 'outline'}
                          className={b.status === 'draft' ? 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200' : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-50 border-emerald-200'}
                        >
                          {b.status === 'draft' ? 'Borrador' : 'Enviado'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-[300px]">
                          <p className="font-semibold text-sm truncate">{b.title}</p>
                          <p className="text-[11px] text-muted-foreground truncate">{b.subtitle || 'Sin subtítulo'}</p>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline" className="font-mono">{b.sent_count}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className="font-mono bg-emerald-500/10 text-emerald-600 border-emerald-500/20">{b.read_count}</Badge>
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-[10px] font-bold">{reach}%</span>
                          <div className="w-16 h-1 bg-muted rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500" style={{ width: `${reach}%` }} />
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          {b.status === 'draft' && onEditDraft && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 gap-1 hover:bg-amber-500/10 hover:text-amber-600 border-amber-200"
                              onClick={() => onEditDraft(b)}
                            >
                              Editar
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1 hover:bg-primary/10 hover:text-primary transition-all"
                            onClick={() => handleViewDetails(b)}
                            disabled={b.status === 'draft'}
                          >
                            Detalles
                            <ChevronRight className="w-4 h-4" />
                          </Button>
                          {onClone && (
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 gap-1 hover:bg-slate-500/10 hover:text-slate-600 border-slate-200"
                              onClick={() => onClone(b)}
                              title="Clonar mensaje"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-8 gap-1 hover:bg-destructive/10 hover:text-destructive border-transparent"
                            onClick={() => setBroadcastToDelete(b)}
                            title="Eliminar permanentemente"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recipient Details Dialog */}
      <Dialog open={!!selectedBroadcast} onOpenChange={(open) => !open && setSelectedBroadcast(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                Destinatarios del Broadcast
              </div>
              {selectedBroadcast && (
                <Badge variant="outline" className="text-xs uppercase px-2 font-mono">
                  {selectedBroadcast.read_count} / {selectedBroadcast.sent_count} Leídos
                </Badge>
              )}
            </DialogTitle>
            <div className="mt-4 pb-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input 
                placeholder="Filtrar por nombre o username..." 
                className="pl-9"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
          </DialogHeader>
          
          <div className="flex-1 overflow-hidden flex flex-col min-h-0">
            {isLoadingDetails ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <Loader2 className="w-8 h-8 animate-spin" />
                <p className="mt-2 text-sm italic">Cargando detalles...</p>
              </div>
            ) : (
              <Tabs defaultValue="read" className="flex-1 flex flex-col min-h-0">
                <div className="px-6 border-b bg-muted/20">
                  <TabsList className="w-full justify-start h-12 bg-transparent gap-6">
                    <TabsTrigger 
                      value="read" 
                      className="h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 font-bold transition-all relative"
                    >
                      Leídos
                      <Badge variant="secondary" className="ml-2 scale-75 bg-emerald-500/10 text-emerald-600 border-none">
                        {readDetails.length}
                      </Badge>
                    </TabsTrigger>
                    <TabsTrigger 
                      value="unread"
                      className="h-full border-b-2 border-transparent data-[state=active]:border-primary data-[state=active]:bg-transparent rounded-none px-2 font-bold transition-all"
                    >
                      No leídos
                      <Badge variant="secondary" className="ml-2 scale-75 bg-amber-500/10 text-amber-600 border-none">
                        {unreadDetails.length}
                      </Badge>
                    </TabsTrigger>
                  </TabsList>
                </div>

                <div className="flex-1 p-4 overflow-y-auto scrollbar-thin min-h-0">
                  <TabsContent value="read" className="mt-0 space-y-2 outline-none">
                    {readDetails.map((d) => (
                      <div 
                        key={d.recipient_id} 
                        className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-muted/30 transition-all group cursor-pointer"
                        onClick={() => d.profile?.username && navigate(`/@${d.profile.username}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/50 group-hover:border-primary/30 transition-colors">
                            <AvatarImage src={d.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs">{d.profile?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{d.profile?.name || 'Usuario'}</p>
                            <p className="text-[11px] text-muted-foreground">@{d.profile?.username || 'anon'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-emerald-600 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20 shadow-sm">
                            <CheckCircle2 className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Leído</span>
                            <span className="text-[10px] opacity-70 ml-1 font-mono">{formatTorontoTime(d.read_at!)}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {readDetails.length === 0 && (
                      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/40 rounded-2xl mx-2">
                        <Users className="w-8 h-8 opacity-20 mb-2" />
                        <p className="text-sm italic">Nadie ha leído este mensaje aún.</p>
                      </div>
                    )}
                  </TabsContent>

                  <TabsContent value="unread" className="mt-0 space-y-2 outline-none">
                    {unreadDetails.map((d) => (
                      <div 
                        key={d.recipient_id} 
                        className="flex items-center justify-between p-3 rounded-xl border border-border/40 bg-card/50 hover:bg-muted/30 transition-all group cursor-pointer"
                        onClick={() => d.profile?.username && navigate(`/@${d.profile.username}`)}
                      >
                        <div className="flex items-center gap-3">
                          <Avatar className="h-10 w-10 border border-border/50 group-hover:border-primary/30 transition-colors">
                            <AvatarImage src={d.profile?.avatar_url || undefined} />
                            <AvatarFallback className="bg-primary/5 text-primary text-xs">{d.profile?.name?.charAt(0) || 'U'}</AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-bold group-hover:text-primary transition-colors">{d.profile?.name || 'Usuario'}</p>
                            <p className="text-[11px] text-muted-foreground font-mono">@{d.profile?.username || 'anon'}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-1.5 text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full border border-slate-200 shadow-sm opacity-70">
                            <Clock className="w-3 h-3" />
                            <span className="text-[10px] font-bold uppercase tracking-wider">Pendiente</span>
                          </div>
                        </div>
                      </div>
                    ))}
                    {unreadDetails.length === 0 && (
                      <div className="py-12 flex flex-col items-center justify-center text-muted-foreground border-2 border-dashed border-border/40 rounded-2xl mx-2">
                        <CheckCircle2 className="w-8 h-8 text-emerald-500/30 mb-2" />
                        <p className="text-sm italic">¡Todos los destinatarios han leído el mensaje!</p>
                      </div>
                    )}
                  </TabsContent>
                </div>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!broadcastToDelete} onOpenChange={(open) => !open && setBroadcastToDelete(null)}>
        <AlertDialogContent className="bg-white border-2 border-destructive/10 rounded-2xl shadow-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2 text-destructive">
              <Trash2 className="w-6 h-6" />
              ¿Estás completamente seguro?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base py-4 leading-relaxed">
              Esta acción **eliminará permanentemente** el registro del historial y **TODAS** las notificaciones que ya fueron enviadas a los usuarios por este mensaje.
              <br/><br/>
              No quedará rastro de esta notificación en el sistema. Esta acción es irreversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="h-12 border-slate-200 text-slate-500 hover:text-slate-700 font-medium px-6">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => broadcastToDelete && handleDelete(broadcastToDelete.id)}
              className="h-12 bg-destructive hover:bg-destructive/90 text-white font-bold shadow-lg shadow-destructive/20 transition-all px-8"
              disabled={isDeleting}
            >
              {isDeleting ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Trash2 className="w-5 h-5 mr-2" />
              )}
              Sí, eliminar ahora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
