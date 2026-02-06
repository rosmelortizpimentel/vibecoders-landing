import { useState, useCallback, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { cn } from '@/lib/utils';

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

  const currentImage = images[currentIndex];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[95vw] max-h-[95vh] p-0 bg-black/95 border-none">
        {/* Close button */}
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-2 right-2 z-50 text-white hover:bg-white/20"
          onClick={() => onOpenChange(false)}
        >
          <X className="w-5 h-5" />
        </Button>

        {/* Image container */}
        <div className="relative flex items-center justify-center min-h-[50vh] md:min-h-[70vh]">
          {/* Previous button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute left-2 z-40 text-white hover:bg-white/20 h-10 w-10"
              onClick={goToPrevious}
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
          )}

          {/* Current image */}
          <img
            src={currentImage.url}
            alt={currentImage.name}
            className="max-w-full max-h-[80vh] object-contain"
          />

          {/* Next button */}
          {images.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 z-40 text-white hover:bg-white/20 h-10 w-10"
              onClick={goToNext}
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          )}
        </div>

        {/* Indicators */}
        {images.length > 1 && (
          <div className="flex items-center justify-center gap-2 pb-4">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={cn(
                  'w-2 h-2 rounded-full transition-colors',
                  index === currentIndex ? 'bg-white' : 'bg-white/40'
                )}
              />
            ))}
            <span className="text-white/60 text-xs ml-2">
              {currentIndex + 1} / {images.length}
            </span>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
