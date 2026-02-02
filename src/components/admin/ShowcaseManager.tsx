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
  GripVertical,
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
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface Showcase {
  id: string;
  project_title: string;
  project_tagline: string;
  project_url: string;
  project_thumbnail: string;
  project_logo_url: string | null;
  author_name: string;
  author_avatar: string | null;
  author_linkedin: string | null;
  author_twitter: string | null;
  author_website: string | null;
  display_order: number | null;
  is_active: boolean | null;
  created_at: string;
}

// Sortable Row Component
function SortableShowcaseRow({ 
  showcase, 
  onEdit, 
  onDelete, 
  onToggleActive 
}: { 
  showcase: Showcase; 
  onEdit: (s: Showcase) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: showcase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div 
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-3 p-3 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-b-0 ${
        !showcase.is_active ? 'opacity-60' : ''
      }`}
    >
      {/* Drag handle */}
      <button 
        {...attributes} 
        {...listeners}
        className="p-1 cursor-grab active:cursor-grabbing hover:bg-gray-200 rounded touch-none"
      >
        <GripVertical className="h-4 w-4 text-gray-400" />
      </button>

      {/* Thumbnail */}
      <img 
        src={showcase.project_thumbnail} 
        alt={showcase.project_title}
        className="h-12 w-20 object-cover rounded border border-gray-200 flex-shrink-0"
      />

      {/* Info */}
      <div className="flex-1 min-w-0">
        <h3 className="font-medium text-sm text-[#1c1c1c] truncate">{showcase.project_title}</h3>
        <p className="text-xs text-gray-500 truncate">{showcase.project_tagline}</p>
        <p className="text-xs text-gray-400">Por {showcase.author_name}</p>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <Switch
          checked={showcase.is_active ?? true}
          onCheckedChange={(checked) => onToggleActive(showcase.id, checked)}
        />
        
        <a
          href={showcase.project_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        >
          <ExternalLink className="h-4 w-4 text-gray-500" />
        </a>

        <button
          onClick={() => onEdit(showcase)}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </button>

        <button
          onClick={() => onDelete(showcase.id)}
          className="p-1.5 hover:bg-red-100 rounded transition-colors"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export function ShowcaseManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingShowcase, setEditingShowcase] = useState<Showcase | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

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
        project_logo_url: data.project_logo_url,
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
          project_logo_url: data.project_logo_url,
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

  // Batch update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      const promises = updates.map(({ id, display_order }) =>
        supabase
          .from('showcase_gallery')
          .update({ display_order })
          .eq('id', id)
      );
      const results = await Promise.all(promises);
      const errorResult = results.find(r => r.error);
      if (errorResult?.error) throw errorResult.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-showcases'] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && showcases) {
      const oldIndex = showcases.findIndex((s) => s.id === active.id);
      const newIndex = showcases.findIndex((s) => s.id === over.id);
      
      const reordered = arrayMove(showcases, oldIndex, newIndex);
      
      // Optimistic update
      queryClient.setQueryData(['admin-showcases'], reordered);
      
      // Persist to database
      const updates = reordered.map((item, index) => ({
        id: item.id,
        display_order: index,
      }));
      updateOrderMutation.mutate(updates);
    }
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
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1c1c1c]">Gestión de Showcases</h1>
          <p className="text-sm text-gray-500">
            Administra los proyectos destacados de la comunidad
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90">
          <Plus className="h-4 w-4 mr-1" />
          Nuevo Showcase
        </Button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-12 w-20 rounded" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="h-3 w-28" />
                </div>
              </div>
            ))}
          </div>
        ) : showcases?.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">No hay showcases aún. ¡Crea el primero!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={showcases?.map(s => s.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {showcases?.map((showcase) => (
                  <SortableShowcaseRow
                    key={showcase.id}
                    showcase={showcase}
                    onEdit={handleEdit}
                    onDelete={setDeletingId}
                    onToggleActive={(id, active) => 
                      toggleActiveMutation.mutate({ id, is_active: active })
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
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
            project_logo_url: editingShowcase.project_logo_url,
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
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este showcase?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer.
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