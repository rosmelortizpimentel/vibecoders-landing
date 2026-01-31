import { useState } from 'react';
import { useApps, AppData } from '@/hooks/useApps';
import { AppCard } from './AppCard';
import { AppEditor } from './AppEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface AppsTabProps {
  appsHook: ReturnType<typeof useApps>;
}

export function AppsTab({ appsHook }: AppsTabProps) {
  const { apps, loading, createApp, updateApp, deleteApp, uploadAppLogo } = appsHook;
  const [isCreating, setIsCreating] = useState(false);
  const [newUrl, setNewUrl] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const handleCreate = async () => {
    if (!newUrl.trim()) return;
    
    try {
      const app = await createApp(newUrl.trim());
      setNewUrl('');
      setIsCreating(false);
      setExpandedAppId(app.id);
    } catch (error) {
      console.error('Error creating app:', error);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    
    try {
      await deleteApp(deleteConfirmId);
      setDeleteConfirmId(null);
    } catch (error) {
      console.error('Error deleting app:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Add App Button */}
      {!isCreating ? (
        <Button
          onClick={() => setIsCreating(true)}
          variant="outline"
          className="w-full border-dashed border-2 border-gray-300 h-14 hover:border-[#3D5AFE] hover:bg-[#3D5AFE]/5 text-gray-600 hover:text-[#3D5AFE]"
        >
          <Plus className="h-5 w-5 mr-2" />
          Agregar App
        </Button>
      ) : (
        <div className="flex gap-2 p-4 border-2 border-[#3D5AFE] rounded-lg bg-[#3D5AFE]/5">
          <Input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://tu-app.com"
            className="flex-1 border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={!newUrl.trim()} className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90">
            Agregar
          </Button>
          <Button variant="ghost" onClick={() => { setIsCreating(false); setNewUrl(''); }} className="text-gray-600 hover:text-[#1c1c1c]">
            Cancelar
          </Button>
        </div>
      )}

      {/* Apps List */}
      {apps.length === 0 && !isCreating ? (
        <div className="text-center py-12 text-gray-500">
          <p>No tienes apps todavía</p>
          <p className="text-sm mt-1">Agrega tu primer proyecto para mostrarlo en tu perfil</p>
        </div>
      ) : (
        <div className="space-y-3">
          {apps.map(app => (
            <div key={app.id}>
              {expandedAppId === app.id ? (
                <AppEditor
                  app={app}
                  onUpdate={updateApp}
                  onUploadLogo={uploadAppLogo}
                  onDelete={() => setDeleteConfirmId(app.id)}
                  onCollapse={() => setExpandedAppId(null)}
                />
              ) : (
                <AppCard
                  app={app}
                  onExpand={() => setExpandedAppId(app.id)}
                  onToggleVisibility={() => updateApp(app.id, { is_visible: !app.is_visible })}
                />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Eliminar esta app?</DialogTitle>
            <DialogDescription>
              Esta acción no se puede deshacer. La app será eliminada permanentemente de tu perfil.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Eliminar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
