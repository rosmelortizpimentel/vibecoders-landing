import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';

export function MenuManager() {
  const queryClient = useQueryClient();

  const { data: items = [], isLoading } = useQuery({
    queryKey: ['admin-menu-items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sidebar_menu_items')
        .select('*')
        .order('display_order', { ascending: true });
      if (error) throw error;
      return data;
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
      toast.success('Menu actualizado');
    },
    onError: () => toast.error('Error al actualizar'),
  });

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
          Activa o desactiva los items del menú lateral.
        </p>
      </div>

      <div className="rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Ruta</TableHead>
              <TableHead>Sección</TableHead>
              <TableHead>Icono</TableHead>
              <TableHead className="text-center">Activo</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">{item.label_key}</TableCell>
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
                    onCheckedChange={(checked) =>
                      toggleMutation.mutate({ id: item.id, is_active: checked })
                    }
                    disabled={toggleMutation.isPending}
                  />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
