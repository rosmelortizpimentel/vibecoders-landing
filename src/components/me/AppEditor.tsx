import { useRef, useState, useCallback, useEffect } from 'react';
import { AppData } from '@/hooks/useApps';
import { useTranslation } from '@/hooks/useTranslation';
import { useCategories } from '@/hooks/useCategories';
import { useStatuses } from '@/hooks/useStatuses';
import { useTechStacks } from '@/hooks/useTechStacks';
import { useAutoSave } from '@/hooks/useAutoSave';
import { DebouncedInput, DebouncedTextarea } from '@/components/ui/debounced-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Plus } from 'lucide-react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TechStackSelector } from './TechStackSelector';
import { Camera, Trash2, ChevronUp, Clock, Lightbulb, Hammer, Shield } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';
import { VerifyDomainModal } from './VerifyDomainModal';
import { useNavigate } from 'react-router-dom';
import { TagInput } from '@/components/ui/tag-input';
import { MarkdownEditor } from '@/components/beta/MarkdownEditor';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface AppEditorProps {
  app: AppData;
  onUpdate: (id: string, updates: Partial<AppData>) => Promise<void>;
  onUploadLogo: (appId: string, file: File) => Promise<string>;
  onUploadScreenshot: (appId: string, file: File) => Promise<string>;
  onDelete: () => void;
  onVerify: () => Promise<{ success: boolean; message?: string; error?: string }>;
}

 export function AppEditor({ app, onUpdate, onUploadLogo, onUploadScreenshot, onDelete, onVerify }: AppEditorProps) {
  const { categories } = useCategories();
   const { statuses } = useStatuses();
   const { t } = useTranslation('apps');
   const navigate = useNavigate();
  const { groupedStacks, stacks } = useTechStacks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  
  const [localApp, setLocalApp] = useState(app);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Sync local state when prop changes (e.g., after a remote update)
  useEffect(() => {
    setLocalApp(app);
  }, [app]);

  const saveApp = useCallback(async (data: Partial<AppData>) => {
    await onUpdate(app.id, data);
  }, [app.id, onUpdate]);

  const { save: autoSave, isSaving } = useAutoSave(saveApp);

  const handleChange = (field: keyof AppData, value: unknown) => {
    const updates = { [field]: value };
    setLocalApp(prev => ({ ...prev, ...updates }));
    autoSave(updates);
  };

  const handleStackToggle = (stackId: string) => {
    const currentStacks = localApp.stacks || [];
    const newStacks = currentStacks.includes(stackId)
      ? currentStacks.filter(id => id !== stackId)
      : [...currentStacks, stackId];
    
    setLocalApp(prev => ({ ...prev, stacks: newStacks }));
    autoSave({ stacks: newStacks });
  };

  const handleLogoClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const url = await onUploadLogo(app.id, file);
        setLocalApp(prev => ({ ...prev, logo_url: url }));
      } catch (error) {
        console.error('Error uploading logo:', error);
      }
    }
  };

  const handleScreenshotClick = () => {
    screenshotInputRef.current?.click();
  };

  const handleScreenshotFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && (localApp.screenshots?.length || 0) < 5) {
      try {
        const url = await onUploadScreenshot(app.id, file);
        const newScreenshots = [...(localApp.screenshots || []), url];
        setLocalApp(prev => ({ ...prev, screenshots: newScreenshots }));
        autoSave({ screenshots: newScreenshots });
      } catch (error) {
        console.error('Error uploading screenshot:', error);
      }
    }
  };

  const handleDeleteScreenshot = (url: string) => {
    const newScreenshots = (localApp.screenshots || []).filter(s => s !== url);
    setLocalApp(prev => ({ ...prev, screenshots: newScreenshots }));
    autoSave({ screenshots: newScreenshots });
  };

  const getIcon = (iconName: string) => {
    const pascalCase = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[pascalCase];
  };

   const handleVerificationSuccess = () => {
     // We don't manually set local state here because auto-save would try to persist it,
     // which is blocked by RLS for security. The verifyApp function already
     // invalidates the query to show the updated state from the server.
   };
 
   const formatVerifiedDate = (dateStr: string | null) => {
     if (!dateStr) return '';
     try {
       return new Date(dateStr).toLocaleDateString('es-ES', {
         day: 'numeric',
         month: 'short',
         year: 'numeric',
       });
     } catch {
       return '';
     }
   };
 
  const descriptionLength = localApp.description?.length || 0;

  return (
    <div className="w-full max-w-full">
      {/* Hidden file inputs */}
      <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />

      {/* Saving indicator */}
      {isSaving && (
        <div className="flex items-center gap-1 text-xs text-muted-foreground mb-3">
          <Clock className="h-3 w-3 animate-pulse" />
          Guardando...
        </div>
      )}

      {/* Form with Sections as Cards */}
      <div className="space-y-6">
        {/* 1. Identidad */}
        <div className="bg-background border border-border/60 shadow-sm rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Identidad</h3>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-6">
            {/* Logo */}
            <div className="space-y-2">
              <Label className="text-foreground text-xs font-semibold">Logo</Label>
              <div 
                className="relative group w-20 h-20 rounded-xl bg-muted/30 flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer hover:border-primary/40 transition-all shadow-inner"
                onClick={handleLogoClick}
              >
                {localApp.logo_url ? (
                  <img src={localApp.logo_url} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary transition-colors" />
                )}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <Camera className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
            </div>

            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-foreground text-xs font-semibold">Nombre</Label>
                  <DebouncedInput
                    value={localApp.name || ''}
                    onValueChange={value => handleChange('name', value)}
                    placeholder="Nombre de la app"
                    className="text-sm border-border bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-foreground text-xs font-semibold">URL *</Label>
                  <DebouncedInput
                    value={localApp.url}
                    onValueChange={value => handleChange('url', value)}
                    placeholder="https://tu-app.com"
                    type="url"
                    className="text-sm border-border bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
                  />
                </div>
              </div>

              {/* Tagline */}
              <div className="space-y-2">
                <Label className="text-foreground text-xs font-semibold">Tagline</Label>
                <div className="relative">
                  <DebouncedInput
                    value={localApp.tagline || ''}
                    onValueChange={value => handleChange('tagline', value.slice(0, 100))}
                    placeholder="Una frase corta que describa tu app"
                    maxLength={100}
                    className="text-sm border-border bg-background placeholder:text-muted-foreground focus:border-primary focus:ring-primary w-full max-w-full pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground tabular-nums">
                    {localApp.tagline?.length || 0}/100
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Detalles */}
        <div className="bg-background border border-border/60 shadow-sm rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Detalles</h3>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-foreground text-xs font-semibold">Descripción</Label>
              <span className="text-[10px] text-muted-foreground tabular-nums">{descriptionLength}/500</span>
            </div>
            <MarkdownEditor
              value={localApp.description || ''}
              onChange={value => handleChange('description', value.slice(0, 500))}
              placeholder="Describe qué hace tu app, para quién es, qué problema resuelve..."
              className="text-sm border-border"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label className="text-foreground text-xs font-semibold">Categoría</Label>
              <Select
                value={localApp.category_id || ''}
                onValueChange={value => handleChange('category_id', value || null)}
              >
                <SelectTrigger className="text-sm border-border bg-background text-foreground hover:bg-muted/30 transition-colors">
                  <SelectValue placeholder="Selecciona una categoría" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => {
                    const Icon = getIcon(cat.icon);
                    return (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4" />}
                          {cat.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-foreground text-xs font-semibold">Estado de Desarrollo</Label>
              <Select
                value={localApp.status_id || 'none'}
                onValueChange={value => handleChange('status_id', value === 'none' ? null : value)}
              >
                <SelectTrigger className="text-sm border-border bg-background text-foreground hover:bg-muted/30 transition-colors">
                  <SelectValue placeholder="Selecciona un estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">
                    <span className="flex items-center gap-2">
                      <div className="h-4 w-4 rounded-full border border-border bg-muted" />
                      {t('none')}
                    </span>
                  </SelectItem>
                  {statuses.map(status => {
                    const Icon = getIcon(status.icon);
                    return (
                      <SelectItem key={status.id} value={status.id}>
                        <span className="flex items-center gap-2">
                          {Icon && <Icon className="h-4 w-4" style={{ color: status.color }} />}
                          {status.name}
                        </span>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hours - Hidden as requested */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 hidden">
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground text-xs font-semibold">
                <Lightbulb className="h-3.5 w-3.5 text-muted-foreground" />
                Horas ideación
              </Label>
              <Input
                type="number"
                min={0}
                value={localApp.hours_ideation || ''}
                onChange={e => handleChange('hours_ideation', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="text-sm border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-foreground text-xs font-semibold">
                <Hammer className="h-3.5 w-3.5 text-muted-foreground" />
                Horas construcción
              </Label>
              <Input
                type="number"
                min={0}
                value={localApp.hours_building || ''}
                onChange={e => handleChange('hours_building', parseInt(e.target.value) || 0)}
                placeholder="0"
                className="text-sm border-border bg-background text-foreground placeholder:text-muted-foreground focus:border-primary focus:ring-primary"
              />
            </div>
          </div>
        </div>

        {/* 3. Metadatos */}
        <div className="bg-background border border-border/60 shadow-sm rounded-xl p-6 space-y-6">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-1.5 h-4 bg-primary rounded-full" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Metadatos</h3>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label className="text-foreground text-xs font-semibold">Tags (máx. 5)</Label>
            <TagInput
              tags={localApp.tags || []}
              maxTags={5}
              onAddTag={(tag) => {
                const newTags = [...(localApp.tags || []), tag];
                handleChange('tags', newTags);
              }}
              onRemoveTag={(tag) => {
                const newTags = (localApp.tags || []).filter(t => t !== tag);
                handleChange('tags', newTags);
              }}
            />
          </div>

          {/* Tech Stack */}
          <div className="space-y-3">
            <Label className="text-foreground text-xs font-semibold">Stack Tecnológico</Label>
            <TechStackSelector
              stacks={stacks}
              groupedStacks={groupedStacks}
              selectedIds={localApp.stacks || []}
              onToggle={handleStackToggle}
            />
          </div>
        </div>

        {/* 4. Media */}
        <div className="bg-background border border-border/60 shadow-sm rounded-xl p-6 space-y-6">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-4 bg-primary rounded-full" />
              <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Media</h3>
            </div>
            <span className="text-[10px] text-muted-foreground font-medium">{localApp.screenshots?.length || 0}/5 pantallas</span>
          </div>
          
          <div className="space-y-4">
            {localApp.screenshots && localApp.screenshots.length > 0 ? (
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide touch-pan-x">
                {localApp.screenshots.map((url, idx) => (
                  <div key={idx} className="relative flex-shrink-0 w-48 h-28 rounded-xl overflow-hidden border border-border bg-muted/30 group shadow-sm transition-all hover:border-primary/30">
                    <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors" />
                    <button
                      onClick={() => handleDeleteScreenshot(url)}
                      className="absolute top-2 right-2 p-1.5 bg-background/90 rounded-full shadow-md opacity-0 group-hover:opacity-100 transition-all hover:bg-destructive hover:text-white"
                      title="Eliminar pantalla"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
                {(localApp.screenshots?.length || 0) < 5 && (
                  <button 
                    onClick={handleScreenshotClick}
                    className="flex-shrink-0 w-48 h-28 rounded-xl border-2 border-dashed border-muted-foreground/20 bg-muted/5 flex flex-col items-center justify-center gap-2 hover:border-primary/40 hover:bg-primary/5 transition-all group"
                  >
                    <div className="p-2 rounded-full bg-background border border-border group-hover:border-primary/20 shadow-sm">
                      <Plus className="h-4 w-4 text-muted-foreground group-hover:text-primary" />
                    </div>
                    <span className="text-[10px] font-bold text-muted-foreground group-hover:text-primary uppercase tracking-tight">Añadir captura</span>
                  </button>
                )}
              </div>
            ) : (
              <div 
                onClick={handleScreenshotClick}
                className="border-2 border-dashed border-border rounded-xl p-8 flex flex-col items-center justify-center gap-3 bg-muted/10 hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer group"
              >
                <div className="p-3 rounded-full bg-background border border-border group-hover:border-primary/20 shadow-sm">
                  <Camera className="h-6 w-6 text-muted-foreground group-hover:text-primary" />
                </div>
                <div className="text-center">
                  <p className="text-xs font-bold text-foreground group-hover:text-primary uppercase tracking-tight">Subir capturas</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Sube hasta 5 capturas de pantalla de tu aplicación</p>
                </div>
              </div>
            )}
            <input
              ref={screenshotInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleScreenshotFileChange}
            />
          </div>
        </div>

        {/* Verification & Action Bar */}
        <div className="bg-background border border-border/60 shadow-sm rounded-xl p-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center border-2 transition-colors",
                localApp.is_verified ? "bg-primary/10 border-primary/20 text-primary" : "bg-muted border-border text-muted-foreground"
              )}>
                <Shield className={cn("h-6 w-6", localApp.is_verified ? "animate-in zoom-in-50 duration-500" : "")} />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-bold">Verificación de App</h4>
                  <VerificationBadge isVerified={localApp.is_verified} />
                </div>
                <p className="text-xs text-muted-foreground">
                  {localApp.is_verified 
                    ? `Verificado correctamente el ${formatVerifiedDate(localApp.verified_at)}`
                    : 'Verifica la propiedad de este dominio para obtener el distintivo de confianza.'
                  }
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 w-full sm:w-auto">
              {!localApp.is_verified && (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setShowVerifyModal(true)}
                  className="flex-1 sm:flex-none border-primary text-primary hover:bg-primary/5 font-bold text-xs h-9 px-4 rounded-lg"
                >
                  Verificar Propiedad
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="flex-1 sm:flex-none text-destructive hover:text-destructive hover:bg-destructive/10 font-bold text-xs h-9 px-4 rounded-lg"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                Eliminar App
              </Button>
            </div>
          </div>
        </div>
      </div>
       
       {/* Verify Modal */}
       <VerifyDomainModal
         open={showVerifyModal}
         onOpenChange={setShowVerifyModal}
         appName={localApp.name || ''}
         appUrl={localApp.url}
         verificationToken={localApp.verification_token}
         onVerify={onVerify}
         onSuccess={handleVerificationSuccess}
       />

       {/* Delete Confirm Dialog */}
       <Dialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{t('deleteConfirmTitle')}</DialogTitle>
             <DialogDescription>{t('deleteConfirmDescription')}</DialogDescription>
           </DialogHeader>
           <div className="flex justify-end gap-3 mt-4">
             <Button variant="ghost" onClick={() => setShowDeleteConfirm(false)}>{t('cancel')}</Button>
             <Button variant="destructive" onClick={() => { setShowDeleteConfirm(false); onDelete(); }}>{t('delete')}</Button>
           </div>
         </DialogContent>
       </Dialog>
    </div>
  );
}
