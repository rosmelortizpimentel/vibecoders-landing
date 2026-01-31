import { useRef, useState, useCallback } from 'react';
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
import { TechStackSelector } from './TechStackSelector';
import { Camera, Trash2, ChevronUp, Clock, Lightbulb, Hammer } from 'lucide-react';
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
    <div className="border-2 border-[#3D5AFE] rounded-lg bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-[#3D5AFE]/5 border-b border-[#3D5AFE]/20">
        <div className="flex items-center gap-3">
          {/* Logo */}
          <div 
            className="relative group w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center overflow-hidden cursor-pointer"
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
          
          <div>
            <h3 className="font-medium text-[#1c1c1c]">{localApp.name || 'Nueva App'}</h3>
            <p className="text-xs text-gray-500">{localApp.url}</p>
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
      <div className="p-4 space-y-6">
        {/* Basic Info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label className="text-[#1c1c1c]">Nombre</Label>
            <Input
              value={localApp.name || ''}
              onChange={e => handleChange('name', e.target.value)}
              placeholder="Nombre de la app"
              className="border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-[#1c1c1c]">URL *</Label>
            <Input
              value={localApp.url}
              onChange={e => handleChange('url', e.target.value)}
              placeholder="https://tu-app.com"
              type="url"
              className="border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
            />
          </div>
        </div>

        {/* Tagline */}
        <div className="space-y-2">
          <Label className="text-[#1c1c1c]">Tagline</Label>
          <Input
            value={localApp.tagline || ''}
            onChange={e => handleChange('tagline', e.target.value.slice(0, 100))}
            placeholder="Una frase corta que describa tu app"
            maxLength={100}
            className="border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
          />
          <p className="text-xs text-gray-500 text-right">{localApp.tagline?.length || 0}/100</p>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-[#1c1c1c]">Descripción</Label>
            <span className="text-xs text-gray-500">Soporta markdown básico</span>
          </div>
          <Textarea
            value={localApp.description || ''}
            onChange={e => handleChange('description', e.target.value.slice(0, 500))}
            placeholder="Describe qué hace tu app, para quién es, qué problema resuelve..."
            className="min-h-[100px] resize-none border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
            maxLength={500}
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
              <SelectTrigger className="border-gray-300 bg-white text-[#1c1c1c]">
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
              value={localApp.status_id || ''}
              onValueChange={value => handleChange('status_id', value || null)}
            >
              <SelectTrigger className="border-gray-300 bg-white text-[#1c1c1c]">
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
              className="border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
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
              className="border-gray-300 bg-white text-[#1c1c1c] placeholder:text-gray-400 focus:border-[#3D5AFE] focus:ring-[#3D5AFE]"
            />
          </div>
        </div>

        {/* Tech Stack */}
        <TechStackSelector
          stacks={stacks}
          groupedStacks={groupedStacks}
          selectedIds={localApp.stacks || []}
          onToggle={handleStackToggle}
        />

        {/* Delete */}
        <div className="pt-4 border-t border-gray-200">
          <Button
            variant="ghost"
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
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
