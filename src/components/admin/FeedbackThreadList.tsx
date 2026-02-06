import { formatDistanceToNow } from 'date-fns';
import { es, enUS } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import type { FeedbackThread } from '@/hooks/useFeedback';

interface FeedbackThreadListProps {
  threads: FeedbackThread[];
  selectedThreadId: string | null;
  onSelectThread: (threadId: string) => void;
}

export function FeedbackThreadList({ 
  threads, 
  selectedThreadId, 
  onSelectThread 
}: FeedbackThreadListProps) {
  const t = useTranslation('feedback');
  const { language } = useLanguage();
  const dateLocale = language === 'es' ? es : enUS;

  if (threads.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
        {t.noConversations}
      </div>
    );
  }

  return (
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
            <button
              key={thread.id}
              onClick={() => onSelectThread(thread.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-lg text-left transition-colors',
                selectedThreadId === thread.id
                  ? 'bg-primary/10'
                  : 'hover:bg-muted'
              )}
            >
              <Avatar className="h-10 w-10">
                <AvatarImage 
                  src={thread.profile?.avatar_url || ''} 
                  alt={thread.profile?.name || ''} 
                />
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-medium truncate">
                    {thread.profile?.username 
                      ? `@${thread.profile.username}` 
                      : thread.profile?.name || 'Usuario'}
                  </span>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {timeAgo}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {thread.message_count} {t.messages}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </ScrollArea>
  );
}
