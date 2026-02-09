import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { MarkdownEditor } from '@/components/beta/MarkdownEditor';
import { TagInput } from './TagInput';
import { FileUploader } from './FileUploader';
import { usePrompts, TOOL_OPTIONS } from '@/hooks/usePrompts';
import type { Prompt, PromptFile } from '@/hooks/usePrompts';
import { Loader2 } from 'lucide-react';

interface PromptFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  editPrompt?: Prompt | null;
}

interface PendingFile {
  file: File;
  id: string;
}

export function PromptFormModal({ open, onOpenChange, editPrompt }: PromptFormModalProps) {
  const { t } = useTranslation('prompts');
  const { createPrompt, updatePrompt, uploadFile, deleteFile } = usePrompts();

  /* State */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [toolUsed, setToolUsed] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<PromptFile[]>([]);
  
  const [pendingResultImages, setPendingResultImages] = useState<PendingFile[]>([]);
  const [uploadedResultImages, setUploadedResultImages] = useState<PromptFile[]>([]);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      if (editPrompt) {
        setTitle(editPrompt.title);
        setDescription(editPrompt.description || '');
        setResultUrl(editPrompt.result_url || '');
        setToolUsed(editPrompt.tool_used || '');
        setTags(editPrompt.tags || []);
        setIsPublic(editPrompt.is_public);
        
        // Split files by role
        const attachments = (editPrompt.prompt_files || []).filter(f => !f.file_role || f.file_role === 'attachment');
        const results = (editPrompt.prompt_files || []).filter(f => f.file_role === 'result_image');
        
        setUploadedFiles(attachments);
        setUploadedResultImages(results);
      } else {
        setTitle('');
        setDescription('');
        setResultUrl('');
        setToolUsed('');
        setTags([]);
        setIsPublic(false);
        setUploadedFiles([]);
        setUploadedResultImages([]);
      }
      setPendingFiles([]);
      setPendingResultImages([]);
    }
  }, [open, editPrompt]);

  const handleAddFiles = (files: File[]) => {
    const newPending = files.map(f => ({ file: f, id: crypto.randomUUID() }));
    setPendingFiles(prev => [...prev, ...newPending]);
  };

  const handleAddResultImages = (files: File[]) => {
    const newPending = files.map(f => ({ file: f, id: crypto.randomUUID() }));
    setPendingResultImages(prev => [...prev, ...newPending]);
  };

  const handleRemovePending = (id: string) => {
    setPendingFiles(prev => prev.filter(p => p.id !== id));
  };

  const handleRemovePendingResultImage = (id: string) => {
    setPendingResultImages(prev => prev.filter(p => p.id !== id));
  };

  const handleRemoveUploaded = async (id: string, url: string) => {
    await deleteFile(id, url);
    setUploadedFiles(prev => prev.filter(f => f.id !== id));
  };

  const handleRemoveUploadedResultImage = async (id: string, url: string) => {
    await deleteFile(id, url);
    setUploadedResultImages(prev => prev.filter(f => f.id !== id));
  };

  const handleSubmit = async () => {
    if (!title.trim()) return;
    setSaving(true);
    try {
      let promptId: string;
      const commonData = {
        title: title.trim(),
        description,
        result_url: resultUrl.trim(),
        tags,
        tool_used: toolUsed,
        is_public: isPublic,
      };

      if (editPrompt) {
        await updatePrompt.mutateAsync({
          id: editPrompt.id,
          ...commonData,
        });
        promptId = editPrompt.id;
      } else {
        const created = await createPrompt.mutateAsync(commonData);
        promptId = created.id;
      }

      // Upload pending attachment files
      for (const pf of pendingFiles) {
        await uploadFile(promptId, pf.file, 'attachment');
      }

      // Upload pending result images
      for (const pf of pendingResultImages) {
        await uploadFile(promptId, pf.file, 'result_image');
      }

      onOpenChange(false);
    } catch (err) {
      console.error('Error saving prompt:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="px-6 pt-6 pb-0">
          <DialogTitle>{editPrompt ? t('form.editTitle') : t('form.createTitle')}</DialogTitle>
        </DialogHeader>

        <ScrollArea className="flex-1 px-6 py-4">
          <div className="space-y-4">
            {/* Title */}
            <div className="space-y-1.5">
              <Label>{t('form.titleLabel')}</Label>
              <Input
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder={t('form.titlePlaceholder')}
              />
            </div>

            {/* Tool */}
            <div className="space-y-1.5">
              <Label>{t('form.toolLabel')}</Label>
              <Select value={toolUsed} onValueChange={setToolUsed}>
                <SelectTrigger>
                  <SelectValue placeholder={t('form.toolPlaceholder')} />
                </SelectTrigger>
                <SelectContent>
                  {TOOL_OPTIONS.map(tool => (
                    <SelectItem key={tool} value={tool}>{tool}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Result URL (Live Demo) */}
            <div className="space-y-1.5">
              <Label>Result URL (Live Demo)</Label>
              <Input
                value={resultUrl}
                onChange={e => setResultUrl(e.target.value)}
                placeholder="https://..."
              />
            </div>

            {/* Content */}
            <div className="space-y-1.5">
              <Label>{t('form.contentLabel')}</Label>
              <div className="text-xs text-muted-foreground mb-1">
                Tip: Use brackets like [PROJECT_NAME] to define dynamic variables.
              </div>
              <MarkdownEditor
                value={description}
                onChange={setDescription}
                placeholder={t('form.contentPlaceholder')}
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <Label>{t('form.tagsLabel')}</Label>
              <TagInput tags={tags} onChange={setTags} placeholder={t('form.tagsPlaceholder')} />
            </div>

            {/* Result Images */}
            <div className="space-y-1.5">
              <Label>Result Gallery (Screenshots)</Label>
              <FileUploader
                pendingFiles={pendingResultImages}
                onAddFiles={handleAddResultImages}
                onRemovePending={handleRemovePendingResultImage}
                uploadedFiles={uploadedResultImages}
                onRemoveUploaded={handleRemoveUploadedResultImage}
                uploading={saving}
              />
            </div>

            {/* Attachments */}
            <div className="space-y-1.5">
              <Label>{t('form.attachmentsLabel')}</Label>
              <FileUploader
                pendingFiles={pendingFiles}
                onAddFiles={handleAddFiles}
                onRemovePending={handleRemovePending}
                uploadedFiles={uploadedFiles}
                onRemoveUploaded={handleRemoveUploaded}
                uploading={saving}
              />
            </div>

            {/* Public toggle */}
            <div className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
              <div>
                <p className="text-sm font-medium">{t('form.publicLabel')}</p>
                <p className="text-xs text-muted-foreground">{t('form.publicDesc')}</p>
              </div>
              <Switch checked={isPublic} onCheckedChange={setIsPublic} />
            </div>
          </div>
        </ScrollArea>

        <DialogFooter className="px-6 py-4 border-t border-border gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            {t('form.cancel')}
          </Button>
          <Button onClick={handleSubmit} disabled={saving || !title.trim()}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {saving ? t('form.saving') : t('form.save')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
