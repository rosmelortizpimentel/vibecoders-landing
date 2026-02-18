import { useRef, useState, useCallback } from 'react';
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
import { Camera, Trash2, ChevronUp, Clock, Lightbulb, Hammer, Shield, Map } from 'lucide-react';
import * as LucideIcons from 'lucide-react';
import { VerificationBadge } from './VerificationBadge';
import { VerifyDomainModal } from './VerifyDomainModal';
import { useNavigate } from 'react-router-dom';
import { TagInput } from '@/components/ui/tag-input';
import { MarkdownEditor } from '@/components/beta/MarkdownEditor';

interface AppEditorProps {
  app: AppData;
  onUpdate: (id: string, updates: Partial<AppData>) => Promise<void>;
  onUploadLogo: (appId: string, file: File) => Promise<string>;
  onUploadScreenshot: (appId: string, file: File) => Promise<string>;
  onDelete: () => void;
  onCollapse: () => void;
   onVerify: () => Promise<{ success: boolean; message?: string; error?: string }>;
}

 export function AppEditor({ app, onUpdate, onUploadLogo, onUploadScreenshot, onDelete, onCollapse, onVerify }: AppEditorProps) {
  const { categories } = useCategories();
   const { statuses } = useStatuses();
   const { t } = useTranslation('apps');
   const navigate = useNavigate();
  const { groupedStacks, stacks } = useTechStacks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const screenshotInputRef = useRef<HTMLInputElement>(null);
  
  const [localApp, setLocalApp] = useState(app);
   const [showVerifyModal, setShowVerifyModal] = useState(false);

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
     setLocalApp(prev => ({ 
       ...prev, 
       is_verified: true, 
       verified_at: new Date().toISOString() 
     }));
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
    <div className="w-full max-w-full border border-[#3D5AFE] rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 bg-[#3D5AFE]/5 border-b border-[#3D5AFE]/20">
        <div className="flex items-center gap-3 flex-1 min-w-0">
          {/* Logo */}
          <div 
            className="relative group w-12 h-12 rounded-lg bg-gray-100 flex-shrink-0 flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleLogoClick}
          >
            {localApp.logo_url ? (
              <img src={localApp.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-5 w-5 text-gray-400 group-hover:text-[#3D5AFE] transition-colors" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          
          <div className="min-w-0 flex-1">
            <h3 className="font-medium text-[#1c1c1c] truncate">{localApp.name || 'Nueva App'}</h3>
            <p className="text-xs text-gray-500 truncate">{localApp.url}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-gray-500 flex items-center gap-1">
              <Clock className="h-3 w-3 animate-pulse" />
              Guardando...
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={onCollapse} className="text-gray-500 hover:text-[#1c1c1c]">
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-3 sm:p-4 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#1c1c1c]">Nombre</Label>
            <DebouncedInput
              value={localApp.name || ''}
              onValueChange={value => handleChange('name', value)}
              placeholder="Nombre de la app"
              className="text-sm border-gray-300 bg-white placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#1c1c1c]">URL *</Label>
            <DebouncedInput
              value={localApp.url}
              onValueChange={value => handleChange('url', value)}
              placeholder="https://tu-app.com"
              type="url"
              className="text-sm border-gray-300 bg-white placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label className="text-[#1c1c1c]">Tagline</Label>
          <DebouncedInput
            value={localApp.tagline || ''}
            onValueChange={value => handleChange('tagline', value.slice(0, 100))}
            placeholder="Una frase corta que describa tu app"
            maxLength={100}
            className="text-sm border-gray-300 bg-white placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE] w-full max-w-full"
          />
          <p className="text-xs text-gray-500 text-right">{localApp.tagline?.length || 0}/100</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <Label className="text-[#1c1c1c]">Descripción</Label>
          <MarkdownEditor
            value={localApp.description || ''}
            onChange={value => handleChange('description', value.slice(0, 500))}
            placeholder="Describe qué hace tu app, para quién es, qué problema resuelve..."
            className="text-sm"
          />
          <p className="text-xs text-gray-500 text-right">{descriptionLength}/500</p>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#1c1c1c]">Categoría</Label>
            <Select
              value={localApp.category_id || ''}
              onValueChange={value => handleChange('category_id', value || null)}
            >
              <SelectTrigger className="text-sm border-gray-300 bg-white text-[#1c1c1c]">
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
            <Label className="text-[#1c1c1c]">Estado</Label>
            <Select
              value={localApp.status_id || 'none'}
              onValueChange={value => handleChange('status_id', value === 'none' ? null : value)}
            >
              <SelectTrigger className="text-sm border-gray-300 bg-white text-[#1c1c1c]">
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="flex items-center gap-2">
                    <div className="h-4 w-4 rounded-full border border-gray-200 bg-gray-50" />
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

        {/* Hours */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-[#1c1c1c]">
              <Lightbulb className="h-4 w-4 text-gray-500" />
              Horas ideación
            </Label>
            <Input
              type="number"
              min={0}
              value={localApp.hours_ideation || ''}
              onChange={e => handleChange('hours_ideation', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="text-sm border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2 text-[#1c1c1c]">
              <Hammer className="h-4 w-4 text-gray-500" />
              Horas construcción
            </Label>
            <Input
              type="number"
              min={0}
              value={localApp.hours_building || ''}
              onChange={e => handleChange('hours_building', parseInt(e.target.value) || 0)}
              placeholder="0"
              className="text-sm border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <Label className="text-[#1c1c1c]">Tags</Label>
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
        <TechStackSelector
          stacks={stacks}
          groupedStacks={groupedStacks}
          selectedIds={localApp.stacks || []}
          onToggle={handleStackToggle}
        />

        {/* Screenshots */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label className="text-[#1c1c1c]">Screenshots ({localApp.screenshots?.length || 0}/5)</Label>
            {(localApp.screenshots?.length || 0) < 5 && (
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleScreenshotClick}
                className="text-[#3D5AFE] hover:bg-[#3D5AFE]/5"
              >
                <Plus className="h-4 w-4 mr-2" />
                Subir captura
              </Button>
            )}
            <input
              ref={screenshotInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleScreenshotFileChange}
            />
          </div>
          
          {localApp.screenshots && localApp.screenshots.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {localApp.screenshots.map((url, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-32 h-20 rounded-lg overflow-hidden border border-gray-200 bg-gray-50 group">
                  <img src={url} alt={`Screenshot ${idx + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => handleDeleteScreenshot(url)}
                    className="absolute top-1 right-1 p-1 bg-white/80 rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center gap-2 bg-gray-50/50">
              <Camera className="h-6 w-6 text-gray-300" />
              <p className="text-xs text-gray-400">Sin capturas opcionales</p>
            </div>
          )}
        </div>

        <Separator />

        {/* Delete */}
        <div className="pt-4 space-y-4">
          {/* Verification Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <VerificationBadge isVerified={localApp.is_verified} />
              <span className="text-sm text-muted-foreground">
                {localApp.is_verified 
                  ? `Verificado el ${formatVerifiedDate(localApp.verified_at)}`
                  : 'Verifica la propiedad de este dominio'
                }
              </span>
            </div>
            {!localApp.is_verified && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => setShowVerifyModal(true)}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Shield className="h-4 w-4 mr-2" />
                Verificar
              </Button>
            )}
          </div>

          {/* Roadmap Button - Only for verified apps */}
          {localApp.is_verified && (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Map className="h-4 w-4 text-primary" />
                <span className="text-sm text-muted-foreground">
                  Gestiona el roadmap público de tu app
                </span>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => navigate(`/roadmap-editor/${app.id}`)}
                className="border-primary text-primary hover:bg-primary/10"
              >
                <Map className="h-4 w-4 mr-2" />
                Roadmap
              </Button>
            </div>
          )}

          <Button
            variant="ghost"
            className="text-destructive hover:text-destructive hover:bg-destructive/10"
            onClick={onDelete}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar app
          </Button>
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
    </div>
  );
}
