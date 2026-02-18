import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MarkdownEditor } from '@/components/beta/MarkdownEditor';
import { Loader2, Trash2, Save } from 'lucide-react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

export interface Idea {
  id: string;
  title: string;
  description: string | null;
  created_at?: string;
  display_order?: number;
  is_done?: boolean;
}

interface IdeaDetailProps {
  idea: Idea | null;
  onSave: (idea: Partial<Idea>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  onCancel: () => void;
  onDirtyChange: (isDirty: boolean) => void;
  isSaving: boolean;
}

export function IdeaDetail({
  idea,
  onSave,
  onDelete,
  onCancel,
  onDirtyChange,
  isSaving
}: IdeaDetailProps) {
  const { t } = useTranslation('profile');
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  
  useEffect(() => {
    if (idea) {
      setTitle(idea.title || '');
      setDescription(idea.description || '');
    } else {
      setTitle('');
      setDescription('');
    }
  }, [idea]);

  useEffect(() => {
    const originalTitle = idea?.title || '';
    const originalDesc = idea?.description || '';
    const isDirty = title !== originalTitle || description !== originalDesc;
    onDirtyChange(isDirty);
  }, [title, description, idea, onDirtyChange]);

  const handleSave = async () => {
    if (!title.trim()) return;
    await onSave({
      id: idea?.id,
      title,
      description
    });
  };

  const isNew = !idea?.id;

  return (
    <div className="h-full flex flex-col bg-card rounded-lg border border-border overflow-hidden">
      <div className="flex-1 p-4 md:p-6 space-y-4 md:space-y-6 overflow-y-auto">
        <div className="space-y-2">
          <label htmlFor="title" className="text-sm font-medium leading-none">
            {t('ideas.titleLabel')} <span className="text-destructive">*</span>
          </label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={t('ideas.titlePlaceholder')}
            className="font-medium text-lg"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="description" className="text-sm font-medium leading-none">
            {t('ideas.descriptionLabel')}
          </label>
          <MarkdownEditor
            value={description}
            onChange={(val) => {
              setDescription(val);
              onDirtyChange(true);
            }}
            placeholder={t('ideas.descriptionPlaceholder')}
            className="min-h-[200px]"
          />
        </div>
      </div>

      <div className="p-3 md:p-4 border-t border-border bg-muted/30 flex justify-between items-center gap-2">
        <div>
          {!isNew && (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t('ideas.confirmDeleteTitle')}</AlertDialogTitle>
                  <AlertDialogDescription>{t('ideas.confirmDeleteMessage')}</AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>{t('ideas.cancel')}</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => idea && onDelete(idea.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {t('ideas.delete')}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </div>

        <div className="flex gap-2">
          <Button variant="ghost" onClick={onCancel} disabled={isSaving} size="sm" className="md:size-default">
            {t('ideas.cancel')}
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !title.trim()} size="sm" className="md:size-default">
            {isSaving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {t('saving')}
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                {t('ideas.save')}
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
