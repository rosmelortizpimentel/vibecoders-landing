import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  ArrowUp, 
  ArrowDown,
  Loader2
} from 'lucide-react';
import { ShowcaseForm, ShowcaseFormData } from './ShowcaseForm';
import { toast } from 'sonner';
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

interface Showcase {
  id: string;
  project_title: string;
  project_tagline: string;
  project_url: string;
  project_thumbnail: string;
  author_name: string;
  author_avatar: string | null;
  author_linkedin: string | null;
  author_twitter: string | null;
  author_website: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
}

export function ShowcaseManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState<Showcase | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Fetch all showcases (including inactive for admin)
  const { data: showcases, isLoading } = useQuery({
    queryKey: ['admin-showcases'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('showcase_gallery')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Showcase[];
    },
  });

  // Create showcase mutation
  const createMutation = useMutation({
    mutationFn: async (data: ShowcaseFormData) => {
      const { error } = await supabase.from('showcase_gallery').insert({
        project_title: data.project_title,
        project_tagline: data.project_tagline,
        project_url: data.project_url,
        project_thumbnail: data.project_thumbnail,
        author_name: data.author_name,
        author_avatar: data.author_avatar,
        author_linkedin: data.author_linkedin,
        author_twitter: data.author_twitter,
        author_website: data.author_website,
        display_order: data.display_order,
        is_active: data.is_active,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-showcases'] });
      setShowForm(false);
      toast.success('Showcase creado exitosamente');
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast.error('Error al crear el showcase');
    },
  });

  // Update showcase mutation
  const updateMutation = useMutation({
    mutationFn: async (data: ShowcaseFormData) => {
      if (!data.id) throw new Error('Missing showcase ID');
      const { error } = await supabase
        .from('showcase_gallery')
        .update({
          project_title: data.project_title,
          project_tagline: data.project_tagline,
          project_url: data.project_url,
          project_thumbnail: data.project_thumbnail,
          author_name: data.author_name,
          author_avatar: data.author_avatar,
          author_linkedin: data.author_linkedin,
          author_twitter: data.author_twitter,
          author_website: data.author_website,
          display_order: data.display_order,
          is_active: data.is_active,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-showcases'] });
      setEditingShowcase(null);
      toast.success('Showcase actualizado exitosamente');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Error al actualizar el showcase');
    },
  });

  // Delete showcase mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('showcase_gallery').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-showcases'] });
      setDeletingId(null);
      toast.success('Showcase eliminado');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Error al eliminar el showcase');
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('showcase_gallery')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-showcases'] });
    },
  });

  // Update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ id, display_order }: { id: string; display_order: number }) => {
      const { error } = await supabase
        .from('showcase_gallery')
        .update({ display_order })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-showcases'] });
    },
  });

  const handleMoveUp = (index: number) => {
    if (!showcases || index === 0) return;
    const current = showcases[index];
    const previous = showcases[index - 1];
    
    updateOrderMutation.mutate({ id: current.id, display_order: previous.display_order ?? index - 1 });
    updateOrderMutation.mutate({ id: previous.id, display_order: current.display_order ?? index });
  };

  const handleMoveDown = (index: number) => {
    if (!showcases || index === showcases.length - 1) return;
    const current = showcases[index];
    const next = showcases[index + 1];
    
    updateOrderMutation.mutate({ id: current.id, display_order: next.display_order ?? index + 1 });
    updateOrderMutation.mutate({ id: next.id, display_order: current.display_order ?? index });
  };

  const handleEdit = (showcase: Showcase) => {
    setEditingShowcase(showcase);
  };

  const handleFormSubmit = async (data: ShowcaseFormData) => {
    if (editingShowcase) {
      await updateMutation.mutateAsync({ ...data, id: editingShowcase.id });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1c1c1c]">Gestión de Showcases</h1>
          <p className="text-sm text-gray-500 mt-1">
            Administra los proyectos destacados de la comunidad
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90">
          <Plus className="h-4 w-4 mr-2" />
          Nuevo Showcase
        </Button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-4">
                <Skeleton className="h-16 w-24 rounded-lg" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-48" />
                  <Skeleton className="h-3 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : showcases?.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-500">No hay showcases aún. ¡Crea el primero!</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {showcases?.map((showcase, index) => (
              <div 
                key={showcase.id} 
                className={`flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                  !showcase.is_active ? 'opacity-60' : ''
                }`}
              >
                {/* Order controls */}
                <div className="flex flex-col gap-1">
                  <button 
                    onClick={() => handleMoveUp(index)}
                    disabled={index === 0}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <ArrowUp className="h-4 w-4 text-gray-500" />
                  </button>
                  <button 
                    onClick={() => handleMoveDown(index)}
                    disabled={index === showcases.length - 1}
                    className="p-1 hover:bg-gray-200 rounded disabled:opacity-30"
                  >
                    <ArrowDown className="h-4 w-4 text-gray-500" />
                  </button>
                </div>

                {/* Thumbnail */}
                <img 
                  src={showcase.project_thumbnail} 
                  alt={showcase.project_title}
                  className="h-16 w-24 object-cover rounded-lg border border-gray-200"
                />

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-[#1c1c1c] truncate">{showcase.project_title}</h3>
                  <p className="text-sm text-gray-500 truncate">{showcase.project_tagline}</p>
                  <p className="text-xs text-gray-400 mt-1">Por {showcase.author_name}</p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3">
                  <Switch
                    checked={showcase.is_active ?? true}
                    onCheckedChange={(checked) => 
                      toggleActiveMutation.mutate({ id: showcase.id, is_active: checked })
                    }
                  />
                  
                  <a
                    href={showcase.project_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <ExternalLink className="h-4 w-4 text-gray-500" />
                  </a>

                  <button
                    onClick={() => handleEdit(showcase)}
                    className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
                  >
                    <Pencil className="h-4 w-4 text-gray-500" />
                  </button>

                  <button
                    onClick={() => setDeletingId(showcase.id)}
                    className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                  >
                    <Trash2 className="h-4 w-4 text-red-500" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showForm || editingShowcase) && (
        <ShowcaseForm
          initialData={editingShowcase ? {
            id: editingShowcase.id,
            project_title: editingShowcase.project_title,
            project_tagline: editingShowcase.project_tagline,
            project_url: editingShowcase.project_url,
            project_thumbnail: editingShowcase.project_thumbnail,
            author_name: editingShowcase.author_name,
            author_avatar: editingShowcase.author_avatar,
            author_linkedin: editingShowcase.author_linkedin,
            author_twitter: editingShowcase.author_twitter,
            author_website: editingShowcase.author_website,
            display_order: editingShowcase.display_order ?? 0,
            is_active: editingShowcase.is_active ?? true,
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingShowcase(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este showcase?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El showcase será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingId && deleteMutation.mutate(deletingId)}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                'Eliminar'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
