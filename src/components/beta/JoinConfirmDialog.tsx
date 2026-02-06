import { useTranslation } from '@/hooks/useTranslation';
import { useBetaSquad } from '@/hooks/useBetaSquad';
import { parseMarkdown } from '@/lib/markdown';
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
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { toast } from 'sonner';

interface JoinConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  appId: string;
  appName: string | null;
  appLogo: string | null;
  betaInstructions: string | null;
  onSuccess: () => void;
}

export function JoinConfirmDialog({
  open,
  onOpenChange,
  appId,
  appName,
  appLogo,
  betaInstructions,
  onSuccess,
}: JoinConfirmDialogProps) {
  const { t } = useTranslation('beta');
  const { joinBeta, joining } = useBetaSquad(appId);

  const handleConfirm = async () => {
    const result = await joinBeta();
    if (result.success) {
      toast.success(
        result.status === 'accepted' ? t('joinedOpen') : t('requestSent')
      );
      onSuccess();
      onOpenChange(false);
    } else {
      toast.error(result.error || t('joinError'));
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-md">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-3">
            {appLogo ? (
              <img
                src={appLogo}
                alt={appName || 'App'}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
              />
            ) : (
              <Avatar className="w-10 h-10">
                <AvatarFallback>
                  {(appName || 'A').charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            )}
            <span>{t('confirmJoinTitle')}</span>
          </AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              {t('confirmJoinMessage').replace('{appName}', appName || 'esta app')}
            </p>
            {betaInstructions && (
              <div className="mt-3 p-3 bg-muted rounded-lg text-sm text-left">
                <p className="font-medium mb-1 text-foreground">{t('instructions')}:</p>
                <div 
                  className="text-muted-foreground prose prose-sm dark:prose-invert max-w-none [&>p]:mb-1 [&>ul]:my-1 [&>ol]:my-1"
                  dangerouslySetInnerHTML={{ __html: parseMarkdown(betaInstructions) }} 
                />
              </div>
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={joining}>
            {t('cancel')}
          </AlertDialogCancel>
          <AlertDialogAction onClick={handleConfirm} disabled={joining}>
            {joining ? '...' : t('confirmJoinButton')}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
