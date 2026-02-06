import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useBetaSquad } from '@/hooks/useBetaSquad';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Star, Send } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

interface BetaFeedbackFormProps {
  appId: string;
  onSuccess?: () => void;
}

export function BetaFeedbackForm({ appId, onSuccess }: BetaFeedbackFormProps) {
  const { t } = useTranslation('beta');
  const { submitFeedback, submitting } = useBetaSquad(appId);
  
  const [type, setType] = useState<'bug' | 'ux' | 'feature' | 'other'>('bug');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState<number>(0);
  const [hoveredRating, setHoveredRating] = useState<number>(0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!content.trim()) {
      toast.error('Please describe your finding');
      return;
    }

    const result = await submitFeedback(type, content.trim(), rating || undefined);
    
    if (result.success) {
      toast.success(t('reportSuccess'));
      setContent('');
      setRating(0);
      onSuccess?.();
    } else {
      toast.error(result.error || t('reportError'));
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

      <div className="space-y-2">
        <Label>{t('ratingLabel')}</Label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className="p-1 transition-transform hover:scale-110"
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              onClick={() => setRating(star === rating ? 0 : star)}
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  (hoveredRating || rating) >= star
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-muted-foreground'
                )}
              />
            </button>
          ))}
        </div>
      </div>

      <Button type="submit" className="w-full" disabled={submitting || !content.trim()}>
        <Send className="w-4 h-4 mr-2" />
        {submitting ? '...' : t('reportSubmit')}
      </Button>
    </form>
  );
}