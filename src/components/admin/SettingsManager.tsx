import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Save, Plus, Trash2, Settings, Upload, X } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface Setting {
  id: string;
  key: string;
  value: string;
  description: string | null;
  created_at: string | null;
  updated_at: string | null;
}

export function SettingsManager() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newKey, setNewKey] = useState('');
  const [newValue, setNewValue] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useState<HTMLInputElement | null>(null); // This won't work as expected with useState for ref, using useRef

  const { data: settings, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('general_settings')
        .select('*')
        .order('key');
      if (error) throw error;
      return data as Setting[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, value, description }: { id: string; value: string; description: string }) => {
      const { error } = await supabase
        .from('general_settings')
        .update({ value, description, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['general-settings'] });
      setEditingId(null);
      toast.success('Configuración actualizada');
    },
    onError: () => {
      toast.error('Error al actualizar');
    },
  });

  const createMutation = useMutation({
    mutationFn: async ({ key, value, description }: { key: string; value: string; description: string }) => {
      const { error } = await supabase
        .from('general_settings')
        .insert({ key, value, description });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['general-settings'] });
      setIsAddDialogOpen(false);
      setNewKey('');
      setNewValue('');
      setNewDescription('');
      toast.success('Configuración creada');
    },
    onError: () => {
      toast.error('Error al crear');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('general_settings')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
      queryClient.invalidateQueries({ queryKey: ['general-settings'] });
      toast.success('Configuración eliminada');
    },
    onError: () => {
      toast.error('Error al eliminar');
    },
  });

  const startEditing = (setting: Setting) => {
    setEditingId(setting.id);
    setEditValue(setting.value);
    setEditDescription(setting.description || '');
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue('');
    setEditDescription('');
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, settingId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `badge_${Date.now()}.${fileExt}`;
      const filePath = `badges/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('stack-assets')
        .upload(filePath, file, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('stack-assets')
        .getPublicUrl(filePath);

      // Directly update the setting value
      updateMutation.mutate({ 
        id: settingId, 
        value: publicUrl, 
        description: editDescription || (settings?.find(s => s.id === settingId)?.description || '') 
      });
      
    } catch (err) {
      console.error('Error uploading badge:', err);
      toast.error('Error al subir la imagen');
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto space-y-6 pr-2">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-gray-400" />
          <h2 className="text-xl font-semibold text-[#1C1C1C]">Configuraciones Globales</h2>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button size="sm" className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white">
              <Plus className="h-4 w-4 mr-2" />
              Nueva
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-white">
            <DialogHeader>
              <DialogTitle className="text-[#1C1C1C]">Nueva Configuración</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-4">
              <div>
                <label className="text-sm font-medium text-[#1C1C1C]">Clave</label>
                <Input
                  value={newKey}
                  onChange={(e) => setNewKey(e.target.value)}
                  placeholder="mi_configuracion"
                  className="mt-1 bg-white border-gray-200 text-[#1C1C1C]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1C1C1C]">Valor</label>
                <Textarea
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  placeholder="Valor de la configuración"
                  className="mt-1 bg-white border-gray-200 text-[#1C1C1C] min-h-[80px]"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-[#1C1C1C]">Descripción</label>
                <Input
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Descripción opcional"
                  className="mt-1 bg-white border-gray-200 text-[#1C1C1C]"
                />
              </div>
              <Button
                onClick={() => createMutation.mutate({ key: newKey, value: newValue, description: newDescription })}
                disabled={!newKey.trim() || !newValue.trim() || createMutation.isPending}
                className="w-full bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white"
              >
                {createMutation.isPending ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  'Crear'
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Settings List */}
      <div className="space-y-3">
        {settings?.map((setting) => (
          <div
            key={setting.id}
            className="bg-white border border-gray-200 rounded-lg p-4 transition-shadow hover:shadow-sm"
          >
            {editingId === setting.id ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                    {setting.key}
                  </code>
                </div>
                <Textarea
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="bg-white border-gray-200 text-[#1C1C1C] min-h-[60px]"
                  placeholder="Valor"
                />
                <Input
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="bg-white border-gray-200 text-[#1C1C1C]"
                  placeholder="Descripción"
                />
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={() => updateMutation.mutate({ id: setting.id, value: editValue, description: editDescription })}
                    disabled={updateMutation.isPending}
                    className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white"
                  >
                    {updateMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </>
                    )}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={cancelEditing}
                    className="border-gray-200 text-gray-700"
                  >
                    Cancelar
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono text-gray-700">
                      {setting.key}
                    </code>
                  </div>
                  
                  {(setting.key === 'pioneer_badge_url' || setting.key === 'contributor_badge_url') ? (
                    <div className="flex items-center gap-4">
                      {setting.value ? (
                        <div className="relative group">
                          <img 
                            src={setting.value} 
                            alt={setting.key} 
                            className="h-12 w-12 object-cover rounded-lg border border-gray-200" 
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                            <label className="cursor-pointer">
                              <Upload className="h-4 w-4 text-white" />
                              <input 
                                type="file" 
                                className="hidden" 
                                accept="image/*" 
                                onChange={(e) => handleFileUpload(e, setting.id)}
                                disabled={isUploading}
                              />
                            </label>
                          </div>
                        </div>
                      ) : (
                        <label className="h-12 w-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#3D5AFE] transition-colors cursor-pointer">
                          {isUploading ? (
                            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                          ) : (
                            <Upload className="h-5 w-5 text-gray-400" />
                          )}
                          <input 
                            type="file" 
                            className="hidden" 
                            accept="image/*" 
                            onChange={(e) => handleFileUpload(e, setting.id)}
                            disabled={isUploading}
                          />
                        </label>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-gray-500 text-xs truncate max-w-xs">{setting.value || 'Sin imagen'}</p>
                        {setting.description && (
                          <p className="text-gray-500 text-xs mt-1">{setting.description}</p>
                        )}
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-[#1C1C1C] text-sm break-all">{setting.value}</p>
                      {setting.description && (
                        <p className="text-gray-500 text-xs mt-1">{setting.description}</p>
                      )}
                    </>
                  )}
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => startEditing(setting)}
                    className="text-gray-500 hover:text-[#3D5AFE] hover:bg-gray-50"
                  >
                    Editar
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="bg-white">
                      <AlertDialogHeader>
                        <AlertDialogTitle className="text-[#1C1C1C]">¿Eliminar configuración?</AlertDialogTitle>
                        <AlertDialogDescription>
                          Esta acción eliminará permanentemente <strong>{setting.key}</strong>.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="border-gray-200">Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => deleteMutation.mutate(setting.id)}
                          className="bg-red-500 hover:bg-red-600 text-white"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            )}
          </div>
        ))}

        {settings?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No hay configuraciones. Crea una nueva.
          </div>
        )}
      </div>
    </div>
  );
}
