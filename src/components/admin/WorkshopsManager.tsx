import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, Calendar as CalendarIcon, Upload, List } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { WorkshopCalendar } from './WorkshopCalendar';
import { TimezoneDisplay } from './TimezoneDisplay';

interface Workshop {
  id: string;
  title: string;
  tagline: string | null;
  description: string | null;
  banner_url: string | null;
  scheduled_at: string;
  duration_minutes: number | null;
  status: string;
  created_at: string;
  updated_at: string;
}

interface Speaker {
  id: string;
  display_name: string;
  photo_url: string | null;
}

interface WorkshopWithSpeakers extends Workshop {
  speakers: Speaker[];
}

const STATUS_MAP: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  draft: { label: 'Borrador', variant: 'secondary' },
  published: { label: 'Publicado', variant: 'default' },
  cancelled: { label: 'Cancelado', variant: 'destructive' },
};

export function WorkshopsManager() {
  const [workshops, setWorkshops] = useState<WorkshopWithSpeakers[]>([]);
  const [allSpeakers, setAllSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editing, setEditing] = useState<Workshop | null>(null);
  const [selectedSpeakerIds, setSelectedSpeakerIds] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: '', tagline: '', description: '', banner_url: '', scheduled_at: '', duration_minutes: '', status: 'draft',
  });

  const fetchWorkshops = async () => {
    setLoading(true);
    const { data: wData, error: wErr } = await supabase
      .from('workshops')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (wErr) { toast.error('Error al cargar charlas'); setLoading(false); return; }

    const { data: wsData } = await supabase.from('workshop_speakers').select('workshop_id, speaker_id');
    const { data: sData } = await supabase.from('speakers').select('id, display_name, photo_url');

    const speakersMap = new Map((sData || []).map((s: Speaker) => [s.id, s]));
    const workshopSpeakers = new Map<string, Speaker[]>();
    (wsData || []).forEach((ws: { workshop_id: string; speaker_id: string }) => {
      const speaker = speakersMap.get(ws.speaker_id);
      if (speaker) {
        const list = workshopSpeakers.get(ws.workshop_id) || [];
        list.push(speaker);
        workshopSpeakers.set(ws.workshop_id, list);
      }
    });

    const enriched: WorkshopWithSpeakers[] = ((wData as Workshop[]) || []).map(w => ({
      ...w,
      speakers: workshopSpeakers.get(w.id) || [],
    }));

    setWorkshops(enriched);
    setAllSpeakers((sData as Speaker[]) || []);
    setLoading(false);
  };

  useEffect(() => { fetchWorkshops(); }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const ext = file.name.split('.').pop();
    const path = `banners/${Date.now()}.${ext}`;
    const { error } = await supabase.storage.from('workshop-assets').upload(path, file);
    if (error) { toast.error('Error al subir banner'); setUploading(false); return; }
    const { data: urlData } = supabase.storage.from('workshop-assets').getPublicUrl(path);
    setFormData(p => ({ ...p, banner_url: urlData.publicUrl }));
    setUploading(false);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.scheduled_at) {
      toast.error('Título y fecha son requeridos');
      return;
    }

    const payload = {
      title: formData.title,
      tagline: formData.tagline || null,
      description: formData.description || null,
      banner_url: formData.banner_url || null,
      scheduled_at: formData.scheduled_at,
      duration_minutes: formData.duration_minutes ? parseInt(formData.duration_minutes) : null,
      status: formData.status,
      updated_at: new Date().toISOString(),
    };

    let workshopId: string;

    if (editing) {
      const { error } = await supabase.from('workshops').update(payload).eq('id', editing.id);
      if (error) { toast.error('Error al actualizar'); return; }
      workshopId = editing.id;
    } else {
      const { data, error } = await supabase.from('workshops').insert(payload).select('id').single();
      if (error || !data) { toast.error('Error al crear charla'); return; }
      workshopId = data.id;
    }

    // Sync speakers
    await supabase.from('workshop_speakers').delete().eq('workshop_id', workshopId);
    if (selectedSpeakerIds.length > 0) {
      const rows = selectedSpeakerIds.map(sid => ({ workshop_id: workshopId, speaker_id: sid }));
      await supabase.from('workshop_speakers').insert(rows);
    }

    toast.success(editing ? 'Charla actualizada' : 'Charla creada');
    closeDialog();
    fetchWorkshops();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta charla?')) return;
    const { error } = await supabase.from('workshops').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    toast.success('Charla eliminada');
    fetchWorkshops();
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: '', tagline: '', description: '', banner_url: '', scheduled_at: '', duration_minutes: '', status: 'draft' });
    setSelectedSpeakerIds([]);
    setShowDialog(true);
  };

  const openEdit = (w: WorkshopWithSpeakers) => {
    setEditing(w);
    setFormData({
      title: w.title,
      tagline: w.tagline || '',
      description: w.description || '',
      banner_url: w.banner_url || '',
      scheduled_at: w.scheduled_at ? w.scheduled_at.slice(0, 16) : '',
      duration_minutes: w.duration_minutes?.toString() || '',
      status: w.status,
    });
    setSelectedSpeakerIds(w.speakers.map(s => s.id));
    setShowDialog(true);
  };

  const closeDialog = () => {
    setShowDialog(false);
    setEditing(null);
  };

  const toggleSpeaker = (id: string) => {
    setSelectedSpeakerIds(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-6 w-6" /> Charlas
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{workshops.length} charlas</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nueva charla</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : workshops.length === 0 ? (
        <p className="text-muted-foreground">No hay charlas aún.</p>
      ) : (
        <Tabs defaultValue="list" className="w-full">
          <div className="flex justify-end mb-4">
            <TabsList>
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" /> Lista
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" /> Calendario
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="mt-0">
            <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="py-2 h-auto text-[11px] font-bold uppercase">Título</TableHead>
              <TableHead className="py-2 h-auto text-[11px] font-bold uppercase">Fecha</TableHead>
              <TableHead className="py-2 h-auto text-[11px] font-bold uppercase">Hora (Local)</TableHead>
              <TableHead className="py-2 h-auto text-[11px] font-bold uppercase">Horarios (Países)</TableHead>
              <TableHead className="py-2 h-auto text-[11px] font-bold uppercase">Estado</TableHead>
              <TableHead className="py-2 h-auto text-[11px] font-bold uppercase">Ponentes</TableHead>
              <TableHead className="py-2 h-auto text-[11px] font-bold uppercase text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workshops.map((w) => (
              <TableRow key={w.id} className="hover:bg-gray-50/50 transition-colors border-b border-gray-100">
                <TableCell className="py-1.5">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{w.title}</span>
                    {w.tagline && <span className="text-[11px] text-gray-500 line-clamp-1">{w.tagline}</span>}
                  </div>
                </TableCell>
                <TableCell className="py-1.5 text-[13px] text-gray-600">
                  {format(new Date(w.scheduled_at), "d 'de' MMM, yyyy", { locale: es })}
                </TableCell>
                <TableCell className="py-1.5 text-[13px] font-medium text-gray-900">
                  {format(new Date(w.scheduled_at), "HH:mm 'hs'", { locale: es })}
                </TableCell>
                <TableCell className="py-1.5">
                  <TimezoneDisplay date={w.scheduled_at} variant="compact" />
                </TableCell>
                <TableCell className="py-1.5">
                  <Badge variant={STATUS_MAP[w.status]?.variant || 'secondary'} className="text-[10px] px-1.5 py-0 h-auto font-medium">
                    {STATUS_MAP[w.status]?.label || w.status}
                  </Badge>
                </TableCell>
                <TableCell className="py-1.5">
                  <div className="flex -space-x-1.5">
                    {w.speakers.map(s => (
                      <Avatar key={s.id} className="h-6 w-6 border-2 border-background shadow-sm">
                        <AvatarImage src={s.photo_url || ''} />
                        <AvatarFallback className="text-[9px]">{s.display_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {w.speakers.length === 0 && <span className="text-[11px] text-muted-foreground italic">Sin ponentes</span>}
                  </div>
                </TableCell>
                <TableCell className="py-1.5 text-right space-x-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(w)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(w.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="calendar" className="mt-0">
          <WorkshopCalendar workshops={workshops} onEdit={openEdit} />
        </TabsContent>
      </Tabs>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar Charla' : 'Nueva Charla'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>Tagline (Subtítulo)</Label>
              <Input value={formData.tagline} onChange={(e) => setFormData(p => ({ ...p, tagline: e.target.value }))} placeholder="Una breve descripción para la lista" />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="flex items-center gap-1.5">
                  Fecha y hora *
                  <img src="https://flagcdn.com/w20/ca.png" width="16" height="12" alt="Canada" className="inline-block rounded-[1px]" title="Hora local (Canadá)" />
                </Label>
                <Input type="datetime-local" value={formData.scheduled_at} onChange={(e) => setFormData(p => ({ ...p, scheduled_at: e.target.value }))} />
                <TimezoneDisplay date={formData.scheduled_at} className="mt-2" />
              </div>
              <div>
                <Label>Duración (min)</Label>
                <Input type="number" value={formData.duration_minutes} onChange={(e) => setFormData(p => ({ ...p, duration_minutes: e.target.value }))} placeholder="60" />
              </div>
            </div>
            <div>
              <Label>Estado</Label>
              <Select value={formData.status} onValueChange={(v) => setFormData(p => ({ ...p, status: v }))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Borrador</SelectItem>
                  <SelectItem value="published">Publicado</SelectItem>
                  <SelectItem value="cancelled">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Banner</Label>
              <div className="flex items-center gap-2">
                <Input type="file" accept="image/*" onChange={handleBannerUpload} disabled={uploading} />
                {uploading && <span className="text-xs text-muted-foreground">Subiendo...</span>}
              </div>
              {formData.banner_url && (
                <img src={formData.banner_url} alt="Banner" className="mt-2 rounded-md max-h-32 object-cover w-full" />
              )}
            </div>
            <div>
              <Label>Ponentes</Label>
              {allSpeakers.length === 0 ? (
                <p className="text-xs text-muted-foreground">No hay ponentes registrados. Créalos primero.</p>
              ) : (
                <div className="border rounded-md max-h-40 overflow-y-auto mt-1">
                  {allSpeakers.map(s => (
                    <label key={s.id} className="flex items-center gap-3 p-2 hover:bg-muted/50 cursor-pointer">
                      <Checkbox
                        checked={selectedSpeakerIds.includes(s.id)}
                        onCheckedChange={() => toggleSpeaker(s.id)}
                      />
                      <Avatar className="h-7 w-7">
                        <AvatarImage src={s.photo_url || ''} />
                        <AvatarFallback className="text-xs">{s.display_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="text-sm">{s.display_name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={closeDialog}>Cancelar</Button>
            <Button onClick={handleSave} disabled={!formData.title.trim() || !formData.scheduled_at}>
              {editing ? 'Guardar' : 'Crear'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
