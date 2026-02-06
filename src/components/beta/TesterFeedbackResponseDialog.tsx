import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { CheckCircle2, RotateCcw } from 'lucide-react';

interface TesterFeedbackResponseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  feedbackId: string;
  onConfirmFixed: () => Promise<void>;
  onReopen: () => Promise<void>;
}

export function TesterFeedbackResponseDialog({
  open,
  onOpenChange,
  feedbackId,
  onConfirmFixed,
  onReopen,
}: TesterFeedbackResponseDialogProps) {
  const { t } = useTranslation('beta');
  const [loading, setLoading] = useState(false);

  const handleResponse = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('verifyResolution')}</DialogTitle>
          <DialogDescription>
            {t('verifyResolutionDesc')}
          </DialogDescription>
        </DialogHeader>
        <DialogFooter className="flex-col sm:flex-row gap-2">
          <Button
            variant="outline"
            onClick={() => handleResponse(onReopen)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            {t('stillBroken')}
          </Button>
          <Button
            onClick={() => handleResponse(onConfirmFixed)}
            disabled={loading}
            className="w-full sm:w-auto"
          >
            <CheckCircle2 className="w-4 h-4 mr-2" />
            {t('confirmFixed')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
