import { useState, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Loader2, Upload, Trash2, Check, Image as ImageIcon, X } from 'lucide-react';
import { useProjectResources, useUploadResource, useDeleteResource, getResourceUrl, ProjectResource } from '@/hooks/useProjectResources';
import { useDomainScrape, StoredImages, BrandingData } from '@/hooks/useDomainBranding';
import { useLanguage } from '@/contexts/LanguageContext';
import { toast } from 'sonner';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface ResourceGalleryModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  projectDomain: string;
  onSelect: (url: string) => void;
  resourceType?: string;
  title?: string;
}

interface ScrapedImage {
  type: 'logo' | 'favicon' | 'ogImage';
  url: string;
  label: string;
}

export const ResourceGalleryModal = ({
  open,
  onOpenChange,
  projectId,
  projectDomain,
  onSelect,
  resourceType,
  title,
}: ResourceGalleryModalProps) => {
  const { t } = useLanguage();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<ProjectResource | null>(null);

  // Fetch user-uploaded resources
  const { data: resources, isLoading: resourcesLoading } = useProjectResources(projectId, resourceType);
  
  // Fetch scraped images
  const { data: domainScrape } = useDomainScrape(projectDomain);
  
  const uploadMutation = useUploadResource();
  const deleteMutation = useDeleteResource();

  // Get scraped images as a list
  const getScrapedImages = (): ScrapedImage[] => {
    const images: ScrapedImage[] = [];
    const storedImages = domainScrape?.stored_images;
    const brandingImages = domainScrape?.branding?.images;

    const addImage = (type: 'logo' | 'favicon' | 'ogImage', url: string | undefined, label: string) => {
      if (url) {
        images.push({ type, url, label });
      }
    };

    // Prefer stored images (from Supabase storage), fallback to original
    addImage('logo', storedImages?.logo || brandingImages?.logo, t('resources.scraped_logo'));
    addImage('favicon', storedImages?.favicon || brandingImages?.favicon, t('resources.scraped_favicon'));
    addImage('ogImage', storedImages?.ogImage || brandingImages?.ogImage, t('resources.scraped_og'));

    return images;
  };

  const scrapedImages = getScrapedImages();

  const handleFileSelect = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error(t('resources.invalid_type'));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t('resources.file_too_large'));
      return;
    }

    try {
      const resource = await uploadMutation.mutateAsync({
        projectId,
        projectDomain,
        file,
        resourceType: resourceType || 'image',
      });
      
      toast.success(t('resources.upload_success'));
      
      // Auto-select the uploaded image
      onSelect(getResourceUrl(resource));
      onOpenChange(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(t('resources.upload_error'));
    }
  }, [projectId, projectDomain, resourceType, uploadMutation, onSelect, onOpenChange, t]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  }, [handleFileSelect]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDelete = async (resource: ProjectResource) => {
    try {
      await deleteMutation.mutateAsync(resource);
      toast.success(t('resources.delete_success'));
      setDeleteConfirm(null);
    } catch (error) {
      console.error('Delete error:', error);
      toast.error(t('resources.delete_error'));
    }
  };

  const handleSelectImage = (url: string) => {
    onSelect(url);
    onOpenChange(false);
  };

  const isLoading = resourcesLoading || uploadMutation.isPending;
  const hasResources = (resources && resources.length > 0) || scrapedImages.length > 0;

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              {title || t('resources.gallery')}
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto space-y-4">
            {/* Upload Area */}
            <div
              className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
              }`}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files)}
              />
              {uploadMutation.isPending ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <span className="text-sm text-muted-foreground">{t('resources.uploading')}</span>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <Upload className="w-8 h-8 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{t('resources.drag_drop')}</span>
                  <span className="text-xs text-muted-foreground">{t('resources.max_size')}</span>
                </div>
              )}
            </div>

            {/* Loading State */}
            {resourcesLoading && (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            )}

            {/* User Uploaded Images */}
            {resources && resources.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">{t('resources.uploaded_images')}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {resources.map((resource) => {
                    const url = getResourceUrl(resource);
                    return (
                      <div
                        key={resource.id}
                        className="group relative aspect-square rounded-md border border-border overflow-hidden bg-muted/50 hover:border-primary transition-colors cursor-pointer"
                        onClick={() => handleSelectImage(url)}
                      >
                        <img
                          src={url}
                          alt={resource.original_name || 'Image'}
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            e.currentTarget.src = '/placeholder.svg';
                          }}
                        />
                        {/* Hover overlay */}
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="secondary"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectImage(url);
                            }}
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            className="h-7 w-7"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteConfirm(resource);
                            }}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {/* File name */}
                        <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                          <span className="text-[9px] text-white truncate block">
                            {resource.original_name || `${resource.file_name}.${resource.file_extension}`}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Scraped Images */}
            {scrapedImages.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-medium text-muted-foreground uppercase">{t('resources.system_images')}</h4>
                <div className="grid grid-cols-4 gap-2">
                  {scrapedImages.map((img) => (
                    <div
                      key={img.type}
                      className="group relative aspect-square rounded-md border border-border overflow-hidden bg-muted/50 hover:border-primary transition-colors cursor-pointer"
                      onClick={() => handleSelectImage(img.url)}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-full object-contain p-2"
                        onError={(e) => {
                          e.currentTarget.src = '/placeholder.svg';
                        }}
                      />
                      {/* Hover overlay */}
                      <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Button
                          size="icon"
                          variant="secondary"
                          className="h-7 w-7"
                        >
                          <Check className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* Label */}
                      <div className="absolute bottom-0 left-0 right-0 bg-black/60 px-1 py-0.5">
                        <span className="text-[9px] text-white truncate block">{img.label}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {!resourcesLoading && !hasResources && (
              <div className="text-center py-8 text-muted-foreground">
                <ImageIcon className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p className="text-sm">{t('resources.empty')}</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end pt-4 border-t">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('resources.delete_confirm_title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('resources.delete_confirm_desc')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => deleteConfirm && handleDelete(deleteConfirm)}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {t('resources.delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
