import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Search, MessageCircle, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';

interface ChatUser {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
}

interface Conversation {
  id: string;
  user_a_id: string;
  user_b_id: string;
  last_message_at: string;
  last_message_preview: string | null;
  other_user: ChatUser;
}

interface ChatSidebarProps {
  selectedConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
}

function formatTime(dateStr: string) {
  const d = new Date(dateStr);
  if (isToday(d)) return format(d, 'HH:mm');
  if (isYesterday(d)) return 'Ayer';
  return format(d, 'dd/MM');
}

export function ChatSidebar({ selectedConversationId, onSelectConversation }: ChatSidebarProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [availableUsers, setAvailableUsers] = useState<ChatUser[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loadingConversations, setLoadingConversations] = useState(true);
  const [tab, setTab] = useState<'conversations' | 'discover'>('conversations');

  const loadConversations = useCallback(async () => {
    if (!user) return;
    setLoadingConversations(true);
    const { data, error } = await supabase
      .from('chat_conversations')
      .select('*')
      .order('last_message_at', { ascending: false });

    if (error || !data) { setLoadingConversations(false); return; }

    const withUsers = await Promise.all(data.map(async (conv) => {
      const otherId = conv.user_a_id === user.id ? conv.user_b_id : conv.user_a_id;
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, username, name, avatar_url')
        .eq('id', otherId)
        .single();
      return { ...conv, other_user: profile as ChatUser };
    }));

    setConversations(withUsers.filter(c => c.other_user));
    setLoadingConversations(false);
  }, [user]);

  const loadAvailableUsers = useCallback(async () => {
    if (!user) return;
    let query = supabase
      .from('profiles')
      .select('id, username, name, avatar_url')
      .eq('chat_available', true)
      .neq('id', user.id)
      .limit(50);

    if (search.trim()) {
      query = query.or(`username.ilike.%${search.trim()}%,name.ilike.%${search.trim()}%`);
    }

    const { data } = await query;
    setAvailableUsers((data as ChatUser[]) || []);
  }, [user, search]);

  useEffect(() => {
    if (!user) return;
    loadConversations();

    const channel = supabase
      .channel('chat-conversations-sidebar')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_conversations',
      }, () => loadConversations())
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [user, loadConversations]);

  useEffect(() => {
    if (!user || tab !== 'discover') return;
    loadAvailableUsers();
  }, [user, tab, loadAvailableUsers]);

  async function startConversation(otherUserId: string) {
    if (!user) return;
    const [userA, userB] = [user.id, otherUserId].sort();

    // Upsert the conversation
    const { data, error } = await supabase
      .from('chat_conversations')
      .upsert(
        { user_a_id: userA, user_b_id: userB },
        { onConflict: 'user_a_id,user_b_id', ignoreDuplicates: false }
      )
      .select()
      .single();

    if (error) {
      // Try finding existing
      const { data: existing } = await supabase
        .from('chat_conversations')
        .select('id')
        .eq('user_a_id', userA)
        .eq('user_b_id', userB)
        .single();
      if (existing) onSelectConversation(existing.id);
      return;
    }

    if (data) onSelectConversation(data.id);
    setTab('conversations');
    await loadConversations();
  }

  const filteredConversations = conversations.filter(c => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      c.other_user?.username?.toLowerCase().includes(q) ||
      c.other_user?.name?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col h-full border-r border-border/80 bg-muted/20">
      {/* Header */}
      <div className="px-4 pt-4 pb-3 border-b border-border/60">
        <h2 className="font-bold text-base text-foreground tracking-tight mb-2.5">Mensajes</h2>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar..."
            className="pl-9 h-9 text-sm rounded-full bg-white/80 border border-border/50 shadow-sm focus-visible:ring-1 focus-visible:ring-primary/40"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex px-2 pt-0.5 border-b border-border/60 text-[13px] font-medium">
        <button
          className={cn(
            'flex-1 py-2 transition-colors rounded-t',
            tab === 'conversations'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setTab('conversations')}
        >
          Chats
        </button>
        <button
          className={cn(
            'flex-1 py-2 transition-colors rounded-t',
            tab === 'discover'
              ? 'text-primary border-b-2 border-primary'
              : 'text-muted-foreground hover:text-foreground'
          )}
          onClick={() => setTab('discover')}
        >
          Descubrir
        </button>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'conversations' && (
          <>
            {loadingConversations ? (
              <div className="p-4 space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3 animate-pulse">
                    <div className="w-10 h-10 rounded-full bg-muted shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-muted rounded w-24" />
                      <div className="h-2.5 bg-muted rounded w-36" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredConversations.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-20" />
                <p className="text-sm">No hay conversaciones aún</p>
                <button
                  onClick={() => setTab('discover')}
                  className="text-primary text-xs mt-1 hover:underline"
                >
                  Descubrir usuarios disponibles
                </button>
              </div>
            ) : (
              filteredConversations.map(conv => (
                <button
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-4 py-2.5 hover:bg-white/60 transition-colors text-left border-l-[3px]',
                    selectedConversationId === conv.id
                      ? 'bg-primary/[0.07] border-l-primary shadow-sm'
                      : 'border-l-transparent hover:border-l-border/40'
                  )}
                >
                  <Avatar className="w-10 h-10 shrink-0">
                    <AvatarImage src={conv.other_user?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                      {conv.other_user?.username?.charAt(0).toUpperCase() ||
                        conv.other_user?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className={cn('text-sm truncate', selectedConversationId === conv.id ? 'font-semibold text-foreground' : 'font-medium text-foreground')}>
                        {conv.other_user?.name || conv.other_user?.username || 'Usuario'}
                      </span>
                      <span className="text-[10px] text-muted-foreground shrink-0">
                        {formatTime(conv.last_message_at)}
                      </span>
                    </div>
                    {conv.other_user?.username && (
                      <p className="text-[10px] text-muted-foreground truncate">@{conv.other_user.username}</p>
                    )}
                    {conv.last_message_preview && (
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {conv.last_message_preview}
                      </p>
                    )}
                  </div>
                </button>
              ))
            )}
          </>
        )}

        {tab === 'discover' && (
          <>
            {availableUsers.length === 0 ? (
              <div className="p-6 text-center text-muted-foreground">
                <p className="text-sm">No hay usuarios disponibles</p>
              </div>
            ) : (
              availableUsers.map(u => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 p-3 hover:bg-muted/50 transition-colors group"
                >
                  <Avatar className="w-9 h-9 shrink-0">
                    <AvatarImage src={u.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-xs">
                      {u.username?.charAt(0).toUpperCase() || u.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1">
                      <span className="text-sm font-medium truncate">
                        {u.name || u.username || 'Usuario'}
                      </span>
                      {u.username && (
                        <Link
                          to={`/@${u.username}`}
                          onClick={e => e.stopPropagation()}
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ExternalLink className="w-3 h-3 text-muted-foreground hover:text-primary" />
                        </Link>
                      )}
                    </div>
                    {u.username && (
                      <p className="text-[10px] text-muted-foreground truncate">@{u.username}</p>
                    )}
                  </div>
                  <button
                    onClick={() => startConversation(u.id)}
                    className="shrink-0 text-xs bg-primary text-white px-2.5 py-1 rounded-full hover:bg-primary/80 transition-colors"
                  >
                    Chat
                  </button>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
