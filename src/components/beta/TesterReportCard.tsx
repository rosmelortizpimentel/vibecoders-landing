import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTesterFeedback, TesterFeedback } from '@/hooks/useTesterFeedback';
import { BetaFeedbackForm } from './BetaFeedbackForm';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';
import { TesterFeedbackResponseDialog } from './TesterFeedbackResponseDialog';
import { ImageCarouselDialog } from './ImageCarouselDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Bug, 
  Palette, 
  Lightbulb, 
  HelpCircle,
  AlertTriangle,
  MessageSquare,
  Plus,
} from 'lucide-react';
import { toast } from 'sonner';

interface TesterReportCardProps {
  appId: string;
}

export function TesterReportCard({ appId }: TesterReportCardProps) {
  const { t } = useTranslation('beta');
  const { language } = useLanguage();
  const { feedback, loading, refetch, respondToResolution, responding } = useTesterFeedback(appId);
  
  const [showForm, setShowForm] = useState(false);
  const [selectedFeedback, setSelectedFeedback] = useState<TesterFeedback | null>(null);
  const [carouselOpen, setCarouselOpen] = useState(false);
  const [carouselImages, setCarouselImages] = useState<{ url: string; name: string }[]>([]);
  const [carouselInitialIndex, setCarouselInitialIndex] = useState(0);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4 text-destructive" />;
      case 'ux': return <Palette className="w-4 h-4 text-primary" />;
      case 'feature': return <Lightbulb className="w-4 h-4 text-primary" />;
      default: return <HelpCircle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'bug': return t('reportBug');
      case 'ux': return t('reportUx');
      case 'feature': return t('reportFeature');
      default: return t('reportOther');
    }
  };

  const handleConfirmFixed = async () => {
    if (!selectedFeedback) return;
    try {
      await respondToResolution({ feedbackId: selectedFeedback.id, response: 'confirmed' });
      toast.success(t('feedbackClosed'));
      setSelectedFeedback(null);
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const handleReopen = async () => {
    if (!selectedFeedback) return;
    try {
      await respondToResolution({ feedbackId: selectedFeedback.id, response: 'reopened' });
      toast.success(t('feedbackReopened'));
      setSelectedFeedback(null);
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const openImageCarousel = (images: { file_url: string; file_name: string }[], index: number) => {
    setCarouselImages(images.map(img => ({ url: img.file_url, name: img.file_name })));
    setCarouselInitialIndex(index);
    setCarouselOpen(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    refetch();
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flip-card-inner" data-flipped={showForm ? "true" : undefined}>
          {/* Front - Report List */}
          {!showForm && (
            <div className="flip-card-front">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MessageSquare className="w-4 h-4" />
                    {t('myReports')} ({feedback.length})
                  </CardTitle>
                  <Button 
                    size="sm" 
                    onClick={() => setShowForm(true)}
                    className="gap-1"
                  >
                    <Plus className="w-4 h-4" />
                    <span className="hidden sm:inline">{t('reportNewFinding')}</span>
                    <span className="sm:hidden">Reportar</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {feedback.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-6">
                    {t('noReportsYet')}
                  </p>
                ) : (
                  <div className="space-y-3 max-h-[400px] overflow-y-auto">
                    {feedback.map((item) => (
                      <div 
                        key={item.id}
                        className="p-3 rounded-lg border bg-card space-y-2"
                      >
                        {/* Header */}
                        <div className="flex items-center justify-between flex-wrap gap-2">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(item.type)}
                            <Badge variant="outline" className="text-xs">
                              {getTypeLabel(item.type)}
                            </Badge>
                            <FeedbackStatusBadge status={item.status} />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {format(
                              new Date(item.created_at), 
                              'dd MMM, HH:mm',
                              { locale: language === 'es' ? es : enUS }
                            )}
                          </span>
                        </div>

                        {/* Alert for in_review status */}
                        {item.status === 'in_review' && (
                          <button
                            onClick={() => setSelectedFeedback(item)}
                            className="flex items-center gap-2 w-full p-2 rounded-md bg-primary/10 text-primary text-sm hover:bg-primary/15 transition-colors text-left"
                          >
                            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                            <span className="flex-1">{t('pendingVerification')}</span>
                            <span className="text-xs underline">{t('respond')}</span>
                          </button>
                        )}

                        {/* Content */}
                        <p className="text-sm">{item.content}</p>

                        {/* Attachments */}
                        {item.attachments.length > 0 && (
                          <div className="flex flex-wrap gap-2 pt-1">
                            {item.attachments.map((att, idx) => (
                              <button
                                key={att.id}
                                onClick={() => openImageCarousel(item.attachments, idx)}
                                className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity ring-1 ring-border"
                              >
                                <img
                                  src={att.file_url}
                                  alt={att.file_name}
                                  className="h-16 w-16 object-cover"
                                />
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </div>
          )}

          {/* Back - Report Form */}
          {showForm && (
            <div className="flip-card-back">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Plus className="w-4 h-4" />
                  {t('reportTitle')}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <BetaFeedbackForm 
                  appId={appId} 
                  onSuccess={handleFormSuccess}
                  onCancel={() => setShowForm(false)}
                  showCancel
                />
              </CardContent>
            </div>
          )}
        </div>
      </Card>

      <TesterFeedbackResponseDialog
        open={!!selectedFeedback}
        onOpenChange={(open) => !open && setSelectedFeedback(null)}
        feedbackId={selectedFeedback?.id || ''}
        onConfirmFixed={handleConfirmFixed}
        onReopen={handleReopen}
      />

      <ImageCarouselDialog
        images={carouselImages}
        initialIndex={carouselInitialIndex}
        open={carouselOpen}
        onOpenChange={setCarouselOpen}
      />
    </>
  );
}
