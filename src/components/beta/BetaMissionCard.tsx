import { useTranslation } from '@/hooks/useTranslation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { parseMarkdown } from '@/lib/markdown';
import { Shield, ExternalLink, FileText, Copy, Check, Layout } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
import { normalizeUrl } from '@/lib/utils';
import { ImageCarouselDialog } from './ImageCarouselDialog';

import { FeedbackAttachment } from '@/hooks/useTesterFeedback';

interface BetaMissionCardProps {
  instructions: string | null;
  betaLink: string | null;
  attachments?: FeedbackAttachment[];
}

export function BetaMissionCard({ instructions, betaLink, attachments = [] }: BetaMissionCardProps) {
  const { t } = useTranslation('beta');
  const [copied, setCopied] = useState(false);
  
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState<{ url: string; name: string }[]>([]);
  const [carouselInitialIndex, setCarouselInitialIndex] = useState(0);

  const handleCopyLink = () => {
    if (betaLink) {
      navigator.clipboard.writeText(betaLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied');
    }
  };

  const openImageCarousel = (images: FeedbackAttachment[], index: number) => {
    setCarouselImages(images.map(img => ({ url: img.file_url, name: img.file_name })));
    setCarouselInitialIndex(index);
    setCarouselOpen(true);
  };

  return (
    <>
      <Card className="h-full border-primary/20 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Shield className="w-4 h-4 text-primary" />
            {t('missionTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 flex-1 flex flex-col pt-0">
          {/* Instructions */}
          <div className="space-y-3">
            {instructions ? (
              <div 
                className="text-sm text-muted-foreground bg-muted/50 p-4 rounded-lg prose prose-sm max-w-none dark:prose-invert"
                dangerouslySetInnerHTML={{ __html: parseMarkdown(instructions) }}
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                {t('noInstructions')}
              </p>
            )}
          </div>

          {/* Access Button (Moved UP) */}
          {betaLink && (
            <div className="flex gap-2">
              <Button 
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-semibold"
                size="lg"
                onClick={() => window.open(normalizeUrl(betaLink), '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('accessLink')}
              </Button>
              <Button
                variant="outline"
                size="icon"
                className="h-11 w-11 shrink-0 bg-background"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="w-5 h-5 text-green-500" />
                ) : (
                  <Copy className="w-5 h-5" />
                )}
              </Button>
            </div>
          )}

          {!betaLink && (
            <p className="text-sm text-muted-foreground italic text-center py-2 bg-muted/30 rounded-lg">
              {t('noLink')}
            </p>
          )}

          {/* Visual Context / Screenshots Placeholder */}
          <div className="space-y-4 pt-4 border-t border-primary/10 flex-1">
            <div className="flex items-center gap-2">
              <Layout className="w-4 h-4 text-primary/60" />
              <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/80">
                {t('visualContext')}
              </h4>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {attachments.length > 0 ? (
                attachments.map((att, idx) => (
                  <div 
                    key={att.id} 
                    onClick={() => openImageCarousel(attachments, idx)}
                    className="group relative aspect-video rounded-xl bg-muted border overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
                  >
                    {att.file_type?.startsWith('image/') ? (
                      <img 
                        src={att.file_url} 
                        alt={att.file_name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" 
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-2">
                        <FileText className="w-6 h-6 text-muted-foreground" />
                        <span className="text-[10px] text-muted-foreground truncate w-full text-center">
                          {att.file_name}
                        </span>
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <ExternalLink className="w-5 h-5 text-white drop-shadow-md" />
                    </div>
                  </div>
                ))
              ) : (
                [1, 2, 3].map((i) => (
                  <div key={i} className="space-y-2 opacity-40">
                    <Skeleton className="aspect-video rounded-xl bg-muted/60" />
                    <Skeleton className="h-2 w-2/3 rounded-full bg-muted/40" />
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <ImageCarouselDialog
        images={carouselImages}
        initialIndex={carouselInitialIndex}
        open={carouselOpen}
        onOpenChange={setCarouselOpen}
      />
    </>
  );
}
