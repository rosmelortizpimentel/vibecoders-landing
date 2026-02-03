import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ExternalLink, 
  GripVertical,
  Loader2,
  Star
} from 'lucide-react';
import { StackForm, StackFormData } from './StackForm';
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

interface Tool {
  id: string;
  name: string;
  tagline: string;
  logo_url: string | null;
  website_url: string;
  category: string;
  pricing_model: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  created_at: string;
}

// Sortable Row Component
function SortableToolRow({ 
  tool, 
  onEdit, 
  onDelete, 
  onToggleActive,
  onToggleFeatured
}: { 
  tool: Tool; 
  onEdit: (t: Tool) => void;
  onDelete: (id: string) => void;
  onToggleActive: (id: string, active: boolean) => void;
  onToggleFeatured: (id: string, featured: boolean) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: tool.id });

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
        !tool.is_active ? 'opacity-60' : ''
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

      {/* Logo */}
      {tool.logo_url ? (
        <img 
          src={tool.logo_url} 
          alt={tool.name}
          className="h-10 w-10 object-cover rounded-lg border border-gray-200 flex-shrink-0"
        />
      ) : (
        <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0">
          <ExternalLink className="h-4 w-4 text-gray-400" />
        </div>
      )}

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <h3 className="font-medium text-sm text-[#1c1c1c] truncate">{tool.name}</h3>
          {tool.is_featured && (
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 flex-shrink-0" />
          )}
        </div>
        <p className="text-xs text-gray-500 truncate">{tool.tagline}</p>
      </div>

      {/* Category Badge */}
      <Badge variant="outline" className="text-xs flex-shrink-0">
        {tool.category}
      </Badge>

      {/* Actions */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={() => onToggleFeatured(tool.id, !tool.is_featured)}
          className={`p-1.5 rounded transition-colors ${
            tool.is_featured 
              ? 'bg-amber-100 hover:bg-amber-200' 
              : 'hover:bg-gray-200'
          }`}
          title={tool.is_featured ? 'Quitar destacado' : 'Destacar'}
        >
          <Star className={`h-4 w-4 ${tool.is_featured ? 'text-amber-500 fill-amber-500' : 'text-gray-400'}`} />
        </button>

        <Switch
          checked={tool.is_active}
          onCheckedChange={(checked) => onToggleActive(tool.id, checked)}
        />
        
        <a
          href={tool.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        >
          <ExternalLink className="h-4 w-4 text-gray-500" />
        </a>

        <button
          onClick={() => onEdit(tool)}
          className="p-1.5 hover:bg-gray-200 rounded transition-colors"
        >
          <Pencil className="h-4 w-4 text-gray-500" />
        </button>

        <button
          onClick={() => onDelete(tool.id)}
          className="p-1.5 hover:bg-red-100 rounded transition-colors"
        >
          <Trash2 className="h-4 w-4 text-red-500" />
        </button>
      </div>
    </div>
  );
}

export function StackManager() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);
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

  // Fetch all tools (including inactive for admin)
  const { data: tools, isLoading } = useQuery({
    queryKey: ['admin-tools'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tools_library')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;
      return data as Tool[];
    },
  });

  // Create tool mutation
  const createMutation = useMutation({
    mutationFn: async (data: StackFormData) => {
      const { error } = await supabase.from('tools_library').insert({
        name: data.name,
        tagline: data.tagline,
        website_url: data.website_url,
        logo_url: data.logo_url,
        category: data.category,
        pricing_model: data.pricing_model,
        is_featured: data.is_featured,
        is_active: data.is_active,
        display_order: data.display_order,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools-stack'] });
      setShowForm(false);
      toast.success('Herramienta creada exitosamente');
    },
    onError: (error) => {
      console.error('Create error:', error);
      toast.error('Error al crear la herramienta');
    },
  });

  // Update tool mutation
  const updateMutation = useMutation({
    mutationFn: async (data: StackFormData) => {
      if (!data.id) throw new Error('Missing tool ID');
      const { error } = await supabase
        .from('tools_library')
        .update({
          name: data.name,
          tagline: data.tagline,
          website_url: data.website_url,
          logo_url: data.logo_url,
          category: data.category,
          pricing_model: data.pricing_model,
          is_featured: data.is_featured,
          is_active: data.is_active,
          display_order: data.display_order,
        })
        .eq('id', data.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools-stack'] });
      setEditingTool(null);
      toast.success('Herramienta actualizada exitosamente');
    },
    onError: (error) => {
      console.error('Update error:', error);
      toast.error('Error al actualizar la herramienta');
    },
  });

  // Delete tool mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('tools_library').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools-stack'] });
      setDeletingId(null);
      toast.success('Herramienta eliminada');
    },
    onError: (error) => {
      console.error('Delete error:', error);
      toast.error('Error al eliminar la herramienta');
    },
  });

  // Toggle active status
  const toggleActiveMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('tools_library')
        .update({ is_active })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools-stack'] });
    },
  });

  // Toggle featured status
  const toggleFeaturedMutation = useMutation({
    mutationFn: async ({ id, is_featured }: { id: string; is_featured: boolean }) => {
      const { error } = await supabase
        .from('tools_library')
        .update({ is_featured })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools-stack'] });
    },
  });

  // Batch update order mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (updates: { id: string; display_order: number }[]) => {
      const promises = updates.map(({ id, display_order }) =>
        supabase
          .from('tools_library')
          .update({ display_order })
          .eq('id', id)
      );
      const results = await Promise.all(promises);
      const errorResult = results.find(r => r.error);
      if (errorResult?.error) throw errorResult.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-tools'] });
      queryClient.invalidateQueries({ queryKey: ['tools-stack'] });
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id && tools) {
      const oldIndex = tools.findIndex((t) => t.id === active.id);
      const newIndex = tools.findIndex((t) => t.id === over.id);
      
      const reordered = arrayMove(tools, oldIndex, newIndex);
      
      // Optimistic update
      queryClient.setQueryData(['admin-tools'], reordered);
      
      // Persist to database
      const updates = reordered.map((item, index) => ({
        id: item.id,
        display_order: index,
      }));
      updateOrderMutation.mutate(updates);
    }
  };

  const handleEdit = (tool: Tool) => {
    setEditingTool(tool);
  };

  const handleFormSubmit = async (data: StackFormData) => {
    if (editingTool) {
      await updateMutation.mutateAsync({ ...data, id: editingTool.id });
    } else {
      await createMutation.mutateAsync(data);
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-[#1c1c1c]">Gestión del Stack</h1>
          <p className="text-sm text-gray-500">
            Administra las herramientas recomendadas
          </p>
        </div>
        <Button onClick={() => setShowForm(true)} size="sm" className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90">
          <Plus className="h-4 w-4 mr-1" />
          Nueva Herramienta
        </Button>
      </div>

      {/* List */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        {isLoading ? (
          <div className="p-4 space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-lg" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-48" />
                </div>
              </div>
            ))}
          </div>
        ) : tools?.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 text-sm">No hay herramientas aún. ¡Crea la primera!</p>
          </div>
        ) : (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={tools?.map(t => t.id) || []}
              strategy={verticalListSortingStrategy}
            >
              <div>
                {tools?.map((tool) => (
                  <SortableToolRow
                    key={tool.id}
                    tool={tool}
                    onEdit={handleEdit}
                    onDelete={setDeletingId}
                    onToggleActive={(id, active) => 
                      toggleActiveMutation.mutate({ id, is_active: active })
                    }
                    onToggleFeatured={(id, featured) => 
                      toggleFeaturedMutation.mutate({ id, is_featured: featured })
                    }
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {(showForm || editingTool) && (
        <StackForm
          initialData={editingTool ? {
            id: editingTool.id,
            name: editingTool.name,
            tagline: editingTool.tagline,
            website_url: editingTool.website_url,
            logo_url: editingTool.logo_url,
            category: editingTool.category,
            pricing_model: editingTool.pricing_model,
            is_featured: editingTool.is_featured,
            is_active: editingTool.is_active,
            display_order: editingTool.display_order,
          } : undefined}
          onSubmit={handleFormSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditingTool(null);
          }}
          isLoading={createMutation.isPending || updateMutation.isPending}
        />
      )}

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={!!deletingId} onOpenChange={() => setDeletingId(null)}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar esta herramienta?</AlertDialogTitle>
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
