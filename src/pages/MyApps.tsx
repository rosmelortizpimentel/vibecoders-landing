import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApps } from '@/hooks/useApps';
import { useTranslation } from '@/hooks/useTranslation';
import { useFeatureFlags } from '@/hooks/useFeatureFlags';
import { useSubscription } from '@/hooks/useSubscription';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, Loader2, Sparkles } from 'lucide-react';
import { ProUpgradeModal } from '@/components/pro/ProUpgradeModal';
import { toast } from 'sonner';
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
import { SortableAppCard } from '@/components/me/SortableAppCard';
import { VerifyDomainModal } from '@/components/me/VerifyDomainModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import type { AppData } from '@/hooks/useApps';

export default function MyApps() {
  const navigate = useNavigate();
  const appsHook = useApps();
  const { apps, loading, createApp, updateApp, deleteApp, reorderApps, verifyApp, refetch } = appsHook;
  const t = useTranslation('apps');
  const { getFlag } = useFeatureFlags();
  const { tier } = useSubscription();

  const [isUrlInputOpen, setIsUrlInputOpen] = useState(false);
  const [showProModal, setShowProModal] = useState(false);
  const [verifyingApp, setVerifyingApp] = useState<AppData | null>(null);
  const [scrapingAppId, setScrapingAppId] = useState<string | null>(null);
  const [newUrl, setNewUrl] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = apps.findIndex((app) => app.id === active.id);
      const newIndex = apps.findIndex((app) => app.id === over.id);
      reorderApps(arrayMove(apps, oldIndex, newIndex));
    }
  };

  const handleVerify = async (appId: string) => verifyApp(appId);

  const handleCreate = async () => {
    if (!newUrl.trim()) return;
    let normalizedUrl = newUrl.trim();
    if (!normalizedUrl.startsWith('http://') && !normalizedUrl.startsWith('https://')) {
      normalizedUrl = `https://${normalizedUrl}`;
    }
    try {
      const app = await createApp(normalizedUrl);
      const isScrapingEnabled = getFlag('enable_firecrawl_scraping');
      if (isScrapingEnabled) {
        setScrapingAppId(app.id);
        try {
          const { error } = await supabase.functions.invoke('scrape-app-details', { body: { app_id: app.id } });
          if (error) throw error;
          toast.success("App creada y analizada");
          await refetch();
        } catch { toast.error("App creada, error al analizar"); }
        finally { setScrapingAppId(null); navigate(`/my-apps/${app.id}`); }
      } else {
        toast.success("App creada");
        navigate(`/my-apps/${app.id}`);
      }
      setIsUrlInputOpen(false);
      setNewUrl('');
    } catch (error) { console.error('Error creating app:', error); }
  };

  const handleDelete = async () => {
    if (!deleteConfirmId) return;
    try { await deleteApp(deleteConfirmId); setDeleteConfirmId(null); }
    catch (error) { console.error('Error deleting app:', error); }
  };

  if (loading) {
    return <main className="flex-1 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-primary" /></main>;
  }

  return (
    <div className="container px-3 sm:px-4 py-4 sm:py-6 flex-1 max-w-3xl mx-auto">
      <h1 className="text-xl sm:text-2xl font-bold text-foreground mb-1">{t.t('hub.backToApps')}</h1>
      <p className="text-sm text-muted-foreground mb-6">{t.noAppsHint}</p>

      <div className="mb-6">
        {!isUrlInputOpen ? (
          <button
            onClick={() => {
              if (tier === 'free' && apps.length >= 1) setShowProModal(true);
              else setIsUrlInputOpen(true);
            }}
            className="w-full border border-dashed border-border rounded-lg h-14 hover:border-muted-foreground hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-colors flex items-center justify-center gap-2 text-sm font-medium"
          >
            <Plus className="h-4 w-4" /> {t.addApp}
          </button>
        ) : (
          <div className="flex flex-col sm:flex-row gap-2 p-4 border border-border rounded-lg bg-background">
            <Input value={newUrl} onChange={e => setNewUrl(e.target.value)} placeholder={t.urlPlaceholder} className="flex-1" autoFocus onKeyDown={e => e.key === 'Enter' && handleCreate()} />
            <div className="flex gap-2">
              <Button onClick={handleCreate} disabled={!newUrl.trim()} className="flex-1 sm:flex-none">{t.add}</Button>
              <Button variant="ghost" onClick={() => { setIsUrlInputOpen(false); setNewUrl(''); }} className="flex-1 sm:flex-none">{t.cancel}</Button>
            </div>
          </div>
        )}
      </div>

      {scrapingAppId && (
        <div className="mb-6 p-4 bg-muted/50 border border-border rounded-xl flex items-center gap-4 animate-in fade-in">
          <Sparkles className="w-5 h-5 text-muted-foreground animate-pulse" />
          <span className="text-sm text-muted-foreground">Analizando...</span>
        </div>
      )}

      {apps.length === 0 && !isUrlInputOpen ? (
        <div className="text-center py-12 text-muted-foreground"><p>{t.noApps}</p></div>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={apps.map(app => app.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {apps.map(app => (
                <SortableAppCard key={app.id} app={app} onExpand={() => navigate(`/my-apps/${app.id}`)} onToggleVisibility={() => updateApp(app.id, { is_visible: !app.is_visible })} onVerify={() => setVerifyingApp(app)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={!!deleteConfirmId} onOpenChange={() => setDeleteConfirmId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t.deleteConfirmTitle}</DialogTitle>
            <DialogDescription>{t.deleteConfirmDescription}</DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="ghost" onClick={() => setDeleteConfirmId(null)}>{t.cancel}</Button>
            <Button variant="destructive" onClick={handleDelete}>{t.delete}</Button>
          </div>
        </DialogContent>
      </Dialog>

      {verifyingApp && (
        <VerifyDomainModal open={!!verifyingApp} onOpenChange={(open) => !open && setVerifyingApp(null)} appName={verifyingApp.name || ''} appUrl={verifyingApp.url} verificationToken={verifyingApp.verification_token} onVerify={() => handleVerify(verifyingApp.id)} onSuccess={() => setVerifyingApp(null)} />
      )}

      <ProUpgradeModal open={showProModal} onOpenChange={setShowProModal} />
    </div>
  );
}
