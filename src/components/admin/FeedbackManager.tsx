import { useState, useEffect } from 'react';
import { MessageCircle, Loader2 } from 'lucide-react';
import { useFeedback } from '@/hooks/useFeedback';
import { useTranslation } from '@/hooks/useTranslation';
import { FeedbackThreadList } from './FeedbackThreadList';
import { FeedbackChat } from './FeedbackChat';

export function FeedbackManager() {
  const t = useTranslation('feedback');
  const { allThreads, threadsLoading } = useFeedback();
  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);

  // Reset selection if thread was deleted
  useEffect(() => {
    if (selectedThreadId && allThreads && !allThreads.find(t => t.id === selectedThreadId)) {
      setSelectedThreadId(null);
    }
  }, [allThreads, selectedThreadId]);

  const selectedThread = allThreads?.find(t => t.id === selectedThreadId) || null;

  if (threadsLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-12rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
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
      <div className="grid grid-cols-[380px_1fr] gap-0 h-[calc(100vh-14rem)] border border-border rounded-lg overflow-hidden">
        {/* Thread List */}
        <div className="border-r border-border bg-muted/30">
          <FeedbackThreadList
            threads={allThreads || []}
            selectedThreadId={selectedThreadId}
            onSelectThread={setSelectedThreadId}
          />
        </div>

        {/* Chat */}
        <div className="bg-background">
          <FeedbackChat thread={selectedThread} />
        </div>
      </div>
    </div>
  );
}
