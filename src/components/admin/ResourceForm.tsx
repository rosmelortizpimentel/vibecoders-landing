import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { X, Upload, Loader2, Link as LinkIcon, Plus, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface DownloadUrl {
  label: string;
  url: string;
}

export interface ResourceFormData {
  id?: string;
  content: string;
  media_urls: string[];
  download_urls: DownloadUrl[];
  status: string;
}

interface ResourceFormProps {
  initialData?: ResourceFormData;
  onSubmit: (data: ResourceFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const emptyForm: ResourceFormData = {
  content: '',
  media_urls: [],
  download_urls: [],
  status: 'published',
};

const inputClassName = "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#1c1c1c] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20 focus:border-[#3D5AFE] disabled:opacity-50";
const textareaClassName = "flex min-h-[120px] w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-[#1c1c1c] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20 focus:border-[#3D5AFE] disabled:opacity-50 resize-none";

export function ResourceForm({ initialData, onSubmit, onCancel, isLoading }: ResourceFormProps) {
  const [formData, setFormData] = useState<ResourceFormData>(initialData || emptyForm);
  const [uploadingMedia, setUploadingMedia] = useState(false);
  const mediaInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof ResourceFormData, value: string | string[] | DownloadUrl[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploadingMedia(true);
    const newMediaUrls = [...formData.media_urls];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const timestamp = Date.now();
      const ext = file.name.split('.').pop();
      const fileName = `resource_${timestamp}_${i}.${ext}`;
      
      const { error } = await supabase.storage
        .from('resources')
        .upload(fileName, file, { upsert: true });

      if (error) {
        console.error('Upload error:', error);
        toast.error(`Error al subir imagen: ${file.name}`);
        continue;
      }

      const { data: urlData } = supabase.storage
        .from('resources')
        .getPublicUrl(fileName);

      newMediaUrls.push(urlData.publicUrl);
    }

    handleChange('media_urls', newMediaUrls);
    setUploadingMedia(false);
    if (mediaInputRef.current) mediaInputRef.current.value = '';
  };

  const removeMedia = (index: number) => {
    const newMediaUrls = formData.media_urls.filter((_, i) => i !== index);
    handleChange('media_urls', newMediaUrls);
  };

  const addDownloadLink = () => {
    const newDownloads = [...formData.download_urls, { label: '', url: '' }];
    handleChange('download_urls', newDownloads);
  };

  const updateDownloadLink = (index: number, field: keyof DownloadUrl, value: string) => {
    const newDownloads = [...formData.download_urls];
    newDownloads[index] = { ...newDownloads[index], [field]: value };
    handleChange('download_urls', newDownloads);
  };

  const removeDownloadLink = (index: number) => {
    const newDownloads = formData.download_urls.filter((_, i) => i !== index);
    handleChange('download_urls', newDownloads);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.content.trim()) {
      toast.error('El contenido es obligatorio');
      return;
    }
    onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 shrink-0">
          <h2 className="text-base font-semibold text-[#1c1c1c]">
            {initialData?.id ? 'Editar Recurso' : 'Nuevo Recurso'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Content */}
          <div className="space-y-2">
            <Label htmlFor="content" className="text-sm font-medium text-[#1c1c1c]">Contenido del Post (Soportar links automáticamente)</Label>
            <textarea
              id="content"
              className={textareaClassName}
              value={formData.content}
              onChange={(e) => handleChange('content', e.target.value)}
              placeholder="¿Qué quieres compartir hoy?"
            />
          </div>

          {/* Media/Images */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-[#1c1c1c]">Imágenes / Media</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => mediaInputRef.current?.click()}
                disabled={uploadingMedia}
                className="h-8 text-xs bg-gray-50"
              >
                {uploadingMedia ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Upload className="h-3 w-3 mr-1" />}
                Añadir Imagen
              </Button>
              <input
                ref={mediaInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {formData.media_urls.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                {formData.media_urls.map((url, index) => (
                  <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-gray-200">
                    <img src={url} alt={`Media ${index}`} className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeMedia(index)}
                      className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border-2 border-dashed border-gray-200 rounded-lg text-gray-400 text-xs">
                No hay imágenes seleccionadas
              </div>
            )}
          </div>

          {/* Download Links */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-[#1c1c1c]">Links de Descarga / Documentos</Label>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addDownloadLink}
                className="h-8 text-xs bg-gray-50"
              >
                <Plus className="h-3 w-3 mr-1" />
                Añadir Link
              </Button>
            </div>

            <div className="space-y-2">
              {formData.download_urls.map((link, index) => (
                <div key={index} className="flex gap-2 items-start bg-gray-50 p-3 rounded-lg border border-gray-100">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input
                      placeholder="Nombre del archivo (ej: PDF Guía)"
                      className={inputClassName}
                      value={link.label}
                      onChange={(e) => updateDownloadLink(index, 'label', e.target.value)}
                    />
                    <div className="relative">
                      <LinkIcon className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
                      <input
                        placeholder="https://..."
                        className={`${inputClassName} pl-8`}
                        value={link.url}
                        onChange={(e) => updateDownloadLink(index, 'url', e.target.value)}
                      />
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDownloadLink(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 shrink-0"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              {formData.download_urls.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-xs">
                  Sin links de descarga
                </div>
              )}
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 flex justify-end gap-2 shrink-0">
          <Button type="button" variant="outline" size="sm" onClick={onCancel}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            size="sm" 
            disabled={isLoading} 
            onClick={handleSubmit}
            className="bg-[#3D5AFE] hover:bg-[#3D5AFE]/90"
          >
            {isLoading ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                Guardando
              </>
            ) : (
              initialData?.id ? 'Guardar Cambios' : 'Publicar Recurso'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
