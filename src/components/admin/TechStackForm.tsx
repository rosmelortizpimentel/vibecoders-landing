 import { useState, useRef } from 'react';
 import { Button } from '@/components/ui/button';
 import { Label } from '@/components/ui/label';
 import { X, Upload, Loader2, Link2, Info } from 'lucide-react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import {
   Tooltip,
   TooltipContent,
   TooltipProvider,
   TooltipTrigger,
 } from '@/components/ui/tooltip';
 
 export interface TechStackFormData {
   id?: string;
   name: string;
   logo_url: string;
   tags: string[];
   display_order: number;
   website_url: string | null;
   referral_url: string | null;
   referral_param: string | null;
   default_referral_code: string | null;
 }
 
 interface TechStackFormProps {
   initialData?: TechStackFormData;
   onSubmit: (data: TechStackFormData) => Promise<void>;
   onCancel: () => void;
   isLoading?: boolean;
 }
 
 const emptyForm: TechStackFormData = {
   name: '',
   logo_url: '',
   tags: [],
   display_order: 0,
   website_url: null,
   referral_url: null,
   referral_param: null,
   default_referral_code: null,
 };
 
 const TAG_OPTIONS = [
   'frontend', 'backend', 'database', 'cloud', 'hosting', 
   'mobile', 'ai', 'ml', 'llm', 'vibe-coding', 'runtime', 
   'framework', 'baas', 'cache'
 ];
 
 const inputClassName = "flex h-9 w-full rounded-md border border-gray-300 bg-white px-3 py-1.5 text-sm text-[#1c1c1c] placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3D5AFE]/20 focus:border-[#3D5AFE] disabled:opacity-50";
 
 export function TechStackForm({ initialData, onSubmit, onCancel, isLoading }: TechStackFormProps) {
   const [formData, setFormData] = useState<TechStackFormData>(initialData || emptyForm);
   const [uploadingLogo, setUploadingLogo] = useState(false);
   const logoInputRef = useRef<HTMLInputElement>(null);
 
   const handleChange = (field: keyof TechStackFormData, value: string | number | string[] | null) => {
     setFormData(prev => ({ ...prev, [field]: value }));
   };
 
   const uploadFile = async (file: File): Promise<string | null> => {
     const timestamp = Date.now();
     const ext = file.name.split('.').pop();
     const fileName = `tech_${timestamp}.${ext}`;
     
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
 
   const toggleTag = (tag: string) => {
     const currentTags = formData.tags;
     if (currentTags.includes(tag)) {
       handleChange('tags', currentTags.filter(t => t !== tag));
     } else {
       handleChange('tags', [...currentTags, tag]);
     }
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     
     if (!formData.name || !formData.logo_url) {
       toast.error('Nombre y Logo son obligatorios');
       return;
     }
 
     await onSubmit(formData);
   };
 
  // Preview referral URL - simplified logic
  const previewUrl = (() => {
    const code = formData.default_referral_code || '{code}';
    if (formData.referral_url) {
      return formData.referral_url.replace('{code}', code);
    }
    return formData.website_url || '';
  })();
 
   return (
     <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-xl shadow-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
         <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
           <h2 className="text-base font-semibold text-[#1c1c1c]">
             {initialData?.id ? 'Editar Tech Stack' : 'Nuevo Tech Stack'}
           </h2>
           <button onClick={onCancel} className="p-1 hover:bg-gray-100 rounded">
             <X className="h-4 w-4 text-gray-500" />
           </button>
         </div>
 
         <form onSubmit={handleSubmit} className="p-4 space-y-4">
           {/* Logo & Name */}
           <div className="flex items-center gap-4">
             <div className="space-y-1">
               <Label className="text-xs text-[#1c1c1c]">Logo *</Label>
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
                       onClick={() => handleChange('logo_url', '')}
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
 
           {/* Tags */}
           <div className="space-y-1">
             <Label className="text-xs text-[#1c1c1c]">Tags</Label>
             <div className="flex flex-wrap gap-1.5">
               {TAG_OPTIONS.map((tag) => (
                 <button
                   key={tag}
                   type="button"
                   onClick={() => toggleTag(tag)}
                   className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                     formData.tags.includes(tag)
                       ? 'bg-[#3D5AFE] text-white border-[#3D5AFE]'
                       : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                   }`}
                 >
                   {tag}
                 </button>
               ))}
             </div>
           </div>
 
           {/* Referral Section */}
           <div className="border-t border-gray-100 pt-4 space-y-3">
             <div className="flex items-center gap-2">
               <Link2 className="h-4 w-4 text-[#3D5AFE]" />
               <span className="text-sm font-medium text-[#1c1c1c]">Configuración de Referidos</span>
             </div>
 
             {/* Website URL */}
             <div className="space-y-1">
               <Label htmlFor="website_url" className="text-xs text-[#1c1c1c]">Website URL</Label>
               <input
                 id="website_url"
                 type="url"
                 className={inputClassName}
                 value={formData.website_url || ''}
                 onChange={(e) => handleChange('website_url', e.target.value || null)}
                 placeholder="https://lovable.dev"
               />
             </div>
 
             {/* Referral URL Template */}
             <div className="space-y-1">
               <div className="flex items-center gap-1">
                 <Label htmlFor="referral_url" className="text-xs text-[#1c1c1c]">Referral URL Template</Label>
                 <TooltipProvider>
                   <Tooltip>
                     <TooltipTrigger asChild>
                       <Info className="h-3 w-3 text-gray-400 cursor-help" />
                     </TooltipTrigger>
                     <TooltipContent className="bg-[#1c1c1c] text-white">
                       <p className="text-xs">Usa {'{code}'} como placeholder para el código de referido</p>
                     </TooltipContent>
                   </Tooltip>
                 </TooltipProvider>
               </div>
               <input
                 id="referral_url"
                 className={inputClassName}
                 value={formData.referral_url || ''}
                 onChange={(e) => handleChange('referral_url', e.target.value || null)}
                 placeholder="https://lovable.dev/invite/{code}"
               />
             </div>
 
            {/* Default Referral Code */}
            <div className="space-y-1">
              <Label htmlFor="default_referral_code" className="text-xs text-[#1c1c1c]">Código Default</Label>
              <input
                id="default_referral_code"
                className={inputClassName}
                value={formData.default_referral_code || ''}
                onChange={(e) => handleChange('default_referral_code', e.target.value || null)}
                placeholder="KFET6W5"
              />
            </div>
 
             {/* Preview */}
             {previewUrl && (
               <div className="bg-gray-50 rounded-md p-2">
                 <Label className="text-xs text-gray-500">Vista previa URL:</Label>
                 <p className="text-xs text-[#3D5AFE] break-all mt-0.5">{previewUrl}</p>
               </div>
             )}
           </div>
 
           {/* Display Order */}
           <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
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