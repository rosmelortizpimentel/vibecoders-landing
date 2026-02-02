import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
  author_name: '',
  author_avatar: null,
  author_linkedin: null,
  author_twitter: null,
  author_website: null,
  display_order: 0,
  is_active: true,
};

export function ShowcaseForm({ initialData, onSubmit, onCancel, isLoading }: ShowcaseFormProps) {
  const [formData, setFormData] = useState<ShowcaseFormData>(initialData || emptyForm);
  const [uploadingThumbnail, setUploadingThumbnail] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof ShowcaseFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File, type: 'thumbnail' | 'avatar'): Promise<string | null> => {
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const fileName = `${type}_${timestamp}.${ext}`;
    
    const { error } = await supabase.storage
      .from('showcase-assets')
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      toast.error(`Error al subir ${type === 'thumbnail' ? 'imagen' : 'avatar'}`);
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('showcase-assets')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'thumbnail' | 'avatar') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (type === 'thumbnail') {
      setUploadingThumbnail(true);
    } else {
      setUploadingAvatar(true);
    }

    const url = await uploadFile(file, type);

    if (url) {
      if (type === 'thumbnail') {
        handleChange('project_thumbnail', url);
      } else {
        handleChange('author_avatar', url);
      }
    }

    if (type === 'thumbnail') {
      setUploadingThumbnail(false);
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
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-[#1c1c1c]">
            {initialData?.id ? 'Editar Showcase' : 'Nuevo Showcase'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Proyecto</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="project_title">Título *</Label>
                <Input
                  id="project_title"
                  value={formData.project_title}
                  onChange={(e) => handleChange('project_title', e.target.value)}
                  placeholder="Nombre del proyecto"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="project_url">URL *</Label>
                <Input
                  id="project_url"
                  type="url"
                  value={formData.project_url}
                  onChange={(e) => handleChange('project_url', e.target.value)}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="project_tagline">Tagline *</Label>
              <Input
                id="project_tagline"
                value={formData.project_tagline}
                onChange={(e) => handleChange('project_tagline', e.target.value)}
                placeholder="Una línea que describa el proyecto"
              />
            </div>

            <div className="space-y-2">
              <Label>Thumbnail *</Label>
              <div className="flex items-center gap-4">
                {formData.project_thumbnail ? (
                  <div className="relative">
                    <img
                      src={formData.project_thumbnail}
                      alt="Thumbnail"
                      className="h-20 w-32 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('project_thumbnail', '')}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => thumbnailInputRef.current?.click()}
                    disabled={uploadingThumbnail}
                    className="h-20 w-32 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#3D5AFE] transition-colors"
                  >
                    {uploadingThumbnail ? (
                      <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                    ) : (
                      <Upload className="h-6 w-6 text-gray-400" />
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
          </div>

          {/* Author Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Autor</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author_name">Nombre *</Label>
                <Input
                  id="author_name"
                  value={formData.author_name}
                  onChange={(e) => handleChange('author_name', e.target.value)}
                  placeholder="Nombre del autor"
                />
              </div>
              <div className="space-y-2">
                <Label>Avatar</Label>
                <div className="flex items-center gap-2">
                  {formData.author_avatar ? (
                    <div className="relative">
                      <img
                        src={formData.author_avatar}
                        alt="Avatar"
                        className="h-10 w-10 object-cover rounded-full border border-gray-200"
                      />
                      <button
                        type="button"
                        onClick={() => handleChange('author_avatar', null)}
                        className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="h-10 w-10 border-2 border-dashed border-gray-300 rounded-full flex items-center justify-center hover:border-[#3D5AFE] transition-colors"
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

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="author_linkedin">LinkedIn</Label>
                <Input
                  id="author_linkedin"
                  type="url"
                  value={formData.author_linkedin || ''}
                  onChange={(e) => handleChange('author_linkedin', e.target.value || null)}
                  placeholder="https://linkedin.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_twitter">Twitter</Label>
                <Input
                  id="author_twitter"
                  type="url"
                  value={formData.author_twitter || ''}
                  onChange={(e) => handleChange('author_twitter', e.target.value || null)}
                  placeholder="https://twitter.com/..."
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="author_website">Website</Label>
                <Input
                  id="author_website"
                  type="url"
                  value={formData.author_website || ''}
                  onChange={(e) => handleChange('author_website', e.target.value || null)}
                  placeholder="https://..."
                />
              </div>
            </div>
          </div>

          {/* Settings Section */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">Configuración</h3>
            
            <div className="flex items-center justify-between">
              <div className="space-y-2 flex-1 max-w-[200px]">
                <Label htmlFor="display_order">Orden</Label>
                <Input
                  id="display_order"
                  type="number"
                  min={0}
                  value={formData.display_order}
                  onChange={(e) => handleChange('display_order', parseInt(e.target.value) || 0)}
                />
              </div>
              <div className="flex items-center gap-3">
                <Label htmlFor="is_active">Activo</Label>
                <Switch
                  id="is_active"
                  checked={formData.is_active}
                  onCheckedChange={(checked) => handleChange('is_active', checked)}
                />
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button type="button" variant="outline" onClick={onCancel}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isLoading} className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90">
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Guardando...
                </>
              ) : (
                initialData?.id ? 'Guardar Cambios' : 'Crear Showcase'
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
