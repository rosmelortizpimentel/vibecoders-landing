import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatThread } from '@/components/chat/ChatThread';
import { MessageCircle, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Chat() {
  const { user } = useAuth();
  const { conversationId } = useParams<{ conversationId?: string }>();
  const navigate = useNavigate();
  const [selectedId, setSelectedId] = useState<string | undefined>(conversationId);

  useEffect(() => {
    setSelectedId(conversationId);
  }, [conversationId]);

  function handleSelectConversation(convId: string) {
    setSelectedId(convId);
    navigate(`/chat/${convId}`, { replace: true });
  }

  function handleBack() {
    setSelectedId(undefined);
    navigate('/chat', { replace: true });
  }

  if (!user) return null;

  return (
    <div className="flex h-[calc(100vh-64px)] -mx-3 -my-3 sm:-mx-4 sm:-my-4 md:-mx-8 md:-my-6 overflow-hidden shadow-xl ring-1 ring-border/30 rounded-none md:rounded-2xl">

      {/* Sidebar — full width on mobile (hidden when thread is open), fixed 288px on md+ */}
      <div className={`
        h-full shrink-0 w-full md:w-72
        ${selectedId ? 'hidden md:block' : 'block'}
      `}>
        <ChatSidebar
          selectedConversationId={selectedId}
          onSelectConversation={handleSelectConversation}
        />
      </div>

      {/* Thread panel — full width on mobile (shown only when selected), flex-1 on md+ */}
      <div className={`
        flex-1 flex flex-col h-full min-w-0 bg-background
        ${selectedId ? 'flex' : 'hidden md:flex'}
      `}>
        {selectedId ? (
          <>
            {/* Mobile back button — only visible on small screens */}
            <button
              onClick={handleBack}
              className="md:hidden flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground border-b border-border bg-card shrink-0"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Mensajes</span>
            </button>
            <ChatThread conversationId={selectedId} />
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center text-muted-foreground gap-3 p-8">
            <div className="w-16 h-16 rounded-2xl bg-primary/5 flex items-center justify-center">
              <MessageCircle className="w-8 h-8 text-primary/40" />
            </div>
            <div>
              <p className="font-medium text-foreground">Selecciona una conversación</p>
              <p className="text-sm mt-1">O descubre usuarios disponibles para chatear</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
