import { useState, useCallback } from 'react';
import Cropper from 'react-easy-crop';
import type { Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { getCroppedImg } from '@/lib/cropImage';
import { Loader2, ZoomIn, Image as ImageIcon, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';

interface BannerCropDialogProps {
  open: boolean;
  imageSrc: string;
  onClose: () => void;
  onConfirm: (croppedBlob: Blob) => void;
}

export function BannerCropDialog({ open, imageSrc, onClose, onConfirm }: BannerCropDialogProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation('profile');

  const onCropComplete = useCallback((_: Area, croppedPixels: Area) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const blob = await getCroppedImg(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch (err) {
      console.error('Error cropping image:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-xl max-w-[95vw] p-0 gap-0">
        <DialogHeader className="px-6 py-4 border-b border-border flex flex-row items-center justify-between space-y-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-primary/10 rounded-lg text-primary">
              <ImageIcon className="h-5 w-5" />
            </div>
            <DialogTitle className="text-lg font-semibold">{t('bannerCrop.title')}</DialogTitle>
          </div>
        </DialogHeader>

        <div className="relative w-full aspect-video min-h-[350px] bg-[#121212] overflow-hidden">
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={4 / 1}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            showGrid={true}
            style={{
              containerStyle: { background: '#121212' },
              cropAreaStyle: { border: '2px solid white', boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.6)' }
            }}
          />
        </div>

        <div className="flex items-center gap-4 px-6 py-5 bg-background">
          <div className="p-2 bg-muted rounded-md group hover:bg-muted/80 transition-colors">
            <ZoomIn className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
          </div>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.05}
            onValueChange={([v]) => setZoom(v)}
            className="flex-1"
          />
        </div>

        <DialogFooter className="px-6 py-4 bg-muted/30 border-t border-border gap-3">
          <Button 
            variant="ghost" 
            onClick={onClose} 
            disabled={loading}
            className="hover:bg-background h-10 px-6 font-medium"
          >
            {t('bannerCrop.cancel')}
          </Button>
          <Button 
            onClick={handleConfirm} 
            disabled={loading}
            className="h-10 px-6 font-semibold bg-primary hover:bg-primary/90 transition-all shadow-md active:scale-95"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              t('bannerCrop.confirm')
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
