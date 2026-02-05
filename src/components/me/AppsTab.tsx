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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { SortableAppCard } from './SortableAppCard';
 import { VerifyDomainModal } from './VerifyDomainModal';

interface AppsTabProps {
  appsHook: ReturnType<typeof useApps>;
}

export function AppsTab({ appsHook }: AppsTabProps) {
   const { apps, loading, createApp, updateApp, deleteApp, uploadAppLogo, reorderApps, verifyApp } = appsHook;
  const [isCreating, setIsCreating] = useState(false);
   const [verifyingApp, setVerifyingApp] = useState<AppData | null>(null);

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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = apps.findIndex((app) => app.id === active.id);
      const newIndex = apps.findIndex((app) => app.id === over.id);
      const reordered = arrayMove(apps, oldIndex, newIndex);
      reorderApps(reordered);
    }
  };
  const [newUrl, setNewUrl] = useState('');
  const [expandedAppId, setExpandedAppId] = useState<string | null>(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
   
   const handleVerify = async (appId: string) => {
     return await verifyApp(appId);
   };

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
        <button
          onClick={() => setIsCreating(true)}
          className="w-full border border-dashed border-gray-300 rounded-lg h-14 hover:border-gray-400 hover:bg-gray-50 text-gray-500 hover:text-gray-700 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          Agregar App
        </button>
      ) : (
        <div className="flex gap-2 p-4 border border-gray-200 rounded-lg bg-white">
          <Input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder="https://tu-app.com"
            className="flex-1 border border-gray-200 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-0"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <Button onClick={handleCreate} disabled={!newUrl.trim()} className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 text-white">
            Agregar
          </Button>
          <Button variant="ghost" onClick={() => { setIsCreating(false); setNewUrl(''); }} className="text-gray-500 hover:text-[#1c1c1c]">
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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={apps.map(app => app.id)}
            strategy={verticalListSortingStrategy}
          >
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
                       onVerify={() => handleVerify(app.id)}
                    />
                  ) : (
                    <SortableAppCard
                      app={app}
                      onExpand={() => setExpandedAppId(app.id)}
                      onToggleVisibility={() => updateApp(app.id, { is_visible: !app.is_visible })}
                       onVerify={() => setVerifyingApp(app)}
                    />
                  )}
                </div>
              ))}
            </div>
          </SortableContext>
        </DndContext>
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
       
       {/* Verify Domain Modal */}
       {verifyingApp && (
         <VerifyDomainModal
           open={!!verifyingApp}
           onOpenChange={(open) => !open && setVerifyingApp(null)}
           appName={verifyingApp.name || ''}
           appUrl={verifyingApp.url}
           verificationToken={verifyingApp.verification_token}
           onVerify={() => handleVerify(verifyingApp.id)}
           onSuccess={() => setVerifyingApp(null)}
         />
       )}
    </div>
  );
}
