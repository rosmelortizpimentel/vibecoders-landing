import { useState, useEffect } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';
import { useTranslation } from '@/hooks/useTranslation';
import { FeedbackThreadList } from './FeedbackThreadList';
import { FeedbackChat } from './FeedbackChat';
import { useIsMobile } from '@/hooks/use-mobile';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function FeedbackManager() {
  const t = useTranslation('feedback');
  const { allThreads, threadsLoading } = useFeedback();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [showMobileChat, setShowMobileChat] = useState(false);
  const isMobile = useIsMobile();

  // Reset selection if thread was deleted
  useEffect(() => {
    if (selectedThreadId && allThreads && !allThreads.find(t => t.id === selectedThreadId)) {
      setSelectedThreadId(null);
    }
  }, [allThreads, selectedThreadId]);

  const selectedThread = allThreads?.find(t => t.id === selectedThreadId) || null;

  const handleSelectThread = (id: string) => {
    setSelectedThreadId(id);
    if (isMobile) {
      setShowMobileChat(true);
    }
  };

  if (threadsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 gap-6 overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-full">
          <MessageCircle className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">{t.adminTitle}</h1>
          <p className="text-muted-foreground">{t.adminSubtitle}</p>
        </div>
      </div>

      {/* Split View */}
      <div className="flex-1 min-h-0 flex md:grid md:grid-cols-[380px_1fr] border border-border rounded-lg overflow-hidden bg-background relative">
        {/* Thread List */}
        <div className={cn(
          "border-r border-border bg-muted/30 overflow-y-auto w-full md:w-auto h-full flex flex-col",
          isMobile && showMobileChat ? "hidden" : "flex"
        )}>
          <FeedbackThreadList
            threads={allThreads || []}
            selectedThreadId={selectedThreadId}
            onSelectThread={handleSelectThread}
          />
        </div>

        {/* Chat */}
        <div className={cn(
          "bg-background min-h-0 flex flex-col flex-1",
          isMobile && !showMobileChat ? "hidden" : "flex"
        )}>
          {isMobile && showMobileChat && (
            <div className="p-2 border-b border-border bg-white flex items-center">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowMobileChat(false)}
                className="gap-1 px-2"
              >
                <ChevronLeft className="h-4 w-4" />
                {t.backToList || 'Volver'}
              </Button>
            </div>
          )}
          <FeedbackChat thread={selectedThread} />
        </div>
      </div>
    </div>
  );
}
