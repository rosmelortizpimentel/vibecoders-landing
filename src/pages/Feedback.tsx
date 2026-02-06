import { useEffect, useRef } from 'react';
import { MessageCircle } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage } from '@/components/feedback/ChatMessage';
import { ChatInput } from '@/components/feedback/ChatInput';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

export default function Feedback() {
  const t = useTranslation('feedback');
  const { user } = useAuth();
  const { 
    userThread, 
    threadLoading, 
    useThreadMessages, 
    sendMessageAsync, 
    isSending,
    uploadFiles 
  } = useFeedback();
  
  const { data: messages, isLoading: messagesLoading } = useThreadMessages(userThread?.id || null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (content: string, files: File[]) => {
    if (!user) {
      toast.error(t.loginRequired);
      return;
    }

    try {
      let attachmentUrls: { url: string; name: string; type: string }[] = [];
      
      if (files.length > 0) {
        attachmentUrls = await uploadFiles(files);
      }

      await sendMessageAsync({
        content,
        threadId: userThread?.id,
        attachmentUrls,
      });
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error(t.errorSending);
      throw error;
    }
  };

  const isLoading = threadLoading || messagesLoading;

  return (
    <div className="flex flex-col h-[calc(100vh-4.5rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="border-b border-border p-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-full">
            <MessageCircle className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-semibold">{t.title}</h1>
            <p className="text-sm text-muted-foreground">{t.subtitle}</p>
          </div>
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
                isOwn={message.sender_id === user?.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground">
            <MessageCircle className="h-12 w-12 mb-4 opacity-50" />
            <p>{t.empty}</p>
          </div>
        )}
      </ScrollArea>

      {/* Input */}
      <ChatInput
        onSend={handleSend}
        isSending={isSending}
        disabled={!user}
      />
    </div>
  );
}
