import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useTesterFeedback } from '@/hooks/useTesterFeedback';
import { BetaFeedbackForm } from './BetaFeedbackForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, MessageSquare } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface BetaActionCardProps {
  appId: string;
}

export function BetaActionCard({ appId }: BetaActionCardProps) {
  const { t } = useTranslation('beta');
  const { feedback, refetch } = useTesterFeedback(appId);
  const [open, setOpen] = useState(false);

  const handleFormSuccess = () => {
    setOpen(false);
    refetch();
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'open': return 'outline';
      case 'in_review': return 'secondary';
      case 'closed': return 'default';
      default: return 'outline';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return t('feedbackOpen');
      case 'in_review': return t('feedbackInReview');
      case 'closed': return t('feedbackClosed');
      default: return status;
    }
  };

  const recentFeedback = feedback.slice(0, 3);

  return (
    <>
      <Card className="h-full border-primary/20 flex flex-col">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <MessageSquare className="w-4 h-4 text-primary" />
            Reportar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 flex-1">
          <Button 
            className="w-full" 
            variant="outline"
            onClick={() => setOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            {t('reportNewFinding')} 🐛
          </Button>

          <div className="space-y-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
              {t('myReports')}
            </p>
            {recentFeedback.length === 0 ? (
              <p className="text-sm text-muted-foreground italic">
                {t('noReportsYet')}
              </p>
            ) : (
              <div className="space-y-3">
                {recentFeedback.map(item => (
                  <div key={item.id} className="p-3 rounded-lg bg-muted/40 border space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-relaxed">
                        {item.content}
                      </p>
                      <Badge variant={getStatusBadgeVariant(item.status) as "default" | "secondary" | "destructive" | "outline"} className="text-[10px] h-5 px-1.5 shrink-0 mt-0.5">
                        {getStatusLabel(item.status)}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground font-light">
                       {new Date(item.created_at).toLocaleDateString('es-ES', { 
                         day: 'numeric', 
                         month: 'long', 
                         hour: '2-digit', 
                         minute: '2-digit' 
                       })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('reportNewFinding')}</DialogTitle>
          </DialogHeader>
          <BetaFeedbackForm 
            appId={appId} 
            onSuccess={handleFormSuccess}
            onCancel={() => setOpen(false)}
            showCancel
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
