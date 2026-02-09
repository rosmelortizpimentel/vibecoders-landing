import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ImageCarouselDialogProps {
  images: { url: string; name: string }[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageCarouselDialog({
  images,
  initialIndex = 0,
  open,
  onOpenChange,
}: ImageCarouselDialogProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  // Reset index when dialog opens
  useEffect(() => {
    if (open) {
      setCurrentIndex(initialIndex);
    }
  }, [open, initialIndex]);

  const goToPrevious = useCallback(() => {
    setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  }, [images.length]);

  const goToNext = useCallback(() => {
    setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
  }, [images.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') goToPrevious();
      if (e.key === 'ArrowRight') goToNext();
      if (e.key === 'Escape') onOpenChange(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, goToPrevious, goToNext, onOpenChange]);

  if (images.length === 0) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[100vw] w-full h-[100dvh] md:max-w-[95vw] md:h-[95vh] p-0 bg-black/95 border-none !flex flex-col overflow-hidden">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 h-10 w-10 backdrop-blur-sm bg-black/20"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-6 h-6" />
        </Button>

        {/* Mobile View: Vertical Scroll */}
        <div className="flex-1 md:hidden overflow-y-auto min-h-0 touch-pan-y pt-16">
          <div className="flex flex-col items-center gap-8 py-10 px-4">
            {images.map((img, idx) => (
              <div key={idx} className="w-full flex flex-col items-center gap-2">
                <img
                  src={img.url}
                  alt={img.name}
                  className="w-full h-auto rounded-lg shadow-2xl border border-white/5"
                />
                <p className="text-white/40 text-xs text-center px-4">{img.name}</p>
              </div>
            ))}
            <div className="h-20" /> {/* Bottom spacing for mobile */}
          </div>
        </div>

        {/* Desktop View: Interactive Carousel */}
        <div className="hidden md:flex flex-1 flex-col min-h-0 relative">
          <div className="flex-1 flex items-center justify-center p-12 relative">
            {/* Previous button */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute left-6 z-40 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                onClick={goToPrevious}
              >
                <ChevronLeft className="w-8 h-8" />
              </Button>
            )}

            {/* Current image */}
            <div className="w-full h-full flex flex-col items-center justify-center gap-4">
              <img
                src={images[currentIndex].url}
                alt={images[currentIndex].name}
                className="max-w-full max-h-[70vh] object-contain shadow-2xl rounded-sm"
              />
              <p className="text-white/60 text-sm font-medium tracking-tight">
                {images[currentIndex].name}
              </p>
            </div>

            {/* Next button */}
            {images.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-6 z-40 text-white hover:bg-white/20 h-12 w-12 rounded-full"
                onClick={goToNext}
              >
                <ChevronRight className="w-8 h-8" />
              </Button>
            )}
          </div>

          {/* Desktop Thumbnails */}
          {images.length > 1 && (
            <div className="bg-black/40 backdrop-blur-md border-t border-white/5 p-4 flex justify-center gap-3">
              <ScrollArea className="max-w-4xl">
                <div className="flex items-center gap-3 pb-2 px-4">
                  {images.map((img, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={cn(
                        'shrink-0 w-20 aspect-video rounded-md overflow-hidden border-2 transition-all relative group',
                        index === currentIndex 
                          ? 'border-primary ring-2 ring-primary/20 scale-105' 
                          : 'border-white/10 opacity-50 hover:opacity-100 hover:border-white/30'
                      )}
                    >
                      <img
                        src={img.url}
                        alt={img.name}
                        className="w-full h-full object-cover"
                      />
                      <div className={cn(
                        "absolute inset-0 bg-primary/20 transition-opacity",
                        index === currentIndex ? "opacity-100" : "opacity-0 group-hover:opacity-100"
                      )} />
                    </button>
                  ))}
                </div>
              </ScrollArea>
              <div className="flex items-center text-white/40 text-xs font-mono px-4 border-l border-white/5">
                {currentIndex + 1} / {images.length}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
