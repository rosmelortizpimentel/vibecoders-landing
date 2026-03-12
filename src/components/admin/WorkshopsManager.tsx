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
import { Plus, Trash2, Pencil, Calendar, Upload } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface Workshop {
  id: string;
  title: string;
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
    title: '', description: '', banner_url: '', scheduled_at: '', duration_minutes: '', status: 'draft',
  });

  const fetchWorkshops = async () => {
    setLoading(true);
    const { data: wData, error: wErr } = await supabase
      .from('workshops')
      .select('*')
      .order('scheduled_at', { ascending: true });

    if (wErr) { toast.error('Error al cargar talleres'); setLoading(false); return; }

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
      if (error || !data) { toast.error('Error al crear taller'); return; }
      workshopId = data.id;
    }

    // Sync speakers
    await supabase.from('workshop_speakers').delete().eq('workshop_id', workshopId);
    if (selectedSpeakerIds.length > 0) {
      const rows = selectedSpeakerIds.map(sid => ({ workshop_id: workshopId, speaker_id: sid }));
      await supabase.from('workshop_speakers').insert(rows);
    }

    toast.success(editing ? 'Taller actualizado' : 'Taller creado');
    closeDialog();
    fetchWorkshops();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este taller?')) return;
    const { error } = await supabase.from('workshops').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    toast.success('Taller eliminado');
    fetchWorkshops();
  };

  const openCreate = () => {
    setEditing(null);
    setFormData({ title: '', description: '', banner_url: '', scheduled_at: '', duration_minutes: '', status: 'draft' });
    setSelectedSpeakerIds([]);
    setShowDialog(true);
  };

  const openEdit = (w: WorkshopWithSpeakers) => {
    setEditing(w);
    setFormData({
      title: w.title,
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Calendar className="h-6 w-6" /> Talleres
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{workshops.length} talleres</p>
        </div>
        <Button onClick={openCreate}><Plus className="h-4 w-4 mr-1" /> Nuevo taller</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : workshops.length === 0 ? (
        <p className="text-muted-foreground">No hay talleres aún.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Ponentes</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {workshops.map((w) => (
              <TableRow key={w.id}>
                <TableCell className="font-medium">{w.title}</TableCell>
                <TableCell>{format(new Date(w.scheduled_at), "d MMM yyyy, HH:mm", { locale: es })}</TableCell>
                <TableCell>
                  <Badge variant={STATUS_MAP[w.status]?.variant || 'secondary'}>
                    {STATUS_MAP[w.status]?.label || w.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex -space-x-2">
                    {w.speakers.map(s => (
                      <Avatar key={s.id} className="h-7 w-7 border-2 border-background">
                        <AvatarImage src={s.photo_url || ''} />
                        <AvatarFallback className="text-xs">{s.display_name.charAt(0)}</AvatarFallback>
                      </Avatar>
                    ))}
                    {w.speakers.length === 0 && <span className="text-xs text-muted-foreground">Sin ponentes</span>}
                  </div>
                </TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(w)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(w.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={(v) => { if (!v) closeDialog(); }}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Editar Taller' : 'Nuevo Taller'}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Título *</Label>
              <Input value={formData.title} onChange={(e) => setFormData(p => ({ ...p, title: e.target.value }))} />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Fecha y hora *</Label>
                <Input type="datetime-local" value={formData.scheduled_at} onChange={(e) => setFormData(p => ({ ...p, scheduled_at: e.target.value }))} />
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
