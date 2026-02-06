import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ExternalLink } from 'lucide-react';
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
  const { useThreadMessages, sendMessageAsync, isSending, uploadFiles, deleteMessage, updateMessage } = useFeedback();
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

  const handleDeleteMessage = async (messageId: string) => {
    if (!thread) return;
    try {
      await deleteMessage({ messageId, threadId: thread.id });
      toast.success(t.messageDeleted);
    } catch (error) {
      console.error('Error deleting message:', error);
      toast.error(t.deleteError);
    }
  };

  const handleUpdateMessage = async (messageId: string, content: string) => {
    if (!thread) return;
    try {
      await updateMessage({ messageId, content, threadId: thread.id });
      toast.success(t.messageUpdated);
    } catch (error) {
      console.error('Error updating message:', error);
      toast.error(t.errorSending);
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

  const userEmail = thread.profile?.email_public || null;

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 overflow-hidden">
      {/* Header */}
      <div className="border-b border-border p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage 
            src={thread.profile?.avatar_url || ''} 
            alt={thread.profile?.name || ''} 
          />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        <div className="min-w-0 flex-1">
          {thread.profile?.username ? (
            <a
              href={`/@${thread.profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5"
            >
              {thread.profile?.name && (
                <p className="font-medium truncate group-hover:text-primary transition-colors">
                  {thread.profile.name}
                </p>
              )}
              <ExternalLink className="h-3.5 w-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
            </a>
          ) : thread.profile?.name ? (
            <p className="font-medium truncate">{thread.profile.name}</p>
          ) : null}
          {thread.profile?.username ? (
            <a
              href={`/@${thread.profile.username}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-muted-foreground truncate hover:text-primary transition-colors"
            >
              @{thread.profile.username}
            </a>
          ) : !thread.profile?.name ? (
            <p className="font-medium">Usuario</p>
          ) : null}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto p-4" ref={scrollRef}>
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
                isAdmin={true}
                onDelete={handleDeleteMessage}
                onUpdate={handleUpdateMessage}
                userEmail={userEmail}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p>{t.empty}</p>
          </div>
        )}
      </div>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isSending={isSending}
      />
    </div>
  );
}
