import { useState, useEffect } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useTesterFeedback } from '@/hooks/useTesterFeedback';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BetaFeedbackImageUploader } from './BetaFeedbackImageUploader';
import { Star, Send, Save } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadedImage {
  url: string;
  name: string;
  type: string;
  path: string;
  id?: string;
}

import { FeedbackAttachment } from '@/hooks/useTesterFeedback';

interface BetaFeedbackFormProps {
  appId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
  mode?: 'create' | 'edit';
  feedbackId?: string;
  initialData?: {
    type: string;
    content: string;
    rating: number | null;
    attachments?: FeedbackAttachment[];
  };
}

export function BetaFeedbackForm({ 
  appId, 
  onSuccess, 
  onCancel, 
  showCancel,
  mode = 'create',
  feedbackId,
  initialData
}: BetaFeedbackFormProps) {
  const { t } = useTranslation('beta');
  const { user } = useAuth();
  const { updateFeedback } = useTesterFeedback(appId);
  
  const [type, setType] = useState<'bug' | 'ux' | 'feature' | 'other'>(
    (initialData?.type as any) || 'bug'
  );
  const [content, setContent] = useState(initialData?.content || '');
  const [rating, setRating] = useState<number>(initialData?.rating || 0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [images, setImages] = useState<UploadedImage[]>(
    initialData?.attachments?.map(att => ({
      url: att.file_url,
      name: att.file_name,
      type: att.file_type,
      path: att.file_path || '',
      id: att.id
    })) || []
  );
  const [submitting, setSubmitting] = useState(false);

  // Sync with initialData if it changes
  useEffect(() => {
    if (initialData) {
      setType(initialData.type as any);
      setContent(initialData.content);
      setRating(initialData.rating || 0);
      setImages(initialData.attachments?.map(att => ({
        url: att.file_url,
        name: att.file_name,
        type: att.file_type,
        path: att.file_path || '',
        id: att.id
      })) || []);
    }
  }, [initialData]);

  const handleImagesChange = async (newImages: UploadedImage[]) => {
    // If in edit mode, handle database sync for NEW images
    if (mode === 'edit' && feedbackId) {
      const addedImages = newImages.filter(ni => !ni.id);
      
      for (const image of addedImages) {
        try {
          const { data, error } = await supabase
            .from('beta_feedback_attachments')
            .insert({
              feedback_id: feedbackId,
              file_url: image.url,
              file_name: image.name,
              file_type: image.type,
              file_path: image.path
            })
            .select()
            .single();

          if (error) throw error;

          // Update the image with its new DB ID to prevent re-insertion
          image.id = data.id;
        } catch (err) {
          console.error('Error inserting new attachment:', err);
          toast.error('Error saving image');
        }
      }
    }
    
    setImages([...newImages]);
  };

  const handleImageRemove = async (image: UploadedImage) => {
    // 1. Physical deletion from storage
    if (image.path) {
      try {
        const { error: storageError } = await supabase.storage
          .from('feedback-attachments')
          .remove([image.path]);
        
        if (storageError) {
          console.error('Error removing file from storage:', storageError);
        }
      } catch (err) {
        console.error('Error in handleImageRemove storage:', err);
      }
    }

    // 2. If it has an ID, delete from database
    if (image.id) {
      try {
        const { error: dbError } = await supabase
          .from('beta_feedback_attachments')
          .delete()
          .eq('id', image.id);
        
        if (dbError) throw dbError;
      } catch (err) {
        console.error('Error deleting attachment record:', err);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please describe your finding');
      return;
    }

    if (!user) {
      toast.error('Not authenticated');
      return;
    }

    setSubmitting(true);

    try {
      if (mode === 'edit' && feedbackId) {
        await updateFeedback({
          feedbackId,
          type,
          content: content.trim(),
          rating: rating || null,
        });
        toast.success(t('reportUpdated') || 'Report updated');
        onSuccess?.();
        return;
      }

      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.access_token) {
        toast.error('Not authenticated');
        return;
      }

      const response = await fetch(
        `https://zkotnnmrehzqonlyeorv.supabase.co/functions/v1/submit-beta-feedback`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
          body: JSON.stringify({
            app_id: appId,
            type,
            content: content.trim(),
            rating: rating || null,
            attachments: images.length > 0 ? images : undefined,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || t('reportError'));
        return;
      }

      toast.success(t('reportSuccess'));
      setContent('');
      setRating(0);
      setImages([]);
      onSuccess?.();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      toast.error(t('reportError'));
    } finally {
      setSubmitting(false);
    }
  };

  const typeOptions = [
    { value: 'bug', label: t('reportBug') },
    { value: 'ux', label: t('reportUx') },
    { value: 'feature', label: t('reportFeature') },
    { value: 'other', label: t('reportOther') },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label>{t('reportType')}</Label>
        <Select value={type} onValueChange={(v) => setType(v as typeof type)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {typeOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-2">
        <Label>{t('reportTitle')}</Label>
        <Textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('reportPlaceholder')}
          rows={4}
          className="resize-none"
        />
      </div>

      <BetaFeedbackImageUploader
        images={images}
        onImagesChange={handleImagesChange}
        onImageRemove={handleImageRemove}
        maxImages={5}
        disabled={submitting}
      />

      <div className="flex gap-2">
        {showCancel && (
          <Button 
            type="button" 
            variant="outline" 
            className="flex-1"
            onClick={onCancel}
            disabled={submitting}
          >
            {t('cancel')}
          </Button>
        )}
        <Button 
          type="submit" 
          className={cn(showCancel ? "flex-1" : "w-full")} 
          disabled={submitting || !content.trim()}
        >
          {mode === 'edit' ? (
            <Save className="w-4 h-4 mr-2" />
          ) : (
            <Send className="w-4 h-4 mr-2" />
          )}
          {submitting ? '...' : (mode === 'edit' ? t('saveChanges') || 'Guardar cambios' : t('reportSubmit'))}
        </Button>
      </div>
    </form>
  );
}
