import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ChatMessage } from '@/components/feedback/ChatMessage';
import { ChatInput } from '@/components/feedback/ChatInput';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { Loader2, MessageCircle } from 'lucide-react';
import type { FeedbackThread } from '@/hooks/useFeedback';

interface FeedbackChatProps {
  thread: FeedbackThread | null;
}

export function FeedbackChat({ thread }: FeedbackChatProps) {
  const t = useTranslation('feedback');
  const { user } = useAuth();
  const { useThreadMessages, sendMessageAsync, isSending, uploadFiles } = useFeedback();
  const { data: messages, isLoading } = useThreadMessages(thread?.id || null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string, files: File[]) => {
    if (!user || !thread) return;

    try {
      let attachmentUrls: { url: string; name: string; type: string }[] = [];
      
      if (files.length > 0) {
        attachmentUrls = await uploadFiles(files);
      }

      await sendMessageAsync({
        content,
        threadId: thread.id,
        attachmentUrls,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t.errorSending);
      throw error;
    }
  };

  if (!thread) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
        <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
        <p>{t.selectConversation}</p>
      </div>
    );
  }

  const initials = thread.profile?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase() || '?';

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={thread.profile?.avatar_url || ''} 
            alt={thread.profile?.name || ''} 
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div>
          <p className="font-medium">
            {thread.profile?.username 
              ? `@${thread.profile.username}` 
              : thread.profile?.name || 'Usuario'}
          </p>
          {thread.profile?.name && thread.profile?.username && (
            <p className="text-sm text-muted-foreground">{thread.profile.name}</p>
          )}
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4" ref={scrollRef}>
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : messages && messages.length > 0 ? (
          <div className="space-y-4">
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                message={message}
                isOwn={message.is_admin_reply}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>{t.empty}</p>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isSending={isSending}
      />
    </div>
  );
}
