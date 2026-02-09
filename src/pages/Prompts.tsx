import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePrompts, COMPATIBILITY_OPTIONS } from '@/hooks/usePrompts';
import type { Prompt } from '@/hooks/usePrompts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromptCard } from '@/components/prompts/PromptCard';
import { Plus, Search, BookOpen, Heart } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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

export default function Prompts() {
  const { t } = useTranslation('prompts');
  const {
    publicPrompts, myPrompts,
    isLoadingPublic, isLoadingMine,
    deletePrompt, toggleVisibility, toggleLike,
  } = usePrompts();

  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState('all');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filterPrompts = (prompts: Prompt[]) => {
    return prompts.filter(p => {
      const matchSearch = !search || 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(tag => tag.includes(search.toLowerCase()));
      
      const matchTool = toolFilter === 'all' || 
        (p.tool_compatibility && p.tool_compatibility.includes(toolFilter)) ||
        p.tool_used === toolFilter;
        
      return matchSearch && matchTool;
    });
  };

  const filteredPublic = useMemo(() => filterPrompts(publicPrompts), [publicPrompts, search, toolFilter]);
  const filteredMine = useMemo(() => filterPrompts(myPrompts), [myPrompts, search, toolFilter]);
  
  const favoritedResources = useMemo(() => filteredPublic.filter(p => p.is_liked), [filteredPublic]);
  const otherResources = useMemo(() => filteredPublic, [filteredPublic]); // Show all in "All Resources" or exclude? Usually Favorites are duplicates or pinned. Let's keep "All Resources" as all, but maybe user wants "Everything else"? "Favorites section first" implies it's a highlighted section. Let's just show favorites if any, then "All Resources" 

  /* Navigation Handlers */
  const handleEdit = (prompt: Prompt) => {
    window.location.href = `/prompts/${prompt.id}/edit`;
  };

  const handleNew = () => {
    window.location.href = '/prompts/new';
  };

  const handleView = (prompt: Prompt) => {
    window.location.href = `/prompts/${prompt.id}`;
  };

  const handleConfirmDelete = async () => {
    if (deleteId) {
      await deletePrompt.mutateAsync(deleteId);
      setDeleteId(null);
    }
  };

  const renderGrid = (prompts: Prompt[], isOwner: boolean, loading: boolean, emptyTitle: string, emptyDesc: string) => {
    if (loading) {
      return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-48 rounded-xl" />
          ))}
        </div>
      );
    }

    if (prompts.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <BookOpen className="h-12 w-12 text-muted-foreground/30 mb-4" />
          <h3 className="font-medium text-muted-foreground">{emptyTitle}</h3>
          <p className="text-sm text-muted-foreground/60 mt-1">{emptyDesc}</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {prompts.map(p => (
          <PromptCard
            key={p.id}
            prompt={p}
            isOwner={isOwner}
            onView={handleView}
            onEdit={() => window.location.href = `/prompts/${p.id}/edit`}
            onDelete={id => setDeleteId(id)}
            onToggleVisibility={(id, pub) => toggleVisibility.mutate({ id, is_public: pub })}
            onToggleLike={(id, liked) => toggleLike.mutate({ resourceId: id, isLiked: liked })}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container px-4 py-8 max-w-5xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground text-lg">{t('subtitle')}</p>
        </div>
        <Button onClick={handleNew} size="lg" className="gap-2 shadow-lg hover:shadow-xl transition-all">
          <Plus className="h-5 w-5" /> {t('newPrompt')}
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-10 h-11"
          />
        </div>
        <Select value={toolFilter} onValueChange={setToolFilter}>
          <SelectTrigger className="w-full sm:w-[200px] h-11">
            <SelectValue placeholder={t('filterByTool')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTools')}</SelectItem>
            {COMPATIBILITY_OPTIONS.map(tool => (
              <SelectItem key={tool} value={tool}>{tool}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="explore" className="space-y-6">
        <TabsList className="w-full sm:w-auto h-auto p-1 bg-muted/50 rounded-full border border-border/50">
          <TabsTrigger 
            value="explore" 
            className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2"
          >
            {t('tabs.explore')}
            {publicPrompts.length > 0 && (
              <Badge variant="secondary" className="px-1.5 h-5 min-w-5 justify-center bg-muted-foreground/10 text-muted-foreground">
                {publicPrompts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger 
            value="mine" 
            className="rounded-full px-6 py-2.5 data-[state=active]:bg-background data-[state=active]:shadow-sm transition-all gap-2"
          >
            {t('tabs.mine')}
            {myPrompts.length > 0 && (
              <Badge variant="secondary" className="px-1.5 h-5 min-w-5 justify-center bg-muted-foreground/10 text-muted-foreground">
                {myPrompts.length}
              </Badge>
            )}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explore" className="space-y-8 animate-in fade-in-50 duration-500">
           {/* Favorites Section */}
           {favoritedResources.length > 0 && !search && toolFilter === 'all' && (
             <div className="space-y-4">
                <div className="flex items-center gap-2 text-primary">
                  <Heart className="h-5 w-5 fill-current" />
                  <h2 className="text-xl font-semibold">{t('favorites')}</h2>
                </div>
                {renderGrid(favoritedResources, false, isLoadingPublic, '', '')}
                <div className="border-t border-border/50 my-8" />
                <h2 className="text-xl font-semibold mb-4">{t('allResources')}</h2>
             </div>
           )}

          {renderGrid(otherResources, false, isLoadingPublic, t('noPublicPrompts'), t('noPublicPromptsDesc'))}
        </TabsContent>

        <TabsContent value="mine" className="animate-in fade-in-50 duration-500">
          {renderGrid(filteredMine, true, isLoadingMine, t('noPrompts'), t('noPromptsDesc'))}
        </TabsContent>
      </Tabs>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteId} onOpenChange={open => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('confirmDelete')}</AlertDialogTitle>
            <AlertDialogDescription />
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('form.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>{t('card.delete')}</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
