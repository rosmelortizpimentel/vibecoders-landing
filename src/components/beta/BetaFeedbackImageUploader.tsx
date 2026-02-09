import { useState, useRef } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { ImagePlus, X, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadedImage {
  url: string;
  name: string;
  type: string;
  path: string;
  id?: string;
}

interface BetaFeedbackImageUploaderProps {
  images: UploadedImage[];
  onImagesChange: (images: UploadedImage[]) => void;
  onImageRemove?: (image: UploadedImage) => void;
  maxImages?: number;
  disabled?: boolean;
}

export function BetaFeedbackImageUploader({
  images,
  onImagesChange,
  onImageRemove,
  maxImages = 10,
  disabled = false,
}: BetaFeedbackImageUploaderProps) {
  const { t } = useTranslation('beta');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const remainingSlots = maxImages - images.length;
    if (remainingSlots <= 0) {
      toast.error(t('maxImagesReached'));
      return;
    }

    const filesToUpload = files.slice(0, remainingSlots);
    
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    const invalidFiles = filesToUpload.filter(f => !validTypes.includes(f.type));
    if (invalidFiles.length > 0) {
      toast.error(t('invalidImageType'));
      return;
    }

    // Validate file sizes (max 5MB each)
    const oversizedFiles = filesToUpload.filter(f => f.size > 5 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(t('imageTooLarge'));
      return;
    }

    setUploading(true);
    const newImages: UploadedImage[] = [];

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `${crypto.randomUUID()}.${fileExt}`;
        const filePath = `${user.id}/beta-feedback/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('feedback-attachments')
          .upload(filePath, file);

        if (uploadError) {
          console.error('Upload error:', uploadError);
          continue;
        }

        const { data: urlData } = supabase.storage
          .from('feedback-attachments')
          .getPublicUrl(filePath);

        newImages.push({
          url: urlData.publicUrl,
          name: file.name,
          type: file.type,
          path: filePath,
        });
      }

      if (newImages.length > 0) {
        onImagesChange([...images, ...newImages]);
      }
    } catch (err) {
      console.error('Error uploading images:', err);
      toast.error(t('uploadError'));
    } finally {
      setUploading(false);
      // Reset input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = (index: number) => {
    const imageToRemove = images[index];
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
    if (onImageRemove) {
      onImageRemove(imageToRemove);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted-foreground">
          {t('attachImages')} ({images.length}/{maxImages})
        </span>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading || images.length >= maxImages}
        >
          {uploading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <ImagePlus className="w-4 h-4 mr-2" />
          )}
          {uploading ? t('uploadingImages') : t('addImages')}
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
        />
      </div>

      {images.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          {images.map((image, index) => (
            <div 
              key={index} 
              className="relative aspect-square rounded-lg overflow-hidden bg-muted group"
            >
              <img
                src={image.url}
                alt={image.name}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleRemove(index)}
                className={cn(
                  "absolute top-1 right-1 p-1 rounded-full",
                  "bg-background/80 hover:bg-background",
                  "opacity-0 group-hover:opacity-100 transition-opacity"
                )}
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
