import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTesterFeedback, TesterFeedback } from '@/hooks/useTesterFeedback';
import { FeedbackStatusBadge } from './FeedbackStatusBadge';
import { TesterFeedbackResponseDialog } from './TesterFeedbackResponseDialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { es, enUS, fr, pt } from 'date-fns/locale';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  Bug, 
  Palette, 
  Lightbulb, 
  HelpCircle,
  AlertTriangle,
  MessageSquare,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

interface TesterFeedbackHistoryProps {
  appId: string;
}

export function TesterFeedbackHistory({ appId }: TesterFeedbackHistoryProps) {
  const { t } = useTranslation('beta');
  const { language } = useLanguage();
  const { feedback, loading, respondToResolution, responding } = useTesterFeedback(appId);

  const getDateLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'fr': return fr;
      case 'pt': return pt;
      default: return es;
    }
  };
  const [selectedFeedback, setSelectedFeedback] = useState<TesterFeedback | null>(null);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="w-4 h-4 text-destructive" />;
      case 'ux': return <Palette className="w-4 h-4 text-primary" />;
      case 'feature': return <Lightbulb className="w-4 h-4 text-yellow-500" />;
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
    } catch (err) {
      toast.error(t('error'));
    }
  };

  const handleReopen = async () => {
    if (!selectedFeedback) return;
    try {
      await respondToResolution({ feedbackId: selectedFeedback.id, response: 'reopened' });
      toast.success(t('feedbackReopened'));
    } catch (err) {
      toast.error(t('error'));
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4" />
            {t('myReports')}
          </CardTitle>
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <MessageSquare className="w-4 h-4" />
            {t('myReports')} ({feedback.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {feedback.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              {t('noReportsYet')}
            </p>
          ) : (
            <div className="space-y-4 max-h-96 overflow-y-auto">
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
                      {t('sentAt')}: {format(
                        new Date(item.created_at), 
                        'dd MMM yyyy, HH:mm',
                        { locale: getDateLocale() }
                      )}
                    </span>
                  </div>

                  {/* Alert for in_review status */}
                  {item.status === 'in_review' && (
                    <div 
                      className="flex items-center gap-2 p-2 rounded-md bg-yellow-500/10 text-yellow-700 dark:text-yellow-400 text-sm cursor-pointer hover:bg-yellow-500/20 transition-colors"
                      onClick={() => setSelectedFeedback(item)}
                    >
                      <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                      <span>{t('pendingVerification')}</span>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="ml-auto h-7"
                      >
                        {t('respond')}
                      </Button>
                    </div>
                  )}

                  {/* Content */}
                  <p className="text-sm">{item.content}</p>

                  {/* Rating */}
                  {item.rating && (
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-4 h-4 ${
                            star <= item.rating! 
                              ? 'fill-yellow-400 text-yellow-400' 
                              : 'text-muted'
                          }`}
                        />
                      ))}
                    </div>
                  )}

                  {/* Attachments */}
                  {item.attachments.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {item.attachments.map((att) => (
                        <button
                          key={att.id}
                          onClick={() => window.open(att.file_url, '_blank')}
                          className="block rounded-lg overflow-hidden hover:opacity-90 transition-opacity"
                        >
                          <img
                            src={att.file_url}
                            alt={att.file_name}
                            className="h-20 w-20 object-cover"
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
      </Card>

      <TesterFeedbackResponseDialog
        open={!!selectedFeedback}
        onOpenChange={(open) => !open && setSelectedFeedback(null)}
        feedbackId={selectedFeedback?.id || ''}
        onConfirmFixed={handleConfirmFixed}
        onReopen={handleReopen}
      />
    </>
  );
}
