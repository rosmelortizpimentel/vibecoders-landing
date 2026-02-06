import { useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
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
  const dateLocale = language === 'es' ? es : enUS;
  
  const [threadToDelete, setThreadToDelete] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!threadToDelete) return;
    
    try {
      await deleteThread(threadToDelete);
      toast.success(language === 'es' ? 'Conversación eliminada' : 'Conversation deleted');
      if (selectedThreadId === threadToDelete) {
        onSelectThread(null);
      }
    } catch (error) {
      console.error('Error deleting thread:', error);
      toast.error(language === 'es' ? 'Error al eliminar' : 'Error deleting');
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

            return (
              <div
                key={thread.id}
                className={cn(
                  'group relative w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors cursor-pointer',
                  selectedThreadId === thread.id
                    ? 'bg-primary/10'
                    : 'hover:bg-muted'
                )}
                onClick={() => onSelectThread(thread.id)}
              >
                <Avatar className="h-10 w-10 shrink-0">
                  <AvatarImage 
                    src={thread.profile?.avatar_url || ''} 
                    alt={thread.profile?.name || ''} 
                  />
                  <AvatarFallback>{initials}</AvatarFallback>
                </Avatar>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      {thread.profile?.username && (
                        <span className="font-medium truncate block">
                          @{thread.profile.username}
                        </span>
                      )}
                      {thread.profile?.name && (
                        <span className="text-sm text-muted-foreground truncate block">
                          {thread.profile.name}
                        </span>
                      )}
                      {!thread.profile?.username && !thread.profile?.name && (
                        <span className="font-medium truncate block">
                          Usuario
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground shrink-0">
                      {timeAgo}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {thread.message_count} {t.messages}
                  </p>
                </div>

                {/* Delete button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="opacity-0 group-hover:opacity-100 shrink-0 h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => {
                    e.stopPropagation();
                    setThreadToDelete(thread.id);
                  }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <AlertDialog open={!!threadToDelete} onOpenChange={() => setThreadToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {language === 'es' ? '¿Eliminar conversación?' : 'Delete conversation?'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {language === 'es' 
                ? 'Esta acción eliminará todos los mensajes e imágenes de esta conversación. No se puede deshacer.'
                : 'This will delete all messages and images in this conversation. This cannot be undone.'}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              {language === 'es' ? 'Cancelar' : 'Cancel'}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              {language === 'es' ? 'Eliminar' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
