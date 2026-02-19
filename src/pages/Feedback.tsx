import { useEffect, useRef } from 'react';
import { MessageCircle, ExternalLink, ChevronLeft } from 'lucide-react';
import { usePageHeader } from '@/contexts/PageHeaderContext';
import { ChatMessage } from '@/components/feedback/ChatMessage';
import { ChatInput } from '@/components/feedback/ChatInput';
import { useFeedback } from '@/hooks/useFeedback';
import { useAuth } from '@/hooks/useAuth';
import { useProfile } from '@/hooks/useProfile';
import { useTranslation } from '@/hooks/useTranslation';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import vibecodersLogo from '@/assets/vibecoders-logo.png';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';

import { Link } from 'react-router-dom'; // Assuming Link is needed for the back button

export default function Feedback() {
  const { user } = useAuth();
  const { profile } = useProfile();
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
  const isMobile = useIsMobile();
  const t = useTranslation('feedback');
  const tCommon = useTranslation('common');
  const { setHeaderContent } = usePageHeader();

  useEffect(() => {
    setHeaderContent(
      <div className="flex items-center gap-2 min-w-0">
        <MessageCircle className="h-4 w-4 text-primary shrink-0" />
        <span className="font-semibold text-foreground truncate">{tCommon.navigation.feedback}</span>
      </div>
    );
    return () => setHeaderContent(null);
  }, [setHeaderContent]);

  const isLoading = threadLoading || messagesLoading;

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

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">

      
      <main className="flex-1 flex flex-col min-h-0 max-w-4xl mx-auto w-full md:p-4">

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
                  isOwn={message.sender_id === user?.id}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground px-6">
              <img 
                src={vibecodersLogo} 
                alt="Vibecoders" 
                className="h-20 w-20 mb-6 opacity-40 grayscale"
              />
              <p className="text-lg font-medium text-foreground/70">{t.emptyTitle}</p>
              <p className="text-sm mt-1">{t.emptySubtitle}</p>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="shrink-0 bg-background md:pb-4">
          <ChatInput
            onSend={handleSend}
            isSending={isSending}
            disabled={!user}
          />
        </div>
      </main>
    </div>
  );
}
