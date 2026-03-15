import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { toast } from 'sonner';
import { Plus, Trash2, Search, Pencil, Mic, Loader2, Camera, Upload, UserMinus } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface Speaker {
  id: string;
  user_id: string | null;
  display_name: string;
  email: string | null;
  tagline: string | null;
  photo_url: string | null;
  created_at: string;
}

interface ProfileResult {
  id: string;
  name: string | null;
  username: string | null;
  tagline: string | null;
  avatar_url: string | null;
}

export function SpeakersManager() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<ProfileResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [formData, setFormData] = useState({ 
    display_name: '', 
    email: '', 
    tagline: '', 
    photo_url: '', 
    user_id: null as string | null 
  });
  const [isUploading, setIsUploading] = useState(false);

  const fetchSpeakers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('speakers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) {
      toast.error('Error al cargar ponentes');
    } else {
      setSpeakers(data || []);
    }
    setLoading(false);
  };

  const handleAdminPhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB limit
    const MAX_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      toast.error('La foto es demasiado grande. Debe pesar menos de 10MB.');
      return;
    }

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `speakers/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('workshop-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('workshop-assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, photo_url: publicUrl }));
      toast.success('Foto cargada correctamente');
    } catch (error) {
      toast.error('Error al cargar la foto: ' + (error instanceof Error ? error.message : 'Error desconocido'));
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => { fetchSpeakers(); }, []);

  const searchUsers = async (query: string) => {
    if (query.length < 2) { setSearchResults([]); return; }
    setSearching(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, username, tagline, avatar_url')
      .or(`name.ilike.%${query}%,username.ilike.%${query}%`)
      .limit(10);
    if (!error && data) setSearchResults(data);
    setSearching(false);
  };

  const selectUser = (profile: ProfileResult) => {
    setFormData({
      display_name: profile.name || '',
      email: '', // Email might not be in profile object, user needs to fill or we could try to fetch it
      tagline: profile.tagline || '',
      photo_url: profile.avatar_url || '',
      user_id: profile.id,
    });
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleAdd = async () => {
    if (!formData.display_name.trim()) { toast.error('El nombre es requerido'); return; }
    const { error } = await supabase.from('speakers').insert({
      display_name: formData.display_name,
      email: formData.email || null,
      tagline: formData.tagline || null,
      photo_url: formData.photo_url || null,
      user_id: formData.user_id,
    });
    if (error) { toast.error('Error al crear ponente: ' + error.message); return; }
    toast.success('Ponente agregado');
    setShowAddDialog(false);
    resetForm();
    fetchSpeakers();
  };

  const handleEdit = async () => {
    if (!editingSpeaker || !formData.display_name.trim()) return;
    const { error } = await supabase.from('speakers').update({
      display_name: formData.display_name,
      email: formData.email || null,
      tagline: formData.tagline || null,
      photo_url: formData.photo_url || null,
    }).eq('id', editingSpeaker.id);
    if (error) { toast.error('Error al actualizar: ' + error.message); return; }
    toast.success('Ponente actualizado');
    setShowEditDialog(false);
    setEditingSpeaker(null);
    resetForm();
    fetchSpeakers();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar este ponente?')) return;
    const { error } = await supabase.from('speakers').delete().eq('id', id);
    if (error) { toast.error('Error al eliminar'); return; }
    toast.success('Ponente eliminado');
    fetchSpeakers();
  };

  const openEditDialog = (speaker: Speaker) => {
    setEditingSpeaker(speaker);
    setFormData({ 
      display_name: speaker.display_name, 
      email: speaker.email || '',
      tagline: speaker.tagline || '', 
      photo_url: speaker.photo_url || '', 
      user_id: speaker.user_id 
    });
    setShowEditDialog(true);
  };

  const resetForm = () => {
    setFormData({ 
      display_name: '', 
      email: '',
      tagline: '', 
      photo_url: '', 
      user_id: null 
    });
    setSearchQuery('');
    setSearchResults([]);
    setManualMode(false);
  };

  const openAddDialog = () => {
    resetForm();
    setShowAddDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Mic className="h-6 w-6" /> Ponentes
          </h2>
          <p className="text-sm text-muted-foreground mt-1">{speakers.length} ponentes registrados</p>
        </div>
        <Button onClick={openAddDialog}><Plus className="h-4 w-4 mr-1" /> Agregar ponente</Button>
      </div>

      {loading ? (
        <p className="text-muted-foreground">Cargando...</p>
      ) : speakers.length === 0 ? (
        <p className="text-muted-foreground">No hay ponentes aún.</p>
      ) : (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Foto</TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Tagline</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {speakers.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={s.photo_url || ''} />
                    <AvatarFallback>{s.display_name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    {s.display_name}
                    {!s.user_id && (
                      <Badge variant="outline" className="text-[10px] py-0 h-4 bg-muted/30 text-muted-foreground border-border/50 font-normal flex items-center gap-1">
                        <UserMinus className="h-2.5 w-2.5" />
                        Manual
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{s.tagline || '—'}</TableCell>
                <TableCell className="text-right space-x-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={(v) => { if (!v) resetForm(); setShowAddDialog(v); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Agregar Ponente</DialogTitle></DialogHeader>
          
          {!manualMode && !formData.user_id && (
            <div className="space-y-3">
              <Label>Buscar usuario existente</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o username..."
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); searchUsers(e.target.value); }}
                  className="pl-9"
                />
              </div>
              {searching && <p className="text-xs text-muted-foreground">Buscando...</p>}
              {searchResults.length > 0 && (
                <div className="border rounded-md max-h-48 overflow-y-auto">
                  {searchResults.map((p) => (
                    <button key={p.id} onClick={() => selectUser(p)} className="w-full flex items-center gap-3 p-2 hover:bg-muted/50 text-left">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={p.avatar_url || ''} />
                        <AvatarFallback>{(p.name || '?').charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{p.name || 'Sin nombre'}</p>
                        <p className="text-xs text-muted-foreground">@{p.username}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <Button variant="outline" size="sm" onClick={() => setManualMode(true)} className="w-full">
                O crear manualmente sin usuario
              </Button>
            </div>
          )}

          {(manualMode || formData.user_id) && (
            <div className="space-y-3">
              {formData.user_id && (
                <p className="text-xs text-muted-foreground">Datos clonados del perfil. Puedes editarlos.</p>
              )}
              <div>
                <Label>Nombre a mostrar *</Label>
                <Input value={formData.display_name} onChange={(e) => setFormData(p => ({ ...p, display_name: e.target.value }))} />
              </div>
              <div>
                <Label>Email</Label>
                <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="email@ejemplo.com" />
              </div>
              <div>
                <Label>Tagline</Label>
                <Input value={formData.tagline} onChange={(e) => setFormData(p => ({ ...p, tagline: e.target.value }))} />
              </div>
              <div>
                <Label>Foto del ponente</Label>
                <div className="flex items-center gap-4 mt-1">
                  <div className="relative group">
                    <Avatar className="h-20 w-20 border-2 border-border group-hover:border-primary transition-colors">
                      <AvatarImage src={formData.photo_url || ''} className="object-cover" />
                      <AvatarFallback className="text-xl">{formData.display_name.charAt(0) || '?'}</AvatarFallback>
                    </Avatar>
                    <label 
                      htmlFor="admin-photo-upload" 
                      className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity"
                    >
                      <Camera className="h-6 w-6 text-white" />
                      <input 
                        id="admin-photo-upload" 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAdminPhotoUpload}
                        disabled={isUploading}
                      />
                    </label>
                  </div>
                  <div className="flex-1 space-y-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="w-full h-9 gap-2"
                      onClick={() => document.getElementById('admin-photo-upload')?.click()}
                      disabled={isUploading}
                    >
                      {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {isUploading ? 'Subiendo...' : 'Subir foto'}
                    </Button>
                    <p className="text-[10px] text-muted-foreground text-center">
                      Máximo 10MB.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { resetForm(); setShowAddDialog(false); }}>Cancelar</Button>
            <Button onClick={handleAdd} disabled={!formData.display_name.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={showEditDialog} onOpenChange={(v) => { if (!v) { setEditingSpeaker(null); resetForm(); } setShowEditDialog(v); }}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Editar Ponente</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Nombre a mostrar *</Label>
              <Input value={formData.display_name} onChange={(e) => setFormData(p => ({ ...p, display_name: e.target.value }))} />
            </div>
            <div>
              <Label>Email</Label>
              <Input type="email" value={formData.email} onChange={(e) => setFormData(p => ({ ...p, email: e.target.value }))} placeholder="email@ejemplo.com" />
            </div>
            <div>
              <Label>Tagline</Label>
              <Input value={formData.tagline} onChange={(e) => setFormData(p => ({ ...p, tagline: e.target.value }))} />
            </div>
            <div>
              <Label>Foto del ponente</Label>
              <div className="flex items-center gap-4 mt-1">
                <div className="relative group">
                  <Avatar className="h-20 w-20 border-2 border-border group-hover:border-primary transition-colors">
                    <AvatarImage src={formData.photo_url || ''} className="object-cover" />
                    <AvatarFallback className="text-xl">{formData.display_name.charAt(0) || '?'}</AvatarFallback>
                  </Avatar>
                  <label 
                    htmlFor="edit-admin-photo-upload" 
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 cursor-pointer rounded-full transition-opacity"
                  >
                    <Camera className="h-6 w-6 text-white" />
                    <input 
                      id="edit-admin-photo-upload" 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={handleAdminPhotoUpload}
                      disabled={isUploading}
                    />
                  </label>
                </div>
                <div className="flex-1 space-y-1">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="w-full h-9 gap-2"
                    onClick={() => document.getElementById('edit-admin-photo-upload')?.click()}
                    disabled={isUploading}
                  >
                    {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                    {isUploading ? 'Subiendo...' : 'Subir foto'}
                  </Button>
                  <p className="text-[10px] text-muted-foreground text-center">
                    Máximo 10MB.
                  </p>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setEditingSpeaker(null); resetForm(); setShowEditDialog(false); }}>Cancelar</Button>
            <Button onClick={handleEdit} disabled={!formData.display_name.trim()}>Guardar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
