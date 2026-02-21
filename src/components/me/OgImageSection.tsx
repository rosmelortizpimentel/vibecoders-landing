import { useRef, useState } from 'react';
import { Camera, Trash2, ExternalLink, Info, Loader2, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ProfileData } from '@/hooks/useProfileEditor';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';

interface OgImageSectionProps {
  profile: ProfileData;
  onUpload: (file: File) => Promise<string>;
  onDelete: () => void;
}

export function OgImageSection({ profile, onUpload, onDelete }: OgImageSectionProps) {
  const tBranding = useTranslation('branding');
  const inputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setError(null);
      setIsUploading(true);
      try {
        await onUpload(file);
      } catch (err: any) {
        console.error('OgImageSection upload error:', err);
        setError(err.message || 'Error al subir la imagen');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const ogImage = profile.og_image_url;
  const displayName = profile.name || profile.username || 'Tu Nombre';
  const tagline = (profile.tagline || '').slice(0, 160) || 'Tu tagline aparecerá aquí';
  const username = profile.username || 'username';

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="w-full space-y-2"
    >
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <h3 className="text-sm font-medium text-foreground">{(tBranding as any).ogImage?.title || 'Imagen Social (OG Image)'}</h3>
          <p className="text-xs text-muted-foreground">
            {(tBranding as any).ogImage?.description || 'Esta imagen aparecerá cuando compartas tu perfil.'}
          </p>
        </div>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            {isOpen ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
            <span className="sr-only">Toggle section</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-6 pt-4 animate-in fade-in slide-in-from-top-1 duration-200">
        {/* Error Feedback */}
        {error && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-xs">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Image Uploader */}
        <div className="relative group max-w-2xl mx-auto">
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploading}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "w-full aspect-[1.91/1] rounded-xl border-2 border-dashed transition-all overflow-hidden relative group shadow-sm flex flex-col items-center justify-center",
              ogImage 
                ? "border-transparent bg-muted" 
                : "border-muted-foreground/20 bg-muted/30 hover:bg-muted/50 hover:border-muted-foreground/40",
              isUploading && "opacity-70 cursor-wait bg-muted/80"
            )}
          >
            {isUploading ? (
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <span className="text-sm font-medium text-muted-foreground">Subiendo imagen...</span>
              </div>
            ) : ogImage ? (
              <>
                <img
                  src={ogImage}
                  alt="OG Image preview"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                  <div className="flex flex-col items-center gap-2">
                    <Camera className="w-8 h-8 text-white" />
                    <span className="text-white text-xs font-medium">Cambiar imagen</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-background flex items-center justify-center mb-3 shadow-sm">
                  <Camera className="w-6 h-6 text-muted-foreground" />
                </div>
                <span className="text-sm font-medium text-foreground">{(tBranding as any).ogImage?.upload || 'Subir imagen'}</span>
                <span className="text-[11px] text-muted-foreground mt-1">{(tBranding as any).ogImage?.recommended || '1200×630px'}</span>
              </div>
            )}
          </button>
          
          {ogImage && !isUploading && (
            <Button
              type="button"
              variant="destructive"
              size="icon"
              className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onDelete();
              }}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>

        {/* Social Preview Mocks - Refined Minimalist Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* LinkedIn Mock */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pl-1">LinkedIn</span>
            <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm transition-shadow hover:shadow-md">
              <div className="aspect-[1.91/1] bg-muted relative">
                {ogImage ? (
                  <img src={ogImage} alt="LinkedIn preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="p-3.5 space-y-1">
                <p className="text-[8px] text-muted-foreground uppercase tracking-widest font-bold">vibecoders.la</p>
                <p className="text-xs font-semibold text-foreground line-clamp-1">{displayName}</p>
                <p className="text-[10px] text-muted-foreground line-clamp-1">{tagline}</p>
              </div>
            </div>
          </div>

          {/* WhatsApp Mock */}
          <div className="space-y-2">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pl-1">WhatsApp</span>
            <div className="rounded-2xl bg-muted/20 p-2.5">
              <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
                <div className="aspect-[1.91/1] bg-muted relative">
                  {ogImage ? (
                    <img src={ogImage} alt="WhatsApp preview" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground/30">
                      <Camera className="w-6 h-6" />
                    </div>
                  )}
                </div>
                <div className="p-2.5 space-y-0.5">
                  <div className="flex items-center gap-1.5 overflow-hidden">
                    <span className="text-[11px] font-bold text-foreground truncate">{displayName}</span>
                    <span className="text-[9px] text-muted-foreground/40 shrink-0">|</span>
                    <span className="text-[9px] text-muted-foreground shrink-0">vibecoders.la</span>
                  </div>
                  <p className="text-[9px] text-muted-foreground line-clamp-1 leading-tight">{tagline}</p>
                </div>
              </div>
            </div>
          </div>

          {/* X/Twitter Mock */}
          <div className="space-y-2 sm:col-span-2 lg:col-span-1">
            <span className="text-[10px] font-bold text-muted-foreground/60 uppercase tracking-widest pl-1">X / Twitter</span>
            <div className="rounded-xl border border-border bg-[#000000] overflow-hidden shadow-sm">
              <div className="aspect-[1.91/1] bg-[#1a1a1a] relative">
                {ogImage ? (
                  <img src={ogImage} alt="X preview" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-800">
                    <Camera className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="p-3 space-y-0.5 border-t border-zinc-900 bg-black">
                <p className="text-xs font-bold text-white line-clamp-1">{displayName}</p>
                <p className="text-[10px] text-zinc-400 line-clamp-1 font-medium">{tagline}</p>
                <p className="text-[10px] text-zinc-500 font-mono tracking-tight">vibecoders.la/@{username}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Action Tools & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex flex-col gap-2 p-4 rounded-xl border border-border bg-muted/30">
            <h4 className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1 flex items-center gap-1.5">
              <ExternalLink className="w-3 h-3" />
              Herramientas de depuración
            </h4>
            <div className="flex flex-wrap gap-x-4 gap-y-2">
              <a
                href="https://developers.facebook.com/tools/debug/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline font-medium"
              >
                Facebook Debugger
              </a>
              <a
                href="https://www.linkedin.com/post-inspector/inspect"
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-primary hover:underline font-medium"
              >
                LinkedIn Inspector
              </a>
            </div>
          </div>

          <div className="flex gap-3 p-4 rounded-xl border border-border/60 bg-muted/10">
            <Info className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
            <p className="text-[10px] text-muted-foreground leading-relaxed italic">
              {(tBranding as any).ogImage?.cacheWarning || 'Los cambios pueden tardar en reflejarse debido al caché de las plataformas.'}
            </p>
          </div>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
