import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/hooks/useTranslation';
import { useState, useCallback } from 'react';
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
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface MenuItem {
  id: string;
  key: string;
  label_key: string;
  path: string;
  icon: string;
  section: string;
  display_order: number;
  is_active: boolean;
  requires_waitlist: boolean;
  css_class: string | null;
  badge_text: string | null;
}

function resolveTranslatedLabel(labelKey: string, tCommon: (key: string) => string, tNotif: (key: string) => string): string {
  const parts = labelKey.split('.');
  if (parts.length !== 2) return labelKey;
  const [ns, key] = parts;
  if (ns === 'notifications') {
    return tNotif(key) || labelKey;
  }
  // For common namespace keys like "navigation.home"
  return tCommon(labelKey) || labelKey;
}

function SortableRow({
  item,
  translatedName,
  onToggle,
  isPending,
}: {
  item: MenuItem;
  translatedName: string;
  onToggle: (id: string, is_active: boolean) => void;
  isPending: boolean;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-8">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-1 text-muted-foreground hover:text-foreground"
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell className="font-medium">
        <div>
          <span>{translatedName}</span>
          <span className="block text-xs text-muted-foreground">{item.label_key}</span>
        </div>
      </TableCell>
      <TableCell className="text-muted-foreground font-mono text-xs">{item.path}</TableCell>
      <TableCell>
        <Badge variant="outline" className="text-xs capitalize">
          {item.section}
        </Badge>
      </TableCell>
      <TableCell className="text-muted-foreground text-xs">{item.icon}</TableCell>
      <TableCell className="text-center">
        <Switch
          checked={item.is_active}
          onCheckedChange={(checked) => onToggle(item.id, checked)}
          disabled={isPending}
        />
      </TableCell>
    </TableRow>
  );
}

export function MenuManager() {
  const queryClient = useQueryClient();
  const { t: tCommon } = useTranslation('common');
  const { t: tNotif } = useTranslation('notifications');

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sidebar_menu_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data as MenuItem[];
    },
  });

  const toggleMutation = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from('sidebar_menu_items')
        .update({ is_active, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-menu-items'] });
      toast.success('Menú actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });

  const reorderMutation = useMutation({
    mutationFn: async (orderedItems: { id: string; display_order: number }[]) => {
      // Update each item's display_order
      const promises = orderedItems.map(({ id, display_order }) =>
        supabase
          .from('sidebar_menu_items')
          .update({ display_order, updated_at: new Date().toISOString() })
          .eq('id', id)
      );
      const results = await Promise.all(promises);
      const failed = results.find((r) => r.error);
      if (failed?.error) throw failed.error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-menu-items'] });
      queryClient.invalidateQueries({ queryKey: ['sidebar-menu-items'] });
      toast.success('Orden actualizado');
    },
    onError: () => toast.error('Error al reordenar'),
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor)
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((i) => i.id === active.id);
      const newIndex = items.findIndex((i) => i.id === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      const reordered = arrayMove(items, oldIndex, newIndex);
      const updates = reordered.map((item, idx) => ({
        id: item.id,
        display_order: idx + 1,
      }));

      // Optimistic update via cache
      queryClient.setQueryData(['admin-menu-items'], reordered.map((item, idx) => ({
        ...item,
        display_order: idx + 1,
      })));

      reorderMutation.mutate(updates);
    },
    [items, queryClient, reorderMutation]
  );

  const handleToggle = useCallback(
    (id: string, is_active: boolean) => {
      toggleMutation.mutate({ id, is_active });
    },
    [toggleMutation]
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Gestión del Menú</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Activa, desactiva y reordena los ítems del menú lateral. Arrastra para cambiar el orden.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-8"></TableHead>
              <TableHead>Nombre</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Ícono</TableHead>
              <TableHead className="text-center">Activo</TableHead>
            </TableRow>
          </TableHeader>
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
            <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
              <TableBody>
                {items.map((item) => (
                  <SortableRow
                    key={item.id}
                    item={item}
                    translatedName={resolveTranslatedLabel(item.label_key, tCommon, tNotif)}
                    onToggle={handleToggle}
                    isPending={toggleMutation.isPending}
                  />
                ))}
              </TableBody>
            </SortableContext>
          </DndContext>
        </Table>
      </div>
    </div>
  );
}
