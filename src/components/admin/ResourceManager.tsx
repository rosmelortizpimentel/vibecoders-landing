import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Plus, Trash2, Pencil, ClipboardList, ExternalLink, Image as ImageIcon } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { ResourceForm, ResourceFormData } from './ResourceForm';

interface Resource extends ResourceFormData {
  id: string;
  author_id: string;
  created_at: string;
  updated_at: string;
}

export function ResourceManager() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Resource | null>(null);
  const [processing, setProcessing] = useState(false);

  const fetchResources = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('resources')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setResources(data || []);
    } catch (error) {
      console.error('Error fetching resources:', error);
      toast.error('Error al cargar recursos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

  const handleSave = async (formData: ResourceFormData) => {
    setProcessing(true);
    try {
      if (editing) {
        const { error } = await supabase
          .from('resources')
          .update({
            content: formData.content,
            media_urls: formData.media_urls,
            download_urls: formData.download_urls,
            status: formData.status,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editing.id);

        if (error) throw error;
        toast.success('Recurso actualizado');
      } else {
        const { data: userData } = await supabase.auth.getUser();
        if (!userData.user) throw new Error('No authenticated user');

        const { error } = await supabase
          .from('resources')
          .insert({
            content: formData.content,
            media_urls: formData.media_urls,
            download_urls: formData.download_urls,
            status: formData.status,
            author_id: userData.user.id,
          });

        if (error) throw error;
        toast.success('Recurso publicado');
      }
      setShowForm(false);
      setEditing(null);
      fetchResources();
    } catch (error) {
      console.error('Error saving resource:', error);
      toast.error('Error al guardar el recurso');
    } finally {
      setProcessing(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de que quieres eliminar este recurso?')) return;
    
    try {
      const { error } = await supabase
        .from('resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      toast.success('Recurso eliminado');
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
      toast.error('Error al eliminar');
    }
  };

  const openCreate = () => {
    setEditing(null);
    setShowForm(true);
  };

  const openEdit = (resource: Resource) => {
    setEditing(resource);
    setShowForm(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <ClipboardList className="h-6 w-6" /> Recursos
          </h2>
          <p className="text-sm text-muted-foreground mt-1">Sube contenido tipo feed con imágenes y descargas.</p>
        </div>
        <Button onClick={openCreate} className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90">
          <Plus className="h-4 w-4 mr-1" /> Nuevo Recurso
        </Button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
        <Table>
          <TableHeader className="bg-gray-50/50">
            <TableRow>
              <TableHead className="w-[40%]">Contenido</TableHead>
              <TableHead>Media</TableHead>
              <TableHead>Descargas</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  Cargando recursos...
                </TableCell>
              </TableRow>
            ) : resources.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                  No hay recursos publicados todavía.
                </TableCell>
              </TableRow>
            ) : (
              resources.map((resource) => (
                <TableRow key={resource.id} className="hover:bg-gray-50/50">
                  <TableCell className="max-w-[300px]">
                    <p className="line-clamp-2 text-sm text-[#1c1c1c]">{resource.content}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <ImageIcon className="h-4 w-4 text-gray-400" />
                      <span className="text-sm">{resource.media_urls?.length || 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1">
                      {resource.download_urls?.map((d, i) => (
                        <div key={i} className="flex items-center gap-1 text-[10px] text-[#3D5AFE] bg-[#3D5AFE]/5 px-1.5 py-0.5 rounded border border-[#3D5AFE]/10 truncate max-w-[120px]">
                          <ExternalLink className="h-2.5 w-2.5" />
                          {d.label}
                        </div>
                      ))}
                      {(!resource.download_urls || resource.download_urls.length === 0) && (
                        <span className="text-xs text-gray-300">-</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-gray-500">
                    {format(new Date(resource.created_at), 'dd MMM, yyyy', { locale: es })}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-[#3D5AFE]" onClick={() => openEdit(resource)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-red-500" onClick={() => handleDelete(resource.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {showForm && (
        <ResourceForm
          initialData={editing || undefined}
          onSubmit={handleSave}
          onCancel={() => setShowForm(false)}
          isLoading={processing}
        />
      )}
    </div>
  );
}
