import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { BetaFeedbackImageUploader } from './BetaFeedbackImageUploader';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface UploadedImage {
  url: string;
  name: string;
  type: string;
}

interface BetaFeedbackFormProps {
  appId: string;
  onSuccess?: () => void;
  onCancel?: () => void;
  showCancel?: boolean;
}

export function BetaFeedbackForm({ appId, onSuccess, onCancel, showCancel }: BetaFeedbackFormProps) {
  const { t } = useTranslation('beta');
  const { user } = useAuth();
  
  const [type, setType] = useState<'bug' | 'ux' | 'feature' | 'other'>('bug');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);
  const [images, setImages] = useState<UploadedImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

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
        onImagesChange={setImages}
        maxImages={10}
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
        <Button type="submit" className={showCancel ? "flex-1" : "w-full"} disabled={submitting || !content.trim()}>
          <Send className="w-4 h-4 mr-2" />
          {submitting ? '...' : t('reportSubmit')}
        </Button>
      </div>
    </form>
  );
}