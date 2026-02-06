import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  Plus, 
  Lightbulb, 
  Search, 
  Loader2, 
  ChevronLeft 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

export function IdeasTab() {
  const t = useTranslation('profile').t; // Access t function directly if useTranslation returns object


  const isMobile = useIsMobile();

  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedID, setSelectedID] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dirty state management for unsaved changes
  const [isDetailDirty, setIsDetailDirty] = useState(false);
  const [pendingID, setPendingID] = useState<string | null>(null); // ID we want to switch TO
  const [showUnsavedDialog, setShowUnsavedDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch ideas
  useEffect(() => {
    const fetchIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('user_ideas')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setIdeas(data || []);
        
        // Select first idea on desktop if none selected and we have ideas
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
  }, []); // Run once on mount

  // Refetch helper
  const refetchIdeas = async () => {
      try {
        const { data, error } = await supabase
          .from('user_ideas')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setIdeas(data || []);
      } catch (error) {
        console.error('Error fetching ideas:', error);
      }
  };

  // Filter ideas
  const filteredIdeas = ideas.filter(idea => 
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

  const handleSave = async (ideaData: Partial<Idea>) => {
    setIsSaving(true);
    try {
      const { user } = (await supabase.auth.getUser()).data;
      if (!user) return;

      if (ideaData.id) {
        // Update
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
        // Create
        const { data, error } = await supabase
          .from('user_ideas')
          .insert({
            user_id: user.id,
            title: ideaData.title,
            description: ideaData.description
          })
          .select()
          .single();
        
        if (error) throw error;
        toast.success(t('saved'));
        
        // Update list and select the new idea
        if (data) {
            setIdeas([data, ...ideas]);
            setSelectedID(data.id);
            // dirty state will reset because selectedID changes
            setIsDetailDirty(false);
            return; // Exit early to avoid fetchIdeas call if we manually updated state (though fetchIdeas is safer)
        }
      }
      
      // Refresh list
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
      }
      toast.success(t('ideas.delete')); // Or custom "Deleted" message
    } catch (error) {
      console.error('Error deleting idea:', error);
      toast.error(t('error'));
    }
  };
  
  const selectedIdea = selectedID === 'new' 
    ? null 
    : ideas.find(i => i.id === selectedID) || null;

  // Determine view state
  // Desktop: Always show List (left) + Detail (right). Detail is empty if no selection.
  // Mobile: Show List. If selectedID, show Detail (full screen override).

  if (loading) {
    return (
      <div className="flex items-center justify-center p-10">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-200px)] min-h-[500px]">
      <AlertDialog open={showUnsavedDialog} onOpenChange={setShowUnsavedDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('ideas.unsavedChangesTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('ideas.unsavedChangesMessage')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={cancelNavigation}>{t('ideas.keepEditing')}</AlertDialogCancel>
            <AlertDialogAction onClick={confirmNavigation}>{t('ideas.discard')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <div className="grid md:grid-cols-12 gap-6 h-full">
        {/* LEFT COLUMN: List */}
        <div className={cn(
          "md:col-span-4 lg:col-span-3 flex flex-col gap-4 h-full",
          isMobile && selectedID ? "hidden" : "flex"
        )}>
           <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold">{t('ideas.title')}</h2>
              <Button size="sm" onClick={handleCreateNew} className="h-8 w-8 p-0 rounded-full">
                 <Plus className="h-4 w-4" />
              </Button>
           </div>
           
           <div className="relative">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
             <Input
               placeholder={t('search') || "Search..."} 
               className="pl-9"
               value={searchQuery}
               onChange={(e) => setSearchQuery(e.target.value)}
             />
           </div>

           <ScrollArea className="flex-1 -mx-2 px-2">
             <div className="space-y-2">
                {selectedID === 'new' && (
                  <div className={cn(
                    "p-3 rounded-lg border cursor-pointer bg-primary/5 border-primary"
                  )}>
                     <div className="font-medium text-primary">{t('ideas.newIdeaTitle')}</div>
                     <div className="text-xs text-muted-foreground">{t('ideas.descriptionPlaceholder')}</div>
                  </div>
                )}
                
                {filteredIdeas.length === 0 && searchQuery && (
                   <div className="text-center py-8 text-muted-foreground text-sm">
                      {t('noResults') || "No results found"}
                   </div>
                )}

                {filteredIdeas.map(idea => (
                  <div
                    key={idea.id}
                    onClick={() => handleSelectIdea(idea.id)}
                    className={cn(
                      "p-3 rounded-lg border cursor-pointer transition-all hover:bg-accent",
                      selectedID === idea.id 
                        ? "bg-primary border-primary text-primary-foreground shadow-md" 
                        : "bg-card border-border"
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                       <h4 className="font-medium line-clamp-1 text-sm">{idea.title}</h4>
                       {/* Maybe a date? */}
                    </div>
                    {idea.description && (
                        <p className={cn(
                          "text-xs line-clamp-2 mt-1 whitespace-pre-wrap",
                          selectedID === idea.id ? "text-primary-foreground/80" : "text-muted-foreground"
                        )}>
                          {idea.description}
                        </p>
                    )}
                  </div>
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
                  key={selectedID} // Force re-mount on ID change to reset local state
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
                <p>{t('ideas.selectIdea')}</p>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
