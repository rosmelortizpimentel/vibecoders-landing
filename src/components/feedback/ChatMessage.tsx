import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ImageAttachment } from './ImageAttachment';
import type { FeedbackMessage } from '@/hooks/useFeedback';

interface ChatMessageProps {
  message: FeedbackMessage;
  isOwn: boolean;
}

export function ChatMessage({ message, isOwn }: ChatMessageProps) {
  const initials = message.sender?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div
      className={cn(
        'flex gap-3 max-w-[85%]',
        isOwn ? 'ml-auto flex-row-reverse' : 'mr-auto'
      )}
    >
      <Avatar className="h-8 w-8 shrink-0">
        <AvatarImage src={message.sender?.avatar_url || ''} alt={message.sender?.name || ''} />
        <AvatarFallback className="text-xs">{initials}</AvatarFallback>
      </Avatar>

      <div className={cn('flex flex-col gap-1', isOwn ? 'items-end' : 'items-start')}>
        {/* Sender info */}
        <div className={cn('flex flex-col', isOwn ? 'items-end' : 'items-start')}>
          {message.sender?.username && (
            <span className="text-xs font-medium text-foreground/80">
              @{message.sender.username}
            </span>
          )}
          {message.sender?.name && (
            <span className="text-xs text-muted-foreground">
              {message.sender.name}
            </span>
          )}
        </div>

        <div
          className={cn(
            'rounded-2xl px-4 py-2 text-sm',
            isOwn
              ? 'bg-primary text-primary-foreground rounded-tr-sm'
              : 'bg-muted rounded-tl-sm'
          )}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
        </div>

        {message.attachments && message.attachments.length > 0 && (
          <div className={cn(
            'flex flex-wrap gap-2 mt-1',
            isOwn ? 'justify-end' : 'justify-start'
          )}>
            {message.attachments.map((attachment) => (
              <ImageAttachment key={attachment.id} attachment={attachment} />
            ))}
          </div>
        )}

        <span className="text-xs text-muted-foreground">
          {format(new Date(message.created_at), 'HH:mm')}
        </span>
      </div>
    </div>
  );
}
