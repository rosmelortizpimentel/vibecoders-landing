import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Plus, 
  Lightbulb, 
  Search, 
  Loader2, 
  CheckCircle2,
  Circle,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { IdeaDetail, Idea } from './ideas/IdeaDetail';
import { SortableIdeaCard } from './ideas/SortableIdeaCard';
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
import { useIsMobile } from '@/hooks/use-mobile';
import { toast } from 'sonner';
import { differenceInDays } from 'date-fns';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';

interface IdeasTabProps {
  initialIdeaId?: string;
}

export function IdeasTab({ initialIdeaId }: IdeasTabProps) {
  const { t } = useTranslation('profile');
  const isMobile = useIsMobile();
  const navigate = useNavigate();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedID, setSelectedID] = useState<string | null>(initialIdeaId === 'new' ? 'new' : initialIdeaId || null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'pending' | 'done'>('pending');
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  
  const [isDetailDirty, setIsDetailDirty] = useState(false);
  const [pendingID, setPendingID] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const [pendingToggle, setPendingToggle] = useState<{ id: string; newDone: boolean } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
  );

  const getDaysTag = useCallback((createdAt: string): string => {
    const days = differenceInDays(new Date(), new Date(createdAt));
    if (days === 0) return t('ideas.today');
    return `${days}d`;
  }, [t]);

  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('user_ideas')
          .select('*')
          .order('is_done' as string, { ascending: true })
          .order('display_order' as string, { ascending: true })
          .order('created_at', { ascending: false });

        if (error) throw error;
        setIdeas((data as unknown as Idea[]) || []);
      } catch (error) {
        console.error('Error fetching ideas:', error);
        toast.error(t('error'));
      } finally {
        setLoading(false);
      }
    };

    fetchIdeas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetchIdeas = async () => {
    try {
      const { data, error } = await supabase
        .from('user_ideas')
        .select('*')
        .order('is_done' as string, { ascending: true })
        .order('display_order' as string, { ascending: true })
        .order('created_at', { ascending: false });

      if (error) throw error;
      setIdeas((data as unknown as Idea[]) || []);
    } catch (error) {
      console.error('Error fetching ideas:', error);
    }
  };

  const sortedIdeas = [...ideas].sort((a, b) => {
    const aDone = a.is_done ? 1 : 0;
    const bDone = b.is_done ? 1 : 0;
    if (aDone !== bDone) return aDone - bDone;
    return (a.display_order || 0) - (b.display_order || 0);
  });

  const filteredIdeas = sortedIdeas.filter(idea => 
    idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const pendingFilteredIdeas = filteredIdeas.filter(i => !i.is_done);
  const doneFilteredIdeas = filteredIdeas.filter(i => i.is_done);

  const pendingCount = ideas.filter(i => !i.is_done).length;
  const doneCount = ideas.filter(i => i.is_done).length;

  const showDetail = selectedID !== null;

  const handleSelectIdea = (id: string | null) => {
    if (selectedID === id) return;
    if (isDetailDirty) {
      setPendingID(id);
      setShowUnsavedDialog(true);
    } else {
      setSelectedID(id);
      if (id === null) {
        navigate('/ideas', { replace: true });
      } else if (id === 'new') {
        navigate('/ideas/new', { replace: true });
      } else {
        navigate(`/ideas/${id}`, { replace: true });
      }
    }
  };

  const confirmNavigation = () => {
    setSelectedID(pendingID);
    setIsDetailDirty(false);
    setShowUnsavedDialog(false);
    if (pendingID === null) {
      navigate('/ideas', { replace: true });
    } else if (pendingID === 'new') {
      navigate('/ideas/new', { replace: true });
    } else {
      navigate(`/ideas/${pendingID}`, { replace: true });
    }
    setPendingID(null);
  };

  const cancelNavigation = () => {
    setPendingID(null);
    setShowUnsavedDialog(false);
  };

  const handleCreateNew = () => {
    handleSelectIdea('new');
  };

  const requestToggleDone = (id: string, newDone: boolean) => {
    setPendingToggle({ id, newDone });
  };

  const confirmToggleDone = async () => {
    if (!pendingToggle) return;
    await handleToggleDone(pendingToggle.id, pendingToggle.newDone);
    setPendingToggle(null);
  };

  const handleToggleDone = async (id: string, done: boolean) => {
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, is_done: done } : i));
    
    try {
      const { error } = await supabase
        .from('user_ideas')
        .update({ is_done: done } as Record<string, unknown>)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling done:', error);
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, is_done: !done } : i));
      toast.error(t('error'));
    }
  };

  const handleSave = async (ideaData: Partial<Idea>) => {
    setIsSaving(true);
    try {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) return;

      if (ideaData.id) {
        const { error } = await supabase
          .from('user_ideas')
          .update({
            title: ideaData.title,
            description: ideaData.description,
            updated_at: new Date().toISOString()
          })
          .eq('id', ideaData.id);
        
        if (error) throw error;
        toast.success(t('saved'));
      } else {
        const maxOrder = ideas.reduce((max, i) => Math.max(max, i.display_order || 0), 0);
        const insertData: Record<string, unknown> = {
            user_id: user.id,
            title: ideaData.title,
            description: ideaData.description,
            display_order: maxOrder + 1
        };
        const { data, error } = await supabase
          .from('user_ideas')
          .insert(insertData as any)
          .select()
          .single();
        
        if (error) throw error;
        toast.success(t('saved'));
        
        if (data) {
          setIdeas([(data as unknown as Idea), ...ideas]);
          setSelectedID(data.id);
          setIsDetailDirty(false);
          navigate(`/ideas/${data.id}`, { replace: true });
          return;
        }
      }
      
      await refetchIdeas();
      setIsDetailDirty(false);
    } catch (error) {
      console.error('Error saving idea:', error);
      toast.error(t('error'));
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase
        .from('user_ideas')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setIdeas(ideas.filter(i => i.id !== id));
      if (selectedID === id) {
        setSelectedID(null);
        navigate('/ideas', { replace: true });
      }
      toast.success(t('ideas.delete')); 
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error(t('error'));
    } finally {
      setIsDeleteDialogOpen(false);
      setIdToDelete(null);
    }
  };

  const openDeleteDialog = (id: string) => {
    setIdToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = pendingFilteredIdeas.findIndex(i => i.id === active.id);
    const newIndex = pendingFilteredIdeas.findIndex(i => i.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(pendingFilteredIdeas, oldIndex, newIndex);
    
    // Update local state optimistically
    const previousIdeas = [...ideas];
    const updatedIdeas = ideas.map(idea => {
      const newIdx = reordered.findIndex(r => r.id === idea.id);
      if (newIdx !== -1) {
        return { ...idea, display_order: newIdx };
      }
      return idea;
    });
    setIdeas(updatedIdeas);

    // Persist to Supabase
    try {
      const updates = reordered.map((idea, idx) => 
        supabase
          .from('user_ideas')
          .update({ display_order: idx } as Record<string, unknown>)
          .eq('id', idea.id)
      );
      await Promise.all(updates);
    } catch (error) {
      console.error('Error persisting order:', error);
      setIdeas(previousIdeas);
      toast.error(t('error'));
    }
  };
  
  const selectedIdea = selectedID === 'new' 
    ? null 
    : ideas.find(i => i.id === selectedID) || null;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const displayedIdeas = activeTab === 'pending' ? pendingFilteredIdeas : doneFilteredIdeas;

  // Detail view
  if (showDetail) {
    return (
      <div className="h-full">
        <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('ideas.unsavedChangesTitle')}</AlertDialogTitle>
              <AlertDialogDescription>{t('ideas.unsavedChangesMessage')}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={cancelNavigation}>{t('ideas.keepEditing')}</AlertDialogCancel>
              <AlertDialogAction onClick={confirmNavigation}>{t('ideas.discard')}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <IdeaDetail 
          key={selectedID}
          idea={selectedIdea} 
          onSave={handleSave}
          onDelete={handleDelete}
          onCancel={() => handleSelectIdea(null)}
          onDirtyChange={setIsDetailDirty}
          isSaving={isSaving}
        />
      </div>
    );
  }

  // Grid view
  return (
    <div className="h-full space-y-3">
      {/* Unsaved changes dialog */}
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ideas.unsavedChangesTitle')}</AlertDialogTitle>
            <AlertDialogDescription>{t('ideas.unsavedChangesMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>{t('ideas.keepEditing')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>{t('ideas.discard')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Delete confirmation dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold">{t('ideas.confirmDeleteTitle')}</AlertDialogTitle>
            <AlertDialogDescription className="text-sm">{t('ideas.confirmDeleteMessage')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel className="h-9 px-4 rounded-lg bg-muted/50 border-none hover:bg-muted transition-colors">
              {t('ideas.cancel')}
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => idToDelete && handleDelete(idToDelete)}
              className="h-9 px-4 rounded-lg bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-all font-semibold"
            >
              {t('ideas.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Toggle done confirmation dialog */}
      <AlertDialog open={!!pendingToggle} onOpenChange={(open) => !open && setPendingToggle(null)}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pendingToggle?.newDone ? t('ideas.confirmCompleteTitle') : t('ideas.confirmReactivateTitle')}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pendingToggle?.newDone ? t('ideas.confirmCompleteMessage') : t('ideas.confirmReactivateMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="gap-2 mt-4">
            <AlertDialogCancel>{t('ideas.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmToggleDone}>
              {pendingToggle?.newDone ? t('ideas.markDone') : t('ideas.markPending')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Header: Tabs + Search + Create */}
      <div className="flex items-center gap-2">
        {isMobile && isSearchOpen ? (
          /* Mobile: expanded search */
          <>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
            >
              <X className="h-4 w-4" />
            </Button>
            <Input
              autoFocus
              placeholder={t('ideas.search')}
              className="h-9 text-sm flex-1"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </>
        ) : (
          /* Desktop always / Mobile default */
          <>
            <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'pending' | 'done')}>
              <TabsList className="h-9">
                <TabsTrigger value="pending" className="text-xs px-3 gap-1.5">
                  <Circle className="h-3.5 w-3.5 text-primary" />
                  {t('ideas.tabPending')} ({pendingCount})
                </TabsTrigger>
                <TabsTrigger value="done" className="text-xs px-3 gap-1.5">
                  <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                  {t('ideas.tabCompleted')} ({doneCount})
                </TabsTrigger>
              </TabsList>
            </Tabs>

            {isMobile ? (
              /* Mobile: search icon */
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 ml-auto"
                onClick={() => setIsSearchOpen(true)}
              >
                <Search className="h-4 w-4" />
              </Button>
            ) : (
              /* Desktop: search input */
              <div className="relative flex-1 max-w-xs ml-auto">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder={t('ideas.search')} 
                  className="pl-9 h-9 text-sm"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            )}
          </>
        )}

        <Button size="icon" onClick={handleCreateNew} className="h-9 w-9 shrink-0 rounded-full">
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Grid */}
      {displayedIdeas.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 text-center space-y-3 opacity-60">
          <Lightbulb className="h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {ideas.length === 0 ? t('ideas.noIdeasMessage') : t('ideas.noIdeasMessage')}
          </p>
          {ideas.length === 0 && (
            <Button variant="outline" size="sm" onClick={handleCreateNew} className="text-xs h-7">
              {t('ideas.createNew')}
            </Button>
          )}
        </div>
      ) : activeTab === 'pending' ? (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={displayedIdeas.map(i => i.id)} strategy={rectSortingStrategy}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
              {displayedIdeas.map(idea => (
                <SortableIdeaCard
                  key={idea.id}
                  idea={idea}
                  getDaysTag={getDaysTag}
                  onSelect={(id) => handleSelectIdea(id)}
                  onDelete={openDeleteDialog}
                  onToggleDone={requestToggleDone}
                  t={t}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {displayedIdeas.map(idea => (
            <SortableIdeaCard
              key={idea.id}
              idea={idea}
              getDaysTag={getDaysTag}
              onSelect={(id) => handleSelectIdea(id)}
              onDelete={openDeleteDialog}
              onToggleDone={requestToggleDone}
              t={t}
              isDragDisabled
            />
          ))}
        </div>
      )}
    </div>
  );
}
