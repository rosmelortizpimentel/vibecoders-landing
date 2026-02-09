import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from '@/hooks/useTranslation';
import { 
  usePrompts, 
  usePrompt,
  COMPATIBILITY_OPTIONS, 
  INTENT_OPTIONS,
  type Prompt, 
  type PromptFile,
  type ResourceType,
  type IntentCategory
} from '@/hooks/usePrompts';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MarkdownEditor } from '@/components/markdown/MarkdownEditor';
import { FileUploader } from '@/components/prompts/FileUploader';
import { TagInput } from '@/components/prompts/TagInput';
import { MultiSelect } from '@/components/ui/multi-select';
import { ChevronLeft, Save, Loader2, Globe, Lock, ImageIcon, FileText, MessageSquare, Settings, FileCode } from 'lucide-react';
import { toast } from 'sonner';

// Reusing types from FileUploader is tricky if not exported, adapting locally or need export
interface PendingFile {
  file: File;
  id: string;
}

export default function PromptStudio() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation('prompts');
  
  // Fetch single prompt if in edit mode
  const { data: fetchedPrompt, isLoading: isLoadingPrompt } = usePrompt(id);

  const { 
    createPrompt, 
    updatePrompt, 
    uploadFile, 
    deleteFile, 
    myPrompts, 
    publicPrompts,
    isLoadingMine 
  } = usePrompts();

  // Mode: Create or Edit
  const isEditMode = !!id;
  const existingPrompt = isEditMode 
    ? (fetchedPrompt || [...myPrompts, ...publicPrompts].find(p => p.id === id)) 
    : null;

  /* State */
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [resultUrl, setResultUrl] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [isPublic, setIsPublic] = useState(false);
  
  // New Fields
  const [resourceType, setResourceType] = useState<ResourceType>('chat_prompt');
  const [intentCategory, setIntentCategory] = useState<IntentCategory>('ui_gen');
  const [compatibility, setCompatibility] = useState<string[]>([]);
  const [filename, setFilename] = useState('');
  
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  const [uploadedFiles, setUploadedFiles] = useState<PromptFile[]>([]);
  
  const [pendingResultImages, setPendingResultImages] = useState<PendingFile[]>([]);
  const [uploadedResultImages, setUploadedResultImages] = useState<PromptFile[]>([]);
  
  const [saving, setSaving] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(isEditMode);

  // Initialize data for edit mode
  useEffect(() => {
    if (isEditMode) {
      if (existingPrompt) {
        setTitle(existingPrompt.title);
        setDescription(existingPrompt.description || '');
        setResultUrl(existingPrompt.result_url || '');
        setTags(existingPrompt.tags || []);
        setIsPublic(existingPrompt.is_public);
        
        // Load new fields
        setResourceType(existingPrompt.resource_type || 'chat_prompt');
        setIntentCategory(existingPrompt.intent_category || 'ui_gen');
        setCompatibility(existingPrompt.tool_compatibility || (existingPrompt.tool_used ? [existingPrompt.tool_used] : []));
        setFilename(existingPrompt.filename || '');
        
        const attachments = (existingPrompt.prompt_files || []).filter(f => !f.file_role || f.file_role === 'attachment');
        const results = (existingPrompt.prompt_files || []).filter(f => f.file_role === 'result_image');
        
        setUploadedFiles(attachments);
        setUploadedResultImages(results);
        setLoadingInitial(false);
      } else if (!isLoadingMine && !isLoadingPrompt) {
        // ID exists but prompt not found (and not loading)
        toast.error('Resource not found');
        navigate('/prompts');
      }
    }
  }, [isEditMode, existingPrompt, isLoadingMine, isLoadingPrompt, navigate]);

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
    if (!title.trim()) {
      toast.error('Title is required');
      return;
    }
    setSaving(true);
    try {
      let promptId: string;
      const commonData = {
        title: title.trim(),
        description,
        result_url: resultUrl.trim(),
        tags,
        is_public: isPublic,
        resource_type: resourceType,
        intent_category: intentCategory,
        tool_compatibility: compatibility,
        filename: filename.trim(),
        tool_used: compatibility[0] || 'Other', // Fallback for backward compatibility
      };

      if (isEditMode && id) {
        await updatePrompt.mutateAsync({
          id,
          ...commonData,
        });
        promptId = id;
      } else {
        const created = await createPrompt.mutateAsync(commonData);
        promptId = created.id;
      }

      // Upload pending files
      for (const pf of pendingFiles) {
        await uploadFile(promptId, pf.file, 'attachment');
      }

      for (const pf of pendingResultImages) {
        await uploadFile(promptId, pf.file, 'result_image');
      }

      navigate(`/prompts/${promptId}`);
      toast.success(isEditMode ? 'Resource updated' : 'Resource created');
    } catch (err) {
      console.error('Error saving:', err);
      toast.error('Failed to save resource');
    } finally {
      setSaving(false);
    }
  };

  if (loadingInitial && isEditMode) {
    return (
      <div className="flex items-center justify-center p-12 h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const resourceTypeOptions = [
    { id: 'chat_prompt', label: t('form.chatPrompt'), icon: MessageSquare },
    { id: 'system_rule', label: t('form.systemRule'), icon: Settings },
    { id: 'file_template', label: t('form.template'), icon: FileCode },
  ];

  const compatibilityOptionsFormatted = COMPATIBILITY_OPTIONS.map(c => ({
    label: c,
    value: c
  }));

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top Navigation */}
      <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-10">
        <div className="container max-w-screen-2xl mx-auto h-14 flex items-center justify-between px-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/prompts')} className="gap-2">
              <ChevronLeft className="h-4 w-4" />
              {t('title') || 'Vault'}
            </Button>
            <Separator orientation="vertical" className="h-4" />
            <h1 className="font-semibold text-sm">
              {isEditMode ? (t('form.editTitle') || 'Edit Resource') : (t('form.createTitle') || 'New Resource')}
            </h1>
          </div>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => navigate('/prompts')} disabled={saving}>
              {t('form.cancel')}
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={saving || !title.trim()}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {saving ? t('form.saving') : t('form.save')}
            </Button>
          </div>
        </div>
      </header>
      
      <main className="flex-1 container max-w-screen-2xl mx-auto p-4 md:p-6 lg:p-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-full">
          
          {/* Left Panel: Sidebar (Metadata) - 30% */}
          <div className="lg:col-span-4 xl:col-span-3 space-y-6">
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm space-y-5 sticky top-20">
              <div className="space-y-4">
                {/* Intent (Primary Classification) */}
                <div className="space-y-1.5">
                  <Label className="text-base font-semibold">{t('form.intentLabel')}</Label>
                  <Select value={intentCategory} onValueChange={(v) => setIntentCategory(v as IntentCategory)}>
                    <SelectTrigger className="h-12 border-primary/20 bg-primary/5">
                      <SelectValue placeholder={t('form.intentPlaceholder')} />
                    </SelectTrigger>
                    <SelectContent>
                      {INTENT_OPTIONS.map(intent => (
                        <SelectItem key={intent.value} value={intent.value}>{intent.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Resource Type Toggle */}
                <div className="space-y-3 pt-2">
                   <Label>{t('form.resourceTypeLabel')}</Label>
                   <div className="grid grid-cols-3 gap-2">
                      {resourceTypeOptions.map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setResourceType(option.id as ResourceType)}
                          className={`
                            flex flex-col items-center justify-center gap-1.5 p-3 rounded-lg border text-xs font-medium transition-all
                            ${resourceType === option.id 
                              ? 'bg-primary text-primary-foreground border-primaryShadow shadow-sm' 
                              : 'bg-background border-border hover:bg-muted hover:text-foreground text-muted-foreground'}
                          `}
                        >
                          <option.icon className="h-4 w-4" />
                          <span className="text-center leading-tight">{option.label}</span>
                        </button>
                      ))}
                   </div>
                </div>

                {/* Filename (Conditional) */}
                {resourceType === 'system_rule' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Label>{t('form.filenameLabel')}</Label>
                    <Input 
                      value={filename} 
                      onChange={e => setFilename(e.target.value)} 
                      placeholder={t('form.filenamePlaceholder')}
                      className="font-mono text-sm" 
                    />
                  </div>
                )}

                <Separator />

                {/* Title */}
                <div className="space-y-1.5">
                  <Label htmlFor="title">{t('form.titleLabel')}</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={e => setTitle(e.target.value)}
                    placeholder={t('form.titlePlaceholder')}
                  />
                </div>

                {/* Compatibility (Multi-Select) */}
                <div className="space-y-1.5">
                  <Label>{t('form.compatibilityLabel')}</Label>
                  <MultiSelect
                    options={compatibilityOptionsFormatted}
                    selected={compatibility}
                    onChange={setCompatibility}
                    placeholder={t('form.compatibilityPlaceholder')}
                  />
                </div>

                {/* Tags */}
                <div className="space-y-1.5">
                  <Label>{t('form.tagsLabel')}</Label>
                  <TagInput tags={tags} onChange={setTags} placeholder={t('form.tagsPlaceholder')} />
                </div>

                {/* Visibility */}
                <div className="bg-muted/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-center justify-between mb-2">
                    <Label className="text-sm font-medium flex items-center gap-2">
                      {isPublic ? <Globe className="h-4 w-4 text-primary" /> : <Lock className="h-4 w-4 text-muted-foreground" />}
                      {t('form.publicLabel')}
                    </Label>
                    <Switch checked={isPublic} onCheckedChange={setIsPublic} />
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {isPublic ? t('form.publicDesc') : "Only you can see this. Toggle to share."}
                  </p>
                </div>
              </div>
            </div>

            {/* Attachments Section */}
            <div className="bg-card border border-border rounded-xl p-5 shadow-sm mt-6">
              <h3 className="font-medium mb-3 flex items-center gap-2">
                 <FileText className="h-4 w-4" />
                 {t('form.attachmentsLabel')}
              </h3>
              <FileUploader
                pendingFiles={pendingFiles}
                onAddFiles={handleAddFiles}
                onRemovePending={handleRemovePending}
                uploadedFiles={uploadedFiles}
                onRemoveUploaded={handleRemoveUploaded}
                uploading={saving}
              />
            </div>
          </div>

          {/* Right Panel: Main Stage (Editor & Evidence) - 70% */}
          <div className="lg:col-span-8 xl:col-span-9 flex flex-col h-full min-h-[600px]">
            <Tabs defaultValue="editor" className="flex-1 flex flex-col">
              <TabsList className="w-full justify-start h-12 bg-transparent border-b border-border rounded-none p-0 mb-6 gap-6">
                <TabsTrigger 
                  value="editor" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2 text-base"
                >
                  Editor
                </TabsTrigger>
                <TabsTrigger 
                  value="results" 
                  className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-primary rounded-none h-full px-2 text-base"
                >
                  {t('detail.results') || 'Results & Evidence'}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="editor" className="flex-1 mt-0">
                <div className="space-y-2 h-full flex flex-col">
                  <div className="flex items-center justify-between text-xs text-muted-foreground mb-2 px-1">
                    <span>Markdown supported</span>
                    <span>Tip: Use [VARIABLE] to define dynamic inputs</span>
                  </div>
                  <div className="flex-1 min-h-[500px] border border-border rounded-xl overflow-hidden bg-card shadow-sm">
                    <MarkdownEditor
                      value={description}
                      onChange={setDescription}
                      placeholder={t('form.contentPlaceholder')}
                      className="h-full border-0 focus-visible:ring-0"
                    />
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="results" className="flex-1 mt-0">
                <div className="bg-card border border-border rounded-xl p-6 shadow-sm h-full">
                  <div className="max-w-2xl mx-auto space-y-8">
                    {/* Live URL */}
                    <div className="space-y-3">
                      <Label className="text-base font-medium">Result URL (Live Demo)</Label>
                      <Input
                        value={resultUrl}
                        onChange={e => setResultUrl(e.target.value)}
                        placeholder="https://v0.dev/..."
                        className="h-11"
                      />
                      <p className="text-xs text-muted-foreground">
                        Link to a deployed version or live preview.
                      </p>
                    </div>

                    <Separator />

                    {/* Gallery */}
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label className="text-base font-medium flex items-center gap-2">
                          <ImageIcon className="h-4 w-4" />
                          Result Gallery
                        </Label>
                        <Badge variant="outline">Screenshots</Badge>
                      </div>
                      
                      <div className="min-h-[200px]">
                        <FileUploader
                          pendingFiles={pendingResultImages}
                          onAddFiles={handleAddResultImages}
                          onRemovePending={handleRemovePendingResultImage}
                          uploadedFiles={uploadedResultImages}
                          onRemoveUploaded={handleRemoveUploadedResultImage}
                          uploading={saving}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
}
