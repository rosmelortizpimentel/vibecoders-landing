import { useState, useMemo } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { usePrompts, TOOL_OPTIONS } from '@/hooks/usePrompts';
import type { Prompt } from '@/hooks/usePrompts';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PromptCard } from '@/components/prompts/PromptCard';
import { PromptDetailModal } from '@/components/prompts/PromptDetailModal';
import { PromptFormModal } from '@/components/prompts/PromptFormModal';
import { Plus, Search, BookOpen } from 'lucide-react';
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
    deletePrompt, toggleVisibility,
  } = usePrompts();

  const [search, setSearch] = useState('');
  const [toolFilter, setToolFilter] = useState('all');
  const [viewPrompt, setViewPrompt] = useState<Prompt | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editPrompt, setEditPrompt] = useState<Prompt | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filterPrompts = (prompts: Prompt[]) => {
    return prompts.filter(p => {
      const matchSearch = !search || 
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        (p.description || '').toLowerCase().includes(search.toLowerCase()) ||
        p.tags?.some(tag => tag.includes(search.toLowerCase()));
      const matchTool = toolFilter === 'all' || p.tool_used === toolFilter;
      return matchSearch && matchTool;
    });
  };

  const filteredPublic = useMemo(() => filterPrompts(publicPrompts), [publicPrompts, search, toolFilter]);
  const filteredMine = useMemo(() => filterPrompts(myPrompts), [myPrompts, search, toolFilter]);

  const handleEdit = (prompt: Prompt) => {
    setEditPrompt(prompt);
    setFormOpen(true);
  };

  const handleNew = () => {
    setEditPrompt(null);
    setFormOpen(true);
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
            onView={setViewPrompt}
            onEdit={handleEdit}
            onDelete={id => setDeleteId(id)}
            onToggleVisibility={(id, pub) => toggleVisibility.mutate({ id, is_public: pub })}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="container px-4 py-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground mt-1">{t('subtitle')}</p>
        </div>
        <Button onClick={handleNew} className="gap-2 shrink-0">
          <Plus className="h-4 w-4" /> {t('newPrompt')}
        </Button>
      </div>

      {/* Search & Filter */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder={t('searchPlaceholder')}
            className="pl-9"
          />
        </div>
        <Select value={toolFilter} onValueChange={setToolFilter}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder={t('filterByTool')} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t('allTools')}</SelectItem>
            {TOOL_OPTIONS.map(tool => (
              <SelectItem key={tool} value={tool}>{tool}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="explore">
        <TabsList className="mb-4">
          <TabsTrigger value="explore">{t('tabs.explore')}</TabsTrigger>
          <TabsTrigger value="mine">{t('tabs.mine')}</TabsTrigger>
        </TabsList>

        <TabsContent value="explore">
          {renderGrid(filteredPublic, false, isLoadingPublic, t('noPublicPrompts'), t('noPublicPromptsDesc'))}
        </TabsContent>

        <TabsContent value="mine">
          {renderGrid(filteredMine, true, isLoadingMine, t('noPrompts'), t('noPromptsDesc'))}
        </TabsContent>
      </Tabs>

      {/* Modals */}
      <PromptDetailModal prompt={viewPrompt} open={!!viewPrompt} onOpenChange={open => !open && setViewPrompt(null)} />
      <PromptFormModal open={formOpen} onOpenChange={setFormOpen} editPrompt={editPrompt} />

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
