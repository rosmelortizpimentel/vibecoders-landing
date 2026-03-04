import { useState, useEffect, useRef, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { ChatInput } from './ChatInput';
import { Loader2, ThumbsUp, CheckCircle2, Heart, Trash2, Mic, Download, X as XIcon, MoreVertical } from 'lucide-react';
import { format, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface Profile {
  id: string;
  username: string | null;
  name: string | null;
  avatar_url: string | null;
  tagline: string | null;
}

interface Reaction {
  id: string;
  message_id: string;
  user_id: string;
  reaction: 'like' | 'check' | 'heart';
}

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_urls: string[];
  audio_url: string | null;
  created_at: string;
  reactions: Reaction[];
}

interface ChatThreadProps {
  conversationId: string;
}

type ReactionType = 'like' | 'check' | 'heart';

const REACTION_ICONS: Record<ReactionType, React.FC<{ className?: string }>> = {
  like: ({ className }) => <ThumbsUp className={className} />,
  check: ({ className }) => <CheckCircle2 className={className} />,
  heart: ({ className }) => <Heart className={className} />,
};

const REACTION_ACTIVE_COLORS: Record<ReactionType, string> = {
  like:  'text-blue-500',
  check: 'text-emerald-500',
  heart: 'text-rose-500',
};

/** Parses plain text and wraps URLs into clickable <a> tags. */
const URL_SPLIT_REGEX = /(https?:\/\/[^\s]+)/g;
const URL_TEST_REGEX = /^https?:\/\//;
function renderText(text: string, isOwn: boolean) {
  const parts = text.split(URL_SPLIT_REGEX);
  return parts.map((part, i) =>
    URL_TEST_REGEX.test(part) ? (
      <a
        key={i}
        href={part}
        target="_blank"
        rel="noopener noreferrer"
        className={isOwn ? 'underline text-white/90 hover:text-white' : 'underline text-primary hover:text-primary/80'}
        onClick={e => e.stopPropagation()}
      >
        {part}
      </a>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

function formatDuration(seconds: number): string {
  if (!isFinite(seconds) || isNaN(seconds)) return '0:00';
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function AudioPlayer({ src }: { src: string }) {
  const hiddenRef = useRef<HTMLAudioElement>(null);
  const [duration, setDuration] = useState(0);

  return (
    <div className="flex items-center gap-2 flex-1 min-w-[180px] max-w-[260px]">
      <audio
        ref={hiddenRef}
        src={src}
        preload="metadata"
        onLoadedMetadata={() => setDuration(hiddenRef.current?.duration ?? 0)}
        style={{ display: 'none' }}
      />
      <audio src={src} controls className="h-8 flex-1" />
      {duration > 0 && (
        <span className="text-[10px] text-muted-foreground shrink-0 tabular-nums">
          {formatDuration(duration)}
        </span>
      )}
    </div>
  );
}

export function ChatThread({ conversationId }: ChatThreadProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [otherUser, setOtherUser] = useState<Profile | null>(null);
  const [myProfile, setMyProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredMessageId, setHoveredMessageId] = useState<string | null>(null);
  const [signedUrls, setSignedUrls] = useState<Record<string, string>>({});
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{
    url: string;
    path: string;
    messageId: string;
    isOwn: boolean;
    imageIndex: number;
  } | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [oldestOffset, setOldestOffset] = useState(0);
  const [deletingChat, setDeletingChat] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = useCallback((smooth = true) => {
    bottomRef.current?.scrollIntoView({ behavior: smooth ? 'smooth' : 'instant' });
  }, []);

  const buildMessages = useCallback(async (msgs: Omit<Message, 'reactions'>[]) => {
    if (!msgs || msgs.length === 0) return [];
    const messageIds = msgs.map((m) => m.id);
    const { data: reactions } = await supabase
      .from('chat_message_reactions')
      .select('*')
      .in('message_id', messageIds);
    const reactionMap: Record<string, Reaction[]> = {};
    (reactions || []).forEach((r) => {
      const reaction = r as Reaction;
      if (!reactionMap[reaction.message_id]) reactionMap[reaction.message_id] = [];
      reactionMap[reaction.message_id].push(reaction);
    });
    return msgs.map((m) => ({
      ...m,
      image_urls: m.image_urls || [],
      audio_url: m.audio_url || null,
      reactions: reactionMap[m.id] || [],
    }));
  }, []);

  const resolveSignedUrls = useCallback(async (msgs: Message[]) => {
    const imagePaths = [...new Set(
      msgs.flatMap(m => m.image_urls).filter(u => u && !u.startsWith('http'))
    )];
    const audioPaths = [...new Set(
      msgs.map(m => m.audio_url).filter((u): u is string => !!u && !u.startsWith('http'))
    )];

    const newEntries: Record<string, string> = {};

    await Promise.all([
      ...imagePaths.map(path =>
        supabase.storage.from('chat-images').createSignedUrl(path, 3600)
          .then(res => { if (res.data?.signedUrl) newEntries[path] = res.data.signedUrl; })
      ),
      ...audioPaths.map(path =>
        supabase.storage.from('chat-audio').createSignedUrl(path, 3600)
          .then(res => { if (res.data?.signedUrl) newEntries[path] = res.data.signedUrl; })
      ),
    ]);

    if (Object.keys(newEntries).length > 0) {
      setSignedUrls(prev => ({ ...prev, ...newEntries }));
    }
  }, []);

  const PAGE_SIZE = 50;

  const loadMessages = useCallback(async () => {
    const { count } = await supabase
      .from('chat_messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', conversationId);

    const total = count ?? 0;
    const from = Math.max(0, total - PAGE_SIZE);
    setHasMore(from > 0);
    setOldestOffset(from);

    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(from, total - 1);

    const built = await buildMessages(msgs || []);
    setMessages(built);
    await resolveSignedUrls(built);
  }, [conversationId, buildMessages, resolveSignedUrls]);

  const loadConversation = useCallback(async () => {
    setLoading(true);
    const { data: conv } = await supabase
      .from('chat_conversations')
      .select('user_a_id, user_b_id')
      .eq('id', conversationId)
      .single();

    if (conv && user) {
      const otherId = conv.user_a_id === user.id ? conv.user_b_id : conv.user_a_id;
      const [{ data: profile }, { data: me }] = await Promise.all([
        supabase.from('profiles').select('id, username, name, avatar_url, tagline').eq('id', otherId).single(),
        supabase.from('profiles').select('id, username, name, avatar_url, tagline').eq('id', user.id).single(),
      ]);
      setOtherUser(profile as Profile);
      setMyProfile(me as Profile);
    }

    await loadMessages();
    setLoading(false);
    setTimeout(() => scrollToBottom(false), 50);
  }, [conversationId, user, loadMessages, scrollToBottom]);

  useEffect(() => {
    if (!user || !conversationId) return;
    loadConversation();
  }, [conversationId, user, loadConversation]);

  async function loadOlderMessages() {
    if (!hasMore || loadingMore) return;
    setLoadingMore(true);
    const scrollEl = scrollRef.current;
    const prevScrollHeight = scrollEl?.scrollHeight ?? 0;

    const from = Math.max(0, oldestOffset - PAGE_SIZE);
    const to = oldestOffset - 1;
    setHasMore(from > 0);
    setOldestOffset(from);

    const { data: msgs } = await supabase
      .from('chat_messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .range(from, to);

    const built = await buildMessages(msgs || []);
    setMessages(prev => [...built, ...prev]);
    await resolveSignedUrls(built);

    requestAnimationFrame(() => {
      if (scrollEl) {
        scrollEl.scrollTop = scrollEl.scrollHeight - prevScrollHeight;
      }
    });
    setLoadingMore(false);
  }

  function resolveUrl(raw: string): string {
    if (raw.startsWith('http')) return raw;
    return signedUrls[raw] || '';
  }

  useEffect(() => {
    if (!conversationId) return;

    const channel = supabase
      .channel(`chat-thread-${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'chat_messages',
        filter: `conversation_id=eq.${conversationId}`,
      }, async (payload) => {
        const newMsg = payload.new as Omit<Message, 'reactions'>;
        setMessages(prev => [...prev, { ...newMsg, image_urls: newMsg.image_urls || [], reactions: [] }]);
        setTimeout(() => scrollToBottom(), 50);
      })
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'chat_message_reactions',
      }, () => {
        loadMessages();
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversationId, loadMessages, scrollToBottom]);

  async function toggleReaction(messageId: string, reaction: ReactionType) {
    if (!user) return;
    const msg = messages.find(m => m.id === messageId);
    const existing = msg?.reactions.find(r => r.user_id === user.id);
    if (existing) {
      await supabase.from('chat_message_reactions').delete().eq('id', existing.id);
      if (existing.reaction === reaction) return;
    }
    await supabase.from('chat_message_reactions').upsert(
      { message_id: messageId, user_id: user.id, reaction },
      { onConflict: 'message_id,user_id,reaction', ignoreDuplicates: true }
    );
  }

  async function deleteMessage(messageId: string) {
    const msg = messages.find(m => m.id === messageId);
    if (msg) {
      await Promise.all([
        ...(msg.image_urls
          .filter(p => p && !p.startsWith('http'))
          .map(p => supabase.storage.from('chat-images').remove([p]))),
        ...(msg.audio_url && !msg.audio_url.startsWith('http')
          ? [supabase.storage.from('chat-audio').remove([msg.audio_url])]
          : []),
      ]);
    }
    await supabase.from('chat_messages').delete().eq('id', messageId);
    setMessages(prev => prev.filter(m => m.id !== messageId));
    setPendingDeleteId(null);
    setOpenMenuId(null);
  }

  async function deleteEntireChat() {
    const imagePaths = messages.flatMap(m => m.image_urls.filter(p => p && !p.startsWith('http')));
    const audioPaths = messages.map(m => m.audio_url).filter((p): p is string => !!p && !p.startsWith('http'));
    await Promise.all([
      ...imagePaths.map(p => supabase.storage.from('chat-images').remove([p])),
      ...audioPaths.map(p => supabase.storage.from('chat-audio').remove([p])),
    ]);
    await supabase.from('chat_messages').delete().eq('conversation_id', conversationId);
    setMessages([]);
    setDeletingChat(false);
  }

  async function deleteImageFromMessage(messageId: string, imagePath: string, imageIndex: number) {
    const msg = messages.find(m => m.id === messageId);
    if (!msg) return;
    if (!imagePath.startsWith('http')) {
      const { error } = await supabase.storage.from('chat-images').remove([imagePath]);
      if (error) console.error('Error deleting image:', error);
    }
    const newUrls = msg.image_urls.filter((_, i) => i !== imageIndex);
    if (newUrls.length === 0) {
      if (!msg.content || msg.content.trim() === ' ') {
        await supabase.from('chat_messages').delete().eq('id', messageId);
        setMessages(prev => prev.filter(m => m.id !== messageId));
      } else {
        await supabase.from('chat_messages').update({ image_urls: [] }).eq('id', messageId);
        setMessages(prev => prev.map(m => m.id === messageId ? { ...m, image_urls: [] } : m));
      }
    } else {
      await supabase.from('chat_messages').update({ image_urls: newUrls }).eq('id', messageId);
      setMessages(prev => prev.map(m => m.id === messageId ? { ...m, image_urls: newUrls } : m));
    }
    setViewer(null);
  }

  async function downloadImage(url: string) {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'imagen_'+Date.now()+'.jpg';
      a.click();
      URL.revokeObjectURL(a.href);
    } catch {
      window.open(url, '_blank');
    }
  }

  useEffect(() => {
    if (!openMenuId) return;
    const close = () => setOpenMenuId(null);
    document.addEventListener('click', close);
    return () => document.removeEventListener('click', close);
  }, [openMenuId]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {otherUser && (
        <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/60 bg-background shrink-0">
          <Avatar className="w-10 h-10 shrink-0">
            <AvatarImage src={otherUser.avatar_url || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary font-semibold">
              {otherUser.username?.charAt(0).toUpperCase() || otherUser.name?.charAt(0).toUpperCase() || '?'}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="font-bold text-sm text-foreground leading-tight truncate">
              {otherUser.name || otherUser.username || 'Usuario'}
            </p>
            {otherUser.username && (
              <Link
                to={'/@'+otherUser.username}
                className="text-[11px] text-muted-foreground underline underline-offset-2 hover:text-primary transition-colors leading-none"
              >
                @{otherUser.username}
              </Link>
            )}
            {otherUser.tagline && (
              <p className="text-[10px] text-muted-foreground/70 truncate leading-tight mt-0.5">
                {otherUser.tagline}
              </p>
            )}
          </div>
          <button
            onClick={() => setDeletingChat(true)}
            className="p-2 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
            title="Eliminar conversación"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 md:px-5 py-4 space-y-0.5 min-h-0 bg-background"
        onScroll={e => {
          const el = e.currentTarget;
          if (el.scrollTop < 80 && hasMore && !loadingMore) {
            loadOlderMessages();
          }
        }}
      >
        {hasMore && (
          <div className="flex justify-center py-3">
            {loadingMore
              ? <span className="text-xs text-muted-foreground animate-pulse">Cargando mensajes anteriores...</span>
              : <button onClick={loadOlderMessages} className="text-xs text-primary hover:underline">Ver mensajes anteriores</button>
            }
          </div>
        )}
        {messages.length === 0 && !loading && (
          <div className="h-full flex flex-col items-center justify-center text-center text-muted-foreground gap-2">
            <p className="text-sm">Comienza la conversación enviando un mensaje.</p>
          </div>
        )}

        {messages.map((msg, idx) => {
          const isOwn = msg.sender_id === user?.id;
          const msgDate = new Date(msg.created_at);
          const prevDate = idx > 0 ? new Date(messages[idx - 1].created_at) : null;
          const showDateSeparator = idx === 0 || msgDate.toDateString() !== prevDate?.toDateString();

          const today = new Date();
          const yesterday = new Date(today);
          yesterday.setDate(today.getDate() - 1);
          let dateLabelText = '';
          if (showDateSeparator) {
            if (msgDate.toDateString() === today.toDateString()) dateLabelText = 'Hoy';
            else if (msgDate.toDateString() === yesterday.toDateString()) dateLabelText = 'Ayer';
            else dateLabelText = msgDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric' });
          }

          const reactionCounts: Record<string, { count: number; hasMyReaction: boolean }> = {};
          msg.reactions.forEach(r => {
            if (!reactionCounts[r.reaction]) reactionCounts[r.reaction] = { count: 0, hasMyReaction: false };
            reactionCounts[r.reaction].count++;
            if (r.user_id === user?.id) reactionCounts[r.reaction].hasMyReaction = true;
          });

          const isLastInGroup = idx === messages.length - 1 || messages[idx + 1]?.sender_id !== msg.sender_id;
          const bubbleProfile = isOwn ? myProfile : otherUser;

          return (
            <div key={msg.id} className="space-y-0">
              {showDateSeparator && (
                <div className="flex items-center justify-center my-4">
                  <span className="text-[10px] text-muted-foreground bg-muted/60 rounded-full px-3 py-0.5 font-medium">
                    {dateLabelText}
                  </span>
                </div>
              )}
              <div
                className={cn('flex items-end gap-2 w-full', isOwn ? 'flex-row-reverse' : 'flex-row')}
                onMouseEnter={() => setHoveredMessageId(msg.id)}
                onMouseLeave={() => setHoveredMessageId(null)}
              >
                {isLastInGroup ? (
                  <Avatar className="w-7 h-7 shrink-0 mb-0.5">
                    <AvatarImage src={bubbleProfile?.avatar_url || undefined} />
                    <AvatarFallback className="bg-primary/10 text-primary text-[10px] font-semibold">
                      {bubbleProfile?.username?.charAt(0).toUpperCase() || bubbleProfile?.name?.charAt(0).toUpperCase() || '?'}
                    </AvatarFallback>
                  </Avatar>
                ) : (
                  <div className="w-7 shrink-0" />
                )}
                <div className={cn('relative max-w-[85%] md:max-w-[75%] flex flex-col space-y-0.5', isOwn ? 'items-end' : 'items-start')}>
                  <button
                    onClick={e => { e.stopPropagation(); setOpenMenuId(openMenuId === msg.id ? null : msg.id); }}
                    className={cn(
                      'absolute top-0.5 z-10 p-1.5 rounded-full bg-background/80 backdrop-blur-sm border border-border shadow-sm transition-all duration-150',
                      isOwn ? '-left-8' : '-right-8',
                      hoveredMessageId === msg.id || openMenuId === msg.id ? 'opacity-100 scale-100' : 'opacity-0 scale-90 pointer-events-none'
                    )}
                  >
                    <MoreVertical className="w-3 h-3 text-muted-foreground" />
                  </button>

                  {openMenuId === msg.id && (
                    <div
                      className={cn(
                        'absolute top-7 z-20 flex flex-col bg-card border border-border rounded-xl shadow-xl overflow-hidden min-w-[160px]',
                        isOwn ? '-left-8' : '-right-8'
                      )}
                      onClick={e => e.stopPropagation()}
                    >
                      <div className="flex items-center gap-1 px-2 py-1.5 border-b border-border/60">
                        {(['like', 'check', 'heart'] as ReactionType[]).map(r => {
                          const Icon = REACTION_ICONS[r];
                          const myReaction = msg.reactions.some(rx => rx.user_id === user?.id && rx.reaction === r);
                          return (
                            <button
                              key={r}
                              onClick={() => { toggleReaction(msg.id, r); setOpenMenuId(null); }}
                              className={cn('flex-1 py-1.5 rounded-lg flex items-center justify-center hover:bg-muted transition-colors', myReaction ? REACTION_ACTIVE_COLORS[r] : 'text-muted-foreground')}
                            >
                              <Icon className="w-4 h-4" />
                            </button>
                          );
                        })}
                      </div>
                      {isOwn && (
                        <button
                          onClick={() => { setOpenMenuId(null); setPendingDeleteId(msg.id); }}
                          className="flex items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-destructive/5 transition-colors w-full text-left"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar mensaje
                        </button>
                      )}
                    </div>
                  )}

                  {msg.image_urls.length > 0 && (
                    <div className="flex gap-1 flex-wrap">
                      {msg.image_urls.map((raw, i) => {
                        const url = resolveUrl(raw);
                        return url ? (
                          <button
                            key={i}
                            onClick={() => setViewer({ url, path: raw, messageId: msg.id, isOwn, imageIndex: i })}
                            className="shrink-0 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-xl bg-muted/10 overflow-hidden"
                          >
                            <img 
                              src={url} 
                              alt={'img-'+i} 
                              className="max-h-32 max-w-[200px] w-auto h-auto object-contain hover:opacity-90 transition-opacity cursor-pointer" 
                            />
                          </button>
                        ) : (
                          <div key={i} className="shrink-0 w-28 h-28 rounded-xl bg-muted flex items-center justify-center">
                            <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                          </div>
                        );
                      })}
                    </div>
                  )}

                  {msg.audio_url && (() => {
                    const audioSrc = resolveUrl(msg.audio_url);
                    return (
                      <div className={cn(
                        'flex items-center gap-2 px-3 py-2',
                        isOwn
                          ? 'bg-primary text-white border border-primary/60 bubble-own ' + (isLastInGroup ? 'rounded-tl-2xl rounded-tr-2xl rounded-br-[4px] rounded-bl-2xl' : 'rounded-2xl')
                          : 'bg-white dark:bg-card text-foreground border border-border/60 bubble-other ' + (isLastInGroup ? 'rounded-tl-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl' : 'rounded-2xl')
                      )}>
                        <Mic className={cn('w-4 h-4 shrink-0', isOwn ? 'text-white/80' : 'text-primary')} />
                        {audioSrc ? <AudioPlayer src={audioSrc} /> : <Loader2 className="w-4 h-4 animate-spin" />}
                      </div>
                    );
                  })()}

                  {msg.content && msg.content.trim() && msg.content.trim() !== ' ' && (
                    <div
                      className={cn(
                        'px-3 py-1.5 text-sm whitespace-pre-wrap break-words leading-relaxed',
                        isOwn
                          ? 'bg-primary text-white border border-primary/60 bubble-own ' + (isLastInGroup ? 'rounded-tl-2xl rounded-tr-2xl rounded-br-[4px] rounded-bl-2xl' : 'rounded-2xl')
                          : 'bg-white dark:bg-card text-foreground border border-border/60 bubble-other ' + (isLastInGroup ? 'rounded-tl-[4px] rounded-tr-2xl rounded-br-2xl rounded-bl-2xl' : 'rounded-2xl')
                      )}
                    >
                      {renderText(msg.content.trim(), isOwn)}
                    </div>
                  )}

                  {Object.entries(reactionCounts).length > 0 && (
                    <div className={cn('flex gap-1 flex-wrap mt-0.5', isOwn ? 'justify-end' : 'justify-start')}>
                      {Object.entries(reactionCounts).map(([r, info]) => {
                        const Icon = REACTION_ICONS[r as ReactionType];
                        return (
                          <button
                            key={r}
                            onClick={() => toggleReaction(msg.id, r as ReactionType)}
                            className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-xs border transition-all', info.hasMyReaction ? 'bg-primary/10 border-primary/20 ' + REACTION_ACTIVE_COLORS[r as ReactionType] : 'bg-background border-border text-muted-foreground hover:border-primary/30')}
                          >
                            <Icon className="w-3 h-3" />
                            {info.count > 1 && <span>{info.count}</span>}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      <ChatInput
        conversationId={conversationId}
        onMessageSent={() => { loadMessages(); setTimeout(() => scrollToBottom(), 100); }}
      />

      {viewer && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => setViewer(null)}
          onKeyDown={e => e.key === 'Escape' && setViewer(null)}
          tabIndex={-1}
          style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)' }}
        >
          <div className="relative flex flex-col items-center gap-4 max-w-[92vw] max-h-[90vh]" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-2">
              <button onClick={() => downloadImage(viewer.url)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors">
                <Download className="w-4 h-4" /> Descargar
              </button>
              {viewer.isOwn && (
                <button onClick={() => deleteImageFromMessage(viewer.messageId, viewer.path, viewer.imageIndex)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-destructive/80 hover:bg-destructive text-white text-sm font-medium transition-colors">
                  <Trash2 className="w-4 h-4" /> Eliminar
                </button>
              )}
              <button onClick={() => setViewer(null)} className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors">
                <XIcon className="w-4 h-4" />
              </button>
            </div>
            <img src={viewer.url} alt="Vista completa" className="max-w-full max-h-[75vh] rounded-xl shadow-2xl object-contain" />
          </div>
        </div>
      )}

      <AlertDialog open={!!pendingDeleteId} onOpenChange={(open) => { if (!open) setPendingDeleteId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar mensaje?</AlertDialogTitle>
            <AlertDialogDescription>Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={() => pendingDeleteId && deleteMessage(pendingDeleteId)}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deletingChat} onOpenChange={(open) => { if (!open) setDeletingChat(false); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar conversación?</AlertDialogTitle>
            <AlertDialogDescription>Se eliminarán todos los mensajes de esta conversación. Esta acción no se puede deshacer.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={deleteEntireChat}>Eliminar todo</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
