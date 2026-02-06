import { useState } from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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
import { Button } from '@/components/ui/button';
import { MoreHorizontal, ThumbsUp, Check, X, Trash2 } from 'lucide-react';

interface FeedbackActionMenuProps {
  feedbackId: string;
  isUseful: boolean;
  status: 'open' | 'in_review' | 'closed';
  onMarkUseful: (isUseful: boolean) => Promise<void>;
  onMarkResolved: () => Promise<void>;
  onClose: () => Promise<void>;
  onDelete: () => Promise<void>;
}

export function FeedbackActionMenu({
  feedbackId,
  isUseful,
  status,
  onMarkUseful,
  onMarkResolved,
  onClose,
  onDelete,
}: FeedbackActionMenuProps) {
  const { t } = useTranslation('beta');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleAction = async (action: () => Promise<void>) => {
    setLoading(true);
    try {
      await action();
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8" disabled={loading}>
            <MoreHorizontal className="w-4 h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuItem onClick={() => handleAction(() => onMarkUseful(!isUseful))}>
            <ThumbsUp className={`w-4 h-4 mr-2 ${isUseful ? 'fill-current' : ''}`} />
            {isUseful ? t('markedUseful') : t('markUseful')}
          </DropdownMenuItem>
          
          {status === 'open' && (
            <DropdownMenuItem onClick={() => handleAction(onMarkResolved)}>
              <Check className="w-4 h-4 mr-2" />
              {t('markResolved')}
            </DropdownMenuItem>
          )}
          
          {status !== 'closed' && (
            <DropdownMenuItem onClick={() => handleAction(onClose)}>
              <X className="w-4 h-4 mr-2" />
              {t('closeReport')}
            </DropdownMenuItem>
          )}
          
          <DropdownMenuSeparator />
          
          <DropdownMenuItem 
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="w-4 h-4 mr-2" />
            {t('deleteReport')}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteReport')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteReportConfirm')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                handleAction(onDelete);
                setShowDeleteConfirm(false);
              }}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
