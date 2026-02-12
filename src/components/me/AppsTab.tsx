import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useApps, AppData } from '@/hooks/useApps';
import { toast } from "sonner";
import { AppCard } from './AppCard';
import { AppEditor } from './AppEditor';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Sparkles, ChevronLeft } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useFeatureFlags } from "@/hooks/useFeatureFlags";
import { useTranslation } from '@/hooks/useTranslation';
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
  const { apps, loading, createApp, updateApp, deleteApp, uploadAppLogo, reorderApps, verifyApp, refetch } = appsHook;
  const t = useTranslation('apps');
  const { getFlag } = useFeatureFlags();
  const isMobile = useIsMobile();
  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [verifyingApp, setVerifyingApp] = useState<AppData | null>(null);
  const [scrapingAppId, setScrapingAppId] = useState<string | null>(null);

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

  const onAppCreated = (appId: string) => {
    setNewUrl('');
    setExpandedAppId(appId);
  };

  const handleCreate = async () => {
    if (!newUrl.trim()) return;
    
    // Normalize URL
    let normalizedUrl = newUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    
    try {
      const app = await createApp(normalizedUrl);
      
      const isScrapingEnabled = getFlag('enable_firecrawl_scraping');

      if (isScrapingEnabled) {
        setScrapingAppId(app.id);
        
        // Trigger scraping in background
        try {
          const { error } = await supabase.functions.invoke('scrape-app-details', {
            body: { app_id: app.id }
          });
          
          if (error) throw error;
          
          toast.success("App creada y analizada correctamente");
          await refetch();
        } catch (error) {
          console.error('Error scraping app:', error);
          toast.error("App creada, pero hubo un error al analizarla");
        } finally {
          setScrapingAppId(null);
          onAppCreated(app.id); // Expand ONLY after scraping finishes (or fails)
        }
      } else {
        toast.success("App creada correctamente");
        onAppCreated(app.id); // Expand immediately if scraping is off
      }
      
      setIsUrlInputOpen(false);
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
    // ...
  }

  // Mobile Detail View
  if (isMobile && expandedAppId) {
    const activeApp = apps.find(a => a.id === expandedAppId);
    if (activeApp) {
      return (
        <div className="w-full max-w-full overflow-hidden space-y-4 animate-in slide-in-from-right duration-300">
          <Button 
            variant="ghost" 
            className="gap-2 -ml-2 text-muted-foreground hover:text-foreground"
            onClick={() => setExpandedAppId(null)}
          >
            <ChevronLeft className="h-4 w-4" />
            {t.back || 'Volver'}
          </Button>
          <AppEditor
            app={activeApp}
            onUpdate={updateApp}
            onUploadLogo={uploadAppLogo}
            onUploadScreenshot={appsHook.uploadAppScreenshot}
            onDelete={() => setDeleteConfirmId(activeApp.id)}
            onCollapse={() => setExpandedAppId(null)}
            onVerify={() => handleVerify(activeApp.id)}
          />
          
           {/* Verify Domain Modal (Mobile context) */}
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

          {/* Delete Dialog (Mobile context) */}
          <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{t.deleteConfirmTitle}</DialogTitle>
                <DialogDescription>
                  {t.deleteConfirmDescription}
                </DialogDescription>
              </DialogHeader>
              <div className="flex justify-end gap-3 mt-4">
                <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
                  {t.cancel}
                </Button>
                <Button variant="destructive" onClick={handleDelete}>
                  {t.delete}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      );
    }
  }

  return (
    <div className="space-y-4">
      {/* Add App Button */}
      {!isUrlInputOpen ? (
        <button
          onClick={() => setIsUrlInputOpen(true)}
          className="w-full border border-dashed border-border rounded-lg h-14 hover:border-muted-foreground hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 text-sm font-medium"
        >
          <Plus className="h-4 w-4" />
          {t.addApp}
        </button>
      ) : (
        <div className="flex flex-col sm:flex-row gap-2 p-4 border border-border rounded-lg bg-background">
          <Input
            value={newUrl}
            onChange={e => setNewUrl(e.target.value)}
            placeholder={t.urlPlaceholder}
            className="flex-1 border border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-0"
            autoFocus
            onKeyDown={e => e.key === 'Enter' && handleCreate()}
          />
          <div className="flex gap-2">
            <Button onClick={handleCreate} disabled={!newUrl.trim()} className="flex-1 sm:flex-none bg-primary hover:bg-primary/90 text-primary-foreground">
              {t.add}
            </Button>
            <Button variant="ghost" onClick={() => { setIsUrlInputOpen(false); setNewUrl(''); }} className="flex-1 sm:flex-none text-muted-foreground hover:text-foreground">
              {t.cancel}
            </Button>
          </div>
        </div>
      )}

      {scrapingAppId && (
        <div className="mb-6 p-4 bg-slate-50 border border-slate-100 rounded-xl flex items-center gap-4 animate-in fade-in slide-in-from-top-4 duration-500 shadow-sm">
          <div className="relative flex items-center justify-center w-8 h-8">
            <div className="absolute inset-0 bg-slate-200 rounded-full animate-ping opacity-20" />
            <div className="relative bg-white p-1.5 rounded-full border border-slate-100 shadow-sm">
              <Sparkles className="w-4 h-4 text-slate-600 animate-pulse" />
            </div>
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-sm font-medium text-slate-900">
              Analizando tu página...
            </span>
            <span className="text-xs text-slate-500">
              Extrayendo logo, colores y detalles sutilmente.
            </span>
          </div>
        </div>
      )}

      {/* Apps List */}
      {apps.length === 0 && !isUrlInputOpen ? (
        <div className="text-center py-12 text-muted-foreground">
          <p>{t.noApps}</p>
          <p className="text-sm mt-1">{t.noAppsHint}</p>
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
            <div className="border-t border-gray-100">
              {apps.map(app => (
                <div key={app.id}>
                  {(!isMobile && expandedAppId === app.id) ? (
                    <AppEditor
                      app={app}
                      onUpdate={updateApp}
                      onUploadLogo={uploadAppLogo}
                      onUploadScreenshot={appsHook.uploadAppScreenshot}
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
            <DialogTitle>{t.deleteConfirmTitle}</DialogTitle>
            <DialogDescription>
              {t.deleteConfirmDescription}
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>
              {t.cancel}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {t.delete}
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
