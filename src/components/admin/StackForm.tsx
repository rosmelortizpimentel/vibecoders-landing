import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { X, Upload, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export interface StackFormData {
  id?: string;
  name: string;
  tagline: string;
  website_url: string;
  logo_url: string | null;
  category: string;
  pricing_model: string | null;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
   referral_url: string | null;
   referral_param: string | null;
   default_referral_code: string | null;
}

interface StackFormProps {
  initialData?: StackFormData;
  onSubmit: (data: StackFormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const emptyForm: StackFormData = {
  name: '',
  tagline: '',
  website_url: '',
  logo_url: null,
  category: '',
  pricing_model: null,
  is_featured: false,
  is_active: true,
  display_order: 0,
   referral_url: null,
   referral_param: null,
   default_referral_code: null,
};

const CATEGORIES = [
  'Frontend AI',
  'Backend',
  'Database',
  'Hosting',
  'Design',
  'AI/ML',
  'DevOps',
  'Analytics',
  'Payments',
  'Auth',
];

const PRICING_MODELS = ['Free Tier', 'Paid', 'Open Source', 'Freemium'];

const inputClassName = "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#1c1c1c] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20 focus:border-[#3D5AFE] disabled:opacity-50";
const selectClassName = "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#1c1c1c] focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20 focus:border-[#3D5AFE] disabled:opacity-50";

export function StackForm({ initialData, onSubmit, onCancel, isLoading }: StackFormProps) {
  const [formData, setFormData] = useState<StackFormData>(initialData || emptyForm);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (field: keyof StackFormData, value: string | number | boolean | null) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const uploadFile = async (file: File): Promise<string | null> => {
    const timestamp = Date.now();
    const ext = file.name.split('.').pop();
    const fileName = `logo_${timestamp}.${ext}`;
    
    const { error } = await supabase.storage
      .from('stack-assets')
      .upload(fileName, file, { upsert: true });

    if (error) {
      console.error('Upload error:', error);
      toast.error('Error al subir el logo');
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('stack-assets')
      .getPublicUrl(fileName);

    return urlData.publicUrl;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingLogo(true);
    const url = await uploadFile(file);
    if (url) {
      handleChange('logo_url', url);
    }
    setUploadingLogo(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.tagline || !formData.website_url || !formData.category) {
      toast.error('Completa todos los campos obligatorios');
      return;
    }

    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
          <h2 className="text-base font-semibold text-[#1c1c1c]">
            {initialData?.id ? 'Editar Herramienta' : 'Nueva Herramienta'}
          </h2>
          <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="space-y-1">
              <Label className="text-xs text-[#1c1c1c]">Logo</Label>
              <div className="flex items-center">
                {formData.logo_url ? (
                  <div className="relative">
                    <img
                      src={formData.logo_url}
                      alt="Logo"
                      className="h-12 w-12 object-cover rounded-lg border border-gray-200"
                    />
                    <button
                      type="button"
                      onClick={() => handleChange('logo_url', null)}
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
                    className="h-12 w-12 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center hover:border-[#3D5AFE] transition-colors"
                  >
                    {uploadingLogo ? (
                      <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    ) : (
                      <Upload className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                )}
                <input
                  ref={logoInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </div>
            </div>

            <div className="flex-1 space-y-1">
              <Label htmlFor="name" className="text-xs text-[#1c1c1c]">Nombre *</Label>
              <input
                id="name"
                className={inputClassName}
                value={formData.name}
                onChange={(e) => handleChange('name', e.target.value)}
                placeholder="Ej: Lovable"
              />
            </div>
          </div>

          {/* Tagline */}
          <div className="space-y-1">
            <Label htmlFor="tagline" className="text-xs text-[#1c1c1c]">Tagline *</Label>
            <input
              id="tagline"
              className={inputClassName}
              value={formData.tagline}
              onChange={(e) => handleChange('tagline', e.target.value)}
              placeholder="Descripción corta (máx 60 caracteres)"
              maxLength={60}
            />
          </div>

          {/* Website URL */}
          <div className="space-y-1">
            <Label htmlFor="website_url" className="text-xs text-[#1c1c1c]">Website URL *</Label>
            <input
              id="website_url"
              type="url"
              className={inputClassName}
              value={formData.website_url}
              onChange={(e) => handleChange('website_url', e.target.value)}
              placeholder="https://..."
            />
          </div>

           {/* Referral Configuration */}
           <div className="border border-gray-200 rounded-lg p-3 space-y-3 bg-gray-50">
             <Label className="text-xs font-medium text-[#1c1c1c]">Configuración de Referidos (opcional)</Label>
             
             <div className="space-y-1">
               <Label htmlFor="referral_url" className="text-[10px] text-gray-500">
                 Template URL (usa {'{code}'} como placeholder)
               </Label>
               <input
                 id="referral_url"
                 className={inputClassName}
                 value={formData.referral_url || ''}
                 onChange={(e) => handleChange('referral_url', e.target.value || null)}
                 placeholder="https://example.com/invite/{code}"
               />
             </div>
 
             <div className="space-y-1">
               <Label htmlFor="default_referral_code" className="text-[10px] text-gray-500">Código Default</Label>
               <input
                 id="default_referral_code"
                 className={inputClassName}
                 value={formData.default_referral_code || ''}
                 onChange={(e) => handleChange('default_referral_code', e.target.value || null)}
                 placeholder="MYCODE"
               />
             </div>
           </div>
 
          {/* Category & Pricing */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label htmlFor="category" className="text-xs text-[#1c1c1c]">Categoría *</Label>
              <select
                id="category"
                className={selectClassName}
                value={formData.category}
                onChange={(e) => handleChange('category', e.target.value)}
              >
                <option value="">Seleccionar...</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="pricing_model" className="text-xs text-[#1c1c1c]">Precio</Label>
              <select
                id="pricing_model"
                className={selectClassName}
                value={formData.pricing_model || ''}
                onChange={(e) => handleChange('pricing_model', e.target.value || null)}
              >
                <option value="">Seleccionar...</option>
                {PRICING_MODELS.map((model) => (
                  <option key={model} value={model}>{model}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Toggles */}
          <div className="flex items-center justify-between pt-2 border-t border-gray-100">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Label htmlFor="is_featured" className="text-xs text-[#1c1c1c]">Destacado</Label>
                <Switch
                  id="is_featured"
                  checked={formData.is_featured}
                  onCheckedChange={(checked) => handleChange('is_featured', checked)}
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
