import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS, fr, pt } from 'date-fns/locale';
import { Trash2, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';
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
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useFeedback } from '@/hooks/useFeedback';
import { toast } from 'sonner';
import type { FeedbackThread } from '@/hooks/useFeedback';

interface FeedbackThreadListProps {
  threads: FeedbackThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string | null) => void;
}

export function FeedbackThreadList({ 
  threads, 
  selectedThreadId, 
  onSelectThread 
}: FeedbackThreadListProps) {
  const t = useTranslation('feedback');
  const { language } = useLanguage();
  const { deleteThread, isDeleting } = useFeedback();
  
  const getDateLocale = () => {
    switch (language) {
      case 'en': return enUS;
      case 'fr': return fr;
      case 'pt': return pt;
      default: return es;
    }
  };

  const dateLocale = getDateLocale();
  
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!threadToDelete) return;
    
    try {
      await deleteThread(threadToDelete);
      toast.success(t.deleted);
      if (selectedThreadId === threadToDelete) {
        onSelectThread(null);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast.error(t.deleteError);
    } finally {
      setThreadToDelete(null);
    }
  };

  if (threads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        {t.noConversations}
      </div>
    );
  }

  return (
    <>
      <ScrollArea className="h-full">
        <div className="p-2 space-y-1">
          {threads.map((thread) => {
            const initials = thread.profile?.name
              ?.split(' ')
              .map(n => n[0])
              .join('')
              .toUpperCase() || '?';

            const timeAgo = formatDistanceToNow(new Date(thread.last_message_at), {
              addSuffix: false,
              locale: dateLocale,
            });

            const displayName = thread.profile?.name || 'Usuario';
            const displayUsername = thread.profile?.username;

            return (
              <div
                key={thread.id}
                className={cn(
                  'group relative w-full flex items-start gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer',
                  selectedThreadId === thread.id
                    ? 'bg-primary/10'
                    : 'hover:bg-muted'
                )}
                onClick={() => onSelectThread(thread.id)}
              >
                <Avatar className="h-10 w-10 shrink-0 mt-0.5">
                  <AvatarImage 
                    src={thread.profile?.avatar_url || ''} 
                    alt={displayName} 
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{displayName}</p>
                  {displayUsername && (
                    <p className="text-xs text-muted-foreground truncate">@{displayUsername}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-1">
                    {thread.message_count} {t.messages} · {timeAgo}
                  </p>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 shrink-0 h-7 w-7 text-destructive hover:text-destructive hover:bg-destructive/10 mt-0.5"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThreadToDelete(thread.id);
                  }}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <AlertDialog open={!!threadToDelete} onOpenChange={() => setThreadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t.deleteConfirm}</AlertDialogTitle>
            <AlertDialogDescription>{t.deleteDescription}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'es' ? 'Cancelar' : language === 'fr' ? 'Annuler' : language === 'pt' ? 'Cancelar' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {language === 'es' ? 'Eliminar' : language === 'fr' ? 'Supprimer' : language === 'pt' ? 'Excluir' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
