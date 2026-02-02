import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface ShowcaseFormData {
  id?: string;
  project_title: string;
  project_tagline: string;
  project_url: string;
  project_thumbnail: string;
  project_logo_url: string | null;
  author_name: string;
  author_avatar: string | null;
  author_linkedin: string | null;
  author_twitter: string | null;
  author_website: string | null;
  display_order: number;
  is_active: boolean;
}

interface ShowcaseFormProps {
  initialData?: ShowcaseFormData;
  onSubmit: (data: ShowcaseFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const emptyForm: ShowcaseFormData = {
  project_title: '',
  project_tagline: '',
  project_url: '',
  project_thumbnail: '',
  project_logo_url: null,
  author_name: '',
  author_avatar: null,
  author_linkedin: null,
  author_twitter: null,
  author_website: null,
  display_order: 0,
  is_active: true,
};

// Reusable input class for white background
const inputClassName = "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#1c1c1c] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20 focus:border-[#3D5AFE] disabled:opacity-50";

export function ShowcaseForm({ initialData, onSubmit, onCancel, isLoading }: ShowcaseFormProps) {
  const [formData, setFormData] = useState<ShowcaseFormData>(initialData || emptyForm);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof ShowcaseFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, type: 'thumbnail' | 'logo' | 'avatar'): Promise<string | null> => {
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const fileName = `${type}_${timestamp}.${ext}`;
    
    const { error } = await supabase.storage
      .from('showcase-assets')
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      toast.error(`Error al subir ${type === 'thumbnail' ? 'imagen' : type === 'logo' ? 'logo' : 'avatar'}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('showcase-assets')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'logo' | 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'thumbnail') {
      setUploadingThumbnail(true);
    } else if (type === 'logo') {
      setUploadingLogo(true);
    } else {
      setUploadingAvatar(true);
    }

    const url = await uploadFile(file, type);

    if (url) {
      if (type === 'thumbnail') {
        handleChange('project_thumbnail', url);
      } else if (type === 'logo') {
        handleChange('project_logo_url', url);
      } else {
        handleChange('author_avatar', url);
      }
    }

    if (type === 'thumbnail') {
      setUploadingThumbnail(false);
    } else if (type === 'logo') {
      setUploadingLogo(false);
    } else {
      setUploadingAvatar(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.project_title || !formData.project_tagline || !formData.project_url || !formData.project_thumbnail || !formData.author_name) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-[#1c1c1c]">
            {initialData?.id ? 'Editar Showcase' : 'Nuevo Showcase'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Project Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Proyecto</h3>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label htmlFor="project_title" className="text-xs text-[#1c1c1c]">Título *</Label>
                <input
                  id="project_title"
                  className={inputClassName}
                  value={formData.project_title}
                  onChange={(e) => handleChange('project_title', e.target.value)}
                  placeholder="Nombre del proyecto"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="project_url" className="text-xs text-[#1c1c1c]">URL *</Label>
                <input
                  id="project_url"
                  type="url"
                  className={inputClassName}
                  value={formData.project_url}
                  onChange={(e) => handleChange('project_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="project_tagline" className="text-xs text-[#1c1c1c]">Tagline *</Label>
              <input
                id="project_tagline"
                className={inputClassName}
                value={formData.project_tagline}
                onChange={(e) => handleChange('project_tagline', e.target.value)}
                placeholder="Una línea que describa el proyecto"
              />
            </div>

            {/* Thumbnail & Logo side by side */}
            <div className="flex items-start gap-4">
              <div className="space-y-1">
                <Label className="text-xs text-[#1c1c1c]">Thumbnail *</Label>
                <div className="flex items-center gap-2">
                  {formData.project_thumbnail ? (
                    <div className="relative">
                      <img
                        src={formData.project_thumbnail}
                        alt="Thumbnail"
                        className="h-14 w-24 object-cover rounded border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange('project_thumbnail', '')}
                        className="absolute -top-1.5 -right-1.5 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => thumbnailInputRef.current?.click()}
                      disabled={uploadingThumbnail}
                      className="h-14 w-24 border-2 border-dashed border-gray-300 rounded flex items-center justify-center hover:border-[#3D5AFE] transition-colors"
                    >
                      {uploadingThumbnail ? (
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                      ) : (
                        <Upload className="h-5 w-5 text-gray-400" />
                      )}
                    </button>
                  )}
                  <input
                    ref={thumbnailInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'thumbnail')}
                    className="hidden"
                  />
                </div>
              </div>

              {/* Logo del proyecto */}
              <div className="space-y-1">
                <Label className="text-xs text-[#1c1c1c]">Logo</Label>
                <div className="flex items-center">
                  {formData.project_logo_url ? (
                    <div className="relative">
                      <img
                        src={formData.project_logo_url}
                        alt="Logo"
                        className="h-10 w-10 object-cover rounded-lg border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange('project_logo_url', null)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => logoInputRef.current?.click()}
                      disabled={uploadingLogo}
                      className="h-10 w-10 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#3D5AFE] transition-colors"
                    >
                      {uploadingLogo ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <Upload className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'logo')}
                    className="hidden"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Author Section */}
          <div className="space-y-3">
            <h3 className="text-xs font-medium text-gray-500 uppercase tracking-wider">Autor</h3>
            
            <div className="flex items-start gap-3">
              <div className="flex-1 space-y-1">
                <Label htmlFor="author_name" className="text-xs text-[#1c1c1c]">Nombre *</Label>
                <input
                  id="author_name"
                  className={inputClassName}
                  value={formData.author_name}
                  onChange={(e) => handleChange('author_name', e.target.value)}
                  placeholder="Nombre del autor"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-[#1c1c1c]">Avatar</Label>
                <div className="flex items-center">
                  {formData.author_avatar ? (
                    <div className="relative">
                      <img
                        src={formData.author_avatar}
                        alt="Avatar"
                        className="h-9 w-9 object-cover rounded-full border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange('author_avatar', null)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="h-9 w-9 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-[#3D5AFE] transition-colors"
                    >
                      {uploadingAvatar ? (
                        <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
                      ) : (
                        <Upload className="h-4 w-4 text-gray-400" />
                      )}
                    </button>
                  )}
                  <input
                    ref={avatarInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'avatar')}
                    className="hidden"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="space-y-1">
                <Label htmlFor="author_linkedin" className="text-xs text-[#1c1c1c]">LinkedIn</Label>
                <input
                  id="author_linkedin"
                  type="url"
                  className={inputClassName}
                  value={formData.author_linkedin || ''}
                  onChange={(e) => handleChange('author_linkedin', e.target.value || null)}
                  placeholder="URL"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="author_twitter" className="text-xs text-[#1c1c1c]">Twitter</Label>
                <input
                  id="author_twitter"
                  type="url"
                  className={inputClassName}
                  value={formData.author_twitter || ''}
                  onChange={(e) => handleChange('author_twitter', e.target.value || null)}
                  placeholder="URL"
                />
              </div>
              <div className="space-y-1">
                <Label htmlFor="author_website" className="text-xs text-[#1c1c1c]">Website</Label>
                <input
                  id="author_website"
                  type="url"
                  className={inputClassName}
                  value={formData.author_website || ''}
                  onChange={(e) => handleChange('author_website', e.target.value || null)}
                  placeholder="URL"
                />
              </div>
            </div>
          </div>

          {/* Settings Section - inline */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <Label htmlFor="display_order" className="text-xs text-[#1c1c1c]">Orden:</Label>
              <input
                id="display_order"
                type="number"
                min={0}
                className={`${inputClassName} w-16`}
                value={formData.display_order}
                onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
              />
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="is_active" className="text-xs text-[#1c1c1c]">Activo</Label>
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => handleChange('is_active', checked)}
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-3 border-t border-gray-200">
            <Button type="button" variant="outline" size="sm" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" size="sm" disabled={isLoading} className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  Guardando
                </>
              ) : (
                initialData?.id ? 'Guardar' : 'Crear'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}