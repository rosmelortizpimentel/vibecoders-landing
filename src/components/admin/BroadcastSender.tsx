import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Search, Send, Loader2, Users, Bell, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { toast } from 'sonner';
import { useAuth } from '@/hooks/useAuth';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
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

interface UserProfile {
  id: string;
  name: string | null;
  username: string | null;
  email: string | null;
  avatar_url: string | null;
}

interface Broadcast {
  id: string;
  title: string;
  subtitle: string | null;
  image_url: string | null;
  button_text: string | null;
  button_link: string | null;
  status: 'draft' | 'sent';
}

interface BroadcastSenderProps {
  editDraft?: Broadcast | null;
  onClearDraft?: () => void;
}

export function BroadcastSender({ editDraft, onClearDraft }: BroadcastSenderProps) {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());

  // Form State
  const [broadcastId, setBroadcastId] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const [buttonText, setButtonText] = useState('');
  const [buttonLink, setButtonLink] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [status, setStatus] = useState<'draft' | 'sent'>('draft');
  const [isPopup, setIsPopup] = useState(false);
  const [autoShow, setAutoShow] = useState(false);
  const [showConfirmSend, setShowConfirmSend] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  // Effect to load draft
  useEffect(() => {
    if (editDraft) {
      setBroadcastId(editDraft.id);
      setTitle(editDraft.title || '');
      setSubtitle(editDraft.subtitle || '');
      setImageUrl(editDraft.image_url || '');
      setButtonText(editDraft.button_text || '');
      setButtonLink(editDraft.button_link || '');
      setStatus(editDraft.status);
      setIsPopup((editDraft as any).is_popup || false);
      setAutoShow((editDraft as any).auto_show || false);
    }
  }, [editDraft]);

  // Effect to handle preview URL generation for private bucket
  useEffect(() => {
    const updatePreview = async () => {
      if (!imageUrl) {
        setPreviewUrl('');
        return;
      }

      // If it's already a full HTTP URL (external), use it directly
      if (imageUrl.startsWith('http')) {
        setPreviewUrl(imageUrl);
        return;
      }

      // If it's a storage path (internal to broadcasts bucket)
      try {
        const { data, error } = await supabase.storage
          .from('broadcasts')
          .createSignedUrl(imageUrl, 3600); // 1 hour

        if (error) throw error;
        setPreviewUrl(data.signedUrl);
      } catch (err) {
        console.error('Error creating signed URL:', err);
        setPreviewUrl('');
      }
    };

    updatePreview();
  }, [imageUrl]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const timestamp = Date.now();
      const fileExt = file.name.split('.').pop();
      const fileName = `broadcast_${timestamp}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('broadcasts')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      setImageUrl(filePath); // Store the relative path in the DB
      toast.success('Imagen subida correctamente');
    } catch (err) {
      console.error('Error uploading image:', err);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('admin-users-list', {
        headers: {
          Authorization: `Bearer ${session.access_token}`,
        },
      });

      if (response.error) throw response.error;
      setUsers(response.data?.users || []);
    } catch (err) {
      console.error('Error fetching users:', err);
      toast.error('Error al cargar usuarios');
    } finally {
      setIsLoadingUsers(false);
    }
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery.trim()) return users;
    const q = searchQuery.toLowerCase();
    return users.filter(u => 
      u.name?.toLowerCase().includes(q) || 
      u.username?.toLowerCase().includes(q) || 
      u.email?.toLowerCase().includes(q)
    );
  }, [users, searchQuery]);

  const toggleUser = (userId: string) => {
    const newSelected = new Set(selectedUserIds);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUserIds(newSelected);
  };

  const selectAll = () => {
    if (selectedUserIds.size === filteredUsers.length) {
      setSelectedUserIds(new Set());
    } else {
      setSelectedUserIds(new Set(filteredUsers.map(u => u.id)));
    }
  };

  const handleSave = async (isDraft: boolean = true) => {
    if (!title.trim()) {
      toast.error('El título es obligatorio');
      return;
    }

    if (!isDraft && selectedUserIds.size === 0) {
      toast.error('Selecciona al menos un usuario para enviar');
      return;
    }

    if (!isDraft && !showConfirmSend) {
      setShowConfirmSend(true);
      return;
    }

    try {
      setIsSending(true);

      const broadcastData = {
        title,
        subtitle: subtitle || null,
        image_url: imageUrl || null,
        button_text: buttonText || null,
        button_link: buttonLink || null,
        created_by: currentUser?.id,
        sent_count: isDraft ? 0 : selectedUserIds.size,
        status: isDraft ? 'draft' : 'sent',
        is_popup: isPopup,
        auto_show: autoShow,
        updated_at: new Date().toISOString()
      };

      let currentBroadcastId = broadcastId;

      if (currentBroadcastId) {
        // Update existing draft/broadcast
        const { error: updateError } = await (supabase
          .from('system_broadcasts' as any) as any)
          .update(broadcastData)
          .eq('id', currentBroadcastId);

        if (updateError) throw updateError;
      } else {
        // Create new broadcast record
        const { data: broadcast, error: broadcastError } = await (supabase
          .from('system_broadcasts' as any) as any)
          .insert(broadcastData)
          .select()
          .single();

        if (broadcastError) throw broadcastError;
        currentBroadcastId = broadcast.id;
        setBroadcastId(currentBroadcastId);
      }

      // 2. If sending, insert notifications
      if (!isDraft) {
        const notificationsToInsert = Array.from(selectedUserIds).map(recipientId => ({
          recipient_id: recipientId,
          type: 'system',
          broadcast_id: currentBroadcastId,
          meta: {
            title,
            subtitle: subtitle || null,
            image_url: imageUrl || null,
            button_text: buttonText || null,
            button_link: buttonLink || null,
            is_popup: isPopup,
            auto_show: autoShow
          }
        }));

        const { error: notifyError } = await (supabase
          .from('notifications' as any) as any)
          .insert(notificationsToInsert as any);

        if (notifyError) throw notifyError;
        
        toast.success('Notificaciones enviadas correctamente');
        // Reset form after sending
        resetForm();
      } else {
        toast.success('Borrador guardado');
      }
      setShowConfirmSend(false);
    } catch (err) {
      console.error('Error saving/sending broadcast:', err);
      toast.error(isDraft ? 'Error al guardar borrador' : 'Error al enviar notificaciones');
    } finally {
      setIsSending(false);
    }
  };

  const resetForm = () => {
    setBroadcastId(null);
    setTitle('');
    setSubtitle('');
    setImageUrl('');
    setButtonText('');
    setButtonLink('');
    setSelectedUserIds(new Set());
    setStatus('draft');
    setIsPopup(false);
    setAutoShow(false);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Configuration Form */}
      <div className="space-y-6">
        <Card className="border-border/50 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Bell className="w-5 h-5 text-primary" />
              Detalles de la Notificación
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Título <span className="text-destructive">*</span></Label>
              <Input 
                id="title" 
                placeholder="Ej: ¡Nueva actualización disponible!" 
                value={title}
                onChange={e => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="subtitle">Subtítulo / Mensaje (Opcional)</Label>
              <Textarea 
                id="subtitle" 
                placeholder="Describe brevemente de qué trata la notificación..."
                value={subtitle}
                onChange={e => setSubtitle(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="image">Imagen de la Notificación (Privada) <span className="text-muted-foreground text-[10px]">(Máx 2MB)</span></Label>
              <div className="flex gap-2">
                <Input 
                  id="image" 
                  placeholder="Pega una URL o sube una imagen..." 
                  value={imageUrl}
                  onChange={e => setImageUrl(e.target.value)}
                  className="flex-1"
                />
                <input
                  type="file"
                  id="file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleFileUpload}
                  disabled={isUploading}
                />
                <Button 
                  type="button"
                  variant="outline" 
                  className="px-3 shrink-0"
                  onClick={() => document.getElementById('file-upload')?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <ImageIcon className="w-4 h-4 text-primary" />
                  )}
                </Button>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="space-y-2">
                <Label htmlFor="btn-text">Texto del Botón</Label>
                <Input 
                  id="btn-text" 
                  placeholder="Ej: Ver más" 
                  value={buttonText}
                  onChange={e => setButtonText(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="btn-link">Link del Botón</Label>
                <div className="flex gap-2">
                  <Input 
                    id="btn-link" 
                    placeholder="/home" 
                    value={buttonLink}
                    onChange={e => setButtonLink(e.target.value)}
                  />
                  <div className="flex-shrink-0 flex items-center justify-center border rounded px-3 bg-muted">
                    <LinkIcon className="w-4 h-4 text-muted-foreground" />
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-6 pt-2">
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="is-popup" 
                  checked={isPopup}
                  onCheckedChange={(checked) => setIsPopup(!!checked)}
                />
                <Label htmlFor="is-popup" className="text-sm font-medium cursor-pointer">
                  Es Popup
                </Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="auto-show" 
                  checked={autoShow}
                  onCheckedChange={(checked) => setAutoShow(!!checked)}
                  disabled={!isPopup}
                />
                <Label 
                  htmlFor="auto-show" 
                  className={`text-sm font-medium cursor-pointer ${!isPopup ? 'text-muted-foreground' : ''}`}
                >
                  Mostrar Automáticamente
                </Label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Preview Card */}
        <Card className="border-border/50 bg-muted/30">
          <CardHeader className="py-3 px-4">
            <CardTitle className="text-xs uppercase text-muted-foreground">Vista Previa</CardTitle>
          </CardHeader>
          <CardContent className="pb-4 px-4">
              <div className="bg-background border-2 border-primary/5 rounded-2xl shadow-xl max-w-sm mx-auto overflow-hidden flex flex-col">
                <div className="pt-6 pb-2 px-4 flex flex-col items-center text-center">
                  <Avatar className="w-14 h-14 border-4 border-white shadow-md ring-2 ring-primary/5 mb-3">
                    <AvatarImage src={vibecodersLogo} alt="VibeCoders" />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">VC</AvatarFallback>
                  </Avatar>
                  <p className="text-lg font-bold text-slate-900 leading-tight mb-2">
                    {title || 'Título de ejemplo'}
                  </p>
                  <p className="text-sm text-muted-foreground leading-relaxed px-2">
                    {subtitle || 'Aquí se verá el mensaje de tu notificación...'}
                  </p>
                </div>
                
                {previewUrl && (
                  <div className="px-5 py-2">
                    <div className="rounded-xl overflow-hidden border border-border/50 bg-muted/30 aspect-video flex items-center justify-center">
                      <img src={previewUrl} alt="preview" className="w-full h-full object-contain" />
                    </div>
                  </div>
                )}
                
                <div className="p-5 mt-auto flex gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="flex-1 text-slate-500 text-xs h-9"
                    disabled
                  >
                    Cerrar
                  </Button>
                  {buttonText && (
                    <Button 
                      size="sm" 
                      className="flex-[2] bg-primary hover:bg-primary/90 text-white font-bold h-9 text-xs shadow-md shadow-primary/10 transition-all"
                      onClick={() => {
                        if (buttonLink) {
                          window.open(buttonLink.startsWith('http') ? buttonLink : `https://${buttonLink}`, '_blank');
                        }
                      }}
                    >
                      {buttonText}
                    </Button>
                  )}
                </div>
              </div>
          </CardContent>
        </Card>
      </div>

      {/* User Selection */}
      <Card className="border-border/50 shadow-sm flex flex-col h-[600px]">
        {/* ... existing header ... */}
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-primary" />
            Destinatarios
            <Badge variant="secondary" className="ml-2">
              {selectedUserIds.size}
            </Badge>
          </CardTitle>
        <CardContent className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* ... existing search ... */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar usuarios por nombre, username o email..." 
              className="pl-9"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex-1 overflow-y-auto border rounded-md divide-y divide-border/50 scrollbar-thin">
            {/* Header select all - only show if there are users */}
            {filteredUsers.length > 0 && (
              <div 
                className="flex items-center gap-3 p-3 bg-muted/40 sticky top-0 z-10 border-b border-border/50 hover:bg-muted/60 transition-colors cursor-pointer"
                onClick={(e) => {
                  e.preventDefault();
                  selectAll();
                }}
              >
                <Checkbox 
                  id="select-all-checkbox"
                  checked={filteredUsers.every(u => selectedUserIds.has(u.id))}
                  onCheckedChange={() => selectAll()}
                />
                <Label 
                  htmlFor="select-all-checkbox" 
                  className="text-sm font-bold cursor-pointer flex-1"
                >
                  Seleccionar todos los visibles ({filteredUsers.length})
                </Label>
              </div>
            )}

            {isLoadingUsers ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <Loader2 className="w-6 h-6 animate-spin" />
                <p className="text-sm italic">Cargando vibradores...</p>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center gap-2 text-muted-foreground">
                <p className="text-sm italic">No se encontraron usuarios</p>
              </div>
            ) : (
              filteredUsers.map(u => (
                <div 
                  key={u.id} 
                  className={`flex items-center gap-3 p-3 hover:bg-muted/30 cursor-pointer transition-colors ${selectedUserIds.has(u.id) ? 'bg-primary/5' : ''}`}
                  onClick={() => toggleUser(u.id)}
                >
                  <Checkbox 
                    checked={selectedUserIds.has(u.id)} 
                    onCheckedChange={() => toggleUser(u.id)}
                    onClick={e => e.stopPropagation()}
                  />
                  <Avatar className="w-8 h-8 border border-border">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback className="text-[10px]">{u.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{u.name || 'Sin nombre'}</p>
                    <p className="text-xs text-muted-foreground truncate">@{u.username || 'anon'}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
        <CardFooter className="pt-4 border-t border-border/50 gap-2">
          <Button 
            variant="outline"
            className="flex-1 h-12"
            onClick={() => handleSave(true)}
            disabled={isSending || !title}
          >
            {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
            Guardar Borrador
          </Button>
          <Button 
            className="flex-[2] h-12 gap-2 shadow-lg hover:shadow-primary/20 transition-all font-bold"
            size="lg"
            onClick={() => handleSave(false)}
            disabled={isSending || selectedUserIds.size === 0}
          >
            {isSending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            Enviar Notificación Now
          </Button>
        </CardFooter>
      </Card>

      <AlertDialog open={showConfirmSend} onOpenChange={setShowConfirmSend}>
        <AlertDialogContent className="bg-white border-2 border-primary/10 rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold flex items-center gap-2">
              <Users className="w-6 h-6 text-primary" />
              Confirmar Envío
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-600 text-base py-4 leading-relaxed">
              Estás a punto de enviar una notificación a <span className="font-bold text-primary text-lg px-1">{selectedUserIds.size}</span> usuarios. 
              <br/><br/>
              ¿Estás seguro de que quieres proceder? Esta acción enviará el mensaje inmediatamente y no se puede deshacer de forma individual fácilmente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 pt-2">
            <AlertDialogCancel className="h-12 border-slate-200 text-slate-500 hover:text-slate-700 font-medium">
              Revisar de nuevo
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => handleSave(false)}
              className="h-12 bg-primary hover:bg-primary/90 text-white font-bold shadow-lg shadow-primary/20 transition-all font-bold px-8"
              disabled={isSending}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
              ) : (
                <Send className="w-5 h-5 mr-2" />
              )}
              Sí, enviar ahora
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
