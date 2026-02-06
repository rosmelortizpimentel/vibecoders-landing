import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import { useBetaSquad } from '@/hooks/useBetaSquad';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { BetaFeedbackForm } from './BetaFeedbackForm';
import { Shield, ExternalLink, FileText, LogOut, Copy, Check } from 'lucide-react';
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
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface BetaTesterPanelProps {
  appId: string;
  betaLink: string | null;
  betaInstructions: string | null;
  onLeft: () => void;
}

export function BetaTesterPanel({
  appId,
  betaLink,
  betaInstructions,
  onLeft,
}: BetaTesterPanelProps) {
  const { t } = useTranslation('beta');
  const { leaveBeta, leaving } = useBetaSquad(appId);
  const [copied, setCopied] = useState(false);

  const handleLeave = async () => {
    const result = await leaveBeta();
    if (result.success) {
      toast.success(t('leftBeta'));
      onLeft();
    }
  };

  const handleCopyLink = () => {
    if (betaLink) {
      navigator.clipboard.writeText(betaLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success('Link copied');
    }
  };

  return (
    <Card className="border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          {t('welcome')}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Instructions Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="w-4 h-4" />
            {t('instructions')}
          </div>
          {betaInstructions ? (
            <p className="text-sm text-muted-foreground whitespace-pre-wrap bg-muted/50 p-3 rounded-lg">
              {betaInstructions}
            </p>
          ) : (
            <p className="text-sm text-muted-foreground italic">
              {t('noInstructions')}
            </p>
          )}
        </div>

        {/* Access Link Section */}
        <div className="space-y-3">
          {betaLink ? (
            <div className="flex gap-2">
              <Button 
                className="flex-1"
                onClick={() => window.open(betaLink, '_blank')}
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                {t('accessLink')}
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={handleCopyLink}
              >
                {copied ? (
                  <Check className="w-4 h-4 text-green-500" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground italic text-center py-2">
              {t('noLink')}
            </p>
          )}
        </div>

        <Separator />

        {/* Feedback Form */}
        <div className="space-y-3">
          <h4 className="font-medium">{t('reportTitle')}</h4>
          <BetaFeedbackForm appId={appId} />
        </div>

        <Separator />

        {/* Leave Squad */}
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" className="w-full text-destructive hover:text-destructive">
              <LogOut className="w-4 h-4 mr-2" />
              {t('leaveBeta')}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{t('leaveBeta')}</AlertDialogTitle>
              <AlertDialogDescription>
                {t('leaveConfirm')}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={handleLeave} disabled={leaving}>
                {leaving ? '...' : t('leaveBeta')}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </CardContent>
    </Card>
  );
}