import { useRef } from 'react';
import { Camera, Trash2, ExternalLink, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileData } from '@/hooks/useProfileEditor';

interface OgImageSectionProps {
  profile: ProfileData;
  onUpload: (file: File) => Promise<string>;
  onDelete: () => void;
}

export function OgImageSection({ profile, onUpload, onDelete }: OgImageSectionProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      await onUpload(file);
    }
  };

  const ogImage = profile.og_image_url;
  const displayName = profile.name || profile.username || 'Tu Nombre';
  const tagline = profile.tagline || 'Tu tagline aparecerá aquí';
  const username = profile.username || 'username';

  return (
    <section className="space-y-6">
      <div>
        <h3 className="text-sm font-medium text-[#1c1c1c]">Imagen para Redes Sociales</h3>
        <p className="text-xs text-gray-500 mt-1">
          Sube una imagen de 1200x630px para previsualizaciones en LinkedIn, WhatsApp y X
        </p>
      </div>

      {/* Image Uploader */}
      <div className="relative">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="w-full aspect-[1.91/1] rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300 transition-colors overflow-hidden relative group"
        >
          {ogImage ? (
            <>
              <img
                src={ogImage}
                alt="OG Image preview"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Camera className="w-8 h-8 text-white" />
              </div>
            </>
          ) : (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
              <Camera className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">Subir imagen</span>
              <span className="text-xs mt-1">1200 x 630 px recomendado</span>
            </div>
          )}
        </button>
        {ogImage && (
          <Button
            type="button"
            variant="destructive"
            size="icon"
            className="absolute top-2 right-2 h-8 w-8"
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Social Preview Mocks */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* LinkedIn Mock */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-500">LinkedIn</span>
          <div className="rounded-lg border border-gray-200 bg-white overflow-hidden shadow-sm">
            <div className="aspect-[1.91/1] bg-gray-100">
              {ogImage ? (
                <img src={ogImage} alt="LinkedIn preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-300">
                  <Camera className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="p-3 space-y-1">
              <p className="text-[10px] text-gray-500 uppercase tracking-wide">vibecoders.la</p>
              <p className="text-sm font-semibold text-[#1c1c1c] line-clamp-1">{displayName}</p>
              <p className="text-xs text-gray-600 line-clamp-1">{tagline}</p>
              {tagline.length < 100 && tagline.length > 0 && (
                <p className="text-[10px] text-amber-600 mt-1">⚠ Min. 100 caracteres recomendados</p>
              )}
            </div>
          </div>
        </div>

        {/* WhatsApp Mock */}
        <div className="space-y-2">
          <span className="text-xs font-medium text-gray-500">WhatsApp</span>
          <div className="rounded-xl bg-[#E7FFDB] p-2">
            <div className="rounded-lg border border-[#B8E6A3] bg-white overflow-hidden">
              <div className="aspect-[1.91/1] bg-gray-100">
                {ogImage ? (
                  <img src={ogImage} alt="WhatsApp preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="p-2 space-y-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-[#1c1c1c] line-clamp-1">{displayName}</span>
                  <span className="text-[10px] text-gray-400">|</span>
                  <span className="text-[10px] text-gray-500">vibecoders.la</span>
                </div>
                <p className="text-[10px] text-gray-600 line-clamp-1">{tagline}</p>
              </div>
            </div>
          </div>
        </div>

        {/* X/Twitter Mock */}
        <div className="space-y-2 sm:col-span-2 lg:col-span-1">
          <span className="text-xs font-medium text-gray-500">X / Twitter</span>
          <div className="rounded-2xl border border-gray-700 bg-[#16181C] overflow-hidden">
            <div className="aspect-[1.91/1] bg-gray-800">
              {ogImage ? (
                <img src={ogImage} alt="X preview" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-600">
                  <Camera className="w-6 h-6" />
                </div>
              )}
            </div>
            <div className="p-3 space-y-0.5 border-t border-gray-700">
              <p className="text-sm font-medium text-white line-clamp-1">{displayName}</p>
              <p className="text-xs text-gray-400 line-clamp-1">{tagline}</p>
              <p className="text-xs text-gray-500">vibecoders.la/@{username}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Debug Tools */}
      <div className="flex flex-col sm:flex-row gap-3">
        <a
          href="https://developers.facebook.com/tools/debug/"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          Facebook Debug Tool
        </a>
        <a
          href="https://www.linkedin.com/post-inspector/inspect"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          <ExternalLink className="w-4 h-4" />
          LinkedIn Post Inspector
        </a>
      </div>

      {/* Cache Note */}
      <div className="flex gap-3 p-4 rounded-lg border border-gray-200 bg-gray-50">
        <Info className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
        <p className="text-xs text-gray-600 leading-relaxed">
          Los cambios pueden tardar en reflejarse en estas plataformas debido a su sistema de caché. 
          Usa las herramientas de arriba para forzar una actualización.
        </p>
      </div>
    </section>
  );
}
