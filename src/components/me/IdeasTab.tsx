import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Plus, 
  Lightbulb, 
  Search, 
  Loader2, 
  ChevronLeft,
  GripVertical,
  CheckCircle2,
  Circle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { IdeaDetail, Idea } from './ideas/IdeaDetail';
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
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
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

// Sortable idea item component
function SortableIdeaItem({ 
  idea, 
  isSelected, 
  onSelect, 
  onDelete, 
  onToggleDone,
  getDaysTag 
}: {
  idea: Idea;
  isSelected: boolean;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleDone: (id: string, done: boolean) => void;
  getDaysTag: (createdAt: string) => string;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: idea.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const isDone = idea.is_done || false;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group flex items-center gap-1 p-2.5 md:p-3 rounded-lg cursor-pointer transition-all",
        isDragging && "opacity-50 z-50 shadow-lg",
        isSelected 
          ? "bg-primary text-primary-foreground shadow-md hover:bg-primary/90" 
          : isDone
            ? "bg-muted/40 border border-border/50 hover:bg-muted/60"
            : "bg-background border border-border hover:bg-accent/50"
      )}
    >
      {/* Drag handle */}
      <button
        className={cn(
          "touch-none shrink-0 cursor-grab active:cursor-grabbing p-0.5",
          isSelected ? "text-primary-foreground/50" : "text-muted-foreground/50"
        )}
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-4 w-4" />
      </button>

      {/* Done toggle */}
      <button
        className={cn(
          "shrink-0 p-0.5",
          isSelected ? "text-primary-foreground/70 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onToggleDone(idea.id, !isDone);
        }}
      >
        {isDone ? (
          <CheckCircle2 className="h-4 w-4 text-primary" />
        ) : (
          <Circle className="h-4 w-4" />
        )}
      </button>

      {/* Title + click area */}
      <div className="flex-1 min-w-0 flex items-center gap-2" onClick={() => onSelect(idea.id)}>
        <h4 className={cn(
          "font-medium line-clamp-1 text-sm flex-1",
          isDone && !isSelected && "line-through opacity-60"
        )}>
          {idea.title}
        </h4>

        {/* Age tag */}
        {idea.created_at && (
          <Badge 
            variant="outline" 
            className={cn(
              "shrink-0 text-[10px] px-1.5 py-0 h-5 font-normal",
              isSelected ? "border-primary-foreground/30 text-primary-foreground/70" : "border-border text-muted-foreground"
            )}
          >
            {getDaysTag(idea.created_at)}
          </Badge>
        )}

        {isDone && (
          <Badge 
            variant="secondary" 
            className={cn(
              "shrink-0 text-[10px] px-1.5 py-0 h-5 bg-primary/10 text-primary border-0",
              isSelected && "bg-primary-foreground/20 text-primary-foreground/70"
            )}
          >
            ✓
          </Badge>
        )}
      </div>

      {/* Delete */}
      <Button
        variant="ghost"
        size="icon"
        className={cn(
          "h-6 w-6 shrink-0 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity",
          isSelected 
            ? "text-primary-foreground/70 hover:text-primary-foreground hover:bg-primary-foreground/20" 
            : "text-muted-foreground hover:text-destructive hover:bg-destructive/10"
        )}
        onClick={(e) => {
          e.stopPropagation();
          onDelete(idea.id);
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
      </Button>
    </div>
  );
}

export function IdeasTab() {
  const { t } = useTranslation('profile');
  const isMobile = useIsMobile();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isDetailDirty, setIsDetailDirty] = useState(false);
  const [pendingID, setPendingID] = useState<string | null>(null);
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [idToDelete, setIdToDelete] = useState<string | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const getDaysTag = useCallback((createdAt: string): string => {
    const days = differenceInDays(new Date(), new Date(createdAt));
    if (days === 0) return t('ideas.today');
    return `${days}d`;
  }, [t]);

  // Fetch ideas with proper ordering
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
        
        if (!isMobile && data && data.length > 0 && !selectedID) {
          setSelectedID(data[0].id);
        }
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

  // Sort: pending first, then done, each group by display_order
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

  const handleSelectIdea = (id: string | null) => {
    if (selectedID === id) return;
    if (isDetailDirty) {
      setPendingID(id);
      setShowUnsavedDialog(true);
    } else {
      setSelectedID(id);
    }
  };

  const confirmNavigation = () => {
    setSelectedID(pendingID);
    setIsDetailDirty(false);
    setShowUnsavedDialog(false);
    setPendingID(null);
  };

  const cancelNavigation = () => {
    setPendingID(null);
    setShowUnsavedDialog(false);
  };

  const handleCreateNew = () => {
    handleSelectIdea('new');
  };

  const handleToggleDone = async (id: string, done: boolean) => {
    // Optimistic update
    setIdeas(prev => prev.map(i => i.id === id ? { ...i, is_done: done } : i));
    
    try {
      const { error } = await supabase
        .from('user_ideas')
        .update({ is_done: done } as Record<string, unknown>)
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error toggling done:', error);
      // Revert
      setIdeas(prev => prev.map(i => i.id === id ? { ...i, is_done: !done } : i));
      toast.error(t('error'));
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const pendingIdeas = filteredIdeas.filter(i => !i.is_done);
    const oldIndex = pendingIdeas.findIndex(i => i.id === active.id);
    const newIndex = pendingIdeas.findIndex(i => i.id === over.id);
    
    if (oldIndex === -1 || newIndex === -1) return;

    const reordered = arrayMove(pendingIdeas, oldIndex, newIndex);
    
    // Optimistic update
    const updatedIdeas = ideas.map(idea => {
      const idx = reordered.findIndex(r => r.id === idea.id);
      if (idx !== -1) return { ...idea, display_order: idx };
      return idea;
    });
    setIdeas(updatedIdeas);

    // Persist
    try {
      for (let i = 0; i < reordered.length; i++) {
        await supabase
          .from('user_ideas')
          .update({ display_order: i } as Record<string, unknown>)
          .eq('id', reordered[i].id);
      }
    } catch (error) {
      console.error('Error updating order:', error);
      await refetchIdeas();
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
      if (selectedID === id) setSelectedID(null);
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

  const pendingFilteredIdeas = filteredIdeas.filter(i => !i.is_done);
  const doneFilteredIdeas = filteredIdeas.filter(i => i.is_done);

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

      <div className="grid md:grid-cols-12 gap-4 md:gap-6 h-full">
        {/* LEFT COLUMN: List */}
        <div className={cn(
          "md:col-span-4 lg:col-span-3 flex flex-col gap-3 h-full",
          isMobile && selectedID ? "hidden" : "flex"
        )}>
          <div className="flex items-center gap-2 shrink-0">
            <div className="relative flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('ideas.search')} 
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Button size="icon" onClick={handleCreateNew} className="h-10 w-10 shrink-0 rounded-full">
              <Plus className="h-5 w-5" />
            </Button>
          </div>

          <ScrollArea className="flex-1 -mx-1 px-1">
            <div className="space-y-1.5">
              {selectedID === 'new' && (
                <div className="p-2.5 md:p-3 rounded-lg border cursor-pointer bg-primary/5 border-primary">
                  <div className="font-medium text-primary text-sm">{t('ideas.newIdeaTitle')}</div>
                </div>
              )}
              
              {filteredIdeas.length === 0 && searchQuery && (
                <div className="text-center py-8 text-muted-foreground text-sm">
                  {t('ideas.noIdeasMessage')}
                </div>
              )}

              {/* Pending ideas - sortable */}
              <DndContext
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={handleDragEnd}
              >
                <SortableContext
                  items={pendingFilteredIdeas.map(i => i.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {pendingFilteredIdeas.map(idea => (
                    <SortableIdeaItem
                      key={idea.id}
                      idea={idea}
                      isSelected={selectedID === idea.id}
                      onSelect={handleSelectIdea}
                      onDelete={openDeleteDialog}
                      onToggleDone={handleToggleDone}
                      getDaysTag={getDaysTag}
                    />
                  ))}
                </SortableContext>
              </DndContext>

              {/* Done ideas - not sortable */}
              {doneFilteredIdeas.map(idea => (
                <SortableIdeaItem
                  key={idea.id}
                  idea={idea}
                  isSelected={selectedID === idea.id}
                  onSelect={handleSelectIdea}
                  onDelete={openDeleteDialog}
                  onToggleDone={handleToggleDone}
                  getDaysTag={getDaysTag}
                />
              ))}

              {ideas.length === 0 && !selectedID && (
                <div className="flex flex-col items-center justify-center py-10 text-center space-y-3 opacity-60">
                  <Lightbulb className="h-10 w-10 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">{t('ideas.noIdeasMessage')}</p>
                  <Button variant="outline" size="sm" onClick={handleCreateNew}>
                    {t('ideas.createNew')}
                  </Button>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* RIGHT COLUMN: Detail */}
        <div className={cn(
          "md:col-span-8 lg:col-span-9 h-full",
          isMobile && !selectedID ? "hidden" : "block"
        )}>
          {(selectedID || selectedIdea) ? (
            <div className="h-full flex flex-col">
              {isMobile && (
                <Button 
                  variant="ghost" 
                  className="self-start mb-2 -ml-2 gap-1 text-muted-foreground"
                  onClick={() => handleSelectIdea(null)}
                >
                  <ChevronLeft className="h-4 w-4" />
                  {t('ideas.backToList')}
                </Button>
              )}
              
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
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-muted-foreground border rounded-lg border-dashed bg-muted/20">
              <Lightbulb className="h-12 w-12 mb-4 opacity-20" />
              <p className="text-sm">{t('ideas.selectIdea')}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
