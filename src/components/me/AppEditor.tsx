import { useRef, useState, useCallback, useEffect } from 'react';
import { AppData } from '@/hooks/useApps';
import { useCategories } from '@/hooks/useCategories';
import { useStatuses } from '@/hooks/useStatuses';
import { useTechStacks } from '@/hooks/useTechStacks';
import { useAutoSave } from '@/hooks/useAutoSave';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Camera, Trash2, ChevronUp, Clock, Lightbulb, Hammer, Check } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface AppEditorProps {
  app: AppData;
  onUpdate: (id: string, updates: Partial<AppData>) => Promise<void>;
  onUploadLogo: (appId: string, file: File) => Promise<string>;
  onDelete: () => void;
  onCollapse: () => void;
}

export function AppEditor({ app, onUpdate, onUploadLogo, onDelete, onCollapse }: AppEditorProps) {
  const { categories } = useCategories();
  const { statuses } = useStatuses();
  const { groupedStacks, stacks } = useTechStacks();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [localApp, setLocalApp] = useState(app);

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

  const getIcon = (iconName: string) => {
    const pascalCase = iconName
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
    return (LucideIcons as unknown as Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>>)[pascalCase];
  };

  const descriptionLength = localApp.description?.length || 0;

  return (
    <div className="border-2 border-primary rounded-lg bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-primary/5 border-b border-primary/20">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div 
            className="relative group w-12 h-12 rounded-lg bg-muted flex items-center justify-center overflow-hidden cursor-pointer"
            onClick={handleLogoClick}
          >
            {localApp.logo_url ? (
              <img src={localApp.logo_url} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Camera className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </div>
          
          <div>
            <h3 className="font-medium">{localApp.name || 'Nueva App'}</h3>
            <p className="text-xs text-muted-foreground">{localApp.url}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isSaving && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Clock className="h-3 w-3 animate-pulse" />
              Guardando...
            </span>
          )}
          <Button variant="ghost" size="icon" onClick={onCollapse}>
            <ChevronUp className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Form */}
      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Nombre</Label>
            <Input
              value={localApp.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Nombre de la app"
            />
          </div>
          <div className="space-y-2">
            <Label>URL *</Label>
            <Input
              value={localApp.url}
              onChange={e => handleChange('url', e.target.value)}
              placeholder="https://tu-app.com"
              type="url"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label>Tagline</Label>
          <Input
            value={localApp.tagline || ''}
            onChange={e => handleChange('tagline', e.target.value.slice(0, 100))}
            placeholder="Una frase corta que describa tu app"
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground text-right">{localApp.tagline?.length || 0}/100</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label>Descripción</Label>
            <span className="text-xs text-muted-foreground">Soporta markdown básico</span>
          </div>
          <Textarea
            value={localApp.description || ''}
            onChange={e => handleChange('description', e.target.value.slice(0, 500))}
            placeholder="Describe qué hace tu app, para quién es, qué problema resuelve..."
            className="min-h-[100px] resize-none"
            maxLength={500}
          />
          <p className="text-xs text-muted-foreground text-right">{descriptionLength}/500</p>
        </div>

        {/* Category & Status */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Categoría</Label>
            <Select
              value={localApp.category_id || ''}
              onValueChange={value => handleChange('category_id', value || null)}
            >
              <SelectTrigger>
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
            <Label>Estado</Label>
            <Select
              value={localApp.status_id || ''}
              onValueChange={value => handleChange('status_id', value || null)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
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
            <Label className="flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Horas ideación
            </Label>
            <Input
              type="number"
              min={0}
              value={localApp.hours_ideation || ''}
              onChange={e => handleChange('hours_ideation', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Hammer className="h-4 w-4" />
              Horas construcción
            </Label>
            <Input
              type="number"
              min={0}
              value={localApp.hours_building || ''}
              onChange={e => handleChange('hours_building', parseInt(e.target.value) || 0)}
              placeholder="0"
            />
          </div>
        </div>

        {/* Tech Stack */}
        <div className="space-y-3">
          <Label>Tech Stack</Label>
          <div className="space-y-4">
            {Object.entries(groupedStacks).map(([group, items]) => {
              if (items.length === 0) return null;
              return (
                <div key={group}>
                  <p className="text-xs text-muted-foreground mb-2">{group}</p>
                  <div className="flex flex-wrap gap-2">
                    {items.map(stack => {
                      const isSelected = localApp.stacks?.includes(stack.id);
                      return (
                        <button
                          key={stack.id}
                          type="button"
                          onClick={() => handleStackToggle(stack.id)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-sm transition-colors ${
                            isSelected
                              ? 'border-primary bg-primary/10 text-primary'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <img src={stack.logo_url} alt={stack.name} className="w-4 h-4" />
                          {stack.name}
                          {isSelected && <Check className="h-3 w-3" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Delete */}
        <div className="pt-4 border-t border-border">
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
    </div>
  );
}
